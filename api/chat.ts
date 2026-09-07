// RAG 챗 엔드포인트 (Vercel Edge). 스트림 Response를 즉시 반환하고, 스트림 안에서
// 질의 임베딩 → 코사인 top-k → OpenAI 챗 스트리밍을 처리해 SSE로 중계한다.
// (사전 작업을 응답 전에 await 하지 않으므로 게이트웨이 504를 피한다.)
import kb from './_data/embeddings.json'

export const config = { runtime: 'edge' }

const EMBED_MODEL = 'text-embedding-3-small' // build-embeddings.mjs와 반드시 동일
const CHAT_MODEL = 'gpt-4o-mini'
const TOP_K = 5
const EMBED_TIMEOUT_MS = 12000
const CHAT_TIMEOUT_MS = 30000

type Rec = { id: number; text: string; embedding: number[] }
const RECORDS = (kb as { records: Rec[] }).records

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i] }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8)
}

async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, { ...init, signal: ctrl.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function embedQuery(query: string, apiKey: string): Promise<number[]> {
  const res = await fetchWithTimeout('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: EMBED_MODEL, input: query }),
  }, EMBED_TIMEOUT_MS)
  if (!res.ok) throw new Error(`embeddings ${res.status}`)
  const json = await res.json()
  return json.data[0].embedding
}

function retrieve(queryVec: number[]): Rec[] {
  return RECORDS
    .map(r => ({ r, score: cosine(queryVec, r.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_K)
    .map(x => x.r)
}

function buildMessages(query: string, contexts: Rec[]) {
  const context = contexts.map((c, i) => `[자료 ${i + 1}]\n${c.text}`).join('\n\n')
  const system = [
    '너는 백엔드 개발자 유승준의 포트폴리오를 소개하는 AI 어시스턴트다.',
    '아래 [자료]에 담긴 내용만 근거로, 한국어로 친근하고 간결하게 답한다.',
    '자료에 없는 내용은 지어내지 말고, "포트폴리오에 담긴 내용 범위에서 답변드릴 수 있어요"라고 안내한다.',
    '수치·기술 용어·기간은 자료에 나온 값을 그대로 사용하고 임의로 바꾸지 않는다.',
    '답변은 보통 2~5문장. 필요하면 짧은 불릿을 쓴다.',
    '',
    '=== 자료 ===',
    context,
  ].join('\n')
  return [
    { role: 'system', content: system },
    { role: 'user', content: query },
  ]
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: CORS })

  // 본문 파싱만 먼저(빠름). 무거운 작업은 전부 스트림 안에서.
  let query = ''
  try { query = ((await req.json()) as { query?: string })?.query ?? '' } catch { /* ignore */ }
  query = String(query).trim().slice(0, 1000)

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))
      const finish = () => { controller.enqueue(encoder.encode('data: [DONE]\n\n')); controller.close() }

      // 즉시 바이트를 흘려 게이트웨이가 연결을 유지하도록 한다(504 방지).
      controller.enqueue(encoder.encode(': connected\n\n'))

      try {
        const apiKey = (globalThis as { process?: { env?: Record<string, string> } }).process?.env?.OPENAI_API_KEY
        if (!apiKey) { send({ error: '서버에 OPENAI_API_KEY가 설정되지 않았습니다.' }); return finish() }
        if (!query) { send({ error: '질문을 입력해주세요.' }); return finish() }

        const qvec = await embedQuery(query, apiKey)
        const contexts = retrieve(qvec)

        const upstream = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model: CHAT_MODEL, messages: buildMessages(query, contexts), stream: true, temperature: 0.3 }),
        }, CHAT_TIMEOUT_MS)

        if (!upstream.ok || !upstream.body) { send({ error: `AI 응답 생성 실패 (${upstream.status})` }); return finish() }

        const reader = upstream.body.getReader()
        const decoder = new TextDecoder()
        let buf = ''
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          const lines = buf.split('\n')
          buf = lines.pop() ?? ''
          for (const line of lines) {
            const t = line.trim()
            if (!t.startsWith('data:')) continue
            const payload = t.slice(5).trim()
            if (payload === '[DONE]') continue
            try {
              const token = JSON.parse(payload)?.choices?.[0]?.delta?.content
              if (token) send({ t: token })
            } catch { /* 불완전 조각 무시 */ }
          }
        }
        finish()
      } catch (e) {
        const aborted = (e as Error)?.name === 'AbortError'
        try { send({ error: aborted ? '응답 시간이 초과되었습니다. 다시 시도해주세요.' : '처리 중 오류가 발생했습니다.' }); finish() } catch { /* already closed */ }
      }
    },
  })

  return new Response(stream, {
    headers: {
      ...CORS,
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
    },
  })
}
