// RAG 챗 엔드포인트 (Vercel Edge). 질의 임베딩 → 코사인 top-k 검색 → OpenAI 챗 스트리밍을 SSE로 중계.
// 프론트는 이 SSE를 읽어 토큰을 라이브로 렌더한다.
import kb from './_data/embeddings.json'

export const config = { runtime: 'edge' }

const EMBED_MODEL = 'text-embedding-3-small' // build-embeddings.mjs와 반드시 동일
const CHAT_MODEL = 'gpt-4o-mini'
const TOP_K = 5

type Record = { id: number; text: string; embedding: number[] }
const RECORDS = (kb as { records: Record[] }).records

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i] }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8)
}

async function embedQuery(query: string, apiKey: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: EMBED_MODEL, input: query }),
  })
  if (!res.ok) throw new Error(`embeddings ${res.status}`)
  const json = await res.json()
  return json.data[0].embedding
}

function retrieve(queryVec: number[]): Record[] {
  return RECORDS
    .map(r => ({ r, score: cosine(queryVec, r.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_K)
    .map(x => x.r)
}

function buildMessages(query: string, contexts: Record[]) {
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

  const apiKey = (globalThis as any).process?.env?.OPENAI_API_KEY
  if (!apiKey) return sse_error('서버에 OPENAI_API_KEY가 설정되지 않았습니다.')

  let query = ''
  try { query = (await req.json())?.query ?? '' } catch { /* ignore */ }
  query = String(query).trim()
  if (!query) return sse_error('질문을 입력해주세요.')
  if (query.length > 1000) query = query.slice(0, 1000)

  let contexts: Record[]
  try {
    const qvec = await embedQuery(query, apiKey)
    contexts = retrieve(qvec)
  } catch {
    return sse_error('검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
  }

  const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages: buildMessages(query, contexts),
      stream: true,
      temperature: 0.3,
    }),
  })
  if (!upstream.ok || !upstream.body) return sse_error('AI 응답 생성에 실패했습니다.')

  // OpenAI SSE(delta.content) → 우리 SSE(data:{"t": token})로 변환
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const reader = upstream.body.getReader()
  let buf = ''

  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read()
      if (done) {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
        return
      }
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
          if (token) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ t: token })}\n\n`))
        } catch { /* 불완전 조각 무시 */ }
      }
    },
    cancel() { reader.cancel() },
  })

  return new Response(stream, {
    headers: {
      ...CORS,
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}

function sse_error(message: string): Response {
  const body = `data: ${JSON.stringify({ error: message })}\n\ndata: [DONE]\n\n`
  return new Response(body, {
    status: 200,
    headers: { ...CORS, 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache' },
  })
}
