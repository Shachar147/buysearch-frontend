import axios from 'axios';
import Cookies from 'js-cookie';
import type { InternalAxiosRequestConfig } from 'axios';

const api = axios.create();

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get('token');
  if (token && config.headers) {
    (config.headers as any)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api; 