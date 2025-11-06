import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Mic, Image, Volume2, Sparkles, Heart } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Mic,
      title: 'AI 인터뷰',
      description: '음성으로 대화하며 인생 이야기를 기록하세요',
      color: 'from-blue-500 to-blue-600',
      path: '/interview',
    },
    {
      icon: Image,
      title: '사진 앨범',
      description: '사진을 보며 추억을 되살리고 이야기를 나누세요',
      color: 'from-purple-500 to-purple-600',
      path: '/album',
    },
    {
      icon: BookOpen,
      title: '내 자서전',
      description: 'AI가 문학적으로 집필한 당신의 인생 이야기',
      color: 'from-primary-500 to-primary-600',
      path: '/book',
    },
    {
      icon: Volume2,
      title: '오디오북',
      description: '당신의 목소리로 듣는 인생 이야기',
      color: 'from-green-500 to-green-600',
      path: '/audiobook',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-warm-50 to-primary-100">
      {/* 히어로 섹션 */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 fade-in">
          <div className="flex items-center justify-center gap-3 mb-6">
            <BookOpen className="w-16 h-16 text-primary-600" />
            <h1 className="text-5xl md:text-6xl font-bold text-primary-900">
              내 인생을 읽다
            </h1>
          </div>
          
          <p className="text-2xl md:text-3xl text-primary-700 font-medium mb-4">
            AI가 묻고, 당신이 대답하면,
          </p>
          <p className="text-2xl md:text-3xl text-primary-700 font-medium mb-8">
            인생이 책이 됩니다
          </p>

          <div className="flex items-center justify-center gap-2 text-primary-600">
            <Sparkles className="w-5 h-5" />
            <p className="text-lg">
              50~70대를 위한 AI 자서전 & 오디오북 플랫폼
            </p>
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* 주요 기능 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <button
              key={index}
              onClick={() => navigate(feature.path)}
              className="group card hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-left"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-primary-900 mb-2">
                {feature.title}
              </h3>
              
              <p className="text-primary-700 leading-relaxed">
                {feature.description}
              </p>

              <div className="mt-4 text-primary-600 font-medium group-hover:text-primary-800 transition-colors">
                시작하기 →
              </div>
            </button>
          ))}
        </div>

        {/* 작동 방식 */}
        <div className="card max-w-4xl mx-auto mb-16 bg-gradient-to-br from-white to-primary-50">
          <h2 className="text-3xl font-bold text-primary-900 mb-8 text-center">
            어떻게 작동하나요?
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-800 mb-2">
                  AI가 질문을 던집니다
                </h3>
                <p className="text-primary-700">
                  "어린 시절 가장 기억에 남는 순간은 언제인가요?" 같은 따뜻한 질문으로 시작합니다.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-800 mb-2">
                  음성으로 편하게 답변하세요
                </h3>
                <p className="text-primary-700">
                  타이핑 없이 마이크에 대고 이야기만 하면 됩니다. AI가 듣고 기록합니다.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-800 mb-2">
                  AI가 문학적으로 집필합니다
                </h3>
                <p className="text-primary-700">
                  당신의 이야기를 감동적인 문체로 재구성하여 자서전을 만듭니다.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-800 mb-2">
                  오디오북으로 들어보세요
                </h3>
                <p className="text-primary-700">
                  완성된 자서전을 AI 목소리로 들을 수 있습니다. 가족과 함께 공유하세요.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="card max-w-2xl mx-auto text-center bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <Heart className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">
            오늘부터 시작하세요
          </h2>
          <p className="text-xl mb-8 text-white/90">
            당신의 소중한 이야기를 영원히 남기세요
          </p>
          <button
            onClick={() => navigate('/interview')}
            className="bg-white text-primary-800 font-bold py-4 px-8 rounded-xl hover:bg-primary-50 transition-colors text-lg shadow-xl"
          >
            첫 인터뷰 시작하기
          </button>
        </div>

        {/* 푸터 */}
        <div className="text-center mt-16 text-primary-600">
          <p className="text-sm">
            © 2024 내 인생을 읽다. AI 자서전 & 오디오북 플랫폼
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;


