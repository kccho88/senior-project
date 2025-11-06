import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 인터셉터
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ========== 사용자 API ==========

export const registerUser = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/users/login', credentials);
  return response.data;
};

export const getUserInfo = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// ========== AI API ==========

export const generateQuestion = async (data) => {
  const response = await api.post('/ai/question', data);
  return response.data;
};

export const transcribeAudio = async (audioFile) => {
  const formData = new FormData();
  formData.append('audio', audioFile);
  
  const response = await api.post('/ai/transcribe', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const analyzeTranscript = async (data) => {
  const response = await api.post('/ai/analyze', data);
  return response.data;
};

export const saveStory = async (storyData) => {
  const response = await api.post('/ai/story', storyData);
  return response.data;
};

export const getUserStories = async (userId) => {
  const response = await api.get(`/ai/stories/${userId}`);
  return response.data;
};

export const generateLiterary = async (storyId) => {
  const response = await api.post('/ai/literary', { storyId });
  return response.data;
};

export const analyzePhoto = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const response = await api.post('/ai/analyze-photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// ========== 오디오북 API ==========

export const generateSpeech = async (data) => {
  const response = await api.post('/audio/generate', data);
  return response.data;
};

export const generateChapterAudio = async (data) => {
  const response = await api.post('/audio/chapter', data);
  return response.data;
};

// ========== 자서전 API ==========

export const getBook = async (userId) => {
  const response = await api.get(`/books/${userId}`);
  return response.data;
};

export const organizeBookChapters = async (bookId, userId) => {
  const response = await api.post(`/books/${bookId}/organize`, { userId });
  return response.data;
};

export const generateChapterContent = async (bookId, chapterIndex) => {
  const response = await api.post(`/books/${bookId}/chapter/${chapterIndex}`);
  return response.data;
};

export const generateCoverImage = async (bookId, prompt) => {
  const response = await api.post(`/books/${bookId}/cover`, { prompt });
  return response.data;
};

export default api;


