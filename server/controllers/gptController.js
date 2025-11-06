import openai from '../config/openai.js';
import Story from '../models/Story.js';

/**
 * AI 인터뷰 질문 생성
 */
export const generateQuestion = async (req, res) => {
  try {
    const { userId, previousStories, category } = req.body;

    // 이전 대화 컨텍스트 구성
    let context = '당신은 따뜻하고 공감적인 AI 인터뷰어입니다. 50~70대 사용자의 인생 이야기를 듣고 기록하는 역할입니다.';
    
    if (previousStories && previousStories.length > 0) {
      context += '\n\n이전 대화 내용:\n';
      previousStories.forEach((story, index) => {
        context += `${index + 1}. Q: ${story.question}\n   A: ${story.summary}\n`;
      });
    }

    const categoryPrompts = {
      childhood: '어린 시절의 추억',
      youth: '청춘 시절의 경험',
      marriage: '결혼과 가족',
      career: '직업과 커리어',
      family: '가족 이야기',
      present: '현재의 삶',
    };

    const categoryHint = category ? `특히 "${categoryPrompts[category]}"에 대해 물어보세요.` : '';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: context,
        },
        {
          role: 'user',
          content: `다음 인터뷰 질문을 하나 생성해주세요. ${categoryHint}\n\n질문은 구체적이고 감성적이며, 사용자가 자신의 경험을 풍부하게 이야기할 수 있도록 유도해야 합니다. 질문만 답변해주세요.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 200,
    });

    const question = completion.choices[0].message.content.trim();

    res.status(200).json({
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
};

/**
 * 사용자 답변 요약 및 감정 분석
 */
export const summarizeAndAnalyze = async (req, res) => {
  try {
    const { transcript, question } = req.body;

    if (!transcript) {
      return res.status(400).json({ message: '텍스트가 필요합니다.' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: '당신은 인생 이야기를 분석하고 요약하는 전문가입니다. 사용자의 답변을 간결하게 요약하고, 감정을 분석하며, 핵심 키워드를 추출하세요.',
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

    res.status(200).json({
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
};

/**
 * 문학적 스토리 생성
 */
export const generateLiteraryVersion = async (req, res) => {
  try {
    const { storyId } = req.body;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: '스토리를 찾을 수 없습니다.' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: '당신은 자서전 작가입니다. 사용자의 인생 이야기를 문학적이고 감동적인 문체로 재구성하세요. 사실은 유지하되, 감정과 분위기를 살려 서술하세요.',
        },
        {
          role: 'user',
          content: `다음 이야기를 문학적으로 재구성해주세요:\n\n질문: ${story.question}\n답변: ${story.transcript}\n\n감정: ${story.emotion}\n키워드: ${story.keywords?.join(', ')}\n\n3-5개 문단으로 작성해주세요.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const literaryVersion = completion.choices[0].message.content;

    // 스토리 업데이트
    story.literaryVersion = literaryVersion;
    await story.save();

    res.status(200).json({
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
};


