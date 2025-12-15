# Vercel 배포 가이드

## 배포 전 준비 사항

### 1. Git 저장소 설정

프로젝트를 Git 저장소에 푸시해야 합니다 (GitHub, GitLab, Bitbucket).

```bash
cd stock-recommendation-web

# Git 초기화 (아직 안 했다면)
git init

# .gitignore 파일 확인 (아래 내용이 포함되어야 함)
# node_modules/
# .next/
# .env*.local
# .vercelignore

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit: Stock recommendation web service"

# GitHub 저장소에 푸시 (저장소를 먼저 생성해야 함)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 2. .gitignore 확인

다음 내용이 `.gitignore`에 포함되어 있는지 확인:

```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

**중요**: `.env.local` 파일이 Git에 커밋되지 않도록 해야 합니다!

## Vercel 배포 단계

### 1. Vercel 계정 생성

1. [https://vercel.com](https://vercel.com) 방문
2. GitHub 계정으로 로그인/회원가입

### 2. 프로젝트 Import

1. Vercel 대시보드에서 "Add New" → "Project" 클릭
2. GitHub 저장소에서 `stock-recommendation-web` 선택
3. "Import" 클릭

### 3. 프로젝트 설정

#### Build & Development Settings
- **Framework Preset**: Next.js (자동 감지됨)
- **Build Command**: `npm run build` (기본값)
- **Output Directory**: `.next` (기본값)
- **Install Command**: `npm install` (기본값)

#### Root Directory
프로젝트가 루트에 있으면 비워두고, 하위 디렉토리에 있으면 해당 경로 지정.

### 4. 환경 변수 설정

**매우 중요**: 다음 환경 변수를 Vercel에 추가해야 합니다:

| 변수 이름 | 값 |
|---------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://phdlspdkzhfdowlghanl.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoZGxzcGRremhmZG93bGdoYW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODc1MDUsImV4cCI6MjA4MTM2MzUwNX0.HmT-FnryH8Wvtq3MuLeeV94xUCx8MPL4iQGbvewrA4A` |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_DYaGW_BQISKRM3qkhxDchg_pMmBJQHh` |
| `ADMIN_PASSWORD` | `admin123` |

#### 환경 변수 추가 방법:
1. Vercel 프로젝트 설정 페이지에서 "Environment Variables" 탭 클릭
2. 각 변수의 이름과 값을 입력
3. "Production", "Preview", "Development" 모두 선택
4. "Save" 클릭

### 5. 배포

"Deploy" 버튼을 클릭하면 자동으로 배포가 시작됩니다.

배포 완료 후:
- Production URL: `https://your-project-name.vercel.app`
- Preview URL: PR마다 자동 생성

## 배포 후 확인 사항

### 1. 웹사이트 접속 테스트
```
https://your-project-name.vercel.app
```

### 2. Realtime 연결 확인
- 페이지 우측 상단에 "실시간 연결됨" (녹색 점) 표시 확인

### 3. 데스크톱 앱 연동 테스트
- 데스크톱 앱에서 종목 더블클릭
- Vercel 배포된 웹사이트에서 실시간으로 추천이 나타나는지 확인

**참고**: 데스크톱 앱은 Supabase를 직접 사용하므로 Vercel URL과 무관하게 작동합니다.

### 4. 취소 기능 테스트
- 추천 카드의 X 버튼 클릭
- 비밀번호 입력 (`admin123`)
- 정상적으로 취소되는지 확인

## 자동 배포 설정

Vercel은 기본적으로 다음과 같이 자동 배포됩니다:

- **main 브랜치**: Production 배포
  ```bash
  git push origin main
  ```

- **다른 브랜치**: Preview 배포
  ```bash
  git checkout -b feature/new-feature
  git push origin feature/new-feature
  ```

- **Pull Request**: 자동으로 Preview 배포 생성

## 커스텀 도메인 설정 (선택사항)

1. Vercel 프로젝트 설정 → "Domains" 탭
2. 원하는 도메인 입력 (예: `stock.yourdomain.com`)
3. DNS 설정 안내를 따라 도메인 연결

## 트러블슈팅

### 1. 빌드 실패
**증상**: "Build failed" 에러
**해결**:
```bash
# 로컬에서 빌드 테스트
npm run build

# 에러가 있으면 수정 후 다시 푸시
git add .
git commit -m "Fix build errors"
git push
```

### 2. 환경 변수 문제
**증상**: "Internal Server Error" 또는 Supabase 연결 실패
**해결**:
- Vercel 프로젝트 설정 → "Environment Variables"
- 모든 환경 변수가 정확히 입력되었는지 확인
- 변경 후 "Redeploy" 버튼 클릭

### 3. Realtime 연결 안 됨
**증상**: 녹색 점이 깜빡이지 않음
**해결**:
- Supabase Dashboard → Project Settings → API
- Realtime이 활성화되어 있는지 확인
- `recommendations` 테이블이 Realtime publication에 포함되어 있는지 확인

### 4. 취소 기능 작동 안 함
**증상**: "추천 취소에 실패했습니다" 에러
**해결**:
- `ADMIN_PASSWORD` 환경 변수가 설정되었는지 확인
- `SUPABASE_SERVICE_ROLE_KEY`가 정확한지 확인

## 배포 URL 공유

배포가 완료되면 다음 URL을 공유할 수 있습니다:

```
Production: https://your-project-name.vercel.app
```

이 URL은 누구나 접속 가능한 공개 웹사이트입니다.

## 보안 주의사항

⚠️ **중요**:
1. `.env.local` 파일을 절대 Git에 커밋하지 마세요
2. Service Role Key는 Vercel 환경 변수로만 관리하세요
3. Admin 비밀번호를 정기적으로 변경하세요
4. GitHub 저장소가 Private인지 확인하세요 (민감한 정보 포함 시)

## 모니터링

Vercel 대시보드에서 다음을 확인할 수 있습니다:
- 배포 상태
- 빌드 로그
- Runtime 로그
- 분석 (방문자 수, 성능 등)

## 비용

- Vercel Free 플랜으로 충분히 사용 가능
- 무제한 배포 및 미리보기
- 100GB 대역폭/월
- 자세한 내용: [https://vercel.com/pricing](https://vercel.com/pricing)
