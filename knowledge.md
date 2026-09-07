# 유승준 포트폴리오 지식베이스

이 문서는 포트폴리오 PDF(포트폴리오_260907)의 내용을 기반으로 한, AI 챗봇의 답변 근거 자료입니다.
포트폴리오에는 3개의 백엔드 프로젝트(한강페이, SMU CLUB, Woori Card Scope)가 담겨 있습니다.

---

## 프로필 / 기본 정보

- 이름: 유승준 (Yoo Seungjun)
- 직무: 백엔드 개발자 (Backend Developer)
- GitHub: https://github.com/fluanceifi
- 지향점: 안정적인 서버 구조와 명확한 로직 설계를 추구합니다. 기능 구현에 그치지 않고 왜 그렇게 동작하는지 끝까지 이해하고, 읽기 쉽고 유지보수하기 쉬운 서버를 만드는 것을 목표로 합니다.
- 주력 기술: Java, Spring Boot, Spring Data JPA, MySQL, Redis, Docker, Nginx, AWS/OCI, GitHub Actions(CI/CD)
- 이 포트폴리오의 3개 프로젝트는 모두 백엔드 관점의 문제 해결(결제 정합성, 대용량 트랜잭션, 성능 최적화, 고가용성)에 초점을 둡니다.

---

## 프로젝트 1: 한강페이 (hangang-pay)

### 한강페이 개요

- 한 줄 소개: 블록체인(CBDC) 기반 지역화폐 PG(Payment Gateway) 결제 서비스입니다.
- 상세: 사용자는 지역화폐를 10% 할인된 가격으로 충전하고 지역 가맹점에서 간편하게 결제하며, 환불 및 은행 간 정산은 한국은행 CBDC 기반으로 처리됩니다. 결제 시 소비자 월렛에서 가맹점 월렛으로 코인이 즉시 이체되고, 가맹점은 쌓인 코인을 1:1로 계좌 환전할 수 있어 별도 정산 배치가 없습니다.
- 성격: 우리FIS아카데미 클라우드 과정 최종 프로젝트 (팀 프로젝트).
- 작업 기간: 2026.04.23 ~ 2026.06.17 (약 2개월).
- GitHub: https://github.com/fluanceifi/hangang-pay
- 유승준의 역할: 백엔드(BackEnd). 결제 도메인의 멱등성/동시성/상태 설계, 결제 복구, Rate Limit, 관측성 구성을 담당했습니다. (팀은 PM&FE, TL&BE, BE&Infra로 구성)
- 기술 스택: Java 17, Spring Boot 3.5, Spring Data JPA, MySQL, Redis, Spring Security(세션 인증, JWT 아님), RestClient 기반 은행 서버 연동, Web3j + Besu(블록체인 스마트컨트랙트), Sentry + Grafana Cloud 모니터링, 클라우드-온프레미스 간 VPN 터널링.
- 아키텍처 특징: 결제 플랫폼(hangang-pay-be)뿐 아니라 은행 서버와 블록체인 서버를 직접 구현하고, 플랫폼에서 은행 API와 블록체인을 연동하는 결제 시스템 흐름을 설계했습니다.

### 한강페이 트러블슈팅 1 — 멱등성으로 중복 결제 방지

- 문제: 사용자가 결제 버튼을 연속으로 누르거나 네트워크 재전송이 발생하면 동일한 결제가 여러 번 생성/실행될 수 있었습니다. 결제 중복은 돈이 두 번 움직이는 정합성 사고입니다. 처음에는 결제 "실행"에만 분산락을 걸었는데, 부하 테스트 중 동시 요청이 오면 결제 요청(Global Transaction UUID) 자체가 여러 번 새로 생성되어, 실행을 막아도 중복 "생성"으로 데이터 일관성이 깨졌습니다.
- 원인 분석: 결제를 생성하는 순간에는 동시 요청을 제어하지 않아 멱등성이 절반만 보장되었습니다. 즉 중복 실행뿐 아니라 중복 생성도 막아야 했습니다.
- 해결:
  - 결제 요청마다 생성되는 `transactionUuid`(Global Transaction UUID)를 클라이언트가 생성해 서버로 넘기고, 이를 결제 실행 멱등키로 사용했습니다.
  - `transactionUuid` + endpoint + method + 요청 본문으로 `requestHash`를 만들어, 같은 키라도 내용이 다르면 `IDEMPOTENCY_CONFLICT`로 막았습니다.
  - Redis `SET NX`(존재하지 않을 때만 저장)의 원자성을 이용해 확인과 저장을 한 번에 처리, 동일 결제 요청은 최초 한 건만 생성되도록 변경했습니다.
  - Redis에는 단순히 `"1"`이 아니라 상태와 응답 스냅샷(status, transactionId, responseSnapshot)을 저장해, 재시도 시 기존 성공 응답을 그대로 재현하도록 했습니다.
  - DB의 `transaction_uuid` unique 제약을 최종 방어선으로 두어, Redis 장애/TTL 만료 상황에서도 실제 거래 중복 저장을 막았습니다.
  - 은행 서버도 `transactionUuid` 기준으로 멱등하게 만들어, 타임아웃 후 재시도 시 중복 transfer가 발생하지 않도록 했습니다.
- 결과: K6 기반 부하 테스트에서 동시에 결제를 요청해도 성공 1건, 중복 결제 0건으로 동일 결제가 한 번만 생성됨을 검증했습니다. (idempotency_burst_2xx, idempotency_burst_blocked_409, idempotency_executed_once 등 커스텀 메트릭으로 확인)
- 배운 점: 결제에서 가장 무서운 건 요청이 실패하는 게 아니라, 실제로는 성공했는데 서버가 실패라고 믿고 사용자가 다시 결제하게 만드는 것입니다. 멱등성은 그 문제를 막는 정합성 장치입니다.

### 한강페이 트러블슈팅 2 — 분산 시스템 결제 복구와 트랜잭션 상태 머신

- 문제: 플랫폼-은행-블록체인으로 이어지는 분산 구조에서, 은행 호출 중 HTTP 5xx나 타임아웃이 나면 결제가 성공인지 실패인지 알 수 없었습니다. 이를 단순히 "실패"로 처리했더니, 실제로는 성공했는데 사용자에게 잘못 안내되는 정합성 문제가 생겼습니다. 정합성을 맞추려 복구 트랜잭션을 추가했더니, 실패한 복구를 계속 재시도하는 무한 루프로 서버가 다운되는 문제가 발생했습니다.
- 원인 분석: 분산 시스템은 외부 호출 시 지금 어디까지 진행됐는지 서버가 명확히 알지 못했고, 성공/실패 두 상태만으로는 "결과를 모르는" 상황을 표현할 수 없었습니다.
- 해결:
  - 성공/실패 외에 결제 시도, 처리 중, 알 수 없음(UNKNOWN), 복구 불가 상태를 추가해 트랜잭션 상태 머신을 설계했습니다. 상태: `PENDING`(의도 생성, 아직 은행 실행 요청 전) → `PROCESSING`(은행 실행 요청함) → `SUCCESS`/`FAILED`/`UNKNOWN`, 그리고 유효시간 만료는 `EXPIRED`.
  - `PENDING`과 `PROCESSING`을 분리해, PENDING은 만료시켜도 실제 결제가 발생하지 않고, PROCESSING은 함부로 실패 처리하지 않고 결과를 모르면 UNKNOWN으로 두도록 했습니다.
  - 애매한 건을 곧장 실패로 단정하지 않고, 다시 시도해볼 만한 경우만 딱 한 번 재시도해 무한 루프를 방지했습니다.
  - 여전히 UNKNOWN이면 잠시 보류했다가 스케줄러로 은행 조회 API(`GET /api/v1/transactions/{transactionUuid}`)를 지수 백오프로 최대 약 10회 재조회했습니다. 은행 서버는 txHash가 있어도 바로 SUCCESS를 주지 않고 블록체인 TransactionReceipt로 결과가 확정된 뒤에만 SUCCESS를 반환하도록 했습니다.
  - 그래도 확정되지 않으면 "복구 불가" 상태로 변경했습니다.
- 결과: 스케줄러(UnknownPaymentRecoveryScheduler)를 통해 사용자의 화면 이탈, 타임아웃, 서버 다운 같은 애매한 상황에서도 결제 상태를 자동으로 복구할 수 있게 되었습니다.
- 배운 점: 분산 결제에서는 "모른다"는 상태를 1급 시민으로 다뤄야 하고, 재시도는 조건과 횟수를 명확히 제한해야 안전합니다.

### 한강페이 트러블슈팅 3 — Rate Limit과 부하 테스트 기반 커넥션 튜닝

- 문제: 결제/조회 API에 부하가 몰릴 때 서버와 은행 서버를 보호할 장치가 필요했습니다. K6로 VU300 부하를 주자 결제 실행에서 응답 지연이 커졌고(p99 약 5.33초), Tomcat 스레드가 busy에 몰리고 HikariCP 커넥션 풀이 대기(pending)하며 DB row-lock 대기가 병목이 되었습니다.
- 원인 분석: Tomcat 워커 스레드(busy vs max), HikariCP pending, DB row-lock 대기를 Grafana로 관측해, 커넥션이 부족하고 락 대기가 길어 지연이 누적됨을 확인했습니다.
- 해결:
  - Redis 기반 Token Bucket으로 순간 스파이크를 앞단에서 완화하고, 정확한 업무 한도는 Sliding Window로 제한하는 구조를 설계했습니다. Rate Limiting ON/OFF로 효과를 비교했습니다.
  - DB row-lock 대기 문제는 JPA `@QueryHint`로 `lock.timeout`을 설정하고 MySQL 8.x의 `NOWAIT`를 사용해, 락을 즉시 획득 못 하면 대기 없이 바로 실패시켜 커넥션 점유 시간을 줄였습니다.
  - 커넥션 부족은 Scale Up과 HikariCP 커넥션 풀 크기 조정으로 완화했습니다.
- 결과: Rate Limiting과 커넥션 튜닝으로 대량 동시 요청에서도 서버가 죽지 않고 처리율을 일정하게 유지하도록 안정화했습니다. Grafana로 p95/p99, CPU, 커넥션 상태를 지속 모니터링했습니다.
- 배운 점: Rate Limit은 중복 결제를 막는 핵심 장치가 아니라(그건 멱등성 담당) 요청량을 줄여 서버와 외부 시스템을 보호하는 장치입니다. 병목은 추측이 아니라 부하 테스트와 지표로 찾아야 합니다.

---

## 프로젝트 2: SMU CLUB (에스엠유 클럽)

### SMU CLUB 개요

- 한 줄 소개: 상명대학교 학생을 위한 동아리 탐색·지원·운영 관리 플랫폼입니다.
- 초점: 운영 안정성 개선, 배치 처리 구조 재설계, 이메일 비동기 처리 성능 개선.
- 작업 기간: 2025.08.15 ~ (진행 중)
- GitHub: https://github.com/smu-human/smu-club
- 기술 블로그: https://fluanceifi.tistory.com/40, https://fluanceifi.tistory.com/42
- 유승준의 역할: 백엔드(BE).
- 기술 스택: React + Vite, Spring Boot, JPA, MySQL, Nginx, Docker Compose, OCI Object Storage, Discord Webhook, Scheduler, JavaMailSender, @Async, AOP.

### SMU CLUB 트러블슈팅 1 — 세션 기반 인증과 안전한 파일 접근(AppSessionToken)

- 문제: 외부 인증(SSO) 의존 구조의 리스크가 있었고, 로그인 없이 지원하는 일반 지원자와 운영진을 구분해야 했습니다. 또 NAT/공유 IP 환경에서 사용자를 안정적으로 식별하고, 이미지 등 리소스에 안전하게 접근하도록 해야 했습니다.
- 해결:
  - DispatcherServlet의 인터셉터 `preHandle()` 단계에서 인증을 검증하도록 요청 처리 흐름(Filter → DispatcherServlet → Interceptor → AOP → Controller)을 설계했습니다.
  - 앱 세션 토큰(AppSessionToken, UUID 기반, 약 30분 TTL)을 발급하고, `@RequiresAppSession` 커스텀 어노테이션이 붙은 요청은 preHandle()에서 토큰을 검증했습니다. 검증한 값은 `request.setAttribute()`로 컨트롤러에 전달했습니다.
  - 파일 접근은 presigned URL 방식으로 유효시간을 둔 임시 접근만 허용해, 리소스를 직접 노출하지 않도록 했습니다.
  - 운영 관점에서 외부 인증 의존을 줄이고, 운영진 로그인 + 일반 지원자 비로그인 구조로 정리했습니다.
- 결과: 세션/토큰 만료와 NAT 환경에서도 요청 주체를 일관되게 식별하고, 리소스 접근을 안전하게 통제했습니다.

### SMU CLUB 트러블슈팅 2 — 배치 트랜잭션 범위 재설계(대용량 트랜잭션 분리)

- 문제: 모집 자동 마감 같은 배치를 하나의 큰 트랜잭션으로 묶으니, 일부 실패가 전체 롤백으로 이어지고 Lock을 약 30초 동안 점유해 다른 작업이 지연됐습니다.
- 해결:
  - 모집 자동 마감은 `BATCH_SIZE=10` 단위 청크로 분할하고 각 청크를 `REQUIRES_NEW` 트랜잭션으로 처리했습니다. 이메일 재전송은 각 항목을 독립 트랜잭션으로 처리했습니다.
  - 조회 트랜잭션은 readonly로 분리하고, Lock을 3초씩 여러 번으로 나눠 점유 시간을 분산했습니다.
- 결과: 일부 실패가 전체 배치를 무효화하지 않고, 실패 지점 추적과 재처리가 단순해졌으며, Lock 점유 시간과 ConnectionTimeout 문제가 개선됐습니다.

### SMU CLUB 트러블슈팅 3 — 이메일 대량 발송 비동기 처리

- 문제: 100명에게 동기로 메일을 발송하면 SMTP는 I/O 바운드라 100초 가까이 블로킹되어 504 Gateway Timeout이 발생했습니다.
- 검토한 대안: BCC(개인화 불가, 수신자 제한), Resend API(무료 100건 한도, 유료 전환 필요) 등을 검토했습니다.
- 해결: `@Async` + `ThreadPoolTaskExecutor`(corePoolSize=5, maxPoolSize=10, queueCapacity=100)로 메인 스레드는 즉시 HTTP 200을 응답하고, 워커 스레드가 병렬로 발송하도록 했습니다. `CompletableFuture.allOf()`로 전체 완료를 집계했습니다.
- 결과: 100건 발송 시간이 93.8초(1.07건/초) → 23.0초(4.34건/초)로, 처리 시간 약 75.4% 단축, 처리량 약 4.1배 향상되었습니다.

### SMU CLUB 트러블슈팅 4 — 운영/협업 개선

- 스케줄러 장애 감지: `@DiscordAlert` 커스텀 어노테이션 + AOP `@Around`로 스케줄러 예외를 감지해 `DiscordAlertService.send()`가 Discord Webhook으로 즉시 알림을 보낸 뒤 원본 예외를 다시 던지는(rethrow) 구조입니다(알림은 @Async로 메인 흐름 차단 방지). 이전에는 실패가 로그에만 남아 사후에야 인지했습니다.
- JPA Fetch Join 조회 누락: 상세 조회에서 이미지가 없는 동아리가 INNER JOIN FETCH로 누락되던 문제를, LEFT JOIN FETCH로 바꿔 연관 엔티티가 없어도 부모가 조회되도록 했습니다.
- API 응답 표준화: `ApiResponseDto<T>`(status, message, data, errorCode)로 응답 포맷을 통일해 프론트엔드 협업 비용을 줄였습니다.

---

## 프로젝트 3: Woori Card Scope (우리카드 스코프)

### Woori Card Scope 개요

- 한 줄 소개: 약 538만 건의 카드 거래 데이터를 대상으로 대용량 조회 성능과 DB 고가용성을 다룬 3-Tier 아키텍처 프로젝트입니다.
- 아키텍처: 3-Tier(WAS · DB · 세션)로 분리. Presentation(Nginx) → Application(Tomcat, Redis 세션 스토어) → Data(MySQL InnoDB Cluster). 세션은 Redis(In-memory)에 저장하고, DB는 MySQL Router를 통해 읽기/쓰기를 라우팅합니다.
- 작업 기간: 2025년 초 (약 1주간 집중 진행) — 정확한 일자는 포트폴리오 PDF 기준 확인 필요.
- GitHub: https://github.com/fluanceifi/woori_card_scope
- 기술 스택: Java 21, Tomcat 9, MySQL 8.0(InnoDB Cluster), Redis 7(Redisson Tomcat Session Manager), MySQL Router, Nginx, Docker.

### Woori Card Scope 트러블슈팅 1 — Deferred Join으로 페이징 성능 최적화

- 문제: `LIMIT ? OFFSET N` 방식의 페이징이 약 538만 건 데이터에서 뒤 페이지로 갈수록 급격히 느려졌습니다. OFFSET N은 앞의 N개 행을 실제로 읽고 버리기 때문에, 넓은(비대한) 행을 그만큼 스캔하는 비용이 큽니다.
- 원인 분석: EXPLAIN으로 보니 인덱스가 없어 `ORDER BY SEQ`에서 정렬 비용과 넓은 행 스캔이 함께 발생했습니다.
- 해결(Deferred Join): 페이지네이션은 커버링 인덱스로 PK(SEQ)만 먼저 추려낸 뒤, 그 PK로 본문을 조인해 가져오도록 바꿨습니다.
  - `... JOIN (SELECT SEQ FROM card_transaction ORDER BY SEQ LIMIT 20 OFFSET ?) tmp ON c.SEQ = tmp.SEQ`
  - `CREATE INDEX idx_seq ON card_transaction (SEQ);`
  - EXPLAIN ANALYZE로 실행 계획(index lookup, idx_seq 사용)을 검증했습니다.
- 결과(측정):
  - 중간 구간: 14,844.9ms → 1,857.9ms (약 87.48% 단축, 약 8배)
  - 깊은 페이지(OFFSET 800,000): 38,890ms → 1,857.9ms (약 95.22% 단축, 약 20.9배)
  - 첫 페이지(OFFSET 0): 14,527ms → 2.3ms (약 99.98% 단축)
- 배운 점: OFFSET 페이징의 비용은 "읽고 버리는" 행에서 나오므로, 인덱스만 태워 키를 먼저 좁히는 Deferred Join으로 스캔량 자체를 줄이는 것이 핵심입니다.

### Woori Card Scope 트러블슈팅 2 — InnoDB Cluster split-brain 방지와 Errant GTID 복구

- 문제: 단순 Master-Replica 구조는 네트워크 분단 시 양쪽이 각자 Master가 되는 split-brain 위험이 있습니다. 한쪽 Master가 사라지면 남은 Replica가 새 Master로 승격되어야 하는데, 분단이 풀리며 옛 Master가 살아나면 Master가 둘이 되어 데이터가 갈라집니다.
- 해결(고가용성 구성):
  - MySQL InnoDB Cluster(Single-Primary) + Group Replication을 사용해, 어느 순간에도 Primary는 하나만 존재하도록 했습니다(split-brain 방지).
  - 과반(quorum = N/2 + 1) 기반 합의로 다수파만 쓰기를 유지하게 했습니다(N=4 → quorum 3).
  - MySQL Router를 두어 6446(R/W)→Primary, 6447(R/O)→Secondary로 라우팅하고, WAS는 Router에만 연결했습니다. HikariCP는 write/read 풀을 분리해 read 부하를 Secondary로 보냈습니다.
- Errant GTID 복구: 장애 노드를 다시 클러스터에 넣을 때, 그 노드에만 존재하는 Errant GTID(예: `...:1-18`) 때문에 재합류가 거부되는 문제가 있었습니다.
  - `cluster.addInstance('root@mysql2:3306', { recoveryMethod: 'clone' })`로 clone 복구를 사용해, seed 노드의 데이터를 통째로 복제(Stage DROP DATA → FILE COPY / PAGE COPY, 약 80MB를 1초 내 전송)해 GTID를 정합하게 맞췄습니다.
  - `docker kill mysql1` / `docker stop mysql2`로 강제 장애를 주입해 failover(R/W 승격)를 검증했습니다.
- 배운 점: 고가용성은 "Primary가 하나임을 보장하는 합의"와 "장애 노드를 다시 안전하게 합류시키는 복구 절차"가 함께 있어야 완성됩니다.

---

## 자주 나올 수 있는 질문(FAQ) 힌트

- "가장 자신 있는 프로젝트는?" → 한강페이. 결제 정합성(멱등성/상태 머신/복구)이라는 어려운 문제를 부하 테스트와 지표로 검증하며 해결했습니다.
- "성능 최적화 경험은?" → Woori Card Scope의 Deferred Join(최대 약 6,313배까지 단축된 첫 페이지 사례 포함)과 한강페이 Rate Limit/커넥션 튜닝.
- "비동기/동시성 경험은?" → SMU CLUB 이메일 @Async 처리(4.1배), 한강페이 Redis 분산락/멱등성/Token Bucket.
- "DB 고가용성 경험은?" → Woori Card Scope의 InnoDB Cluster + Group Replication + MySQL Router, Errant GTID clone 복구.
- 연락/링크 → GitHub: https://github.com/fluanceifi
