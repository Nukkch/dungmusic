import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (username, password) => {
    const payload = typeof username === 'object' ? username : { username, password };
    return api.post('/auth/register', payload);
  },
  login: (username, password) => {
    const payload = typeof username === 'object' ? username : { username, password };
    return api.post('/auth/login', payload);
  },
  logout: () => api.post('/auth/logout'),
};

export const tracksAPI = {
  parse: (query) => api.post('/tracks/parse', { query }),
};

export const playlistsAPI = {
  getAll: () => api.get('/playlists'),
  create: (payload) => api.post('/playlists', payload),
  delete: (playlistId) => api.delete(`/playlists/${playlistId}`),
  addTrack: (playlistId, track) => api.post(`/playlists/${playlistId}/tracks`, track),
  removeTrack: (playlistId, trackId) => api.delete(`/playlists/${playlistId}/tracks/${trackId}`),
};

export default api;