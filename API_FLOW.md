# API 흐름 가이드 📊

## 핵심 데모 흐름: VoiceRecorder → Whisper → GPT → BookPreview

이 문서는 사용자가 음성으로 이야기를 녹음하고, AI가 이를 처리하여 자서전으로 만드는 전체 흐름을 설명합니다.

---

## 🎯 전체 흐름 다이어그램

```
사용자 음성 녹음
    ↓
[VoiceRecorder 컴포넌트]
    ↓
음성 파일 (Blob)
    ↓
[1] POST /api/ai/transcribe (Whisper API)
    ↓
텍스트 변환 결과
    ↓
[2] POST /api/ai/analyze (GPT-4 API)
    ↓
요약 + 감정 분석 + 키워드
    ↓
[3] POST /api/ai/story (MongoDB 저장)
    ↓
스토리 ID
    ↓
[4] POST /api/ai/literary (GPT-4 API)
    ↓
문학적 버전
    ↓
[BookPreview 컴포넌트]
    ↓
사용자에게 결과 표시
```

---

## 📝 단계별 상세 설명

### 1단계: 음성 녹음 (VoiceRecorder)

**컴포넌트:** `client/src/components/VoiceRecorder.jsx`

**동작:**
1. 사용자가 마이크 버튼 클릭
2. `navigator.mediaDevices.getUserMedia()` 호출
3. MediaRecorder로 음성 녹음
4. 녹음 완료 시 Blob을 File로 변환
5. `onRecordingComplete(audioFile)` 콜백 호출

**출력:**
```javascript
audioFile = File {
  name: "recording-1234567890.webm",
  type: "audio/webm",
  size: 123456
}
```

---

### 2단계: 음성 → 텍스트 변환 (Whisper)

**API 엔드포인트:** `POST /api/ai/transcribe`

**요청:**
```javascript
const formData = new FormData();
formData.append('audio', audioFile);

const response = await fetch('/api/ai/transcribe', {
  method: 'POST',
  body: formData,
});
```

**서버 처리:** `server/controllers/whisperController.js`
```javascript
// 1. 파일을 임시 저장
// 2. OpenAI Whisper API 호출
const transcription = await openai.audio.transcriptions.create({
  file: audioFile,
  model: 'whisper-1',
  language: 'ko',
});
// 3. 텍스트 반환
```

**응답:**
```json
{
  "success": true,
  "transcript": "어린 시절 저는 시골 마을에서 자랐습니다. 할머니와 함께 살았고, 매일 아침 개울가에서 친구들과 놀았습니다..."
}
```

---

### 3단계: 텍스트 분석 (GPT-4)

**API 엔드포인트:** `POST /api/ai/analyze`

**요청:**
```javascript
const response = await fetch('/api/ai/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transcript: "어린 시절 저는 시골 마을에서...",
    question: "어린 시절 가장 기억에 남는 순간은 언제인가요?"
  }),
});
```

**서버 처리:** `server/controllers/gptController.js`
```javascript
// GPT-4에게 요청
const completion = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [
    {
      role: 'system',
      content: '사용자의 답변을 요약하고, 감정을 분석하며, 키워드를 추출하세요.'
    },
    {
      role: 'user',
      content: `질문: ${question}\n답변: ${transcript}\n\nJSON 형식으로 응답해주세요.`
    }
  ],
  response_format: { type: 'json_object' }
});
```

**응답:**
```json
{
  "success": true,
  "summary": "시골 마을에서 할머니와 함께 자란 어린 시절의 평화로운 기억",
  "emotion": "nostalgic",
  "keywords": ["시골", "할머니", "개울", "친구들"]
}
```

---

### 4단계: 스토리 저장 (MongoDB)

**API 엔드포인트:** `POST /api/ai/story`

**요청:**
```javascript
const response = await fetch('/api/ai/story', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: "user123",
    title: "시골 마을의 추억",
    category: "childhood",
    question: "어린 시절 가장 기억에 남는 순간은?",
    transcript: "어린 시절 저는...",
    summary: "시골 마을에서 할머니와...",
    emotion: "nostalgic",
    keywords: ["시골", "할머니", "개울"]
  }),
});
```

**서버 처리:** `server/routes/aiRoutes.js`
```javascript
const story = new Story({
  userId,
  title,
  category,
  question,
  transcript,
  summary,
  emotion,
  keywords,
});
await story.save();
```

**응답:**
```json
{
  "success": true,
  "story": {
    "_id": "65abc123...",
    "userId": "user123",
    "title": "시골 마을의 추억",
    "summary": "시골 마을에서...",
    "emotion": "nostalgic",
    "keywords": ["시골", "할머니", "개울"],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 5단계: 문학적 버전 생성 (GPT-4)

**API 엔드포인트:** `POST /api/ai/literary`

**요청:**
```javascript
const response = await fetch('/api/ai/literary', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    storyId: "65abc123..."
  }),
});
```

**서버 처리:** `server/controllers/gptController.js`
```javascript
// 1. 스토리 조회
const story = await Story.findById(storyId);

// 2. GPT-4에게 문학적 재구성 요청
const completion = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [
    {
      role: 'system',
      content: '자서전 작가로서 이야기를 문학적으로 재구성하세요.'
    },
    {
      role: 'user',
      content: `질문: ${story.question}\n답변: ${story.transcript}\n\n3-5개 문단으로 작성해주세요.`
    }
  ],
  temperature: 0.8,
});

// 3. 결과를 스토리에 저장
story.literaryVersion = completion.choices[0].message.content;
await story.save();
```

**응답:**
```json
{
  "success": true,
  "literaryVersion": "그 시절, 나는 작은 시골 마을의 품에서 자랐다. 할머니의 따뜻한 손길 아래, 매일 아침은 새로운 모험으로 시작되었다...\n\n개울가는 우리들만의 비밀 놀이터였다. 친구들과 함께 물장구를 치며 보낸 그 여름날들은, 지금도 내 마음속에 햇살처럼 따스하게 남아있다..."
}
```

---

### 6단계: 결과 표시 (BookPreview)

**컴포넌트:** `client/src/components/BookPreview.jsx`

**표시 내용:**
1. 스토리 제목
2. 감정 이모지 + 라벨
3. 작성 날짜
4. 요약
5. 문학적 버전 (하이라이트)
6. 키워드 태그
7. 원본 텍스트 (접기/펼치기)

---

## 🔄 전체 코드 흐름 (Interview.jsx)

```javascript
// client/src/pages/Interview.jsx

const handleRecordingComplete = async (audioFile) => {
  setIsProcessing(true);

  try {
    // 1. 음성 → 텍스트
    setProcessingStep('음성을 텍스트로 변환하고 있습니다...');
    const transcriptResult = await transcribeAudio(audioFile);
    const transcript = transcriptResult.transcript;

    // 2. 텍스트 분석
    setProcessingStep('답변을 분석하고 있습니다...');
    const analysisResult = await analyzeTranscript({
      transcript,
      question: currentQuestion,
    });

    // 3. 스토리 저장
    setProcessingStep('이야기를 저장하고 있습니다...');
    const storyData = {
      userId,
      title: analysisResult.keywords?.[0] || '새로운 이야기',
      category: 'childhood',
      question: currentQuestion,
      transcript,
      summary: analysisResult.summary,
      emotion: analysisResult.emotion,
      keywords: analysisResult.keywords,
    };
    const savedResult = await saveStory(storyData);

    // 4. 문학적 버전 생성
    setProcessingStep('문학적으로 재구성하고 있습니다...');
    const literaryResult = await generateLiterary(savedResult.story._id);

    // 5. 최종 결과 표시
    const finalStory = {
      ...savedResult.story,
      literaryVersion: literaryResult.literaryVersion,
    };
    setCurrentStory(finalStory);

  } catch (error) {
    console.error('처리 실패:', error);
    alert('처리 중 오류가 발생했습니다.');
  } finally {
    setIsProcessing(false);
  }
};
```

---

## 📊 데이터 모델

### Story 스키마 (MongoDB)

```javascript
{
  userId: ObjectId,
  title: String,
  category: String, // 'childhood', 'youth', 'marriage', etc.
  question: String, // AI가 물어본 질문
  audioUrl: String, // S3 URL (선택사항)
  transcript: String, // Whisper 변환 결과
  summary: String, // GPT 요약
  emotion: String, // 'happy', 'sad', 'nostalgic', etc.
  keywords: [String],
  literaryVersion: String, // 문학적 버전
  images: [{
    url: String,
    caption: String,
    analysis: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## ⏱️ 예상 처리 시간

| 단계 | 예상 시간 | API 호출 |
|------|----------|---------|
| 음성 녹음 | 사용자 입력 | - |
| Whisper 변환 | 5-10초 | OpenAI Whisper |
| GPT 분석 | 3-5초 | OpenAI GPT-4 |
| 스토리 저장 | 1초 미만 | MongoDB |
| 문학적 변환 | 10-15초 | OpenAI GPT-4 |
| **총 소요 시간** | **약 20-30초** | - |

---

## 💡 최적화 팁

### 1. 병렬 처리
```javascript
// 나쁜 예: 순차 처리
const result1 = await api1();
const result2 = await api2();

// 좋은 예: 병렬 처리
const [result1, result2] = await Promise.all([
  api1(),
  api2()
]);
```

### 2. 캐싱
- AI 질문을 미리 생성하여 캐싱
- 자주 사용되는 응답 캐싱

### 3. 스트리밍
- GPT-4 스트리밍 응답으로 체감 속도 개선
- 사용자에게 실시간 피드백 제공

---

## 🐛 디버깅 가이드

### 로그 확인

**서버 로그:**
```javascript
console.log('Whisper 변환 결과:', transcription.text);
console.log('GPT 분석 결과:', analysis);
console.log('저장된 스토리 ID:', story._id);
```

**클라이언트 로그:**
```javascript
console.log('녹음 완료:', audioFile);
console.log('현재 처리 단계:', processingStep);
console.log('최종 스토리:', currentStory);
```

### 일반적인 오류

1. **Whisper 오류:** 오디오 파일 형식 확인 (webm, mp3, wav 지원)
2. **GPT 오류:** API 키 및 크레딧 확인
3. **MongoDB 오류:** 연결 문자열 및 네트워크 확인

---

## 🎉 완성!

이제 전체 흐름을 이해했습니다. 사용자가 음성으로 이야기하면, AI가 자동으로:
1. 텍스트로 변환 ✅
2. 분석 및 요약 ✅
3. 저장 ✅
4. 문학적으로 재구성 ✅
5. 아름답게 표시 ✅

**다음 단계:** 실제로 테스트해보세요! 🚀


