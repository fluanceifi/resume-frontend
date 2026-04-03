const EDU_ITEMS = [
  {
    name: '휴먼IT대학 AI공학부 (편입, 4년제, 서울)',
    period: '2024.03 – 2026.08',
    detail: '학점 4.18 / 4.5 \u00a0·\u00a0 전공 4.2 / 4.5 \u00a0·\u00a0 주간',
  },
  {
    name: '부천대학교 호텔외식조리학과 (2년제, 경기)',
    period: '2018.03 – 2022.02',
    detail: '학점 3.86 / 4.5 \u00a0·\u00a0 주간',
  },
]

export default function Education() {
  return (
    <section className="r-section">
      <p className="section-label">Education</p>
      {EDU_ITEMS.map(item => (
        <div className="edu-item" key={item.name}>
          <div className="edu-row">
            <span className="edu-name">{item.name}</span>
            <span className="edu-period">{item.period}</span>
          </div>
          <p className="edu-detail">{item.detail}</p>
        </div>
      ))}
    </section>
  )
}
