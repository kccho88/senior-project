import express from 'express';
import multer from 'multer';
import { transcribeAudio } from '../controllers/whisperController.js';
import { generateQuestion, summarizeAndAnalyze, generateLiteraryVersion } from '../controllers/gptController.js';
import { analyzePhoto, analyzeMultiplePhotos } from '../controllers/visionController.js';
import Story from '../models/Story.js';

const router = express.Router();

// Multer 설정 (파일 업로드)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const memoryStorage = multer.memoryStorage();

const uploadDisk = multer({ storage });
const uploadMemory = multer({ storage: memoryStorage });

/**
 * AI 질문 생성
 */
router.post('/question', generateQuestion);

/**
 * 음성을 텍스트로 변환 (Whisper)
 */
router.post('/transcribe', uploadDisk.single('audio'), transcribeAudio);

/**
 * 답변 요약 및 감정 분석
 */
router.post('/analyze', summarizeAndAnalyze);

/**
 * 스토리 저장
 */
router.post('/story', async (req, res) => {
  try {
    const {
      userId,
      title,
      category,
      question,
      audioUrl,
      transcript,
      summary,
      emotion,
      keywords,
    } = req.body;

    const story = new Story({
      userId,
      title,
      category,
      question,
      audioUrl,
      transcript,
      summary,
      emotion,
      keywords,
    });

    await story.save();

    res.status(201).json({
      success: true,
      story,
    });

  } catch (error) {
    console.error('스토리 저장 오류:', error);
    res.status(500).json({
      success: false,
      message: '스토리 저장에 실패했습니다.',
      error: error.message,
    });
  }
});

/**
 * 사용자의 모든 스토리 조회
 */
router.get('/stories/:userId', async (req, res) => {
  try {
    const stories = await Story.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      stories,
      count: stories.length,
    });

  } catch (error) {
    console.error('스토리 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '스토리 조회에 실패했습니다.',
      error: error.message,
    });
  }
});

/**
 * 문학적 버전 생성
 */
router.post('/literary', generateLiteraryVersion);

/**
 * 사진 분석 (단일)
 */
router.post('/analyze-photo', uploadMemory.single('image'), analyzePhoto);

/**
 * 사진 분석 (다중)
 */
router.post('/analyze-photos', uploadMemory.array('images', 10), analyzeMultiplePhotos);

export default router;


