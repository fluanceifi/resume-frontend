const SKILLS: { cat: string; tags: string[] }[] = [
  { cat: 'Language',   tags: ['Java', 'Python'] },
  { cat: 'Backend & DB', tags: ['Spring Boot', 'JPA', 'MySQL', 'Redis'] },
  { cat: 'Infra',      tags: ['Docker', 'Nginx', 'AWS', 'OCI', 'GitHub Actions', 'CI/CD'] },
  { cat: 'AI / RAG',   tags: ['LangChain', 'FastAPI', 'OpenAI API', 'Spring AI'] },
  { cat: 'Search',     tags: ['Elasticsearch', 'BM25', 'kNN (HNSW)', 'Hybrid Search', 'RRF'] },
]

export default function Skills() {
  return (
    <section className="r-section">
      <p className="section-label">Skills</p>
      <div className="skills-rows">
        {SKILLS.map(({ cat, tags }) => (
          <div className="skill-row" key={cat}>
            <span className="skill-cat">{cat}</span>
            <div className="tags">
              {tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
