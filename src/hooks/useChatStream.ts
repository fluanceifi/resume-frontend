import { useRef, useState } from 'react'

export interface Message {
  role: 'user' | 'ai'
  text: string
}

// 같은 Vercel 프로젝트면 상대경로. GitHub Pages 등 분리 배포 시 VITE_CHAT_ENDPOINT로 절대 URL 지정.
const ENDPOINT = import.meta.env.VITE_CHAT_ENDPOINT ?? '/api/chat'

export function useChatStream() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // 마지막 AI 메시지 텍스트에 토큰을 이어 붙인다 (라이브 타이핑).
  function appendToLastAi(token: string) {
    setMessages(prev => {
      const next = prev.slice()
      const last = next[next.length - 1]
      if (last && last.role === 'ai') next[next.length - 1] = { ...last, text: last.text + token }
      return next
    })
  }

  async function sendMessage(query: string) {
    const q = query.trim()
    if (!q || isLoading) return

    setMessages(prev => [...prev, { role: 'user', text: q }, { role: 'ai', text: '' }])
    setIsLoading(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
        signal: controller.signal,
      })
      if (!res.ok || !res.body) throw new Error('bad response')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      let gotError = ''

      // eslint-disable-next-line no-constant-condition
      while (true) {
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
            const obj = JSON.parse(payload)
            if (obj.t) appendToLastAi(obj.t)
            else if (obj.error) gotError = obj.error
          } catch { /* 조각 무시 */ }
        }
      }

      if (gotError) appendToLastAi(gotError)
      // 응답이 완전히 비어 있으면 안내 문구
      setMessages(prev => {
        const next = prev.slice()
        const last = next[next.length - 1]
        if (last && last.role === 'ai' && !last.text.trim()) {
          next[next.length - 1] = { ...last, text: '답변을 생성하지 못했습니다. 다시 시도해주세요.' }
        }
        return next
      })
    } catch (err) {
      const aborted = (err as Error).name === 'AbortError'
      if (!aborted) {
        setMessages(prev => {
          const next = prev.slice()
          const last = next[next.length - 1]
          const msg = '네트워크 오류가 발생했습니다. 연결을 확인해주세요.'
          if (last && last.role === 'ai' && !last.text.trim()) next[next.length - 1] = { ...last, text: msg }
          else next.push({ role: 'ai', text: msg })
          return next
        })
      }
    } finally {
      abortRef.current = null
      setIsLoading(false)
    }
  }

  return { messages, isLoading, sendMessage }
}
