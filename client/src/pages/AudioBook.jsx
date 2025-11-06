import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Volume2, Loader2, Sparkles } from 'lucide-react';
import { generateSpeech } from '../services/api';

const AudioBook = () => {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState('nova');

  const sampleText = `
    어린 시절, 나는 작은 시골 마을에서 자랐다. 
    아침마다 할머니가 끓여주시던 된장찌개 냄새에 잠에서 깨어났고,
    학교 가는 길에는 친구들과 함께 개울가를 따라 걸었다.
    그 시절의 기억들은 지금도 내 마음속에 따뜻하게 남아있다.
  `;

  const voices = [
    { id: 'nova', name: '노바 (여성, 따뜻함)', description: '부드럽고 따뜻한 여성 목소리' },
    { id: 'alloy', name: '알로이 (중성)', description: '중성적이고 안정적인 목소리' },
    { id: 'echo', name: '에코 (남성)', description: '차분한 남성 목소리' },
    { id: 'shimmer', name: '시머 (여성, 밝음)', description: '밝고 경쾌한 여성 목소리' },
  ];

  const handleGenerateAudio = async () => {
    setIsGenerating(true);
    try {
      const result = await generateSpeech({
        text: sampleText,
        voice: selectedVoice,
      });
      setAudioUrl(result.audioUrl);
    } catch (error) {
      console.error('오디오 생성 실패:', error);
      alert('오디오 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
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
            <Volume2 className="w-7 h-7" />
            오디오북
          </h1>
          <div className="w-24"></div>
        </div>

        {/* 설명 */}
        <div className="card mb-8 bg-gradient-to-br from-warm-50 to-primary-100 border-2 border-warm-300">
          <h2 className="text-xl font-bold text-primary-900 mb-2 flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            당신의 목소리로 듣는 인생 이야기
          </h2>
          <p className="text-primary-700 leading-relaxed">
            AI가 당신의 자서전을 감정을 담아 읽어드립니다. 
            원하는 목소리를 선택하고, 편안하게 들어보세요.
          </p>
        </div>

        {/* 목소리 선택 */}
        <div className="card mb-8">
          <h3 className="text-lg font-bold text-primary-800 mb-4">목소리 선택</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {voices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setSelectedVoice(voice.id)}
                className={`p-4 rounded-xl text-left transition-all ${
                  selectedVoice === voice.id
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                }`}
              >
                <div className="font-semibold mb-1">{voice.name}</div>
                <div className={`text-sm ${selectedVoice === voice.id ? 'text-white/80' : 'text-primary-600'}`}>
                  {voice.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 샘플 텍스트 */}
        <div className="card mb-8">
          <h3 className="text-lg font-bold text-primary-800 mb-4">미리보기 텍스트</h3>
          <div className="bg-primary-50 p-4 rounded-xl border border-primary-200">
            <p className="text-primary-900 leading-loose whitespace-pre-line">
              {sampleText}
            </p>
          </div>
        </div>

        {/* 오디오 생성 버튼 */}
        {!audioUrl && (
          <div className="card text-center">
            <button
              onClick={handleGenerateAudio}
              disabled={isGenerating}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  오디오 생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  오디오북 생성하기
                </>
              )}
            </button>
            <p className="text-sm text-primary-600 mt-3">
              선택한 목소리로 샘플 오디오를 생성합니다
            </p>
          </div>
        )}

        {/* 오디오 플레이어 */}
        {audioUrl && (
          <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white fade-in">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">나의 인생 이야기</h3>
              <p className="text-white/80">AI 오디오북</p>
            </div>

            <div className="flex items-center justify-center gap-6 mb-6">
              <button
                onClick={togglePlayPause}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10 text-primary-600 fill-primary-600" />
                ) : (
                  <Play className="w-10 h-10 text-primary-600 fill-primary-600 ml-1" />
                )}
              </button>
            </div>

            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="w-full"
              controls
            />

            <div className="mt-6 pt-6 border-t border-white/20">
              <button
                onClick={() => {
                  setAudioUrl(null);
                  setIsPlaying(false);
                }}
                className="btn-secondary w-full"
              >
                다른 목소리로 다시 생성
              </button>
            </div>
          </div>
        )}

        {/* 안내 */}
        <div className="card bg-primary-50 mt-8">
          <h3 className="font-bold text-primary-800 mb-3">💡 오디오북 기능</h3>
          <ul className="space-y-2 text-primary-700">
            <li>• 다양한 AI 목소리 중 선택 가능</li>
            <li>• 감정과 톤을 자동으로 조절</li>
            <li>• 챕터별로 나누어 들을 수 있음</li>
            <li>• MP3 파일로 다운로드 가능</li>
            <li>• 가족과 공유하기 쉬움</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AudioBook;


