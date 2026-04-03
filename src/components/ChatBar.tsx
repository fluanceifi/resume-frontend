import { useRef, useState } from 'react'

interface ChatBarProps {
  onSend: (query: string) => void
  onToggleModal: () => void
  isLoading: boolean
  modalOpen: boolean
}

export default function ChatBar({ onSend, onToggleModal, isLoading, modalOpen }: ChatBarProps) {
  const [value, setValue] = useState('')
  const [composing, setComposing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSend() {
    const query = value.trim()
    if (!query || isLoading) return
    setValue('')
    onSend(query)
    textareaRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !composing) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-bar">
      <div className="chat-bar-inner">
        <button
          className={`chat-bar-toggle${modalOpen ? ' active' : ''}`}
          onClick={onToggleModal}
          aria-label="AI 도우미 열기"
          title="AI 도우미"
        >
          💬
        </button>
        <div className="chat-bar-input-wrap">
        <textarea
          ref={textareaRef}
          className="chat-bar-input"
          rows={1}
          value={value}
          placeholder="유승준에 대해 무엇이든 물어보세요…"
          autoComplete="off"
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setComposing(true)}
          onCompositionEnd={() => setComposing(false)}
        />
        </div>
        <button
          className="chat-bar-send"
          onClick={handleSend}
          disabled={isLoading || !value.trim()}
        >
          전송
        </button>
      </div>
    </div>
  )
}
