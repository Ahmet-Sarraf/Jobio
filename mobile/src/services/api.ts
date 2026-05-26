import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/useAuthStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.252.214.165:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token if it exists
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired, trigger logout in Zustand store
      await useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
