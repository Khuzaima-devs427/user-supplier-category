import axios from 'axios';
import { API_BASE_URL } from './constants';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Updated to accept config parameter
export const clientService = {
  get: <T>(endpoint: string, config?: any) => client.get<T>(endpoint, config),
  post: <T>(endpoint: string, data?: any, config?: any) => client.post<T>(endpoint, data, config), 
  put: <T>(endpoint: string, data?: any, config?: any) => client.put<T>(endpoint, data, config), 
  patch: <T>(endpoint: string, data?: any, config?: any) => client.patch<T>(endpoint, data, config),
  delete: <T>(endpoint: string, config?: any) => client.delete<T>(endpoint, config), 
};

export default client;