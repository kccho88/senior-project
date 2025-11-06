import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema({
  title: String,
  content: String,
  storyIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
  }],
  order: Number,
});

const bookSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    default: '나의 인생 이야기',
  },
  subtitle: {
    type: String,
  },
  coverImage: {
    type: String, // DALL-E로 생성된 표지 이미지 URL
  },
  coverPrompt: {
    type: String, // 표지 생성에 사용된 프롬프트
  },
  chapters: [chapterSchema],
  status: {
    type: String,
    enum: ['draft', 'generating', 'completed', 'published'],
    default: 'draft',
  },
  audioBookUrl: {
    type: String, // 전체 오디오북 파일 URL
  },
  pdfUrl: {
    type: String,
  },
  epubUrl: {
    type: String,
  },
  wordCount: {
    type: Number,
    default: 0,
  },
  estimatedReadingTime: {
    type: Number, // 분 단위
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  publishedAt: {
    type: Date,
  },
});

bookSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Book = mongoose.model('Book', bookSchema);

export default Book;


