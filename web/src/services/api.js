import axios from 'axios';

// API Base URL - SESUAIKAN DENGAN SETUP ANDA
const API_BASE_URL = 'http://localhost:3000/api';

// Untuk production:
// const API_BASE_URL = 'https://your-api.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get device/browser ID
export const getDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'web-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

// Books API
export const booksAPI = {
  getAll: () => api.get('/books'),
  getById: (id) => api.get(`/books/${id}`),
  create: (bookData) => api.post('/books', bookData),
  update: (id, bookData) => api.put(`/books/${id}`, bookData),
  delete: (id) => api.delete(`/books/${id}`),
  getByCategory: (category) => api.get(`/books/category/${category}`),
};

// Chapters API
export const chaptersAPI = {
  getByBookId: (bookId) => api.get(`/chapters/book/${bookId}`),
  getById: (id) => api.get(`/chapters/${id}`),
  create: (chapterData) => api.post('/chapters', chapterData),
  update: (id, chapterData) => api.put(`/chapters/${id}`, chapterData),
  delete: (id) => api.delete(`/chapters/${id}`),
};

// Favorites API
export const favoritesAPI = {
  getAll: (deviceId) => api.get(`/favorites/${deviceId}`),
  checkFavorite: (deviceId, bookId) => api.get(`/favorites/${deviceId}/${bookId}`),
  add: (deviceId, bookId) => api.post('/favorites', { deviceId, bookId }),
  remove: (deviceId, bookId) => api.delete(`/favorites/${deviceId}/${bookId}`),
  removeById: (id) => api.delete(`/favorites/${id}`),
};

// Progress API
export const progressAPI = {
  getAll: (deviceId) => api.get(`/progress/${deviceId}`),
  getByBook: (deviceId, bookId) => api.get(`/progress/${deviceId}/${bookId}`),
  createOrUpdate: (progressData) => api.post('/progress', progressData),
  update: (id, progressData) => api.put(`/progress/${id}`, progressData),
  delete: (id) => api.delete(`/progress/${id}`),
};

// Utility API
export const utilityAPI = {
  getCategories: () => api.get('/categories'),
  search: (query) => api.get('/search', { params: { q: query } }),
};

export default api;
