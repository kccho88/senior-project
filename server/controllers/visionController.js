import openai from '../config/openai.js';
import { uploadToS3 } from '../config/s3.js';

/**
 * GPT-4 Vision으로 사진 분석
 */
export const analyzePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '이미지 파일이 필요합니다.' });
    }

    // S3에 이미지 업로드
    const imageUrl = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // GPT-4 Vision API 호출
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
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
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(response.choices[0].message.content);

    res.status(200).json({
      success: true,
      imageUrl,
      analysis,
    });

  } catch (error) {
    console.error('사진 분석 오류:', error);
    res.status(500).json({
      success: false,
      message: '사진 분석에 실패했습니다.',
      error: error.message,
    });
  }
};

/**
 * 여러 사진 일괄 분석
 */
export const analyzeMultiplePhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: '이미지 파일이 필요합니다.' });
    }

    const results = [];

    for (const file of req.files) {
      try {
        // S3에 업로드
        const imageUrl = await uploadToS3(
          file.buffer,
          file.originalname,
          file.mimetype
        );

        // Vision API 호출
        const response = await openai.chat.completions.create({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: '이 사진을 간단히 설명해주세요. (시대, 장소, 상황)',
                },
                {
                  type: 'image_url',
                  image_url: { url: imageUrl },
                },
              ],
            },
          ],
          max_tokens: 200,
        });

        results.push({
          imageUrl,
          description: response.choices[0].message.content,
        });

      } catch (error) {
        console.error(`사진 분석 실패 (${file.originalname}):`, error);
        results.push({
          imageUrl: null,
          error: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      results,
    });

  } catch (error) {
    console.error('일괄 분석 오류:', error);
    res.status(500).json({
      success: false,
      message: '일괄 분석에 실패했습니다.',
      error: error.message,
    });
  }
};


