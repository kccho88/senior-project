// 간단한 서버 테스트
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const app = express();

app.use(cors());
app.use(express.json());

// 테스트 라우트
app.get('/', (req, res) => {
  res.json({
    message: '✅ 서버가 정상 작동 중입니다!',
    openai_key: process.env.OPENAI_API_KEY ? '✅ API 키 설정됨' : '❌ API 키 없음',
    timestamp: new Date().toISOString(),
  });
});

// OpenAI 테스트
app.get('/test-openai', async (req, res) => {
  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: '안녕하세요! 한 문장으로 답변해주세요.' }],
      max_tokens: 50,
    });

    res.json({
      success: true,
      message: '✅ OpenAI API 연결 성공!',
      response: completion.choices[0].message.content,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ OpenAI API 오류',
      error: error.message,
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 테스트 서버 실행 중: http://localhost:${PORT}`);
  console.log(`📝 OpenAI API 키: ${process.env.OPENAI_API_KEY ? '설정됨 ✅' : '없음 ❌'}`);
  console.log(`\n테스트 엔드포인트:`);
  console.log(`  - http://localhost:${PORT}/`);
  console.log(`  - http://localhost:${PORT}/test-openai\n`);
});

