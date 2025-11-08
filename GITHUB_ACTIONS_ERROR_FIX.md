# 🔧 GitHub Actions 에러 해결 가이드

## 📋 에러 확인 방법

### Step 1: 에러 로그 보기
1. GitHub 저장소 접속: `https://github.com/kccho88/senior-project`
2. **Actions** 탭 클릭
3. 빨간색 X가 있는 워크플로우 클릭
4. 빨간색 X가 있는 단계 클릭 (build 또는 deploy)
5. 에러 메시지 확인

---

## 🔧 해결 방법 (순서대로 시도)

---

## 해결 방법 1: Actions 권한 설정 (가장 흔한 원인!)

### 증상
```
Error: Resource not accessible by integration
Error: HttpError: Resource not accessible by integration
```

### 해결 단계

#### 1-1. Settings 접속
- GitHub 저장소에서 **Settings** 탭 클릭

#### 1-2. Actions 메뉴
왼쪽 사이드바에서:
```
Code and automation
└─ Actions
   └─ General  ← 클릭!
```

#### 1-3. Workflow permissions 찾기
페이지를 아래로 스크롤하면 **"Workflow permissions"** 섹션이 있습니다

#### 1-4. 권한 변경
다음과 같이 설정:
- ✅ **"Read and write permissions"** 선택 (중요!)
- ✅ **"Allow GitHub Actions to create and approve pull requests"** 체크

#### 1-5. 저장
- 하단의 **"Save"** 버튼 클릭

#### 1-6. 워크플로우 재실행
1. **Actions** 탭으로 이동
2. 실패한 워크플로우 클릭
3. 오른쪽 상단 **"Re-run all jobs"** 버튼 클릭

---

## 해결 방법 2: GitHub Pages 설정 확인

### 2-1. Pages 설정 확인
1. **Settings** → **Pages**
2. **Source**가 **"GitHub Actions"** 로 되어 있는지 확인
3. 아니라면 드롭다운에서 **"GitHub Actions"** 선택

### 2-2. 저장소 Public 확인
1. **Settings** → **General**
2. 페이지 맨 아래 **"Danger Zone"** 섹션
3. 저장소가 **Public**인지 확인
4. Private이면 Public으로 변경 (또는 GitHub Pro 필요)

---

## 해결 방법 3: 워크플로우 파일 수정 (npm ci → npm install)

### 증상
```
Error: The `npm ci` command can only install with an existing package-lock.json
```

### 해결 단계

#### 3-1. 워크플로우 파일 편집
1. GitHub 저장소에서 **Actions** 탭
2. 왼쪽에서 **"Deploy to GitHub Pages"** 클릭
3. 오른쪽 상단 **"..."** (점 3개) 클릭
4. **"View workflow file"** 클릭
5. 연필 아이콘 (Edit) 클릭

#### 3-2. 코드 수정
다음 부분을 찾아서:
```yaml
      - name: Install dependencies
        run: |
          cd client
          npm ci
```

이렇게 변경:
```yaml
      - name: Install dependencies
        run: |
          cd client
          npm install
```

#### 3-3. 커밋
- **"Commit changes"** 클릭
- 커밋 메시지: `fix: npm ci를 npm install로 변경`
- **"Commit changes"** 클릭

---

## 해결 방법 4: package-lock.json 동기화

### 4-1. 로컬에서 확인
PowerShell에서:
```powershell
cd "C:\Users\PC\Desktop\Cursor_ai_exe\senior project"
git status
```

### 4-2. package-lock.json 커밋 확인
`client/package-lock.json`이 커밋되어 있는지 확인

### 4-3. 없다면 추가
```powershell
git add client/package-lock.json
git commit -m "chore: package-lock.json 추가"
git push origin main
```

---

## 해결 방법 5: Node.js 버전 변경

### 증상
```
Error: The engine "node" is incompatible with this module
```

### 해결: 워크플로우 파일에서 Node 버전 변경

#### 5-1. 워크플로우 파일 편집
(위의 3-1 단계 참고)

#### 5-2. Node 버전 찾기
```yaml
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'  ← 이 부분
```

#### 5-3. 버전 변경
```yaml
          node-version: '20'  ← 20으로 변경
```

---

## 해결 방법 6: 빌드 경로 문제

### 증상
```
Error: Unable to find any artifacts for the associated workflow
```

### 해결: dist 폴더 확인

#### 6-1. 로컬에서 빌드 테스트
```powershell
cd "C:\Users\PC\Desktop\Cursor_ai_exe\senior project\client"
npm run build
```

#### 6-2. dist 폴더 확인
빌드 후 `client/dist` 폴더가 생성되는지 확인

#### 6-3. 빌드 성공하면
```powershell
cd ..
git add .
git commit -m "test: 로컬 빌드 테스트"
git push origin main
```

---

## 🎯 가장 가능성 높은 해결 방법 (추천 순서)

### 1순위: Actions 권한 설정 ⭐⭐⭐
→ **해결 방법 1** 시도

### 2순위: GitHub Pages Source 설정 ⭐⭐
→ **해결 방법 2** 시도

### 3순위: npm ci → npm install 변경 ⭐
→ **해결 방법 3** 시도

---

## 📸 스크린샷으로 보는 해결 방법

### Actions 권한 설정 위치

```
GitHub 저장소
  └─ Settings (상단 탭)
      └─ Actions (왼쪽 사이드바)
          └─ General
              └─ Workflow permissions (페이지 하단)
                  └─ ✅ Read and write permissions
```

### GitHub Pages 설정 위치

```
GitHub 저장소
  └─ Settings (상단 탭)
      └─ Pages (왼쪽 사이드바)
          └─ Source: GitHub Actions
```

---

## 🆘 여전히 안 되면?

### 에러 메시지 복사하기

1. Actions 탭에서 실패한 워크플로우 클릭
2. 빨간색 X가 있는 단계 클릭
3. 에러 메시지 전체 복사
4. 저에게 알려주세요!

### 확인할 정보
- 어느 단계에서 실패했나요? (build? deploy?)
- 에러 메시지가 뭔가요?
- 저장소가 Public인가요?

---

## ✅ 성공 확인

다음과 같이 보이면 성공입니다:

### Actions 탭
```
✅ Deploy to GitHub Pages
   build: 성공
   deploy: 성공
```

### 배포 URL
```
https://kccho88.github.io/senior-project/
```

---

## 💡 예방 팁

### 앞으로 에러 방지하려면:

1. **로컬에서 먼저 빌드 테스트**
   ```bash
   cd client
   npm run build
   ```

2. **package-lock.json 항상 커밋**
   ```bash
   git add client/package-lock.json
   git commit -m "chore: update package-lock.json"
   ```

3. **Actions 권한 유지**
   - "Read and write permissions" 유지

---

이 가이드를 따라해도 안 되면, 에러 메시지를 복사해서 알려주세요! 🚀

