# 🚀 GitHub Pages 배포 가이드

## 📋 목차
1. [자동 배포 (GitHub Actions)](#자동-배포-github-actions)
2. [수동 배포 (gh-pages)](#수동-배포-gh-pages)
3. [배포 확인](#배포-확인)
4. [문제 해결](#문제-해결)

---

## 🤖 자동 배포 (GitHub Actions)

### 설정 방법

#### 1. GitHub Pages 활성화

1. GitHub 저장소 페이지 접속:
   ```
   https://github.com/kccho88/senior-project
   ```

2. **Settings** 탭 클릭

3. 왼쪽 메뉴에서 **Pages** 클릭

4. **Source** 섹션에서:
   - **Source**: `GitHub Actions` 선택
   - (기존의 Branch 옵션이 아닌 GitHub Actions를 선택해야 합니다)

5. **Save** 버튼 클릭

#### 2. 자동 배포 시작

설정이 완료되면, 이제부터 `main` 브랜치에 푸시할 때마다 자동으로 배포됩니다!

```bash
# 코드 수정 후
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin main
```

#### 3. 배포 진행 상황 확인

1. GitHub 저장소의 **Actions** 탭 클릭
2. 최근 워크플로우 실행 확인
3. 녹색 체크 표시가 나타나면 배포 완료!

---

## 🔧 수동 배포 (gh-pages)

자동 배포 대신 수동으로 배포하고 싶다면:

### 1. gh-pages 패키지 설치

```bash
cd client
npm install --save-dev gh-pages
```

### 2. 배포 실행

```bash
cd client
npm run deploy
```

이 명령어는:
1. 프로젝트를 빌드하고 (`npm run build`)
2. `dist` 폴더를 `gh-pages` 브랜치에 푸시합니다

### 3. GitHub Pages 설정 (수동 배포용)

1. GitHub 저장소 → **Settings** → **Pages**
2. **Source**: `Deploy from a branch` 선택
3. **Branch**: `gh-pages` 선택, 폴더는 `/ (root)` 선택
4. **Save** 클릭

---

## 🌐 배포 확인

### 배포된 사이트 주소

배포가 완료되면 다음 주소에서 접속 가능합니다:

```
https://kccho88.github.io/senior-project/
```

### 배포 상태 확인

#### GitHub Actions 사용 시:
1. GitHub 저장소 → **Actions** 탭
2. 최근 워크플로우 실행 확인
3. 상태:
   - 🟡 노란색 점: 진행 중
   - ✅ 녹색 체크: 성공
   - ❌ 빨간색 X: 실패

#### 배포 시간:
- 일반적으로 2-5분 소요
- 첫 배포는 조금 더 걸릴 수 있음

---

## ⚙️ 설정 파일 설명

### 1. `vite.config.js`

```javascript
base: '/senior-project/'  // GitHub Pages용 base 경로
```

- GitHub Pages는 `https://username.github.io/repository-name/` 형식
- `base` 경로를 저장소 이름으로 설정해야 함

### 2. `.github/workflows/deploy.yml`

자동 배포를 위한 GitHub Actions 워크플로우:

- **트리거**: `main` 브랜치에 푸시할 때
- **작업**:
  1. 코드 체크아웃
  2. Node.js 설정
  3. 의존성 설치
  4. 프로젝트 빌드
  5. GitHub Pages에 배포

### 3. `package.json` 스크립트

```json
"scripts": {
  "predeploy": "npm run build",  // 배포 전 자동 빌드
  "deploy": "gh-pages -d dist"   // dist 폴더를 gh-pages 브랜치에 배포
}
```

---

## 🐛 문제 해결

### 문제 1: 404 에러 발생

**증상**: 페이지에 접속하면 404 에러

**원인**: `base` 경로가 잘못 설정됨

**해결**:
1. `client/vite.config.js` 확인
2. `base: '/senior-project/'`가 올바른지 확인
3. 저장소 이름과 일치해야 함

### 문제 2: CSS/JS 파일을 찾을 수 없음

**증상**: 페이지는 열리지만 스타일이 깨짐

**원인**: 정적 파일 경로 문제

**해결**:
1. `vite.config.js`의 `base` 경로 확인
2. 빌드 후 재배포:
   ```bash
   cd client
   npm run build
   git add .
   git commit -m "fix: base 경로 수정"
   git push origin main
   ```

### 문제 3: GitHub Actions 실패

**증상**: Actions 탭에서 빨간색 X 표시

**해결**:
1. Actions 탭에서 실패한 워크플로우 클릭
2. 에러 로그 확인
3. 주요 원인:
   - 빌드 에러: 코드 오류 수정 필요
   - 권한 문제: Settings → Actions → General → Workflow permissions에서 "Read and write permissions" 활성화

### 문제 4: 변경사항이 반영되지 않음

**증상**: 코드를 수정했는데 사이트에 반영 안 됨

**해결**:
1. GitHub Actions가 완료될 때까지 대기 (2-5분)
2. 브라우저 캐시 삭제 (Ctrl + Shift + R)
3. 시크릿 모드에서 확인

### 문제 5: API 호출 실패

**증상**: 배포된 사이트에서 API 호출 실패

**원인**: 백엔드 서버가 로컬에서만 실행 중

**해결**:
이 프로젝트는 백엔드 서버가 필요합니다. 다음 중 하나를 선택:

#### 옵션 A: 백엔드 별도 배포
- Heroku, Railway, Render 등에 백엔드 배포
- `client/src/services/api.js`에서 API URL 변경

#### 옵션 B: 데모 모드 구현
- API 호출 없이 작동하는 데모 버전 구현
- 샘플 데이터 사용

---

## 📝 배포 체크리스트

배포 전 확인사항:

- [ ] `vite.config.js`에 `base` 경로 설정
- [ ] `package.json`에 배포 스크립트 추가
- [ ] `.github/workflows/deploy.yml` 파일 생성
- [ ] GitHub Pages 설정 완료
- [ ] 로컬에서 빌드 테스트 (`npm run build`)
- [ ] `.gitignore`에 `dist/` 폴더 포함 확인

---

## 🔄 배포 워크플로우

### 일반적인 배포 과정

```bash
# 1. 기능 개발
# (코드 작성...)

# 2. 로컬 테스트
cd client
npm run dev

# 3. 빌드 테스트
npm run build
npm run preview

# 4. Git 커밋 & 푸시
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin main

# 5. GitHub Actions 자동 배포 대기 (2-5분)

# 6. 배포 확인
# https://kccho88.github.io/senior-project/ 접속
```

---

## 🎯 추가 팁

### 1. 커스텀 도메인 사용

GitHub Pages에서 커스텀 도메인을 사용하려면:

1. Settings → Pages → Custom domain
2. 도메인 입력 (예: `mylifestory.com`)
3. DNS 설정에서 CNAME 레코드 추가

### 2. HTTPS 강제

- Settings → Pages → "Enforce HTTPS" 체크
- 자동으로 HTTPS로 리다이렉트

### 3. 배포 환경 변수

민감한 정보는 GitHub Secrets에 저장:

1. Settings → Secrets and variables → Actions
2. New repository secret 클릭
3. 이름과 값 입력

워크플로우에서 사용:
```yaml
env:
  API_KEY: ${{ secrets.API_KEY }}
```

---

## 📊 배포 통계

### 빌드 크기 최적화

빌드 후 크기 확인:
```bash
cd client
npm run build
```

최적화 팁:
- 이미지 압축
- 코드 스플리팅
- Tree shaking
- Lazy loading

---

## 🎉 완료!

이제 프로젝트가 GitHub Pages에 배포되었습니다!

### 접속 주소
```
https://kccho88.github.io/senior-project/
```

### 자동 배포 활성화
- `main` 브랜치에 푸시하면 자동으로 배포됩니다
- 배포 상태는 Actions 탭에서 확인 가능

### 문제 발생 시
- 이 가이드의 [문제 해결](#문제-해결) 섹션 참고
- GitHub Actions 로그 확인
- Issues에 질문 등록

---

**Happy Deploying! 🚀**


