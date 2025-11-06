import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    default: '새로운 이야기',
  },
  category: {
    type: String,
    enum: ['childhood', 'youth', 'marriage', 'career', 'family', 'present', 'other'],
    default: 'other',
  },
  question: {
    type: String, // AI가 물어본 질문
  },
  audioUrl: {
    type: String, // 사용자 음성 녹음 파일 (S3)
  },
  transcript: {
    type: String, // Whisper로 변환된 텍스트
  },
  summary: {
    type: String, // GPT가 요약한 내용
  },
  emotion: {
    type: String, // 감정 분석 결과 (happy, sad, nostalgic, proud 등)
  },
  images: [{
    url: String,
    caption: String,
    analysis: String, // GPT Vision 분석 결과
  }],
  literaryVersion: {
    type: String, // 문학적으로 재구성된 버전
  },
  keywords: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

storySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Story = mongoose.model('Story', storySchema);

export default Story;


