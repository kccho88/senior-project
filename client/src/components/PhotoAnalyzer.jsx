import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { analyzePhoto } from '../services/api';

const PhotoAnalyzer = ({ onAnalysisComplete }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzePhoto(selectedImage);
      setAnalysis(result.analysis);
      
      if (onAnalysisComplete) {
        onAnalysisComplete({
          imageUrl: result.imageUrl,
          analysis: result.analysis,
        });
      }
    } catch (error) {
      console.error('사진 분석 실패:', error);
      alert('사진 분석에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setPreview(null);
    setAnalysis(null);
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-primary-800 mb-4 flex items-center gap-2">
        <ImageIcon className="w-6 h-6" />
        사진으로 기억 되살리기
      </h3>

      {!preview ? (
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-primary-300 rounded-xl p-8 hover:border-primary-500 transition-colors bg-primary-50 hover:bg-primary-100">
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-12 h-12 text-primary-600" />
              <p className="text-primary-700 font-medium">사진을 업로드하세요</p>
              <p className="text-sm text-primary-600">
                AI가 사진을 분석하고 질문을 만들어드립니다
              </p>
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-xl"
            />
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-red-50 transition-colors"
            >
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>

          {!analysis && (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI가 사진을 분석하고 있습니다...
                </>
              ) : (
                '사진 분석하기'
              )}
            </button>
          )}

          {analysis && (
            <div className="bg-primary-50 p-4 rounded-xl space-y-3 fade-in">
              <div>
                <h4 className="text-sm font-semibold text-primary-700 mb-1">시대</h4>
                <p className="text-primary-900">{analysis.era}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-primary-700 mb-1">장소</h4>
                <p className="text-primary-900">{analysis.location}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-primary-700 mb-1">상황</h4>
                <p className="text-primary-900">{analysis.situation}</p>
              </div>
              <div className="pt-3 border-t border-primary-200">
                <h4 className="text-sm font-semibold text-primary-700 mb-2">AI의 질문</h4>
                <p className="text-lg text-primary-900 font-medium">
                  {analysis.question}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoAnalyzer;


