import axios from 'axios';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://server-ue4m.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});