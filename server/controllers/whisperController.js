import openai from '../config/openai.js';
import fs from 'fs';

/**
 * Whisper API를 사용하여 음성을 텍스트로 변환
 */
export const transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '음성 파일이 필요합니다.' });
    }

    const audioFile = fs.createReadStream(req.file.path);

    // Whisper API 호출
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'ko', // 한국어
      response_format: 'json',
    });

    // 임시 파일 삭제
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      transcript: transcription.text,
    });

  } catch (error) {
    console.error('Whisper 변환 오류:', error);
    
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
};


