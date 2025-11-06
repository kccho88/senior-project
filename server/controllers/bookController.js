import Book from '../models/Book.js';
import Story from '../models/Story.js';
import openai from '../config/openai.js';
import { uploadToS3 } from '../config/s3.js';

/**
 * 자서전 생성 또는 가져오기
 */
export const getOrCreateBook = async (req, res) => {
  try {
    const { userId } = req.params;

    let book = await Book.findOne({ userId }).populate('chapters.storyIds');

    if (!book) {
      book = new Book({
        userId,
        title: '나의 인생 이야기',
        chapters: [],
      });
      await book.save();
    }

    res.status(200).json({
      success: true,
      book,
    });

  } catch (error) {
    console.error('책 조회/생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '책 조회에 실패했습니다.',
      error: error.message,
    });
  }
};

/**
 * 스토리들을 챕터로 구성
 */
export const organizeChapters = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { userId } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: '책을 찾을 수 없습니다.' });
    }

    // 모든 스토리 가져오기
    const stories = await Story.find({ userId }).sort({ createdAt: 1 });

    // 카테고리별로 그룹화
    const categoryMap = {
      childhood: { title: '유년기 - 어린 시절의 기억', stories: [] },
      youth: { title: '청춘기 - 젊은 날의 열정', stories: [] },
      marriage: { title: '결혼과 사랑', stories: [] },
      career: { title: '일과 커리어', stories: [] },
      family: { title: '가족 이야기', stories: [] },
      present: { title: '지금의 나', stories: [] },
      other: { title: '그 외의 이야기', stories: [] },
    };

    stories.forEach(story => {
      const category = story.category || 'other';
      if (categoryMap[category]) {
        categoryMap[category].stories.push(story._id);
      }
    });

    // 챕터 생성
    const chapters = [];
    let order = 1;

    for (const [category, data] of Object.entries(categoryMap)) {
      if (data.stories.length > 0) {
        chapters.push({
          title: data.title,
          storyIds: data.stories,
          order: order++,
          content: '', // 나중에 GPT로 생성
        });
      }
    }

    book.chapters = chapters;
    await book.save();

    res.status(200).json({
      success: true,
      book,
    });

  } catch (error) {
    console.error('챕터 구성 오류:', error);
    res.status(500).json({
      success: false,
      message: '챕터 구성에 실패했습니다.',
      error: error.message,
    });
  }
};

/**
 * 챕터 내용 생성 (문학적 버전)
 */
export const generateChapterContent = async (req, res) => {
  try {
    const { bookId, chapterIndex } = req.params;

    const book = await Book.findById(bookId).populate('chapters.storyIds');
    if (!book || !book.chapters[chapterIndex]) {
      return res.status(404).json({ message: '챕터를 찾을 수 없습니다.' });
    }

    const chapter = book.chapters[chapterIndex];
    const stories = chapter.storyIds;

    // 스토리들의 문학적 버전을 합치기
    const storiesText = stories.map((story, idx) => {
      return `\n\n### ${idx + 1}. ${story.title || '이야기'}\n${story.literaryVersion || story.summary}`;
    }).join('\n');

    // GPT로 챕터 전체를 하나의 흐름으로 재구성
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: '당신은 자서전 작가입니다. 여러 개의 이야기를 하나의 챕터로 자연스럽게 엮어주세요. 시간 순서와 감정의 흐름을 고려하여 문학적으로 서술하세요.',
        },
        {
          role: 'user',
          content: `다음 이야기들을 "${chapter.title}" 챕터로 구성해주세요:\n${storiesText}\n\n하나의 자연스러운 챕터로 작성해주세요. 각 이야기 사이의 전환을 부드럽게 연결하세요.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 3000,
    });

    chapter.content = completion.choices[0].message.content;
    book.wordCount = book.chapters.reduce((sum, ch) => sum + (ch.content?.length || 0), 0);
    book.estimatedReadingTime = Math.ceil(book.wordCount / 500); // 분당 500자 가정

    await book.save();

    res.status(200).json({
      success: true,
      chapter,
    });

  } catch (error) {
    console.error('챕터 내용 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '챕터 내용 생성에 실패했습니다.',
      error: error.message,
    });
  }
};

/**
 * DALL-E로 표지 이미지 생성
 */
export const generateCoverImage = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { prompt } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: '책을 찾을 수 없습니다.' });
    }

    // 프롬프트가 없으면 자동 생성
    let coverPrompt = prompt;
    if (!coverPrompt) {
      coverPrompt = `A warm and nostalgic book cover for an autobiography titled "${book.title}". Artistic, emotional, Korean style, vintage photography aesthetic, soft colors, representing a life story.`;
    }

    // DALL-E API 호출
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: coverPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
    });

    const imageUrl = response.data[0].url;

    book.coverImage = imageUrl;
    book.coverPrompt = coverPrompt;
    await book.save();

    res.status(200).json({
      success: true,
      coverImage: imageUrl,
    });

  } catch (error) {
    console.error('표지 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '표지 생성에 실패했습니다.',
      error: error.message,
    });
  }
};


