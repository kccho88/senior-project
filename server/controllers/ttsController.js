import openai from '../config/openai.js';
import { uploadToS3 } from '../config/s3.js';
import fs from 'fs';
import path from 'path';

/**
 * OpenAI TTS를 사용하여 텍스트를 음성으로 변환
 */
export const generateSpeech = async (req, res) => {
  try {
    const { text, voice = 'nova' } = req.body;

    if (!text) {
      return res.status(400).json({ message: '텍스트가 필요합니다.' });
    }

    // OpenAI TTS API 호출
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: voice, // alloy, echo, fable, onyx, nova, shimmer
      input: text,
      speed: 0.9, // 조금 느리게 (노년층 고려)
    });

    // 응답을 버퍼로 변환
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // S3에 업로드
    const fileName = `audio-${Date.now()}.mp3`;
    const audioUrl = await uploadToS3(buffer, fileName, 'audio/mpeg');

    res.status(200).json({
      success: true,
      audioUrl,
    });

  } catch (error) {
    console.error('TTS 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '음성 생성에 실패했습니다.',
      error: error.message,
    });
  }
};

/**
 * 챕터별 오디오북 생성
 */
export const generateChapterAudio = async (req, res) => {
  try {
    const { chapterId, text, voice = 'nova' } = req.body;

    if (!text) {
      return res.status(400).json({ message: '텍스트가 필요합니다.' });
    }

    // 긴 텍스트를 청크로 나누기 (4096자 제한)
    const chunks = splitTextIntoChunks(text, 4000);
    const audioUrls = [];

    for (let i = 0; i < chunks.length; i++) {
      const mp3 = await openai.audio.speech.create({
        model: 'tts-1-hd',
        voice: voice,
        input: chunks[i],
        speed: 0.9,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      const fileName = `chapter-${chapterId}-part-${i + 1}-${Date.now()}.mp3`;
      const audioUrl = await uploadToS3(buffer, fileName, 'audio/mpeg');
      
      audioUrls.push(audioUrl);
    }

    res.status(200).json({
      success: true,
      audioUrls,
      totalParts: chunks.length,
    });

  } catch (error) {
    console.error('챕터 오디오 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '챕터 오디오 생성에 실패했습니다.',
      error: error.message,
    });
  }
};

/**
 * 텍스트를 청크로 분할하는 헬퍼 함수
 */
function splitTextIntoChunks(text, maxLength) {
  const chunks = [];
  let currentChunk = '';

  const sentences = text.split(/(?<=[.!?])\s+/);

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      // 문장이 너무 길면 강제로 자르기
      if (sentence.length > maxLength) {
        const parts = sentence.match(new RegExp(`.{1,${maxLength}}`, 'g'));
        chunks.push(...parts.slice(0, -1));
        currentChunk = parts[parts.length - 1];
      } else {
        currentChunk = sentence;
      }
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}


