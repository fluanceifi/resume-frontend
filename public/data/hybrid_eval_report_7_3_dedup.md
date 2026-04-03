# Hybrid Top-1 Accuracy Comparison (20-query Golden Set)
Hybrid setup: bm25=0.7, knn=0.3, rank_constant=20 <br>
Total queries: 20 <br>
BM25 Tuned (title/content boosted): 95.00% <br>
Hybrid RRF (0.7:0.3): 100.00% <br>

| Query | Expected | BM25 Tuned Top-1 | BM25 | Hybrid Top-1 | Hybrid |
|---|---|---|---:|---|---:|
| 결제 승인 API 필수 파라미터 | 결제 승인 | 결제 승인 | O | 결제 승인 | O |
| paymentKey로 결제 상태 조회 | paymentKey로 결제 조회 | paymentKey로 결제 조회 | O | paymentKey로 결제 조회 | O |
| orderId로 결제를 찾는 방법 | orderId로 결제 조회 | orderId로 결제 조회 | O | orderId로 결제 조회 | O |
| 승인된 결제를 취소하는 API | 결제 취소 | 결제 승인 | X | 결제 취소 | O |
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
