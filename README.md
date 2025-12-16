# 주식 추천 웹 서비스

데스크톱 앱에서 실시간으로 주식 추천을 전송하고, 웹에서 확인할 수 있는 서비스입니다.

## 주요 기능

- ✅ 실시간 추천 표시 (Supabase Realtime)
- ✅ 추천 취소 기능 (관리자 비밀번호 보호)
- ✅ 반응형 디자인 (모바일/태블릿/데스크톱)
- ✅ 서버 사이드 렌더링 (SSR)
- ✅ 데스크톱 앱 연동

## 기술 스택

- **프론트엔드**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **백엔드**: Supabase (PostgreSQL + Realtime + Auth)
- **배포**: Vercel
- **데스크톱 앱**: Python 3.11 + PyQt5 + Supabase Python SDK

## 프로젝트 구조

```
stock-recommendation-web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # 메인 페이지
│   │   ├── layout.tsx         # 루트 레이아웃
│   │   └── api/               # API Routes
│   │       └── recommendations/
│   │           └── cancel/    # 추천 취소 API
│   ├── components/            # React 컴포넌트
│   │   ├── RecommendationList.tsx  # 추천 목록 (Realtime)
│   │   └── CancelModal.tsx         # 취소 모달
│   └── lib/                   # 유틸리티
│       ├── supabase/          # Supabase 클라이언트
│       └── utils.ts           # 헬퍼 함수
├── DEPLOYMENT.md              # 상세 배포 가이드
├── QUICK_DEPLOY.md           # 빠른 배포 가이드
└── package.json
```

## 로컬 개발 환경 설정

### 1. 환경 변수 설정

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=https://phdlspdkzhfdowlghanl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoZGxzcGRremhmZG93bGdoYW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODc1MDUsImV4cCI6MjA4MTM2MzUwNX0.HmT-FnryH8Wvtq3MuLeeV94xUCx8MPL4iQGbvewrA4A
SUPABASE_SERVICE_ROLE_KEY=sb_secret_DYaGW_BQISKRM3qkhxDchg_pMmBJQHh
ADMIN_PASSWORD=admin123
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 배포

### 빠른 배포 (5분)

[QUICK_DEPLOY.md](./QUICK_DEPLOY.md) 참고

### 상세 배포 가이드

[DEPLOYMENT.md](./DEPLOYMENT.md) 참고

## 사용 방법

### 1. 데스크톱 앱에서 추천 전송

1. 데스크톱 앱 실행
2. "실시간 모니터링" 탭으로 이동
3. 종목코드(첫 번째 열)를 더블클릭
4. 콘솔에서 "[OK] Web send success" 메시지 확인

### 2. 웹에서 추천 확인

1. 웹 브라우저에서 접속
2. 우측 상단에 "실시간 연결됨" (녹색 점) 확인
3. 추천이 실시간으로 나타남

### 3. 추천 취소

1. 추천 카드의 X 버튼 클릭
2. 관리자 비밀번호 입력: `admin123`
3. 취소 사유 입력 (선택사항)
4. "취소" 버튼 클릭

## 데이터베이스 스키마

### recommendations 테이블

| 컬럼명 | 타입 | 설명 |
|-------|------|------|
| id | BIGSERIAL | 기본 키 |
| recommendation_time | TIMESTAMPTZ | 추천 시간 |
| stock_code | VARCHAR(6) | 종목 코드 |
| stock_name | VARCHAR(100) | 종목명 |
| current_price | INTEGER | 현재가 |
| change_rate | DECIMAL(5,2) | 등락률 |
| change_amount | INTEGER | 등락폭 |
| volume | BIGINT | 거래량 |
| trading_value | BIGINT | 거래대금 |
| volume_rank | INTEGER | 거래량 순위 |
| theme_name | VARCHAR(200) | 테마명 |
| is_active | BOOLEAN | 활성 상태 |
| created_at | TIMESTAMPTZ | 생성 시간 |
| cancelled_at | TIMESTAMPTZ | 취소 시간 |
| cancelled_reason | TEXT | 취소 사유 |

## 보안

- ✅ Row Level Security (RLS) 적용
- ✅ Service Role Key는 서버 사이드에서만 사용
- ✅ 관리자 비밀번호로 취소 기능 보호
- ✅ 환경 변수로 민감한 정보 관리

## 성능 최적화

- ✅ Server-Side Rendering (SSR)
- ✅ 이미지 최적화 (Next.js Image)
- ✅ 자동 코드 분할 (Code Splitting)
- ✅ Supabase Connection Pooling

## 브라우저 지원

- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)

## 라이선스

Private - 내부 사용 전용

## 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.
