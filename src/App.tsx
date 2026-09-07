import ChatWidget from './components/ChatWidget'

const PDF_URL = '/portfolio.pdf'

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
        <object data={`${PDF_URL}#view=FitH`} type="application/pdf" className="pdf-object" aria-label="포트폴리오 PDF">
          {/* PDF 인라인 뷰어를 지원하지 않는 환경(주로 모바일)용 폴백 */}
          <div className="pdf-fallback">
            <p>이 브라우저에서는 PDF를 바로 볼 수 없어요.</p>
            <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">포트폴리오 PDF 열기</a>
          </div>
        </object>
      </main>

      <ChatWidget />
    </div>
  )
}
