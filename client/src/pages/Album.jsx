import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';
import PhotoAnalyzer from '../components/PhotoAnalyzer';
import AIQuestionBox from '../components/AIQuestionBox';
import VoiceRecorder from '../components/VoiceRecorder';
import BookPreview from '../components/BookPreview';
import {
  transcribeAudio,
  analyzeTranscript,
  saveStory,
  generateLiterary,
} from '../services/api';

const Album = () => {
  const navigate = useNavigate();
  const [userId] = useState(localStorage.getItem('userId') || 'demo-user');
  const [photoAnalysis, setPhotoAnalysis] = useState(null);
  const [showRecorder, setShowRecorder] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [currentStory, setCurrentStory] = useState(null);

  const handleAnalysisComplete = (result) => {
    setPhotoAnalysis(result);
    setShowRecorder(true);
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
        question: photoAnalysis.analysis.question,
      });

      setProcessingStep('사진과 함께 이야기를 저장하고 있습니다...');

      // 3. 스토리 저장 (사진 정보 포함)
      const storyData = {
        userId,
        title: analysisResult.keywords?.[0] || '사진 속 추억',
        category: 'other',
        question: photoAnalysis.analysis.question,
        transcript,
        summary: analysisResult.summary,
        emotion: analysisResult.emotion,
        keywords: analysisResult.keywords,
        images: [{
          url: photoAnalysis.imageUrl,
          caption: photoAnalysis.analysis.situation,
          analysis: JSON.stringify(photoAnalysis.analysis),
        }],
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
      setShowRecorder(false);

    } catch (error) {
      console.error('처리 실패:', error);
      alert('처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleNewPhoto = () => {
    setPhotoAnalysis(null);
    setShowRecorder(false);
    setCurrentStory(null);
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
          <h1 className="text-2xl font-bold text-primary-900 flex items-center gap-2">
            <ImageIcon className="w-7 h-7" />
            사진 앨범
          </h1>
          <div className="w-24"></div>
        </div>

        {/* 설명 */}
        <div className="card mb-8 bg-gradient-to-br from-warm-50 to-primary-100 border-2 border-warm-300">
          <h2 className="text-xl font-bold text-primary-900 mb-2">
            📸 사진으로 기억을 되살려보세요
          </h2>
          <p className="text-primary-700 leading-relaxed">
            오래된 사진을 업로드하면, AI가 사진 속 시대와 상황을 분석하고
            당신에게 질문을 던집니다. 사진을 보며 떠오르는 기억을 이야기해주세요.
          </p>
        </div>

        {/* 사진 분석기 */}
        <div className="mb-8">
          <PhotoAnalyzer onAnalysisComplete={handleAnalysisComplete} />
        </div>

        {/* AI 질문 (사진 분석 후) */}
        {photoAnalysis && (
          <div className="mb-8 fade-in">
            <AIQuestionBox question={photoAnalysis.analysis.question} />
          </div>
        )}

        {/* 음성 녹음 (질문 후) */}
        {showRecorder && !isProcessing && !currentStory && (
          <div className="card fade-in">
            <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
          </div>
        )}

        {/* 처리 중 */}
        {isProcessing && (
          <div className="card mb-8 text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-lg text-primary-800 font-medium">{processingStep}</p>
            <p className="text-sm text-primary-600 mt-2">
              AI가 사진과 함께 당신의 이야기를 소중하게 다듬고 있습니다...
            </p>
          </div>
        )}

        {/* 결과 미리보기 */}
        {currentStory && (
          <div className="space-y-6">
            <div className="card bg-green-50 border-green-300">
              <div className="flex items-center gap-3 text-green-800">
                <CheckCircle className="w-6 h-6" />
                <p className="font-semibold">사진과 함께 이야기가 성공적으로 저장되었습니다!</p>
              </div>
            </div>

            {/* 사진 표시 */}
            {photoAnalysis && (
              <div className="card">
                <h3 className="text-lg font-bold text-primary-800 mb-3">📸 추억의 사진</h3>
                <img 
                  src={photoAnalysis.imageUrl} 
                  alt="추억의 사진" 
                  className="w-full rounded-xl mb-3"
                />
                <div className="bg-primary-50 p-3 rounded-lg text-sm text-primary-700">
                  <p><strong>시대:</strong> {photoAnalysis.analysis.era}</p>
                  <p><strong>장소:</strong> {photoAnalysis.analysis.location}</p>
                  <p><strong>상황:</strong> {photoAnalysis.analysis.situation}</p>
                </div>
              </div>
            )}

            <BookPreview story={currentStory} />

            <div className="flex gap-4">
              <button
                onClick={handleNewPhoto}
                className="btn-primary flex-1"
              >
                다른 사진 업로드
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

        {/* 예시 가이드 */}
        {!photoAnalysis && !currentStory && (
          <div className="card bg-primary-50">
            <h3 className="font-bold text-primary-800 mb-3">💡 이런 사진들이 좋아요</h3>
            <ul className="space-y-2 text-primary-700">
              <li>• 어린 시절 가족 사진</li>
              <li>• 학창 시절 졸업 사진</li>
              <li>• 결혼식 사진</li>
              <li>• 옛날 동네나 집 사진</li>
              <li>• 친구들과의 추억이 담긴 사진</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Album;


