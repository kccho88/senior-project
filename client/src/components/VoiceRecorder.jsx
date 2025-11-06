import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

const VoiceRecorder = ({ onRecordingComplete, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, {
          type: 'audio/webm',
        });
        
        onRecordingComplete(audioFile);
        
        // 스트림 정리
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // 타이머 시작
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('녹음 시작 실패:', error);
      alert('마이크 접근 권한이 필요합니다.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!isRecording ? (
        <button
          onClick={startRecording}
          disabled={disabled}
          className="relative group"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
            <Mic className="w-12 h-12 text-white" />
          </div>
          <div className="absolute inset-0 bg-primary-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity"></div>
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="relative group"
        >
          <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center shadow-xl pulse-ring">
            <Square className="w-10 h-10 text-white fill-white" />
          </div>
          <div className="absolute -inset-2 bg-red-400 rounded-full opacity-30 animate-ping"></div>
        </button>
      )}

      <div className="text-center">
        {isRecording ? (
          <div className="space-y-2">
            <p className="text-2xl font-bold text-red-600 animate-pulse">
              {formatTime(recordingTime)}
            </p>
            <p className="text-sm text-primary-600">녹음 중...</p>
          </div>
        ) : (
          <p className="text-primary-700 font-medium">
            마이크 버튼을 눌러 이야기를 시작하세요
          </p>
        )}
      </div>

      {isRecording && (
        <div className="flex gap-2 mt-2">
          <div className="w-2 h-8 bg-red-500 rounded animate-pulse"></div>
          <div className="w-2 h-8 bg-red-500 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-8 bg-red-500 rounded animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;


