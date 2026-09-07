// chat.ts의 SSE 파싱/중계 로직을 실제 OpenAI 스트리밍으로 검증. 토큰이 실시간으로 도착하는지 확인.
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const kb = JSON.parse(readFileSync(resolve(__dirname, '../api/_data/embeddings.json'), 'utf8'))
const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) { console.error('OPENAI_API_KEY 필요'); process.exit(1) }
const cosine = (a, b) => { let d=0,na=0,nb=0; for (let i=0;i<a.length;i++){d+=a[i]*b[i];na+=a[i]*a[i];nb+=b[i]*b[i]} return d/(Math.sqrt(na)*Math.sqrt(nb)+1e-8) }

const q = process.argv[2] || '한강페이에서 결제 복구는 어떻게 설계했나요?'
const emb = await (await fetch('https://api.openai.com/v1/embeddings',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model:'text-embedding-3-small',input:q})})).json()
const qv = emb.data[0].embedding
const ctx = kb.records.map(r=>({r,s:cosine(qv,r.embedding)})).sort((a,b)=>b.s-a.s).slice(0,5).map((x,i)=>`[자료 ${i+1}]\n${x.r.text}`).join('\n\n')
const system = `너는 유승준 포트폴리오 어시스턴트다. 아래 자료만 근거로 한국어로 간결히 답한다.\n\n${ctx}`

const up = await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model:'gpt-4o-mini',stream:true,temperature:0.3,messages:[{role:'system',content:system},{role:'user',content:q}]})})

const reader = up.body.getReader(); const dec = new TextDecoder()
let buf = '', full = '', chunks = 0, t0 = Date.now(), tFirst = 0
process.stdout.write(`Q: ${q}\nA: `)
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  buf += dec.decode(value, { stream: true })
  const lines = buf.split('\n'); buf = lines.pop() ?? ''
  for (const line of lines) {
    const t = line.trim()
    if (!t.startsWith('data:')) continue
    const p = t.slice(5).trim()
    if (p === '[DONE]') continue
    try { const tok = JSON.parse(p)?.choices?.[0]?.delta?.content; if (tok) { if (!tFirst) tFirst = Date.now()-t0; process.stdout.write(tok); full += tok; chunks++ } } catch {}
  }
}
console.log(`\n\n[스트리밍 검증] 토큰 청크 ${chunks}개, 첫 토큰까지 ${tFirst}ms, 총 ${Date.now()-t0}ms, 길이 ${full.length}자`)
