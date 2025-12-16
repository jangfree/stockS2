# 빠른 Vercel 배포 가이드

이 문서는 5분 안에 Vercel에 배포하는 방법을 설명합니다.

## 사전 준비 완료 ✅

- [x] Git 저장소 초기화됨
- [x] 초기 커밋 생성됨
- [x] .gitignore 설정됨

## 단계별 배포

### 1. GitHub 저장소 생성 (2분)

1. [https://github.com/new](https://github.com/new) 접속
2. Repository name: `stock-recommendation-web` (또는 원하는 이름)
3. **Private** 선택 (민감한 환경 변수 포함)
4. "Create repository" 클릭
5. 생성된 저장소 URL 복사 (예: `https://github.com/USERNAME/stock-recommendation-web.git`)

### 2. GitHub에 푸시 (1분)

```bash
cd c:/clCode/ex6/stock-recommendation-web

# GitHub 저장소 연결 (위에서 복사한 URL 사용)
git remote add origin https://github.com/YOUR_USERNAME/stock-recommendation-web.git

# main 브랜치로 변경 및 푸시
git branch -M main
git push -u origin main
```

### 3. Vercel 배포 (2분)

#### 3-1. Vercel 로그인
1. [https://vercel.com](https://vercel.com) 접속
2. "Sign Up" 또는 "Log In"
3. "Continue with GitHub" 클릭
4. GitHub 권한 승인

#### 3-2. 프로젝트 Import
1. Vercel 대시보드에서 "Add New..." → "Project" 클릭
2. "Import Git Repository" 섹션에서 `stock-recommendation-web` 찾기
3. "Import" 클릭

#### 3-3. 환경 변수 설정
"Environment Variables" 섹션에서 다음 4개 변수 추가:

```
NEXT_PUBLIC_SUPABASE_URL = https://phdlspdkzhfdowlghanl.supabase.co
```
```
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoZGxzcGRremhmZG93bGdoYW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODc1MDUsImV4cCI6MjA4MTM2MzUwNX0.HmT-FnryH8Wvtq3MuLeeV94xUCx8MPL4iQGbvewrA4A
```
```
SUPABASE_SERVICE_ROLE_KEY = sb_secret_DYaGW_BQISKRM3qkhxDchg_pMmBJQHh
```
```
ADMIN_PASSWORD = admin123
```

**중요**: 각 변수를 추가할 때마다 "Add" 버튼을 클릭하세요.

#### 3-4. 배포 시작
"Deploy" 버튼 클릭

### 4. 배포 완료 확인

배포가 완료되면 (약 2-3분 소요):
1. "Visit" 버튼을 클릭하거나
2. `https://your-project-name.vercel.app` 접속

## 배포 후 테스트

### 테스트 1: 웹사이트 접속
- [ ] Vercel URL로 접속 성공
- [ ] "실시간 연결됨" (녹색 점) 표시 확인

### 테스트 2: 데스크톱 앱 연동
1. 데스크톱 앱 실행
2. 종목코드 더블클릭
3. Vercel 웹사이트에서 실시간으로 추천 나타나는지 확인

### 테스트 3: 취소 기능
1. 추천 카드의 X 버튼 클릭
2. 비밀번호 입력: `admin123`
3. 추천이 사라지는지 확인

## 배포 URL

배포가 완료되면 Vercel이 자동으로 생성한 URL을 확인하세요:

```
https://stock-recommendation-web-xxxx.vercel.app
```

이 URL을 다른 사람과 공유할 수 있습니다.

## 문제 해결

### 빌드 실패
```bash
# 로컬에서 빌드 테스트
npm run build
```

에러가 있으면 수정 후:
```bash
git add .
git commit -m "Fix build errors"
git push
```

Vercel이 자동으로 재배포합니다.

### 환경 변수 문제
1. Vercel 프로젝트 → Settings → Environment Variables
2. 모든 4개 변수가 정확한지 확인
3. 변경 후 Deployments → 최신 배포 → "Redeploy" 클릭

### Realtime 연결 안 됨
- 브라우저를 새로고침 (F5)
- 브라우저 콘솔 (F12) 에러 확인

## 업데이트 배포

코드를 수정한 후:

```bash
git add .
git commit -m "Update feature"
git push
```

Vercel이 자동으로 새 버전을 배포합니다.

## 다음 단계

- [ ] 커스텀 도메인 연결 (선택사항)
- [ ] 성능 모니터링 설정
- [ ] 에러 추적 설정 (Sentry 등)

상세한 내용은 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.
