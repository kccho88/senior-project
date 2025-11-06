import express from 'express';
import { generateSpeech, generateChapterAudio } from '../controllers/ttsController.js';

const router = express.Router();

/**
 * 텍스트를 음성으로 변환
 */
router.post('/generate', generateSpeech);

/**
 * 챕터 오디오북 생성
 */
router.post('/chapter', generateChapterAudio);

export default router;


