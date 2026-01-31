import axios from 'axios';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://book-production-2ebd.up.railway.app/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Get device ID
export const getDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'web-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  login: (username, password) => 
    api.post('/auth/login', { username, password }),
  logout: () => 
    api.post('/auth/logout'),
  verify: () => 
    api.get('/auth/verify'),
  getMe: () => 
    api.get('/auth/me'),
  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
};

// ============================================
// BOOKS API
// ============================================
export const booksAPI = {
  getAll: () => api.get('/books'),
  getById: (id) => api.get(`/books/${id}`),
  create: (bookData) => api.post('/books', bookData),
  update: (id, bookData) => api.put(`/books/${id}`, bookData),
  delete: (id) => api.delete(`/books/${id}`),
  getByCategory: (category) => api.get(`/books/category/${category}`),
};

// ============================================
// CHAPTERS API
// ============================================
export const chaptersAPI = {
  getByBookId: (bookId) => api.get(`/chapters/book/${bookId}`),
  getById: (id) => api.get(`/chapters/${id}`),
  create: (chapterData) => api.post('/chapters', chapterData),
  update: (id, chapterData) => api.put(`/chapters/${id}`, chapterData),
  delete: (id) => api.delete(`/chapters/${id}`),
};

// ============================================
// UPLOAD API
// ============================================
export const uploadAPI = {
  uploadBookPDF: (formData) => 
    api.post('/upload/pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadChapterPDF: (formData) =>
    api.post('/upload/chapter-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getBookPDFUrl: (bookId) => 
    `${API_BASE_URL}/upload/pdf/${bookId}`,
  getChapterPDFUrl: (chapterId) =>
    `${API_BASE_URL}/upload/chapter-pdf/${chapterId}`,
  deleteBookPDF: (bookId) => 
    api.delete(`/upload/pdf/${bookId}`),
  deleteChapterPDF: (chapterId) =>
    api.delete(`/upload/chapter-pdf/${chapterId}`),
};

// ============================================
// FAVORITES API
// ============================================
export const favoritesAPI = {
  getAll: (deviceId) => api.get(`/favorites/${deviceId}`),
  checkFavorite: (deviceId, bookId) => api.get(`/favorites/${deviceId}/${bookId}`),
  add: (deviceId, bookId) => api.post('/favorites', { deviceId, bookId }),
  remove: (deviceId, bookId) => api.delete(`/favorites/${deviceId}/${bookId}`),
  removeById: (id) => api.delete(`/favorites/${id}`),
};

// ============================================
// PROGRESS API
// ============================================
export const progressAPI = {
  getAll: (deviceId) => api.get(`/progress/${deviceId}`),
  getByBook: (deviceId, bookId) => api.get(`/progress/${deviceId}/${bookId}`),
  createOrUpdate: (progressData) => api.post('/progress', progressData),
  update: (id, progressData) => api.put(`/progress/${id}`, progressData),
  delete: (id) => api.delete(`/progress/${id}`),
};

// ============================================
// UTILITY API
// ============================================
export const utilityAPI = {
  getCategories: () => api.get('/categories'),
  search: (query) => api.get('/search', { params: { q: query } }),
};

export default api;
