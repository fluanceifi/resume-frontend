import { useEffect, useRef, useState } from 'react'

type CopyTarget = 'email' | 'phone' | null

const CONTACTS = [
  { label: '✉\u00a0 gksrnr66@gmail.com', href: 'mailto:gksrnr66@gmail.com', copyValue: 'gksrnr66@gmail.com', copyKey: 'email' as const },
  { label: '📞\u00a0 010-4130-1904', href: 'tel:01041301904', copyValue: '010-4130-1904', copyKey: 'phone' as const },
  { label: '⌂\u00a0 github.com/fluanceifi', href: 'https://github.com/fluanceifi' },
  { label: 'in\u00a0 LinkedIn', href: 'https://www.linkedin.com/in/sjy-511661289/' },
]

export default function Contact() {
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

  const handleCopy = async (text: string, target: Exclude<CopyTarget, null>, e: React.MouseEvent) => {
    e.preventDefault()
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
    <section className="r-section">
      <p className="section-label">Contact</p>
      <div className="contact-list">
        {CONTACTS.map(item =>
          item.copyValue ? (
            <button
              key={item.href}
              type="button"
              className="contact-item copyable"
              onClick={e => void handleCopy(item.copyValue, item.copyKey, e)}
              title="클릭하면 복사됩니다"
            >
              {item.label}
              <span className={`copy-feedback ${copiedTarget === item.copyKey ? 'show' : ''}`}>
                복사됨
              </span>
            </button>
          ) : (
            <a
              key={item.href}
              className="contact-item"
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.label}
            </a>
          )
        )}
      </div>
    </section>
  )
}
