// 지식베이스(knowledge.md)를 청킹 → OpenAI 임베딩 → api/_data/embeddings.json 생성.
// 배포 전 1회 로컬 실행: OPENAI_API_KEY=sk-... node scripts/build-embeddings.mjs
// 질의 시점(api/chat.ts)의 임베딩 모델과 반드시 동일한 모델을 사용해야 한다.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const KNOWLEDGE = resolve(ROOT, 'knowledge.md')
const OUT = resolve(ROOT, 'api/_data/embeddings.json')

const EMBED_MODEL = 'text-embedding-3-small'
const MAX_CHARS = 1800 // 청크당 최대 글자 수

const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
  console.error('OPENAI_API_KEY 환경변수가 필요합니다.')
  process.exit(1)
}

/** knowledge.md를 헤딩(##/###) 기준으로 청킹. 각 청크는 상위 ## 헤딩을 문맥으로 함께 담는다. */
function chunk(md) {
  const lines = md.split('\n')
  const sections = [] // { h2, h3, body[] }
  let h2 = '', h3 = '', body = []
  const flush = () => {
    const text = body.join('\n').trim()
    if (text) sections.push({ h2, h3, text })
    body = []
  }
  for (const line of lines) {
    if (line.startsWith('## ')) { flush(); h2 = line.slice(3).trim(); h3 = '' }
    else if (line.startsWith('### ')) { flush(); h3 = line.slice(4).trim() }
    else body.push(line)
  }
  flush()

  // 헤딩 라벨을 앞에 붙이고, 너무 긴 섹션은 문단 단위로 분할
  const chunks = []
  for (const s of sections) {
    const heading = [s.h2, s.h3].filter(Boolean).join(' — ')
    const full = heading ? `# ${heading}\n${s.text}` : s.text
    if (full.length <= MAX_CHARS) { chunks.push(full); continue }
    const paras = s.text.split(/\n\s*\n/)
    let buf = heading ? `# ${heading}\n` : ''
    for (const p of paras) {
      if ((buf + '\n' + p).length > MAX_CHARS && buf.trim()) {
        chunks.push(buf.trim())
        buf = (heading ? `# ${heading} (계속)\n` : '') + p
      } else {
        buf += '\n' + p
      }
    }
    if (buf.trim()) chunks.push(buf.trim())
  }
  return chunks.filter(c => c.replace(/\s/g, '').length > 10)
}

async function embed(input) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: EMBED_MODEL, input }),
  })
  if (!res.ok) throw new Error(`embeddings API ${res.status}: ${await res.text()}`)
  const json = await res.json()
  return json.data.map(d => d.embedding)
}

const md = readFileSync(KNOWLEDGE, 'utf8')
const chunks = chunk(md)
console.log(`청크 ${chunks.length}개 임베딩 중 (model=${EMBED_MODEL})...`)

const vectors = await embed(chunks) // 배치 임베딩 (한 번에 전송)
const records = chunks.map((text, i) => ({ id: i, text, embedding: vectors[i] }))

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify({ model: EMBED_MODEL, dim: vectors[0].length, records }))
console.log(`완료: ${OUT} (${records.length}개, dim=${vectors[0].length})`)
