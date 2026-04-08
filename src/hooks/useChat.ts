import { useState } from 'react'

export interface Message {
  role: 'user' | 'ai'
  text: string
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8081'
const MODEL = import.meta.env.VITE_MODEL ?? 'gpt-4o-mini'
const API_ENDPOINT = `${BACKEND_URL}/api/v1/rag/query`
const MAX_RESULTS = 5
const REQUEST_TIMEOUT_MS = 20000

function cleanAnswerText(text: string): string {
  // 마크다운 각주·참고 섹션 제거
  return text
    .replace(/\[\^[^\]]*\]/g, '')
    .replace(/\s*\[\d+\]/g, '')
    .replace(/\n---\n[\s\S]*$/, '')
    .trim()
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  async function sendMessage(query: string) {
    if (!query.trim() || isLoading) return

    setMessages(prev => [...prev, { role: 'user', text: query }])
    setIsLoading(true)

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, maxResults: MAX_RESULTS, model: MODEL }),
        signal: controller.signal,
      })

      const json = await res.json()

      if (json.success) {
        setMessages(prev => [...prev, { role: 'ai', text: cleanAnswerText(json.data.answer) }])
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: `오류: ${json.error}` }])
      }
    } catch (err) {
      const isTimeout = (err as Error).name === 'AbortError'
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: isTimeout
            ? '응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
            : '네트워크 오류가 발생했습니다. 연결을 확인해주세요.',
        },
      ])
    } finally {
      clearTimeout(timer)
      setIsLoading(false)
    }
  }

  return { messages, isLoading, sendMessage }
}
