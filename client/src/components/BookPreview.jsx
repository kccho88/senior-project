import React from 'react';
import { BookOpen, Heart, Calendar } from 'lucide-react';

const BookPreview = ({ story }) => {
  if (!story) return null;

  const emotionEmoji = {
    happy: '😊',
    sad: '😢',
    nostalgic: '🥹',
    proud: '😌',
    grateful: '🙏',
    reflective: '🤔',
  };

  const emotionLabel = {
    happy: '행복',
    sad: '슬픔',
    nostalgic: '그리움',
    proud: '자랑스러움',
    grateful: '감사',
    reflective: '회상',
  };

  return (
    <div className="card fade-in">
      <div className="flex items-center gap-3 mb-4">
        <BookOpen className="w-6 h-6 text-primary-600" />
        <h3 className="text-xl font-bold text-primary-800">
          {story.title || '새로운 이야기'}
        </h3>
      </div>

      {/* 감정 및 날짜 */}
      <div className="flex items-center gap-4 mb-4 text-sm text-primary-600">
        {story.emotion && (
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span>
              {emotionEmoji[story.emotion]} {emotionLabel[story.emotion]}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{new Date(story.createdAt).toLocaleDateString('ko-KR')}</span>
        </div>
        {story.images && story.images.length > 0 && (
          <div className="flex items-center gap-2 text-purple-600">
            <span>📸</span>
            <span>사진 포함</span>
          </div>
        )}
      </div>

      {/* 사진 (있는 경우) */}
      {story.images && story.images.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-1 gap-3">
            {story.images.map((image, index) => (
              <div key={index} className="rounded-xl overflow-hidden border-2 border-primary-200">
                <img 
                  src={image.url} 
                  alt={image.caption || '추억의 사진'} 
                  className="w-full h-auto"
                />
                {image.caption && (
                  <div className="bg-primary-50 p-2 text-sm text-primary-700">
                    {image.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 요약 */}
      {story.summary && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-primary-700 mb-2">요약</h4>
          <p className="text-primary-800 leading-relaxed">{story.summary}</p>
        </div>
      )}

      {/* 문학적 버전 */}
      {story.literaryVersion && (
        <div className="bg-primary-50 p-4 rounded-xl border border-primary-200">
          <h4 className="text-sm font-semibold text-primary-700 mb-2 flex items-center gap-2">
            <span>✨</span>
            <span>문학적 버전</span>
          </h4>
          <p className="text-primary-900 leading-loose whitespace-pre-line">
            {story.literaryVersion}
          </p>
        </div>
      )}

      {/* 키워드 */}
      {story.keywords && story.keywords.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {story.keywords.map((keyword, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-primary-200 text-primary-800 rounded-full text-sm font-medium"
            >
              #{keyword}
            </span>
          ))}
        </div>
      )}

      {/* 원본 텍스트 (접기/펼치기) */}
      {story.transcript && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-primary-600 hover:text-primary-800 font-medium">
            원본 텍스트 보기
          </summary>
          <p className="mt-2 text-sm text-primary-700 bg-white p-3 rounded-lg border border-primary-200">
            {story.transcript}
          </p>
        </details>
      )}
    </div>
  );
};

export default BookPreview;


