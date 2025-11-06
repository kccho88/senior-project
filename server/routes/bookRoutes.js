import express from 'express';
import {
  getOrCreateBook,
  organizeChapters,
  generateChapterContent,
  generateCoverImage,
} from '../controllers/bookController.js';

const router = express.Router();

/**
 * 자서전 조회/생성
 */
router.get('/:userId', getOrCreateBook);

/**
 * 챕터 구성
 */
router.post('/:bookId/organize', organizeChapters);

/**
 * 챕터 내용 생성
 */
router.post('/:bookId/chapter/:chapterIndex', generateChapterContent);

/**
 * 표지 이미지 생성
 */
router.post('/:bookId/cover', generateCoverImage);

export default router;


