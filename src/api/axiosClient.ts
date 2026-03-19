import axios from 'axios';
import type { ApiError } from '../types/document';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.data) {
      const data = error.response.data as ApiError;
      return Promise.reject(new Error(data.error || 'An unexpected error occurred'));
    }
    return Promise.reject(new Error('Network error'));
  },
);

export default axiosClient;
