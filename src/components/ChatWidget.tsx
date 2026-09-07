import { useEffect, useRef, useState } from 'react'
import { useChatStream } from '../hooks/useChatStream'

const SUGGESTIONS = [
  '가장 자신 있는 프로젝트는?',
  '한강페이에서 중복 결제는 어떻게 막았나요?',
  '대용량 데이터 성능 최적화 경험이 있나요?',
  'DB 고가용성은 어떻게 다뤘나요?',
]

// [label](url) 형태를 링크로 렌더
function renderText(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = []
  const re = /\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0, m: RegExpExecArray | null, k = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    out.push(
      <a key={k++} href={m[2]} target="_blank" rel="noopener noreferrer">{m[1]}</a>
    )
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const { messages, isLoading, sendMessage } = useChatStream()
  const [value, setValue] = useState('')
  const [composing, setComposing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isLoading, open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  function submit(q: string) {
    const text = q.trim()
    if (!text || isLoading) return
    setValue('')
    sendMessage(text)
    inputRef.current?.focus()
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !composing) {
      e.preventDefault()
      submit(value)
    }
  }

  const showSuggestions = messages.length === 0
  const waiting = isLoading && messages[messages.length - 1]?.role === 'ai' && !messages[messages.length - 1]?.text

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        className={`fab${open ? ' fab-open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'AI 챗봇 닫기' : 'AI 챗봇 열기'}
      >
        {open ? (
          <span className="fab-x">✕</span>
        ) : (
          <>
            <span className="fab-icon" aria-hidden>💬</span>
            <span className="fab-label">AI에게 물어보기</span>
            <span className="fab-ping" aria-hidden />
          </>
        )}
      </button>

      {/* 챗 패널 */}
      <div className={`chat-panel${open ? ' open' : ''}`} role="dialog" aria-label="AI 포트폴리오 챗봇" aria-hidden={!open}>
        <header className="chat-head">
          <div className="chat-head-dot" aria-hidden />
          <div className="chat-head-text">
            <strong>AI 포트폴리오 챗봇</strong>
            <span>유승준의 프로젝트에 대해 물어보세요</span>
          </div>
          <button className="chat-head-close" onClick={() => setOpen(false)} aria-label="닫기">✕</button>
        </header>

        <div className="chat-scroll" ref={scrollRef}>
          {showSuggestions ? (
            <div className="chat-welcome">
              <p className="chat-welcome-title">무엇이든 물어보세요 👋</p>
              <p className="chat-welcome-sub">포트폴리오에 담긴 3개 프로젝트(한강페이 · SMU CLUB · Woori Card Scope)를 바탕으로 답해드려요.</p>
              <div className="chat-chips">
                {SUGGESTIONS.map(s => (
                  <button key={s} className="chat-chip" onClick={() => submit(s)}>{s}</button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`bubble ${m.role}`}>
                {m.role === 'ai' && waiting && i === messages.length - 1
                  ? <span className="typing"><i /><i /><i /></span>
                  : renderText(m.text)}
              </div>
            ))
          )}
        </div>

        <div className="chat-input">
          <textarea
            ref={inputRef}
            rows={1}
            value={value}
            placeholder="예) 한강페이에서 맡은 역할은?"
            onChange={e => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={() => setComposing(false)}
          />
          <button className="chat-send" onClick={() => submit(value)} disabled={isLoading || !value.trim()} aria-label="전송">
            ↑
          </button>
        </div>
      </div>
    </>
  )
}
