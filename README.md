# 내 인생을 읽다 📘

AI 자서전 & 오디오북 생성 플랫폼

## 🎯 프로젝트 소개

50~70대 사용자가 자신의 인생 이야기를 AI와 대화하며 기록하면,
AI가 이를 문학적으로 집필하고, 목소리로 읽어주는 오디오북과 자서전을 자동 생성합니다.

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm run install-all
```

### 2. 환경 변수 설정

`server/.env` 파일을 생성하고 다음 내용을 입력하세요:

```
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_bucket_name
PORT=5000
```

### 3. 개발 서버 실행

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📁 프로젝트 구조

```
내인생을읽다/
├── client/          # React Frontend
├── server/          # Express Backend
└── package.json     # Root package.json
```

## 🔧 주요 기능

1. **AI 인터뷰어** - 음성 기반 대화로 인생 이야기 수집
2. **사진 AI 분석** - 사진 속 기억을 AI가 분석하고 질문
3. **AI 자서전 집필** - 대화 내용을 문학적으로 재구성
4. **오디오북 생성** - 사용자 목소리로 자서전 낭독
5. **자동 출판** - PDF/EPUB 생성 및 표지 디자인

## 💰 수익화 모델

- 무료 플랜: 월 3개 인터뷰 & 챕터 1개
- 프리미엄: ₩12,900/월
- 출판 패키지: 전자책 ₩29,000 / 실물책 ₩89,000

## 🧠 기술 스택

**Frontend:** React, Vite, TailwindCSS  
**Backend:** Node.js, Express, MongoDB  
**AI:** OpenAI GPT-4, Whisper, DALL-E  
**Audio:** ElevenLabs TTS  
**Storage:** AWS S3


