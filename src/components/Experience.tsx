const EXP_ITEMS = [
  { name: '우리FIS아카데미 (960h)', period: '2025.01 – 2026.06' },
  { name: '엔디에스 클라우드 직무캠프 (40h)', period: '2024.08' },
]

export default function Experience() {
  return (
    <section className="r-section">
      <p className="section-label">Experience</p>
      {EXP_ITEMS.map(item => (
        <div className="exp-item" key={item.name}>
          <div className="exp-row">
            <span className="exp-name">{item.name}</span>
            <span className="exp-period">{item.period}</span>
          </div>
        </div>
      ))}
    </section>
  )
}
