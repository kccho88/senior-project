# 내 인생을 읽다 - 설치 및 실행 가이드 🚀

## 📋 사전 요구사항

- Node.js 18.x 이상
- MongoDB 설치 또는 MongoDB Atlas 계정
- OpenAI API 키 (필수)
- AWS S3 계정 (선택사항)

---

## 🔧 1단계: 프로젝트 클론 및 의존성 설치

```bash
# 프로젝트 디렉토리로 이동
cd "senior project"

# 루트, 서버, 클라이언트 모든 의존성 설치
npm run install-all
```

또는 개별 설치:

```bash
# 루트
npm install

# 서버
cd server
npm install

# 클라이언트
cd ../client
npm install
```

---

## 🔑 2단계: 환경 변수 설정

### 서버 환경 변수

`server/.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
# OpenAI API (필수)
OPENAI_API_KEY=sk-your-openai-api-key-here

# MongoDB (필수)
MONGODB_URI=mongodb://localhost:27017/my-life-story
# 또는 MongoDB Atlas 사용 시:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/my-life-story

# JWT Secret (필수)
JWT_SECRET=your-super-secret-jwt-key-change-this

# AWS S3 (선택사항 - 파일 업로드용)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_BUCKET_NAME=my-life-story-bucket
AWS_REGION=ap-northeast-2

# 서버 설정
PORT=5000
NODE_ENV=development

# ElevenLabs (선택사항 - 고급 음성 복제용)
ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

### 클라이언트 환경 변수 (선택사항)

`client/.env` 파일을 생성:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🗄️ 3단계: MongoDB 설정

### 로컬 MongoDB 사용

```bash
# MongoDB 서비스 시작 (Windows)
net start MongoDB

# MongoDB 서비스 시작 (Mac/Linux)
sudo systemctl start mongod
```

### MongoDB Atlas 사용 (권장)

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 가입
2. 무료 클러스터 생성
3. Database Access에서 사용자 생성
4. Network Access에서 IP 화이트리스트 추가 (0.0.0.0/0 또는 현재 IP)
5. 연결 문자열을 복사하여 `.env`의 `MONGODB_URI`에 입력

---

## 🎯 4단계: OpenAI API 키 발급

1. [OpenAI Platform](https://platform.openai.com/) 가입
2. API Keys 메뉴에서 새 키 생성
3. 생성된 키를 복사하여 `.env`의 `OPENAI_API_KEY`에 입력

**필요한 OpenAI 모델:**
- `whisper-1` - 음성→텍스트 변환
- `gpt-4-turbo-preview` - 텍스트 분석 및 생성
- `gpt-4-vision-preview` - 사진 분석
- `dall-e-3` - 표지 이미지 생성
- `tts-1-hd` - 텍스트→음성 변환

---

## 🚀 5단계: 개발 서버 실행

### 방법 1: 동시 실행 (권장)

루트 디렉토리에서:

```bash
npm run dev
```

이 명령어는 백엔드와 프론트엔드를 동시에 실행합니다.

### 방법 2: 개별 실행

**터미널 1 - 백엔드:**
```bash
cd server
node server.js
```

**터미널 2 - 프론트엔드:**
```bash
cd client
npm run dev
```

---

## 🌐 6단계: 애플리케이션 접속

서버가 정상적으로 실행되면:

- **프론트엔드:** http://localhost:5173
- **백엔드 API:** http://localhost:5000
- **API 문서:** http://localhost:5000 (JSON 응답)

---

## 📝 주요 API 엔드포인트

### 사용자
- `POST /api/users/register` - 회원가입
- `POST /api/users/login` - 로그인
- `GET /api/users/:userId` - 사용자 정보

### AI 인터뷰
- `POST /api/ai/question` - AI 질문 생성
- `POST /api/ai/transcribe` - 음성→텍스트 (Whisper)
- `POST /api/ai/analyze` - 답변 분석 (GPT)
- `POST /api/ai/story` - 스토리 저장
- `GET /api/ai/stories/:userId` - 스토리 목록
- `POST /api/ai/literary` - 문학적 버전 생성
- `POST /api/ai/analyze-photo` - 사진 분석 (Vision)

### 오디오북
- `POST /api/audio/generate` - TTS 생성
- `POST /api/audio/chapter` - 챕터 오디오 생성

### 자서전
- `GET /api/books/:userId` - 자서전 조회
- `POST /api/books/:bookId/organize` - 챕터 구성
- `POST /api/books/:bookId/chapter/:chapterIndex` - 챕터 내용 생성
- `POST /api/books/:bookId/cover` - 표지 생성 (DALL-E)

---

## 🧪 테스트 흐름

### 1. 홈 페이지
- http://localhost:5173 접속
- 4개의 주요 기능 카드 확인

### 2. AI 인터뷰 테스트
1. "AI 인터뷰" 클릭
2. AI가 생성한 질문 확인
3. 마이크 버튼 클릭 (브라우저 권한 허용)
4. 음성으로 답변 (또는 테스트용 음성 파일 업로드)
5. AI가 자동으로:
   - 음성→텍스트 변환 (Whisper)
   - 답변 요약 및 감정 분석 (GPT)
   - 스토리 저장
   - 문학적 버전 생성 (GPT)
6. 결과 확인

### 3. 사진 앨범 테스트
1. "사진 앨범" 클릭
2. 사진 업로드
3. AI가 사진 분석 (GPT-4 Vision)
4. 생성된 질문에 음성으로 답변

### 4. 자서전 보기
1. "내 자서전" 클릭
2. 저장된 스토리 목록 확인
3. "챕터 자동 구성" 클릭
4. 챕터별로 이야기 확인

### 5. 오디오북 테스트
1. "오디오북" 클릭
2. 목소리 선택
3. "오디오북 생성하기" 클릭
4. 생성된 오디오 재생

---

## ⚠️ 문제 해결

### MongoDB 연결 실패
```
❌ MongoDB 연결 실패: connect ECONNREFUSED
```
**해결:** MongoDB 서비스가 실행 중인지 확인하거나 MongoDB Atlas 연결 문자열 확인

### OpenAI API 오류
```
❌ OpenAI API Error: 401 Unauthorized
```
**해결:** `.env` 파일의 `OPENAI_API_KEY` 확인 및 API 크레딧 잔액 확인

### 포트 충돌
```
Error: listen EADDRINUSE: address already in use :::5000
```
**해결:** 다른 프로세스가 포트를 사용 중입니다.
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### 마이크 권한 오류
```
Error: Permission denied
```
**해결:** 브라우저 설정에서 마이크 권한 허용 (Chrome: 설정 > 개인정보 및 보안 > 사이트 설정 > 마이크)

---

## 📦 프로덕션 빌드

### 클라이언트 빌드
```bash
cd client
npm run build
```

빌드된 파일은 `client/dist/` 폴더에 생성됩니다.

### 서버 배포
- **Render:** `server/` 폴더를 Render에 배포
- **AWS EC2:** PM2로 프로세스 관리
- **Vercel (프론트엔드):** `client/` 폴더를 Vercel에 배포

---

## 💰 예상 비용 (월간)

### 무료 티어 사용 시
- MongoDB Atlas: 무료 (512MB)
- Vercel/Render: 무료
- OpenAI API: 사용량에 따라 (테스트 시 약 $5-10)

### 프리미엄 사용자 100명 기준
- OpenAI API: ~$200-300
- MongoDB Atlas: ~$25 (M10 클러스터)
- AWS S3: ~$10
- 서버 호스팅: ~$20-50

---

## 🎓 추가 학습 자료

- [OpenAI API 문서](https://platform.openai.com/docs)
- [MongoDB 튜토리얼](https://www.mongodb.com/docs/manual/tutorial/)
- [React 공식 문서](https://react.dev/)
- [Express.js 가이드](https://expressjs.com/)

---

## 📞 지원

문제가 발생하면:
1. 콘솔 로그 확인
2. `.env` 파일 설정 재확인
3. MongoDB 연결 상태 확인
4. OpenAI API 크레딧 확인

---

**축하합니다! 🎉**
이제 "내 인생을 읽다" 플랫폼을 사용할 준비가 되었습니다.


