import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обработка 401 ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => {
    localStorage.removeItem('accessToken');
    return api.post('/auth/logout');
  },
};
export const tracksAPI = {
  parse: (query) => api.get('/tracks/parse', { params: { query } }),
  // или
  // parse: (query) => api.post('/tracks/parse', { query }),
};

export const playlistsAPI = {
  getAll: () => api.get('/playlists'),
  create: (data) => api.post('/playlists', data),
  delete: (id) => api.delete(`/playlists/${id}`),  // ← Добавлено!
  addTrack: (playlistId, track) => api.post(`/playlists/${playlistId}/tracks`, track),
  removeTrack: (playlistId, trackId) => api.delete(`/playlists/${playlistId}/tracks/${trackId}`),
};

export default api;