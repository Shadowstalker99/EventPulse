import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

api.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    } catch (e) {
      // Fallback to local token if Firebase token fetch fails
    }
  }

  const localToken = localStorage.getItem('eventpulse_token');
  if (localToken) {
    config.headers.Authorization = `Bearer ${localToken}`;
  }

  return config;
});

export default api;
