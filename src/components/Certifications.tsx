const CERT_ITEMS = [
  {
    name: '정보처리기사',
    date: '2025.06.18',
    org: '한국산업인력공단',
  },
  {
    name: 'SQLD',
    date: '2026.03.27',
    org: '한국데이터산업진흥원',
  },
]

export default function Certifications() {
  return (
    <section className="r-section">
      <p className="section-label">Certifications</p>
      {CERT_ITEMS.map(item => (
        <div className="edu-item" key={item.name}>
          <div className="edu-row">
            <span className="edu-name">{item.name}</span>
            <span className="edu-period">{item.date}</span>
          </div>
          <p className="edu-detail">{item.org}</p>
        </div>
      ))}
    </section>
  )
}
