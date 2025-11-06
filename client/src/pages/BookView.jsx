import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Loader2, Sparkles, Download } from 'lucide-react';
import { getUserStories, getBook, organizeBookChapters } from '../services/api';

const BookView = () => {
  const navigate = useNavigate();
  const [userId] = useState(localStorage.getItem('userId') || 'demo-user');
  const [stories, setStories] = useState([]);
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 스토리 목록 가져오기
      const storiesResult = await getUserStories(userId);
      setStories(storiesResult.stories || []);

      // 자서전 가져오기
      const bookResult = await getBook(userId);
      setBook(bookResult.book);

    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrganizeChapters = async () => {
    if (!book) return;

    setIsLoading(true);
    try {
      const result = await organizeBookChapters(book._id, userId);
      setBook(result.book);
      alert('챕터가 구성되었습니다!');
    } catch (error) {
      console.error('챕터 구성 실패:', error);
      alert('챕터 구성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-primary-800 font-medium">자서전을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
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
            <BookOpen className="w-7 h-7" />
            나의 자서전
          </h1>
          <div className="w-24"></div>
        </div>

        {stories.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen className="w-16 h-16 text-primary-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-primary-800 mb-2">
              아직 이야기가 없습니다
            </h2>
            <p className="text-primary-600 mb-6">
              AI 인터뷰를 시작하여 첫 번째 이야기를 만들어보세요!
            </p>
            <button
              onClick={() => navigate('/interview')}
              className="btn-primary"
            >
              인터뷰 시작하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 왼쪽: 챕터 목록 */}
            <div className="lg:col-span-1">
              <div className="card sticky top-8">
                <h2 className="text-xl font-bold text-primary-800 mb-4">목차</h2>
                
                {book?.chapters && book.chapters.length > 0 ? (
                  <div className="space-y-2">
                    {book.chapters.map((chapter, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedChapter(chapter)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                          selectedChapter === chapter
                            ? 'bg-primary-600 text-white'
                            : 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                        }`}
                      >
                        <div className="font-semibold">
                          {index + 1}. {chapter.title}
                        </div>
                        <div className="text-sm opacity-80">
                          {chapter.storyIds?.length || 0}개의 이야기
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-primary-600 mb-4">
                      아직 챕터가 구성되지 않았습니다
                    </p>
                    <button
                      onClick={handleOrganizeChapters}
                      className="btn-primary flex items-center gap-2 mx-auto"
                    >
                      <Sparkles className="w-4 h-4" />
                      챕터 자동 구성
                    </button>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-primary-200">
                  <div className="text-sm text-primary-600 space-y-1">
                    <p>총 {stories.length}개의 이야기</p>
                    {book?.wordCount && (
                      <p>{book.wordCount.toLocaleString()}자</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 스토리 목록 또는 챕터 내용 */}
            <div className="lg:col-span-2">
              {selectedChapter ? (
                <div className="card">
                  <h2 className="text-2xl font-bold text-primary-900 mb-6">
                    {selectedChapter.title}
                  </h2>
                  {selectedChapter.content ? (
                    <div className="prose prose-lg max-w-none text-primary-900 leading-loose whitespace-pre-line">
                      {selectedChapter.content}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-primary-600 mb-4">
                        이 챕터의 내용이 아직 생성되지 않았습니다
                      </p>
                      <button className="btn-primary">
                        챕터 내용 생성하기
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-primary-800">
                      모든 이야기 ({stories.length})
                    </h2>
                    <button className="btn-secondary text-sm">
                      <Download className="w-4 h-4 inline mr-2" />
                      PDF 다운로드
                    </button>
                  </div>

                  {stories.map((story) => (
                    <div key={story._id} className="card hover:shadow-xl transition-shadow">
                      <h3 className="text-lg font-bold text-primary-800 mb-2">
                        {story.title}
                      </h3>
                      <p className="text-sm text-primary-600 mb-3">
                        {new Date(story.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                      <p className="text-primary-900 leading-relaxed">
                        {story.summary}
                      </p>
                      {story.keywords && story.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {story.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-primary-200 text-primary-800 rounded-full text-xs"
                            >
                              #{keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookView;


