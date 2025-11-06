import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import AIQuestionBox from '../components/AIQuestionBox';
import VoiceRecorder from '../components/VoiceRecorder';
import BookPreview from '../components/BookPreview';
import {
  generateQuestion,
  transcribeAudio,
  analyzeTranscript,
  saveStory,
  generateLiterary,
} from '../services/api';

const Interview = () => {
  const navigate = useNavigate();
  const [userId] = useState(localStorage.getItem('userId') || 'demo-user');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStory, setCurrentStory] = useState(null);
  const [processingStep, setProcessingStep] = useState('');
  const [savedStory, setSavedStory] = useState(null);

  useEffect(() => {
    loadQuestion();
  }, []);

  const loadQuestion = async () => {
    setIsLoadingQuestion(true);
    try {
      const result = await generateQuestion({
        userId,
        category: 'childhood',
      });
      setCurrentQuestion(result.question);
    } catch (error) {
      console.error('질문 생성 실패:', error);
      setCurrentQuestion('어린 시절 가장 기억에 남는 순간은 언제인가요?');
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleRecordingComplete = async (audioFile) => {
    setIsProcessing(true);
    setProcessingStep('음성을 텍스트로 변환하고 있습니다...');

    try {
      // 1. 음성 → 텍스트 (Whisper)
      const transcriptResult = await transcribeAudio(audioFile);
      const transcript = transcriptResult.transcript;

      setProcessingStep('답변을 분석하고 있습니다...');

      // 2. 텍스트 분석 (GPT)
      const analysisResult = await analyzeTranscript({
        transcript,
        question: currentQuestion,
      });

      setProcessingStep('이야기를 저장하고 있습니다...');

      // 3. 스토리 저장
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
      const storyId = savedResult.story._id;

      setProcessingStep('문학적으로 재구성하고 있습니다...');

      // 4. 문학적 버전 생성
      const literaryResult = await generateLiterary(storyId);

      // 최종 스토리
      const finalStory = {
        ...savedResult.story,
        literaryVersion: literaryResult.literaryVersion,
      };

      setCurrentStory(finalStory);
      setSavedStory(finalStory);

    } catch (error) {
      console.error('처리 실패:', error);
      alert('처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleNextQuestion = () => {
    setCurrentStory(null);
    setSavedStory(null);
    loadQuestion();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-primary-700 hover:text-primary-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">돌아가기</span>
          </button>
          <h1 className="text-2xl font-bold text-primary-900">AI 인터뷰</h1>
          <div className="w-24"></div>
        </div>

        {/* AI 질문 */}
        <div className="mb-8">
          <AIQuestionBox question={currentQuestion} isLoading={isLoadingQuestion} />
        </div>

        {/* 음성 녹음 */}
        {!currentStory && !isProcessing && (
          <div className="card mb-8">
            <VoiceRecorder
              onRecordingComplete={handleRecordingComplete}
              disabled={isProcessing}
            />
          </div>
        )}

        {/* 처리 중 */}
        {isProcessing && (
          <div className="card mb-8 text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-lg text-primary-800 font-medium">{processingStep}</p>
            <p className="text-sm text-primary-600 mt-2">
              AI가 당신의 이야기를 소중하게 다듬고 있습니다...
            </p>
          </div>
        )}

        {/* 결과 미리보기 */}
        {currentStory && (
          <div className="space-y-6">
            <div className="card bg-green-50 border-green-300">
              <div className="flex items-center gap-3 text-green-800">
                <CheckCircle className="w-6 h-6" />
                <p className="font-semibold">이야기가 성공적으로 저장되었습니다!</p>
              </div>
            </div>

            <BookPreview story={currentStory} />

            <div className="flex gap-4">
              <button
                onClick={handleNextQuestion}
                className="btn-primary flex-1"
              >
                다음 질문으로
              </button>
              <button
                onClick={() => navigate('/book')}
                className="btn-secondary flex-1"
              >
                내 자서전 보기
              </button>
            </div>
          </div>
        )}

        {/* 안내 문구 */}
        {!currentStory && !isProcessing && (
          <div className="text-center text-primary-600 space-y-2">
            <p className="text-lg font-medium">
              💡 편안하게 이야기해주세요
            </p>
            <p className="text-sm">
              AI가 당신의 목소리를 듣고, 소중한 기억을 책으로 만들어드립니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Interview;


