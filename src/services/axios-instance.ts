import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  withCredentials: true
});

// Add a request interceptor
// Note: We're using HTTP-only cookies, so we don't need to manually add Authorization header
// The server will automatically include the cookie with requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  return config;
});

export default api; 