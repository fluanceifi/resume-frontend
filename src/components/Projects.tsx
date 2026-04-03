interface ProjectLink {
  label: string
  href: string
}

interface Project {
  name: string
  links: ProjectLink[]
  desc: string
  stack: string[]
}

const PROJECTS: Project[] = [
  {
    name: 'SMU-CLUB',
    links: [
      { label: 'Portfolio →', href: '/smu-club' },
      { label: 'GitHub →', href: 'https://github.com/smu-human/smu-club' },
    ],
    desc: '상명대학교 동아리 탐색·지원·운영 관리 플랫폼. AOP + Discord Webhook 기반 스케줄러 장애 감지 체계 구축, 청크 단위 배치 트랜잭션 재설계(REQUIRES_NEW), JPA LEFT JOIN FETCH 최적화, ApiResponseDto<T> 기반 응답 표준화를 통해 운영 안정성과 협업 효율을 개선했다.',
    stack: ['React + Vite', 'Spring Boot', 'JPA', 'MySQL', 'Docker Compose', 'Nginx', 'OCI', 'Discord Webhook'],
  },
  {
    name: 'Hybrid RAG Portfolio',
    links: [
      { label: 'Portfolio →', href: '/hybrid-rag' },
      { label: 'GitHub →', href: 'https://github.com/fluanceifi/hybrid-search-rag' },
    ],
    desc: '토스페이먼츠 API 실문서를 대상으로 Elasticsearch 기반 RAG 검색 품질을 개선한 프로젝트. BM25 query 전략 개선으로 Top-1 정확도 35% → 95%, RRF section_key dedup 적용으로 45% → 100% 달성. baseline을 두 트랙으로 분리해 개선 원인을 독립적으로 검증했다.',
    stack: ['FastAPI', 'Elasticsearch', 'Lucene Analyzer', 'BM25', 'kNN (HNSW)', 'Weighted RRF', 'OpenAI Embedding', 'Docker Compose'],
  },
  {
    name: 'Woori Card Scope',
    links: [
      { label: 'GitHub →', href: 'https://github.com/fluanceifi/woori_card_scope' },
    ],
    desc: '카드 관련 데이터를 다루며 구현한 개인 프로젝트 저장소.',
    stack: ['Spring Boot', 'MySQL', 'JPA'],
  },
]

export default function Projects() {
  return (
    <section className="r-section">
      <p className="section-label">Projects</p>
      {PROJECTS.map(project => (
        <div className="project-item" key={project.name}>
          <div className="project-row">
            <span className="project-name">{project.name}</span>
            <div className="project-links">
              {project.links.map(link => (
                <a key={link.label} href={link.href} {...(link.href.startsWith('http') && { target: '_blank', rel: 'noopener noreferrer' })}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <p className="project-desc">{project.desc}</p>
          <div className="project-stack tags">
            {project.stack.map(tag => <span className="tag" key={tag}>{tag}</span>)}
          </div>
        </div>
      ))}
    </section>
  )
}
