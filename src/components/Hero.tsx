import { useEffect, useRef, useState } from 'react'

type CopyTarget = 'email' | 'phone' | null

export default function Hero() {
  const [copiedTarget, setCopiedTarget] = useState<CopyTarget>(null)
  const resetTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current)
      }
    }
  }, [])

  const fallbackCopyText = (text: string) => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }

  const handleCopy = async (text: string, target: Exclude<CopyTarget, null>) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        fallbackCopyText(text)
      }

      setCopiedTarget(target)

      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current)
      }
      resetTimerRef.current = window.setTimeout(() => {
        setCopiedTarget(null)
      }, 1000)
    } catch {
      fallbackCopyText(text)
      setCopiedTarget(target)
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current)
      }
      resetTimerRef.current = window.setTimeout(() => {
        setCopiedTarget(null)
      }, 1000)
    }
  }

  return (
    <header className="hero">
      <div className="hero-top">
        <img className="profile-photo" src="/profile.png" alt="유승준 프로필" />
        <div className="hero-text">
          <h1 className="hero-greeting">안녕하세요, 유승준입니다.</h1>
          <p className="hero-title">Backend Developer</p>
          <nav className="contacts">
            <button
              type="button"
              className="contact-copy"
              onClick={() => void handleCopy('gksrnr66@gmail.com', 'email')}
            >
              gksrnr66@gmail.com
              <span className={`copy-feedback ${copiedTarget === 'email' ? 'show' : ''}`}>
                복사됨
              </span>
            </button>
            <button
              type="button"
              className="contact-copy"
              onClick={() => void handleCopy('010-4130-1904', 'phone')}
            >
              010-4130-1904
              <span className={`copy-feedback ${copiedTarget === 'phone' ? 'show' : ''}`}>
                복사됨
              </span>
            </button>
            <a href="https://github.com/fluanceifi" target="_blank" rel="noopener noreferrer">github.com/fluanceifi</a>
            <a href="https://www.linkedin.com/in/sjy-511661289/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </nav>
        </div>
      </div>
    </header>
  )
}
