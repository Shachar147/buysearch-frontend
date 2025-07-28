import { API_BASE_URL } from '../utils/config';
import api from './axios-instance';

export async function fetchAllSources() {
  const res = await api.get(`${API_BASE_URL}/sources?all=true`);
  return res.data;
}

export async function fetchSourceById(id: string) {
  const res = await api.get(`${API_BASE_URL}/sources/${id}`);
  return res.data;
} 