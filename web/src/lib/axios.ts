import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

// Assuming your NestJS backend runs on 3000 and Web on 3001,
// or just configure it via environment variables. For now we use the local backend URL.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // We access Zustand state directly outside of React components by calling getState()
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If the token is expired or unauthorized, we can automatically log the user out
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      
      // We can also redirect to login page (if running on client-side)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
