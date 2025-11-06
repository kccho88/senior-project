import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// 환경 변수 로드
dotenv.config();

// uploads 디렉토리 생성
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

// OpenAI 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Multer 설정 (파일 업로드)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// 미들웨어
app.use(cors());
app.use(express.json());

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '✅ 내 인생을 읽다 - API 서버',
    version: '1.0.0',
    status: 'running',
    openai: process.env.OPENAI_API_KEY ? 'connected' : 'not configured',
  });
});

// 음성을 텍스트로 변환 (Whisper API)
app.post('/api/ai/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: '음성 파일이 필요합니다.' 
      });
    }

    console.log('📝 음성 파일 수신:', req.file.originalname);

    // Whisper API 호출
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'whisper-1',
      language: 'ko',
    });

    console.log('✅ Whisper 변환 완료:', transcription.text);

    // 임시 파일 삭제
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      transcript: transcription.text,
    });

  } catch (error) {
    console.error('❌ Whisper 변환 오류:', error.message);
    
    // 오류 발생 시 임시 파일 삭제
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: '음성 변환에 실패했습니다.',
      error: error.message,
    });
  }
});

// AI 질문 생성 (간단 버전)
app.post('/api/ai/question', async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '당신은 따뜻하고 공감적인 AI 인터뷰어입니다. 50~70대 사용자의 인생 이야기를 듣고 기록하는 역할입니다.',
        },
        {
          role: 'user',
          content: '어린 시절에 대한 질문을 하나 만들어주세요. 질문만 답변해주세요.',
        },
      ],
      temperature: 0.8,
      max_tokens: 100,
    });

    const question = completion.choices[0].message.content.trim();

    res.json({
      success: true,
      question,
    });
  } catch (error) {
    console.error('질문 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '질문 생성에 실패했습니다.',
      error: error.message,
    });
  }
});

// 텍스트 분석 (간단 버전)
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { transcript, question } = req.body;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '사용자의 답변을 요약하고, 감정을 분석하며, 키워드를 추출하세요.',
        },
        {
          role: 'user',
          content: `질문: ${question}\n\n답변: ${transcript}\n\n다음 형식으로 JSON 응답해주세요:\n{\n  "summary": "요약 (2-3문장)",\n  "emotion": "감정 (happy/sad/nostalgic/proud/grateful/reflective 중 하나)",\n  "keywords": ["키워드1", "키워드2", "키워드3"]\n}`,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(completion.choices[0].message.content);

    res.json({
      success: true,
      ...analysis,
    });
  } catch (error) {
    console.error('분석 오류:', error);
    res.status(500).json({
      success: false,
      message: '분석에 실패했습니다.',
      error: error.message,
    });
  }
});

// 스토리 저장 (메모리 버전 - MongoDB 없이)
const stories = [];

app.post('/api/ai/story', (req, res) => {
  try {
    const story = {
      _id: Date.now().toString(),
      ...req.body,
      createdAt: new Date(),
    };
    stories.push(story);

    res.json({
      success: true,
      story,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '스토리 저장에 실패했습니다.',
      error: error.message,
    });
  }
});

// 스토리 목록 조회
app.get('/api/ai/stories/:userId', (req, res) => {
  const userStories = stories.filter(s => s.userId === req.params.userId);
  res.json({
    success: true,
    stories: userStories,
    count: userStories.length,
  });
});

// 사진 분석 (GPT-4 Vision)
app.post('/api/ai/analyze-photo', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: '이미지 파일이 필요합니다.' 
      });
    }

    console.log('📸 사진 파일 수신:', req.file.originalname);

    // 이미지를 base64로 인코딩
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');
    const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;

    // GPT-4 Vision API 호출
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '당신은 사진을 분석하여 시대, 장소, 인물, 상황을 파악하고, 사용자에게 그 사진에 대한 기억을 물어보는 AI입니다.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '이 사진을 분석하고, 다음 정보를 JSON 형식으로 제공해주세요:\n{\n  "era": "추정 시대 (예: 1980년대)",\n  "location": "추정 장소",\n  "people": "인물 수 및 특징",\n  "situation": "상황 설명",\n  "question": "사용자에게 물어볼 질문 (감성적이고 구체적으로)"\n}',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    console.log('✅ 사진 분석 완료');

    // 임시 파일 삭제
    fs.unlinkSync(req.file.path);

    // JSON 파싱 시도
    let analysis;
    try {
      analysis = JSON.parse(response.choices[0].message.content);
    } catch (e) {
      // JSON 파싱 실패 시 텍스트 그대로 사용
      analysis = {
        era: '분석 중',
        location: '분석 중',
        people: '분석 중',
        situation: response.choices[0].message.content,
        question: '이 사진에 대해 어떤 기억이 있으신가요?',
      };
    }

    res.json({
      success: true,
      imageUrl: `/uploads/${req.file.filename}`, // 실제로는 S3 URL
      analysis,
    });

  } catch (error) {
    console.error('❌ 사진 분석 오류:', error.message);
    
    // 오류 발생 시 임시 파일 삭제
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: '사진 분석에 실패했습니다.',
      error: error.message,
    });
  }
});

// 문학적 버전 생성
app.post('/api/ai/literary', async (req, res) => {
  try {
    const { storyId } = req.body;
    const story = stories.find(s => s._id === storyId);

    if (!story) {
      return res.status(404).json({ message: '스토리를 찾을 수 없습니다.' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '자서전 작가로서 이야기를 문학적으로 재구성하세요.',
        },
        {
          role: 'user',
          content: `다음 이야기를 문학적으로 재구성해주세요:\n\n질문: ${story.question}\n답변: ${story.transcript}\n\n3-5개 문단으로 작성해주세요.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 800,
    });

    const literaryVersion = completion.choices[0].message.content;
    story.literaryVersion = literaryVersion;

    res.json({
      success: true,
      literaryVersion,
    });
  } catch (error) {
    console.error('문학적 변환 오류:', error);
    res.status(500).json({
      success: false,
      message: '문학적 변환에 실패했습니다.',
      error: error.message,
    });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`\n🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📘 내 인생을 읽다 - AI 자서전 플랫폼`);
  console.log(`\nOpenAI API: ${process.env.OPENAI_API_KEY ? '✅ 연결됨' : '❌ 설정 필요'}`);
  console.log(`\nAPI 엔드포인트:`);
  console.log(`  - GET  http://localhost:${PORT}/`);
  console.log(`  - POST http://localhost:${PORT}/api/ai/transcribe (음성→텍스트)`);
  console.log(`  - POST http://localhost:${PORT}/api/ai/analyze-photo (사진 분석)`);
  console.log(`  - POST http://localhost:${PORT}/api/ai/question`);
  console.log(`  - POST http://localhost:${PORT}/api/ai/analyze`);
  console.log(`  - POST http://localhost:${PORT}/api/ai/story`);
  console.log(`  - GET  http://localhost:${PORT}/api/ai/stories/:userId`);
  console.log(`  - POST http://localhost:${PORT}/api/ai/literary\n`);
});

