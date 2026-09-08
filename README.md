# resume-frontend — 포트폴리오 + AI 챗봇(RAG)

정적으로 서빙되는 포트폴리오 PDF 뷰어 + 눈에 띄는 AI 챗봇 버튼. 챗봇은 포트폴리오 내용을 근거로 답하는 **RAG**이며, 답변은 **SSE 스트리밍**으로 라이브 타이핑된다.

## 아키텍처

```
[브라우저]
  ├─ 정적 프론트 (Vite + React) : PDF 뷰어(<object>) + 플로팅 챗 버튼
  └─ POST /api/chat (SSE)
        ▼
[Vercel Edge Function  api/chat.ts]
  1. 질의 임베딩            (OpenAI text-embedding-3-small)
  2. 코사인 유사도 top-5    (api/_data/embeddings.json)
  3. 프롬프트 구성 후 챗    (OpenAI gpt-4o-mini, stream)
  4. OpenAI SSE → 자체 SSE(data:{"t": token})로 중계
```

- 프론트와 API가 **하나의 Vercel 프로젝트**에 함께 배포된다(같은 오리진, CORS 불필요).
- 지식베이스 원본: `knowledge.md` (유승준 본인의 1인칭 기록 — 프로필/이력/성향 + 프로젝트 4개: 한강페이 · SMU CLUB · Woori Card Scope · Hybrid RAG + 이 사이트 자체).
- 임베딩은 질의마다 만들지 않고 **사전 생성**해 `api/_data/embeddings.json`에 둔다. Vercel 빌드(`buildCommand`)가 `npm run embeddings`를 먼저 돌리므로, `knowledge.md`만 고쳐 push하면 배포 시점에 자동으로 다시 만들어진다.

## 주요 파일

| 경로 | 역할 |
|---|---|
| `knowledge.md` | RAG 지식베이스 원본(사람이 읽고 수정) |
| `scripts/build-embeddings.mjs` | knowledge.md 청킹 → 임베딩 → `api/_data/embeddings.json` |
| `api/chat.ts` | Edge 함수: 검색 + OpenAI 챗 스트리밍(SSE) |
| `api/_data/embeddings.json` | 청크 임베딩. 빌드 때 재생성되며, 키가 없는 환경을 위해 커밋도 해 둔다 |
| `src/hooks/useChatStream.ts` | SSE를 읽어 토큰을 라이브로 append |
| `src/components/ChatWidget.tsx` | 플로팅 버튼 + 챗 패널 |
| `src/App.tsx` | PDF 뷰어 + 위젯 |
| `public/portfolio.pdf` | 정적 서빙되는 포트폴리오 PDF |

## 지식베이스 갱신

`knowledge.md`를 고쳐서 push하면 끝이다. Vercel 빌드가 `npm run embeddings`를 먼저 실행해
임베딩을 다시 만들므로, 로컬에서 따로 생성할 필요가 없다(Vercel에 `OPENAI_API_KEY`가 있어야 한다).

```bash
git add knowledge.md && git commit -m "docs: 지식베이스 갱신" && git push
```

로컬에서 미리 만들어 커밋해 두고 싶다면:

```bash
OPENAI_API_KEY=sk-... npm run embeddings
git add api/_data/embeddings.json && git commit -m "chore: 임베딩 재생성"
```

> `OPENAI_API_KEY`가 없는 환경에서는 재생성을 건너뛰고 커밋된 `embeddings.json`을 그대로 쓴다.
> 빌드는 실패하지 않지만, 그 배포에는 `knowledge.md` 변경이 반영되지 않는다.

## 로컬 개발

```bash
npm install

# 정적 프론트만 (챗 API는 동작 안 함)
npm run dev

# 프론트 + /api 서버리스 함께 (권장)
npm i -g vercel
echo "OPENAI_API_KEY=sk-..." > .env.local
vercel dev
```

동작/정확도 점검:

```bash
OPENAI_API_KEY=sk-... node scripts/test-rag.mjs      # 검색+답변 정확도
OPENAI_API_KEY=sk-... node scripts/test-stream.mjs   # SSE 스트리밍
```

## 배포 (Vercel)

1. GitHub에 push.
2. Vercel 대시보드에서 이 레포를 Import (프레임워크 자동 감지: Vite).
3. **Environment Variables**에 `OPENAI_API_KEY` 추가.
4. Deploy. 이후 `git push`마다 자동 재배포된다.

CLI로 하려면:

```bash
vercel            # 최초: 프로젝트 링크
vercel env add OPENAI_API_KEY
vercel --prod
```

## 환경변수

| 변수 | 위치 | 설명 |
|---|---|---|
| `OPENAI_API_KEY` | Vercel 서버 | 임베딩 + 챗. 클라이언트에 노출 안 됨 |
| `VITE_CHAT_ENDPOINT` | 빌드타임(선택) | 프론트/API 분리 배포 시에만 API 절대 URL 지정 |
