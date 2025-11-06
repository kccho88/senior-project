import React from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';

const AIQuestionBox = ({ question, isLoading = false }) => {
  return (
    <div className="card bg-gradient-to-br from-primary-100 to-white border-2 border-primary-300 fade-in">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-primary-800">AI 인터뷰어</h3>
            <Sparkles className="w-4 h-4 text-primary-600" />
          </div>
          
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-primary-200 rounded animate-pulse"></div>
              <div className="h-4 bg-primary-200 rounded animate-pulse w-3/4"></div>
            </div>
          ) : (
            <p className="text-xl text-primary-900 leading-relaxed">
              {question || '질문을 생성하고 있습니다...'}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-primary-200">
        <p className="text-sm text-primary-600 italic">
          💡 편안하게 답변해주세요. 당신의 이야기가 소중한 책이 됩니다.
        </p>
      </div>
    </div>
  );
};

export default AIQuestionBox;


