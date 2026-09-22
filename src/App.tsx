import { Analytics } from '@vercel/analytics/react'
import ChatWidget from './components/ChatWidget'

// src/assets/의 portfolio*.pdf 중 파일명(날짜·시각) 최신본을 빌드 시 자동 선택한다.
// 새 PDF는 src/assets/portfolioYYMMDD[HHMM].pdf 로 추가만 하면 코드 수정 없이 반영되고,
// Vite 해시 URL이라 브라우저 캐시도 자동으로 무효화된다. (구버전은 지워 한 개만 남긴다)
const pdfUrls = import.meta.glob('./assets/portfolio*.pdf', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>
const pdfKeys = Object.keys(pdfUrls).sort()
const PDF_URL = pdfKeys.length ? pdfUrls[pdfKeys[pdfKeys.length - 1]] : ''

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-left">
          <span className="topbar-name">유승준</span>
          <span className="topbar-role">Backend Developer · Portfolio</span>
        </div>
        <nav className="topbar-links">
          <a href="https://github.com/fluanceifi" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost">PDF 새 탭</a>
        </nav>
      </header>

      <main className="pdf-stage">
        <object data={`${PDF_URL}#zoom=80`} type="application/pdf" className="pdf-object" aria-label="포트폴리오 PDF">
          {/* PDF 인라인 뷰어를 지원하지 않는 환경(주로 모바일)용 폴백 */}
          <div className="pdf-fallback">
            <p>이 브라우저에서는 PDF를 바로 볼 수 없어요.</p>
            <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">포트폴리오 PDF 열기</a>
          </div>
        </object>
      </main>

      <ChatWidget />
      <Analytics />
    </div>
  )
}
