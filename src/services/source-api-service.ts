import { API_BASE_URL } from '../utils/config';
import api from './axios-instance';

export async function fetchAllSources() {
  let allSources = [];
  let offset = 0;
  const limit = 200;
  let hasNextPage = true;
  while (hasNextPage) {
    const res = await api.get(`${API_BASE_URL}/sources?offset=${offset}&limit=${limit}`);
    const { data, hasNextPage: next, total } = res.data;
    allSources = allSources.concat(data);
    offset += data.length;
    hasNextPage = next && data.length > 0;
  }
  return allSources;
}

export async function fetchSourceById(id: string) {
  const res = await api.get(`${API_BASE_URL}/sources/${id}`);
  return res.data;
} 