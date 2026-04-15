import '../styles/portfolio.css'

export default function SmuClubPage() {
  return (
    <main className="document">

      {/* ────────── HERO ────────── */}
      <section className="page hero">
        <span className="eyebrow">Project Portfolio</span>
        <h1>SMU-CLUB</h1>
        <p className="lead">
          상명대학교 학생을 위한 동아리 탐색, 지원, 운영 관리 플랫폼으로,
          운영 안정성 개선, 배치 처리 구조 재설계, 이메일 비동기 처리 성능 개선을 중심으로 정리한 프로젝트 포트폴리오이다.
        </p>

        <div className="meta-grid">
          <article className="meta-card">
            <span className="label">프로젝트 유형</span>
            <div className="value">동아리 관리 및 지원 플랫폼</div>
          </article>
          <article className="meta-card">
            <span className="label">핵심 기술</span>
            <div className="value">React + Vite, Spring Boot, JPA, MySQL</div>
          </article>
          <article className="meta-card">
            <span className="label">중점 주제</span>
            <div className="value">운영 안정성, 배치 트랜잭션, 조회 안정성, 이메일 비동기 처리</div>
          </article>
        </div>


        <div className="summary-grid">
          <article className="summary-card">
            <h3>프로젝트 개요</h3>
            <p>
              SMU-CLUB은 학생이 다양한 동아리를 탐색하고 지원할 수 있도록 지원하며,
              운영진은 동아리 소개 관리, 모집 상태 전환, 지원자 조회, 결과 통보,
              파일 업로드 등의 운영 업무를 하나의 서비스에서 처리할 수 있도록 설계한 플랫폼이다.
            </p>
          </article>
          <article className="summary-card">
            <h3>핵심 개선 사항</h3>
            <ul className="tight-list">
              <li>스케줄러 실패를 운영자가 즉시 감지할 수 있도록 알림 체계를 개선했다.</li>
              <li>배치성 작업의 트랜잭션 범위를 재설계해 실패 전파 범위를 줄였다.</li>
              <li>합불결과 메일 발송을 비동기 처리로 전환해 서버 블로킹을 해소했다.</li>
              <li>JPA Fetch Join으로 인한 조회 누락 문제를 해결했다.</li>
            </ul>
          </article>
        </div>

        <div className="summary-grid">
          <article className="summary-card">
            <h3>운영 관점 의사결정</h3>
            <p>
              서비스 운영 과정에서 외부 인증 의존 구조의 리스크를 검토하고,
              학교 관계자들과의 협의 이후 운영진 계정 로그인과 일반 지원자 비로그인 지원 구조로의
              전환 방향을 주도적으로 정리했다.
              메일 대량 발송 방식으로 BCC, Resend API, @Async + ThreadPoolTaskExecutor 세 가지를
              검토했으며, 개인화 요구사항·비용·운영 규모를 기준으로 비동기 스레드풀 방식을 선택했다.
            </p>
          </article>
          <article className="summary-card">
            <h3>제출 포인트</h3>
            <ul className="tight-list">
              <li>배치 작업의 운영 안정성 확보 경험</li>
              <li>문제 발견 이후 구조적 개선까지 연결한 경험</li>
              <li>기술 구현과 협업 효율화를 함께 고려한 경험</li>
              <li>운영 리스크를 인지하고 서비스 방향을 조정한 경험</li>
              <li>처리시간 75.4% 단축, 처리량 4.1배 향상이라는 수치로 개선 효과를 검증한 경험</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="page">
        <h3>Skills</h3>
        <div className="skills-rows">
          <div className="skill-row">
            <span className="skill-cat">Frontend</span>
            <div className="tags">
              <span className="tag">React + Vite</span>
            </div>
          </div>
          <div className="skill-row">
            <span className="skill-cat">Backend &amp; DB</span>
            <div className="tags">
              <span className="tag">Spring Boot</span>
              <span className="tag">JPA</span>
              <span className="tag">MySQL</span>
            </div>
          </div>
          <div className="skill-row">
            <span className="skill-cat">Infra</span>
            <div className="tags">
              <span className="tag">Nginx</span>
              <span className="tag">Docker Compose</span>
              <span className="tag">OCI</span>
            </div>
          </div>
          <div className="skill-row">
            <span className="skill-cat">Integration</span>
            <div className="tags">
              <span className="tag">OCI Object Storage</span>
              <span className="tag">Discord Webhook</span>
              <span className="tag">Scheduler</span>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── ARCHITECTURE & FLOW ────────── */}
      <section className="page">
        <h2 className="section-title">Architecture &amp; Flow</h2>
        <p className="section-desc">
          서비스 구조와 주요 데이터 흐름을 시각화하여, 사용자 요청이 어떤 방식으로 백엔드와 외부 시스템으로 연결되는지 정리했다.
        </p>

        <div className="diagram-grid">
          <article className="diagram-card">
            <h3>Architecture Diagram</h3>
            <figure>
              <img src="/images/architecture.png" alt="SMU-CLUB architecture diagram" />
              <figcaption>
                학생 사용자와 운영진은 Client를 통해 서비스에 접근하며, Backend API는 MySQL,
                OCI Object Storage, SMTP, 외부 인증 시스템과 연동된다.
              </figcaption>
            </figure>
          </article>

          <article className="diagram-card">
            <h3>Data Flow Diagram</h3>
            <figure>
              <img src="/images/dataflow.png" alt="SMU-CLUB data flow diagram" />
              <figcaption>
                동아리 조회, 파일 업로드, 지원서 제출, 지원자 관리, 이메일 발송 흐름을 사용자와 운영진 관점에서 정리했다.
              </figcaption>
            </figure>
          </article>
        </div>
      </section>

      {/* ────────── SEQUENCE DIAGRAM ────────── */}
      <section className="page">
        <h2 className="section-title">Sequence Diagram</h2>
        <p className="section-desc">
          주요 시나리오를 기준으로 배치 처리, 상세 조회, 스케줄러 장애 감지 흐름을 분리해 정리했다.
        </p>

        <div className="diagram-grid">
          <article className="diagram-card">
            <h3>모집 자동 마감 시퀀스</h3>
            <figure>
              <img src="/images/recruitmentautoclosersequence.png" alt="Recruitment auto closure sequence" />
              <figcaption>
                종료 대상 조회 이후 청크 단위로 상태를 갱신하는 구조를 시퀀스 기준으로 정리했다.
              </figcaption>
            </figure>
          </article>

          <article className="diagram-card">
            <h3>동아리 상세 조회 시퀀스</h3>
            <figure>
              <img src="/images/clubdetailsequnce.png" alt="Club detail sequence" />
              <figcaption>
                동아리 상세 조회 시 LEFT JOIN FETCH를 사용해 이미지가 없더라도 부모 엔티티가 조회되도록 설계했다.
              </figcaption>
            </figure>
          </article>

          <article className="diagram-card">
            <h3>스케줄러 장애 알림 시퀀스</h3>
            <figure>
              <img src="/images/scheduler.png" alt="Scheduler alert sequence" />
              <figcaption>
                스케줄러 예외 발생 시 AOP 기반으로 Discord Webhook 알림이 전송되는 구조를 나타낸다.
              </figcaption>
            </figure>
          </article>
        </div>
      </section>

      {/* ────────── 문제 해결 사례 ────────── */}
      <section className="page">
        <h2 className="section-title">문제 해결 사례</h2>
        <p className="section-desc">
          프로젝트 진행 과정에서 운영 안정성, 데이터 조회 정확성, 협업 효율 측면에서 발견한 문제를 문제-해결-결과 순서로 정리했다.
        </p>

        <div className="problem-list">
          {/* Problem 01 */}
          <article className="problem-card">
            <span className="number">Problem 01</span>
            <h3>스케줄러가 실패해도 운영자가 즉시 인지하기 어려웠다</h3>

            <div className="subheading">문제</div>
            <p>
              이 프로젝트에는 모집 기간 종료 시 자동 마감, 이메일 재전송, 만료된 동아리 회원 정리,
              OCI 고아 파일 정리와 같이 사용자가 직접 호출하지 않는 배치성 작업이 다수 존재한다.
            </p>
            <p>
              초기 구조에서는 스케줄러 실패가 로그에만 남거나 늦게 발견될 가능성이 컸다. <br></br>
              특히 스케줄러는 API 요청과 달리 사용자가 즉시 오류를 체감하지 않기 때문에,
              실패가 발생해도 운영 측에서 사후적으로 인지하는 문제가 있었다.
            </p>

            <div className="subheading">해결</div>
            <p>
              스케줄러 메서드에 <code>@DiscordAlert</code> 커스텀 어노테이션을 적용,{' '} <code>Aspect</code>에서 <code>@AfterThrowing</code>으로 예외를 감지한다.{' '} <br></br>
            <code>Service</code>가 <code>Discord Webhook API</code>로 장애 알림을 보내는 구조를 적용했다.
            </p>
            <figure className="figure-constrained">
              <img src="/images/discordalert.png" alt="Discord 장애 알림 동작 흐름" />
              <figcaption>
                스케줄러 예외 발생 → AOP @AfterThrowing 감지 → DiscordAlertService → Discord Webhook 전송까지의 내부 흐름이다.
              </figcaption>
            </figure>
            <ul className="tight-list">
              <li>예외 감지 책임을 비즈니스 로직에서 분리</li>
              <li>알림 전송은 <code>@Async</code>로 실행해 메인 흐름 차단 방지</li>
              
              <li>스케줄러별 중복 알림 코드를 공통 관심사로 정리</li>
            </ul>


            <div className="subheading">결과</div>
            <ul className="tight-list">
              <li>배치 작업 장애를 외부 채널을 통해 신속하게 인지할 수 있게 되었다.</li>
              <li>운영자가 로그를 별도로 확인하지 않아도 장애 상황을 즉시 파악할 수 있게 되었다.</li>
              <li>스케줄러 코드에서 알림 관련 중복 로직이 줄어 유지보수성이 향상되었다.</li>
              <li>원래 예외는 다시 던져서 에러 정보가 날라가지 않도록 한다.</li>
            </ul>
          </article>

          {/* Problem 02 */}
          <article className="problem-card">
            <span className="number">Problem 02</span>
            <h3>단일 트랜잭션 배치는 일부 실패가 전체 실패로 확산되기 쉬웠다</h3>

            <div className="subheading">문제</div>
            <figure className="figure-constrained">
              <img src="/images/before-chunk.png" alt="단일 트랜잭션 배치 — 문제 구조" />
              <figcaption>단일 @Transactional로 전체를 감싸면 Lock이 30초간 유지되고, 그 사이 다른 트랜잭션은 접근할 수 없다.</figcaption>
            </figure>
            <br></br>
            <p>
              배치 작업을 하나의 큰 트랜잭션으로 처리할 경우 일부 데이터 처리 실패가 전체 롤백으로 이어질 수 있고,
              락 점유 시간이 길어져 운영 중 충돌 가능성이 커진다. 또한 어느 데이터에서 실패했는지 추적이 어렵고,
              재처리 범위가 불필요하게 커지는 문제가 있었다.
            </p>
            <p>
              이 문제는 모집 자동 마감과 이메일 재전송처럼 여러 건을 독립적으로 처리할 수 있는 작업에서 특히 두드러졌다.
            </p>
            <div className="subheading">해결</div>
            <p>
              트랜잭션 범위를 배치 특성에 맞게 분리해 조회는 가볍게 수행하고,
              실제 변경 작업은 작은 단위로 분리하는 방식으로 구조를 재설계했다.
            </p>
            <ul className="tight-list">
              <li>모집 자동 마감은 종료 대상 조회 후 <code>BATCH_SIZE = 10</code> 단위로 청크 분할</li>
              <li><code>closeRecruitments()</code>를 <code>REQUIRES_NEW</code> 트랜잭션으로 처리</li>
              <li>이메일 재전송은 각 항목을 <code>processSingleTask()</code>에서 독립 트랜잭션으로 처리</li>
              <li>성공 시 상태 반영, 실패 시 백오프 및 포기 처리를 개별 단위로 관리</li>
            </ul>
            <figure className="figure-constrained">
              <img src="/images/after-chunk.png" alt="Chunk 단위 독립 트랜잭션 — 해결 구조" />
              <figcaption>Chunk 단위로 분리하면 Lock이 3초씩 분산되고, Chunk 간 Commit·Unlock 사이에 다른 트랜잭션이 끼어들 수 있다.</figcaption>
            </figure>
            <figure>
              <img src="/images/compare-chunk.png" alt="단일 트랜잭션 vs Chunk 처리 비교표" />
              <figcaption>Before / After 비교 — 트랜잭션 수, Lock 유지 시간, 실패 영향, 메모리 사용량 전반에서 개선됐다.</figcaption>
            </figure>

            <div className="subheading">결과</div>
            <ul className="tight-list">
              <li>일부 실패가 전체 배치를 무효화하지 않도록 개선했다.</li>
              <li>Lock 점유 시간: <strong>30초 통째로</strong> → <strong>3초씩 10번</strong>으로 분산했다.</li>
              <li>배치 처리 중 어느 구간에서 실패했는지 파악하기 쉬워졌다.</li>
              <li>운영 환경에서 재시도와 장애 복구 절차가 한층 단순해졌다.</li>
            </ul>
          </article>

          {/* Problem 03 */}
          <article className="problem-card">
            <span className="number">Problem 03</span>
            <h3>합불결과 메일 100건을 동기로 발송하면 서버가 100초 동안 멈췄다</h3>

            <div className="subheading">문제</div>
            <p>
              관리자가 "합불결과 메일 발송하기" 버튼을 누르면 지원자 전체에게 개별 합격/불합격 메일을 보내야 했다. <br></br>
              초기 구현은 for문으로 한 통씩 동기적으로 발송했다. <br></br>
              SMTP I/O 작업 특성상 1명당 평균 1초가 걸렸고, 100명이면 100초 동안 메인 스레드가 블로킹됐다. <br></br>
              결과적으로 화면이 멈춘 채로 대기하다 <code>504 Gateway Timeout</code>이 발생했다.
            </p>
            <figure className="figure-narrow">
              <img src="/images/mailadminui.png" alt="지원자 관리 — 합불결과 메일 발송하기 UI" />
              <figcaption>관리자가 "합불결과 메일 발송하기" 버튼을 누르면 동기 발송으로 서버가 멈췄다.</figcaption>
            </figure>

            <div className="subheading">해결 — @Async + ThreadPoolTaskExecutor</div>
            <p>
              메일 발송 작업을 별도 스레드에 위임하고, 메인 스레드는 즉시 응답을 반환하는 방식을 선택했다. <br></br>
              관리자가 버튼을 누르면 서버는 0.1초 만에 "전송이 시작되었습니다"를 돌려주고,
              실제 메일은 뒤에서 조용히 나간다.
            </p>
            <ul className="tight-list">
              <li>메인 애플리케이션 클래스에 <code>@EnableAsync</code>, 메일 발송 메서드에 <code>@Async</code>를 추가했다.</li>
              <li>
                <code>@Async</code>만 붙이면 Spring은 요청마다 스레드를 무한정 생성(<code>SimpleAsyncTaskExecutor</code>)해
                트래픽 폭주 시 서버가 다시 드러눕는다.
              </li>
              <li>
                <code>ThreadPoolTaskExecutor</code>를 커스텀해 스레드 수를 직접 제어했다
                (corePoolSize=5 / maxPoolSize=10 / queueCapacity=100).
              </li>
            </ul>
            <pre><code>{`@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "mailExecutor")
    public Executor mailExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);     // 기본 대기 스레드 수
        executor.setMaxPoolSize(10);     // 최대 스레드 수
        executor.setQueueCapacity(100);  // 대기열 크기
        executor.setThreadNamePrefix("MailSender-");
        executor.initialize();
        return executor;
    }
}`}</code></pre>
            <div className="diagram-grid mail-diagram-grid">
              <article className="diagram-card">
                <h3>문제 — 동기 발송</h3>
                <figure>
                  <img src="/images/mailsyncproblem.png" alt="동기 발송 블로킹 흐름" />
                  <figcaption>메인 스레드가 100건을 순차 처리하는 동안 화면이 멈추고 504 Timeout이 발생한다.</figcaption>
                </figure>
              </article>
              <article className="diagram-card">
                <h3>해결 — 비동기 + 스레드풀</h3>
                <figure>
                  <img src="/images/mailasyncthreadpool.png" alt="비동기 ThreadPoolTaskExecutor 구조" />
                  <figcaption>메인 스레드는 즉시 응답하고, ThreadPoolTaskExecutor의 워커 스레드가 병렬로 처리한다.</figcaption>
                </figure>
              </article>
            </div>

            <div className="subheading">벤치마크 비교</div>
            <div className="diagram-grid bench-diagram-grid">
              <figure>
                <img src="/images/sync-bench.png" alt="동기 발송 벤치마크" />
                <figcaption>동기 발송 — 100건 순차 처리 결과</figcaption>
              </figure>
              <figure>
                <img src="/images/async-bench.png" alt="비동기 발송 벤치마크" />
                <figcaption>비동기 + 스레드풀 발송 — 100건 처리 결과</figcaption>
              </figure>
            </div>

            <div className="subheading">결과</div>
            <ul className="tight-list">
              <li><strong>UX 개선</strong> — 관리자가 버튼을 누르자마자 0.1초 내 "전송이 시작되었습니다" 피드백을 받는다. 504 Timeout 해소.</li>
              <li><strong>성능 개선</strong> — 동일 조건에서 <strong>동기 93.8초(1.07건/초)</strong> 대비 <strong>비동기 23.0초(4.34건/초)</strong>로 <strong>총 처리시간 75.4%</strong> 단축, <strong>처리량 약 4.1배 향상.</strong></li>
              <li><strong>안정성</strong> — ThreadPoolTaskExecutor가 스레드 수를 제한하므로 트래픽 폭주에도 서버가 안정적으로 운영된다.</li>
              <li><strong>실패 격리</strong> — 1건 전송 실패 시 catch 블록에서 로그만 남기고 나머지는 정상 처리된다. 시스템 결함 허용(Fault Tolerance) 능력이 높아졌다.</li>
            </ul>
          </article>

          {/* Problem 04 */}
          <article className="problem-card">
            <span className="number">Problem 04</span>
            <h3>JPA Fetch Join 사용 시 연관 데이터가 없으면 부모 엔티티가 조회 결과에서 누락되었다</h3>

            <div className="subheading">문제</div>
            <figure className="figure-constrained">
              <img src="/images/club.png" alt="동아리 — 동아리 이미지 참조" />
              <figcaption>기본정보는 동아리 테이블, 이미지는 동아리 이미지 테이블에 저장된다.</figcaption>
            </figure>
            <p>
              동아리 상세 조회에서는 동아리 <strong>기본 정보</strong>와 <strong>이미지 목록</strong>을 함께 내려줘야 했다. <br></br>
              그러나 연관된 이미지가 없는 동아리의 경우, Fetch Join 전략에 따라 부모 엔티티 자체가 조회 결과에서 누락될 수 있었다.
            </p>
            <p>
              서비스 관점에서는 존재하는 동아리임에도 조회되지 않는 현상으로 나타났으며,
              이는 단순한 데이터 부재와는 다른 성격의 버그였다.
            </p>

            <div className="subheading">해결</div>
            <p>
              상세 조회 쿼리를 <code>LEFT JOIN FETCH</code>로 변경해,
              연관 엔티티가 없어도 부모 엔티티는 반드시 조회되도록 수정했다.
            </p>
            <pre><code>{`@Query("SELECT c FROM Club c LEFT JOIN FETCH c.clubImages WHERE c.id = :clubId")
 Optional<Club> findByIdWithClubImages(Long clubId);`}</code></pre>
            <p>
              핵심은 이미지가 없더라도 동아리 상세는 보여야 한다는 기능 요구사항을 조인 전략에 정확히 반영하는 것이었다.
            </p>

            <div className="subheading">결과</div>
            <ul className="tight-list">
              <li>이미지가 없는 동아리도 정상적으로 상세 조회가 가능해졌다.</li>
              <li>데이터 부재와 조회 누락을 혼동하지 않도록 개선했다.</li>
              <li>JPA 조인 전략을 요구사항 기준으로 선택해야 한다는 기준을 팀 내에 공유할 수 있었다.</li>
            </ul>
          </article>
        </div>
      </section>

      {/* ────────── 결과적으로 얻은 개선점 ────────── */}
      <section className="page">
        <h2 className="section-title">결과적으로 얻은 개선점</h2>
        <p className="section-desc">
          구현 단위의 수정에 그치지 않고, 운영 안정성, 데이터 접근 안정성, 협업 생산성, 서비스 운영 의사결정까지 연결되는 개선 효과를 만들었다.
        </p>

        <div className="improvements-grid">
          <article className="improvement-card">
            <h3>운영 안정성</h3>
            <ul className="tight-list">
              <li>스케줄러 장애 감지 체계를 외부 알림 채널로 확장했다.</li>
              <li>배치 작업을 청크 단위 및 건별 처리로 분리해 장애 전파 범위를 줄였다.</li>
              <li>이메일 재전송, 파일 정리와 같은 운영성 기능을 서비스 구조에 통합했다.</li>
              <li>이메일 비동기 발송으로 타임아웃 없이 대량 메일 처리가 가능해졌다.</li>
            </ul>
          </article>

          <article className="improvement-card">
            <h3>성능 개선</h3>
            <ul className="tight-list">
              <li>이메일 대량 발송을 비동기 처리로 전환해 총 처리시간을 75.4% 단축했다.</li>
              <li>동기 발송(93.8초, 1.07건/초) 대비 비동기(23.0초, 4.34건/초)로 처리량이 약 4.1배 향상됐다.</li>
              <li>ThreadPoolTaskExecutor로 스레드 수를 제어해 성능과 안정성을 동시에 확보했다.</li>
            </ul>
          </article>

          <article className="improvement-card">
            <h3>데이터 접근 안정성</h3>
            <ul className="tight-list">
              <li>JPA 조인 전략을 기능 요구사항에 맞게 재설계했다.</li>
              <li>대량 상태 변경을 배치 업데이트로 처리해 불필요한 엔티티 반복 수정을 줄였다.</li>
            </ul>
          </article>


          <article className="improvement-card">
            <h3>서비스 운영 관점의 의사결정</h3>
            <ul className="tight-list">
              <li>외부 인증 의존 구조의 운영 리스크를 검토했다.</li>
              <li>학교 관계자들과의 협의 결과를 반영해 서비스 구조 변경 방향을 정리했다.</li>
              <li>운영진과 일반 지원자의 사용 맥락을 분리해 접근성과 운영 현실성을 함께 고려했다.</li>
            </ul>
          </article>
        </div>

        <div className="footer-note">
          <strong>참고 근거</strong>
          <ul className="tight-list refs-list">
            <li>
              코드 저장소:{' '}
              <a href="https://github.com/smu-human/smu-club">https://github.com/smu-human/smu-club</a>
            </li>
            <li>
              스케줄러/배치 관련 클래스:{' '}
              <code>RecruitmentAutoClosureScheduler</code>,{' '}
              <code>EmailRetryScheduler</code>,{' '}
              <code>EmailRetryService</code>,{' '}
              <code>ExpiredClubMemberCleanupScheduler</code>
            </li>
            <li>
              이메일 비동기 처리 관련 클래스:{' '}
              <code>OwnerService</code>,{' '}
              <code>AsyncConfig</code>
            </li>
            <li>
              조회 관련 클래스:{' '}
              <code>GuestClubController</code>,{' '}
              <code>GuestClubService</code>,{' '}
              <code>ClubRepository</code>
            </li>
            <li>
              기술 포스팅:{' '}
              <a href="https://fluanceifi.tistory.com/40">스케줄러가 조용히 실패했다</a>,{' '}
              <a href="https://fluanceifi.tistory.com/42">단일 트랜잭션의 함정에서 Chunk 처리까지</a>,{' '}
              <a href="https://fluanceifi.notion.site/Trouble-Shooting-100-100-feat-2b7f210247b28024b839c912e385c034">
                100명한테 메일 보내는데 왜 서버가 100초동안 멈추는거야?
              </a>
            </li>
          </ul>
        </div>
      </section>
    </main>
  )
}
