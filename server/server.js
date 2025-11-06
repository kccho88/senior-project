import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import audioRoutes from './routes/audioRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import fs from 'fs';

// 환경 변수 로드
dotenv.config();

// Express 앱 생성
const app = express();

// uploads 디렉토리 생성
if (!fs.existsSync('server/uploads')) {
  fs.mkdirSync('server/uploads', { recursive: true });
}

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use('/uploads', express.static('server/uploads'));

// MongoDB 연결
connectDB();

// 라우트
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/books', bookRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '내 인생을 읽다 - API 서버',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      ai: '/api/ai',
      audio: '/api/audio',
      books: '/api/books',
    },
  });
});

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '서버 오류가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 서버 시작
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📘 내 인생을 읽다 - AI 자서전 플랫폼`);
  console.log(`\n환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API: http://localhost:${PORT}`);
  console.log(`\n사용 가능한 엔드포인트:`);
  console.log(`  - POST /api/users/register - 회원가입`);
  console.log(`  - POST /api/users/login - 로그인`);
  console.log(`  - POST /api/ai/question - AI 질문 생성`);
  console.log(`  - POST /api/ai/transcribe - 음성→텍스트 변환`);
  console.log(`  - POST /api/ai/analyze - 답변 분석`);
  console.log(`  - POST /api/ai/story - 스토리 저장`);
  console.log(`  - GET  /api/ai/stories/:userId - 스토리 목록`);
  console.log(`  - POST /api/audio/generate - TTS 생성`);
  console.log(`  - GET  /api/books/:userId - 자서전 조회\n`);
});

export default app;


