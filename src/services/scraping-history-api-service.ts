import { API_BASE_URL } from '../utils/config';
import api from './axios-instance';

export async function getScrapingHistorySummary() {
  const res = await api.get(`${API_BASE_URL}/scraping-history/summary`);
   //   const res = await axios.get('/api/scraping-history/summary');
  return res.data;
} 