import { useEffect, useRef } from 'react'
import type { Message } from '../hooks/useChat'

interface ChatModalProps {
  open: boolean
  onClose: () => void
  messages: Message[]
  isLoading: boolean
}

function formatAiText(text: string): React.ReactNode[] {
  // [text](url) → <a> 변환
  const parts = text.split(/(\[([^\]]+)\]\(([^)]+)\))/g)
  const result: React.ReactNode[] = []
  let i = 0
  while (i < parts.length) {
    if (parts[i].startsWith('[') && i + 2 < parts.length) {
      const label = parts[i + 1]
      const url = parts[i + 2]
      result.push(
        <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
          {label}
        </a>
      )
      i += 3
    } else {
      if (parts[i]) result.push(parts[i])
      i++
    }
  }
  return result
}

export default function ChatModal({ open, onClose, messages, isLoading }: ChatModalProps) {
  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages, isLoading])

  return (
    <div className={`chat-modal${open ? ' open' : ''}`} role="dialog" aria-label="AI 도우미">
      <div className="chat-modal-header">
        <div>
          <div className="chat-modal-title">AI 도우미</div>
          <div className="chat-modal-sub">유승준에 대해 무엇이든 물어보세요</div>
        </div>
        <button className="chat-modal-close" onClick={onClose} aria-label="닫기">✕</button>
      </div>

      <div className="chat-modal-messages" ref={messagesRef}>
        {messages.length === 0 && (
          <p className="chat-modal-empty">질문을 입력하면 AI가 답변합니다.</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            {msg.role === 'ai' ? formatAiText(msg.text) : msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="chat-msg ai">
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line short" />
          </div>
        )}
      </div>
    </div>
  )
}
