// RAG 동작/정확도 로컬 검증. OPENAI_API_KEY=... node scripts/test-rag.mjs
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const kb = JSON.parse(readFileSync(resolve(__dirname, '../api/_data/embeddings.json'), 'utf8'))
const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) { console.error('OPENAI_API_KEY 필요'); process.exit(1) }

const cosine = (a, b) => { let d = 0, na = 0, nb = 0; for (let i = 0; i < a.length; i++) { d += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i] } return d/(Math.sqrt(na)*Math.sqrt(nb)+1e-8) }

async function embed(q) {
  const r = await fetch('https://api.openai.com/v1/embeddings', { method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`}, body: JSON.stringify({ model:'text-embedding-3-small', input:q }) })
  return (await r.json()).data[0].embedding
}
async function chat(q, ctx) {
  const system = `너는 백엔드 개발자 유승준의 포트폴리오를 소개하는 AI 어시스턴트다. 아래 [자료]에 담긴 내용만 근거로 한국어로 간결하게 답한다. 자료에 없으면 지어내지 말고 포트폴리오 범위에서 답변 가능하다고 안내한다. 수치/용어는 자료 값을 그대로 쓴다.\n\n=== 자료 ===\n${ctx}`
  const r = await fetch('https://api.openai.com/v1/chat/completions', { method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`}, body: JSON.stringify({ model:'gpt-4o-mini', temperature:0.3, messages:[{role:'system',content:system},{role:'user',content:q}] }) })
  return (await r.json()).choices[0].message.content
}

const queries = [
  '한강페이에서 중복 결제는 어떻게 막았나요?',
  '우리카드 프로젝트에서 성능 최적화한 수치를 알려줘',
  'SMU CLUB 이메일 대량 발송 성능 개선 결과가 궁금해',
  '가장 자신있는 프로젝트가 뭐예요?',
  '유승준님 취미가 뭐예요?',
]

for (const q of queries) {
  const qv = await embed(q)
  const top = kb.records.map(r => ({ r, s: cosine(qv, r.embedding) })).sort((a,b)=>b.s-a.s).slice(0,5)
  const ctx = top.map((x,i)=>`[자료 ${i+1}]\n${x.r.text}`).join('\n\n')
  const heads = top.map(x => (x.r.text.split('\n')[0]||'').replace(/^#\s*/,'').slice(0,40) + ` (${x.s.toFixed(3)})`)
  const ans = await chat(q, ctx)
  console.log('\n' + '='.repeat(70))
  console.log('Q:', q)
  console.log('검색된 청크:', JSON.stringify(heads, null, 0))
  console.log('A:', ans)
}
