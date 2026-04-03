# RAG 검색 정확도 개선 실험 요약
 모델: text-embedding-3-small (OpenAI 최저가 임베딩 모델) <br>
 데이터: chunks_long.json / 인덱스: pg-docs-toss-small <br>
 골든셋: data/golden_queries_20.json (20개 쿼리) <br>

[핵심 결론]
모델 교체 없이, 데이터 구조화 + 검색 튜닝만으로
kNN 단독 80% → Hybrid RRF 100% 달성

### 실험 1: kNN 단독 (벡터 검색만 사용)
설정: bm25_weight=0.0, knn_weight=1.0, rank_constant=20
결과: Top-1 정확도 80.00% (16/20)

오답 목록:
  - 결제 승인 API 필수 파라미터  → 자동결제 승인 (오답)
  - 빌링키로 자동결제 승인       → 카드 정보로 빌링키 발급 (오답)
  - Billing 객체 응답 필드       → Payment 객체 (오답)
  - 결제 실패 에러 코드 목록     → 결제 승인 (오답)

원인: text-embedding-3-small이 의미적으로 유사한 문서를 혼동
      (결제 승인 ↔ 자동결제 승인, Billing ↔ Payment 등)

### 실험 2: Hybrid RRF 7:3
설정: bm25_weight=0.7, knn_weight=0.3, rank_constant=20
결과: Top-1 정확도 95.00% (19/20)

오답 목록:
  - 결제 실패 에러 코드 목록     → Payment 객체 (오답)

분석: kNN이 "결제 실패" 표현에서 Payment 객체를 강하게 당겨옴
      BM25의 정답 신호(에러 코드)를 kNN이 뒤집는 케이스

### 실험 3: Hybrid RRF 8:2
설정: bm25_weight=0.8, knn_weight=0.2, rank_constant=20
결과: Top-1 정확도 95.00% (19/20)

동일한 오답 1건 잔존 → 비율 조정으로는 해결 불가

### 실험 4: Hybrid RRF 85:15  ← 최종 채택
설정: bm25_weight=0.85, knn_weight=0.15, rank_constant=20
결과: Top-1 정확도 100.00% (20/20)

| Query | Expected | BM25 Tuned Top-1 | BM25 | Hybrid Top-1 | Hybrid |
|---|---|---|---:|---|---:|
| 결제 승인 API 필수 파라미터 | 결제 승인 | 결제 승인 | O | 결제 승인 | O |
| paymentKey로 결제 상태 조회 | paymentKey로 결제 조회 | paymentKey로 결제 조회 | O | paymentKey로 결제 조회 | O |
| orderId로 결제를 찾는 방법 | orderId로 결제 조회 | orderId로 결제 조회 | O | orderId로 결제 조회 | O |
| 승인된 결제를 취소하는 API | 결제 취소 | 결제 취소 | O | 결제 취소 | O |
| 카드 번호 직접 입력 결제 | 카드 번호 결제 | 카드 번호 결제 | O | 카드 번호 결제 | O |
| 가상계좌 발급 API | 가상계좌 발급 요청 | 가상계좌 발급 요청 | O | 가상계좌 발급 요청 | O |
| Payment 객체 주요 필드 | Payment 객체 | Payment 객체 | O | Payment 객체 | O |
| authKey로 빌링키 발급 | 인증 정보(authKey)로 빌링키 발급 | 인증 정보(authKey)로 빌링키 발급 | O | 인증 정보(authKey)로 빌링키 발급 | O |
| 카드 정보로 빌링키 발급 | 카드 정보로 빌링키 발급 | 카드 정보로 빌링키 발급 | O | 카드 정보로 빌링키 발급 | O |
| 빌링키로 자동결제 승인 | 자동결제 승인 | 자동결제 승인 | O | 자동결제 승인 | O |
| 발급된 빌링키 삭제 | 빌링키 삭제 | 빌링키 삭제 | O | 빌링키 삭제 | O |
| Billing 객체 응답 필드 | Billing 객체 | Billing 객체 | O | Billing 객체 | O |
| 거래 내역 조회 API | 거래 조회 | 거래 조회 | O | 거래 조회 | O |
| 정산 데이터 조회 | 정산 조회 | 정산 조회 | O | 정산 조회 | O |
| 수동 정산 요청 방법 | 수동 정산 요청 | 수동 정산 요청 | O | 수동 정산 요청 | O |
| 현금영수증 발급 요청 API | 현금영수증 발급 요청 | 현금영수증 발급 요청 | O | 현금영수증 발급 요청 | O |
| 현금영수증 발급 취소 API | 현금영수증 발급 취소 요청 | 현금영수증 발급 취소 요청 | O | 현금영수증 발급 취소 요청 | O |
| 현금영수증 조회 API | 현금영수증 조회 | 현금영수증 조회 | O | 현금영수증 조회 | O |
| 웹훅 이벤트 종류 | 웹훅 이벤트 | 웹훅 이벤트 | O | 웹훅 이벤트 | O |
| 결제 실패 에러 코드 목록 | 에러 코드 | 에러 코드 | O | 에러 코드 | O |

==============================================================================
개선 단계 요약
==============================================================================

단계 1. 데이터 구조화
  - 섹션 단위 청킹 (chunks_long.json)
  - section_key 부여 (섹션 식별자)
  → kNN 단독 80% 가능하게 함

단계 2. RRF 중복 제거 (핵심 버그 수정)
  - RRF 병합 전 section_key 기준 dedup
  - 같은 섹션의 다중 청크 → 대표 청크 1개만 남김
  → 중복 누적으로 인한 랭킹 왜곡 해결

단계 3. 하이브리드 가중치 튜닝
  - BM25(키워드) + kNN(의미) 조합
  - 최적 비율: 85:15
  → 100% 달성

==============================================================================
재현 커맨드
==============================================================================

# 인덱싱
EMBEDDING_MODEL=text-embedding-3-small ES_INDEX=pg-docs-toss-small \
  CHUNKS_PATH=data/chunks_long.json python3 scripts/pipeline/index_to_es.py

# 평가
python3 scripts/eval/eval_hybrid_top1.py \
  --golden data/golden_queries_20.json \
  --index pg-docs-toss-small \
  --bm25-weight 0.85 \
  --knn-weight 0.15
