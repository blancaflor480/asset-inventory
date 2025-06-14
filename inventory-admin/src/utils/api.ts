import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 404) {
      console.error('API endpoint not found:', error.config.url);
    }
    return Promise.reject(error);
  }
);

export default api;