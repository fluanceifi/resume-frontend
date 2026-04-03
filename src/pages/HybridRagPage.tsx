import '../styles/portfolio.css'

export default function HybridRagPage() {
  return (
    <main className="document">

      {/* ────────── HERO ────────── */}
      <section className="page hero">
        <span className="eyebrow">Project Portfolio</span>
        <h1>Hybrid RAG Portfolio</h1>
        <p className="lead">
          토스페이먼츠 API 실문서를 대상으로 Elasticsearch 기반 RAG 검색 품질을 개선한 프로젝트다.
          Apache Lucene Analyzer + BM25 + kNN(HNSW) + Weighted RRF 조합을 운영 관점에서 튜닝했고,
          baseline을 두 트랙으로 분리해 개선 원인을 명확히 검증했다.
        </p>

        <div className="meta-grid">
          <article className="meta-card">
            <span className="label">프로젝트 유형</span>
            <div className="value">검색 품질 개선 / RAG Retrieval 튜닝</div>
          </article>
          <article className="meta-card">
            <span className="label">핵심 스택</span>
            <div className="value">FastAPI, Elasticsearch, OpenAI Embedding, Docker</div>
          </article>
          <article className="meta-card">
            <span className="label">검증 데이터</span>
            <div className="value">Toss API 실문서 + 검증 질문 20개</div>
          </article>
        </div>

        <div className="stack">
          <span className="chip">Elasticsearch</span>
          <span className="chip">Lucene Analyzer</span>
          <span className="chip">BM25</span>
          <span className="chip">kNN (HNSW)</span>
          <span className="chip">Weighted RRF</span>
          <span className="chip">text-embedding-3-small</span>
          <span className="chip">text-embedding-3-large</span>
          <span className="chip">FastAPI</span>
          <span className="chip">Docker Compose</span>
        </div>

        <div className="baseline-grid">
          <article className="summary-card">
            <h3>Baseline Track A (BM25 Query Strategy)</h3>
            <p className="metric-line">
              <strong>35.00% → 95.00%</strong>
              <span className="badge">model: n/a</span>
              <span className="badge">weights: n/a</span>
              <span className="badge">dedup: n/a</span>
            </p>
            <p>
              초기에는 본문만 검색 → 중복 단어 多, 정확도 35%<br />
              제목을 검색 범위에 추가 + 제목 가중치 3배 적용 → 정확도 95%
            </p>
            <p><strong>초기 35%는 dedup 문제가 아닌, 단순 검색 방식의 기준 성능</strong></p>
            <p className="evidence">
              evidence:{' '}
              <a target="_blank" rel="noopener noreferrer" href="https://github.com/fluanceifi/Hybrid-RAG-Portfolio/blob/main/data/bm25_eval_report.md">
                data/bm25_eval_report.md
              </a>
            </p>
          </article>

          <article className="summary-card">
            <h3>Baseline Track B (Hybrid RRF Stability)</h3>
            <p className="metric-line">
              <strong>45.00% → 100.00%</strong>
              <span className="badge">model: large</span>
              <span className="badge">weights: 0.7:0.3</span>
              <span className="badge">dedup: off → on</span>
            </p>
            <p>
              20섹션 → 48청크로 분산, 동일 섹션 청크가 RRF 점수 누적 → 상위 독식<br />
              중복 제거로 후보 수 감소 → k=5에서 k=10으로 상향 조정<br />
              7:3 가중치 동일 조건에서 dedup 미적용 시 45% → 적용 후 100% 회복
            </p>
            <p><strong>핵심: fusion 전 병합 단위 정규화</strong></p>
            <p className="evidence">
              evidence:{' '}
              <a target="_blank" rel="noopener noreferrer" href="https://github.com/fluanceifi/Hybrid-RAG-Portfolio/blob/main/data/hybrid_eval_b0.7_k0.3_rc20_kc10.md">
                data/hybrid_eval_b0.7_k0.3_rc20_kc10.md
              </a>
              ,{' '}
              <a target="_blank" rel="noopener noreferrer" href="https://github.com/fluanceifi/Hybrid-RAG-Portfolio/blob/main/data/hybrid_eval_report_7_3_dedup.md">
                data/hybrid_eval_report_7_3_dedup.md
              </a>
            </p>
          </article>
        </div>
      </section>

      {/* ────────── BASELINE 정의 ────────── */}
      <section className="page">
        <h2 className="section-title">Baseline 정의와 혼선 방지</h2>
        <p className="section-desc">
          본 포트폴리오는 수치를 단일 선형 개선으로 표현하지 않고, baseline을 목적별로 분리해 개선 원인을 분명히 기술한다.
        </p>

        <div className="insight-callout">
          <h3>혼선 방지 핵심 문장</h3>
          <p>
            <strong>35%는 BM25 초기 query 전략 baseline이며, dedup 이슈와 무관하다.</strong><br />
            dedup 영향은 Hybrid RRF 병합 단계에서 발생했고, 7:3 기준{' '}
            <strong>45% → 100%</strong> 개선 구간으로 별도 관리한다.
          </p>
        </div>

        <div className="summary-grid">
          <article className="summary-card">
            <h3>BM25 Baseline</h3>
            <ul className="tight-list">
              <li>조건: <code>match content</code></li>
              <li>결과: 35.00%</li>
              <li>개선: <code>multi_match(title^3 + content)</code> → 95.00%</li>
            </ul>
          </article>
          <article className="summary-card">
            <h3>Hybrid Baseline</h3>
            <ul className="tight-list">
              <li>조건: RRF 병합 전 dedup 미적용, 7:3</li>
              <li>결과: 45.00%</li>
              <li>개선: <code>section_key</code> dedup 적용 → 100.00%</li>
            </ul>
          </article>
        </div>
      </section>

      {/* ────────── ARCHITECTURE ────────── */}
      <section className="page">
        <h2 className="section-title">Architecture &amp; Retrieval Strategy</h2>
        <p className="section-desc">
          검색 전략은 BM25 단일 방식이 아니라 Lucene 기반 lexical retrieval, ES kNN(HNSW), 그리고 weighted RRF fusion으로 구성했다.
        </p>

        <div className="diagram-grid">
          <article className="diagram-card">
            <h3>System Architecture</h3>
            <figure>
              <img src="/assets/images/hybrid_rag_architecture.png" alt="Hybrid RAG system architecture" />
              <figcaption>
                FastAPI 질의 처리에서 Elasticsearch(BM25/kNN)와 OpenAI 임베딩/생성을 조합한다.
              </figcaption>
            </figure>
          </article>
          <article className="diagram-card">
            <h3>Lucene + BM25 + kNN(HNSW) + RRF</h3>
            <figure>
              <img src="/assets/images/retrieval-flow.png" alt="Retrieval flow diagram" />
              <figcaption>
                Lucene Analyzer(동의어 포함) 기반 lexical 신호와 HNSW 기반 semantic 신호를 weighted RRF로 결합한다.
              </figcaption>
            </figure>
          </article>
        </div>

        <div className="summary-grid">
          <article className="summary-card">
            <h3>Lexical Retrieval</h3>
            <ul className="tight-list">
              <li>엔진: Elasticsearch(Lucene)</li>
              <li>분석기: Nori + synonym_graph 기반 search analyzer</li>
              <li>랭킹: BM25 + title/content boost + phrase boost</li>
            </ul>
          </article>
          <article className="summary-card">
            <h3>Semantic &amp; Fusion</h3>
            <ul className="tight-list">
              <li>엔진: dense_vector kNN</li>
              <li>탐색: HNSW 기반 ANN</li>
              <li>결합: Weighted RRF (BM25, kNN 비중 조정)</li>
            </ul>
          </article>
        </div>
      </section>

      {/* ────────── TROUBLESHOOTING ────────── */}
      <section className="page">
        <h2 className="section-title">Troubleshooting</h2>
        <p className="section-desc">
          장애/오탐의 원인을 시스템 단계별로 분리하고, 데이터 수집-병합-튜닝 순서로 개선했다.
        </p>

        <div className="problem-list">
          <article className="problem-card">
            <span className="number">Issue 01</span>
            <h3><code>#fragment</code> 중복 수집으로 문서 품질이 왜곡됐다</h3>
            <div className="subheading">원인</div>
            <p>
              API 문서의 각 섹션은 <code>reference#결제승인</code>처럼 fragment 단위로 구분되지만,
              HTTP 요청 시 fragment는 서버에 전달되지 않는다.
              결과적으로 같은 페이지가 섹션 수만큼 반복 수집되어 동일 문서가 중복 인덱싱됐고,
              BM25 스코어와 kNN 유사도 모두 왜곡됐다.
            </p>
            <div className="subheading">해결</div>
            <ul className="tight-list">
              <li>
                <strong>fetch 단계 fragment 제거 dedup</strong>:
                URL 수집 시 fragment를 제거한 뒤 중복 URL을 필터링하여 동일 페이지를 한 번만 요청하도록 수정했다.
              </li>
              <li>
                <strong>문서/청크 해시 기반 중복 제거</strong>:
                수집된 문서의 본문 내용을 해시화하여 내용이 동일한 청크는 인덱싱 단계에서 제거했다.
              </li>
              <li>
                <strong>섹션 분할 후 장문 청킹 재구성</strong>:
                중복 제거 이후 섹션 단위로 문서를 재분할하고, 청킹을 재구성하여 섹션 경계가 명확한 검색 단위를 확보했다.
              </li>
            </ul>
            <div className="subheading">근거</div>
            <p className="evidence">
              <a target="_blank" rel="noopener noreferrer" href="https://github.com/fluanceifi/hybrid-search-rag/blob/main/README.md">
                README.md
              </a>
            </p>
          </article>

          <article className="problem-card">
            <span className="number">Issue 02</span>
            <h3>RRF dedup 미적용 시 동일 섹션 점수가 과누적됐다</h3>
            <div className="subheading">원인</div>
            <p>
              한 섹션이 여러 청크로 쪼개진 상태에서 RRF 병합을 수행 시,
              같은 섹션의 청크들이 BM25/kNN 양쪽 리스트에 각각 등장해 점수가 청크 수만큼 누적된다.
              실제로는 순위가 낮은 섹션이 청크 수가 많다는 이유만으로 1등을 차지하는 왜곡이 발생했다.
            </p>
            <div className="subheading">해결</div>
            <ul className="tight-list">
              <li>
                RRF 계산 전에 <code>section_key</code> 기준 dedup 적용 —{' '}
                <code>es_store.py:116</code> <code>dedup_by_doc_key()</code>:
                BM25/kNN 각 리스트에서 동일 <code>section_key</code>의 첫 청크만 남기고 제거
              </li>
              <li>병합 단위를 문서 의미 단위로 정규화</li>
            </ul>
            <div className="subheading">결과</div>
            <ul className="tight-list">
              <li>7:3 동일 조건에서 45% → 100% 회복</li>
            </ul>
            <p className="evidence">
              <a target="_blank" rel="noopener noreferrer" href="https://github.com/fluanceifi/Hybrid-RAG-Portfolio/blob/main/data/hybrid_eval_b0.7_k0.3_rc20_kc10.md">
                hybrid_eval_b0.7_k0.3_rc20_kc10.md
              </a>
              ,{' '}
              <a target="_blank" rel="noopener noreferrer" href="https://github.com/fluanceifi/Hybrid-RAG-Portfolio/blob/main/data/hybrid_eval_report_7_3_dedup.md">
                hybrid_eval_report_7_3_dedup.md
              </a>
            </p>
          </article>

          <article className="problem-card">
            <span className="number">Issue 03</span>
            <h3>가중치 과적용은 독이 될 수 있었다</h3>
            <div className="subheading">관찰</div>
            <p>
              small 모델 실험에서 85:15는 100%였지만, 9:1은 95%로 후퇴했다.
              특정 신호를 과도하게 신뢰하면 질의 유형 다양성에 취약해진다.
            </p>
            <div className="subheading">결론</div>
            <ul className="tight-list">
              <li>도메인별 질의 분포에 맞춘 최적점 탐색이 필요</li>
              <li>가중치는 높을수록 좋지 않고 균형이 중요</li>
            </ul>
            <p className="evidence">
              <a target="_blank" rel="noopener noreferrer" href="https://github.com/fluanceifi/Hybrid-RAG-Portfolio/blob/main/data/eval_summary_small_model.md">
                eval_summary_small_model.md
              </a>
              ,{' '}
              <a target="_blank" rel="noopener noreferrer" href="https://github.com/fluanceifi/Hybrid-RAG-Portfolio/blob/main/data/hybrid_eval_report_9_1_dedup.md">
                hybrid_eval_report_9_1_dedup.md
              </a>
            </p>
          </article>
        </div>
      </section>

      {/* ────────── 실험 결과 ────────── */}
      <section className="page">
        <h2 className="section-title">실험 결과 (단계별 병기)</h2>
        <p className="section-desc">
          모델, 가중치, dedup 여부를 조건 배지로 명시해 결과를 비교했다.
        </p>

        <div className="diagram-grid">
          <article className="diagram-card">
            <h3>RRF Dedup 영향</h3>
            <figure>
              <img src="/assets/images/dedup-impact.png" alt="Dedup impact chart" />
              <figcaption>dedup off/on 차이가 hybrid 랭킹 안정성에 직접적으로 영향을 미친다.</figcaption>
            </figure>
          </article>
          <article className="diagram-card">
            <h3>가중치 민감도</h3>
            <figure>
              <img src="/assets/images/weight-sensitivity.png" alt="Weight sensitivity chart" />
              <figcaption>85:15와 7:3은 강한 성능을 보였고, 9:1은 오히려 후퇴할 수 있음을 확인했다.</figcaption>
            </figure>
          </article>
          <article className="diagram-card">
            <h3>모델 비교 (small vs large)</h3>
            <figure>
              <img src="/assets/images/model-comparison.png" alt="Model comparison chart" />
              <figcaption>large 모델 7:3도 100%를 달성했지만, small 모델에서도 가중치 최적화로 100% 도달 가능했다.</figcaption>
            </figure>
          </article>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>실험 단계</th>
                <th>조건</th>
                <th>Top-1</th>
                <th>핵심 해석</th>
                <th>근거</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>BM25 Baseline</td>
                <td>
                  <span className="badge">model: n/a</span>{' '}
                  <span className="badge">weights: n/a</span>{' '}
                  <span className="badge">dedup: n/a</span>{' '}
                  <span className="badge">query: match content</span>
                </td>
                <td className="score">35.00%</td>
                <td>BM25 초기 query 전략 baseline</td>
                <td>
                  <a target="_blank" rel="noopener noreferrer" href="https://github.com/fluanceifi/Hybrid-RAG-Portfolio/blob/main/data/bm25_eval_report.md">
                    bm25_eval_report.md
                  </a>
                </td>
              </tr>
              <tr>
                <td>BM25 Tuned</td>
                <td>
                  <span className="badge">model: n/a</span>{' '}
                  <span className="badge">weights: n/a</span>{' '}
                  <span className="badge">dedup: n/a</span>{' '}
                  <span className="badge">query: multi_match + boost</span>
                </td>
                <td className="score">95.00%</td>
                <td>title/content boost로 lexical 정밀도 개선</td>
                <td>
                  <a target="_blank" rel="noopener noreferrer" href="https://github.com/fluanceifi/Hybrid-RAG-Portfolio/blob/main/data/bm25_eval_report.md">
                    bm25_eval_report.md
                  </a>
                </td>
              </tr>
              <tr>
                <td>Hybrid Baseline</td>
                <td>
                  <span className="badge">model: large</span>{' '}
                  <span className="badge">weights: 0.7:0.3</span>{' '}
                  <span className="badge">dedup: off</span>
                </td>
                <td className="score">45.00%</td>
                <td>동일 섹션 중복 누적으로 RRF 왜곡</td>
                <td>
                  <a target="_blank" rel="noopener noreferrer" href="https://github.com/fluanceifi/Hybrid-RAG-Portfolio/blob/main/data/hybrid_eval_b0.7_k0.3_rc20_kc10.md">
                    hybrid_eval_b0.7_k0.3_rc20_kc10.md
                  </a>
                </td>
              </tr>
              <tr>
                <td>Hybrid Stabilized</td>
                <td>
                  <span className="badge">model: large</span>{' '}
                  <span className="badge">weights: 0.7:0.3</span>{' '}
                  <span className="badge">dedup: on</span>
                </td>
                <td className="score">100.00%</td>
                <td>section_key dedup으로 병합 단위 정상화</td>
                <td>
                  <a target="_blank" rel="noopener noreferrer" href="https://github.com/fluanceifi/Hybrid-RAG-Portfolio/blob/main/data/hybrid_eval_report_7_3_dedup.md">
                    hybrid_eval_report_7_3_dedup.md
                  </a>
                </td>
              </tr>
              <tr>
                <td>Small Model Tuned</td>
                <td>
                  <span className="badge">model: small</span>{' '}
                  <span className="badge">weights: 85:15</span>{' '}
                  <span className="badge">dedup: on</span>
                </td>
                <td className="score">100.00%</td>
                <td>모델 교체 없이도 최적 가중치로 100% 달성</td>
                <td>
                  <a target="_blank" rel="noopener noreferrer" href="https://github.com/fluanceifi/Hybrid-RAG-Portfolio/blob/main/data/eval_summary_small_model.md">
                    eval_summary_small_model.md
                  </a>
                  ,{' '}
                  <a target="_blank" rel="noopener noreferrer" href="https://github.com/fluanceifi/Hybrid-RAG-Portfolio/blob/main/data/eval_report_small_85_15.md">
                    eval_report_small_85_15.md
                  </a>
                </td>
              </tr>
              <tr>
                <td>Small Model Overweight</td>
                <td>
                  <span className="badge">model: small</span>{' '}
                  <span className="badge">weights: 0.9:0.1</span>{' '}
                  <span className="badge">dedup: on</span>
                </td>
                <td className="score">95.00%</td>
                <td>과한 BM25 비중은 질의 다양성 대응력을 떨어뜨릴 수 있음</td>
                <td>
                  <a target="_blank" rel="noopener noreferrer" href="https://github.com/fluanceifi/Hybrid-RAG-Portfolio/blob/main/data/hybrid_eval_report_9_1_dedup.md">
                    hybrid_eval_report_9_1_dedup.md
                  </a>
                </td>
              </tr>
              <tr>
                <td>Large Model 7:3</td>
                <td>
                  <span className="badge">model: large</span>{' '}
                  <span className="badge">weights: 0.7:0.3</span>{' '}
                  <span className="badge">dedup: on</span>
                </td>
                <td className="score">100.00%</td>
                <td>semantic 신호 품질 향상 시 7:3 조합에서도 안정적 성능</td>
                <td>
                  <a target="_blank" rel="noopener noreferrer" href="https://github.com/fluanceifi/Hybrid-RAG-Portfolio/blob/main/data/hybrid_eval_report_7_3_large.md">
                    hybrid_eval_report_7_3_large.md
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="footnote">
          주의: <code>eval_report_small_85_15.md</code> 헤더는 출력 포맷(소수점 1자리) 때문에{' '}
          <code>0.8:0.1</code>로 보일 수 있다. 실험 요약 문서에서는 85:15로 관리한다.
        </p>
      </section>

      {/* ────────── REFERENCE-DRIVEN TUNING ────────── */}
      <section className="page">
        <h2 className="section-title">Reference-Driven Tuning</h2>
        <p className="section-desc">
          외부 레퍼런스를 그대로 복제하지 않고, 도메인별 가중치 설계 인사이트를 실험 설계에 반영해 검증했다.
        </p>
        <div className="summary-grid">
          <article className="summary-card">
            <h3>참조 인사이트</h3>
            <p>
              Medium 사례에서 문서 유형별로 BM25/Vector 가중치를 다르게 운용해야 성능이 좋아진다는 점을 확인했다.
              이를 기반으로 7:3, 85:15, 9:1을 비교하며 도메인 최적점을 찾았다.
            </p>
            <p className="evidence">
              reference:{' '}
              <a target="_blank" rel="noopener noreferrer" href="https://medium.com/@hitendra.patel2986/i-built-a-hybrid-search-system-that-beats-standard-rag-by-35-1968791ae539">
                I Built a Hybrid Search System That Beats Standard RAG by 35%
              </a>
            </p>
          </article>
          <article className="summary-card">
            <h3>적용 결과</h3>
            <ul className="tight-list">
              <li>small 모델에서도 가중치 최적화로 100% 도달 가능함을 확인</li>
              <li>9:1처럼 과도한 비중은 오히려 95%로 후퇴 가능</li>
              <li>large 모델 7:3은 100%로 안정적인 조합을 확인</li>
            </ul>
          </article>
        </div>
      </section>

      {/* ────────── 재현 및 근거 ────────── */}
      <section className="page">
        <h2 className="section-title">재현 및 근거</h2>
        <p className="section-desc">
          본 포트폴리오의 핵심 수치는 로컬 리포트 파일 기반이며, 아래 커맨드로 재현 가능하다.
        </p>
        <pre><code>{`# 0) 레포 클론
git clone https://github.com/fluanceifi/hybrid-search-rag
cd hybrid-search-rag

# 1) 전체 파이프라인 (수집 → 분할 → 청킹 → 인덱싱)
python3 pg-rag/setup_pipeline.py

# 2) BM25 baseline/tuned 평가
python3 pg-rag/scripts/eval/eval_bm25_top1.py \\
  --golden pg-rag/data/golden_queries_20.json \\
  --index pg-docs-toss-small \\
  --es-url http://localhost:9200

# 3) Hybrid 평가 예시
python3 pg-rag/scripts/eval/eval_hybrid_top1.py \\
  --golden pg-rag/data/golden_queries_20.json \\
  --index pg-docs-toss-small \\
  --es-url http://localhost:9200 \\
  --bm25-weight 0.7 \\
  --knn-weight 0.3 \\
  --rank-constant 20`}</code></pre>

        <div className="footer-note">
          <strong>Evidence Files</strong>
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/fluanceifi/Hybrid-RAG-Portfolio/blob/main/data/bm25_eval_report.md">data/bm25_eval_report.md</a><br />
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/fluanceifi/Hybrid-RAG-Portfolio/blob/main/data/hybrid_eval_b0.7_k0.3_rc20_kc10.md">data/hybrid_eval_b0.7_k0.3_rc20_kc10.md</a><br />
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/fluanceifi/Hybrid-RAG-Portfolio/blob/main/data/hybrid_eval_report_7_3_dedup.md">data/hybrid_eval_report_7_3_dedup.md</a><br />
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/fluanceifi/Hybrid-RAG-Portfolio/blob/main/data/eval_summary_small_model.md">data/eval_summary_small_model.md</a><br />
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/fluanceifi/Hybrid-RAG-Portfolio/blob/main/data/eval_report_small_85_15.md">data/eval_report_small_85_15.md</a><br />
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/fluanceifi/Hybrid-RAG-Portfolio/blob/main/data/hybrid_eval_report_9_1_dedup.md">data/hybrid_eval_report_9_1_dedup.md</a><br />
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/fluanceifi/Hybrid-RAG-Portfolio/blob/main/data/hybrid_eval_report_7_3_large.md">data/hybrid_eval_report_7_3_large.md</a><br />
          <a href="/assets/data/metrics.json">portfolio/assets/data/metrics.json</a>
        </div>
      </section>
    </main>
  )
}
