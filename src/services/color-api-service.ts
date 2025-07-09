import { API_BASE_URL } from '../utils/config';
import api from './axios-instance';

export async function fetchAllColors() {
  let allColors = [];
  let offset = 0;
  const limit = 200;
  let hasNextPage = true;
  while (hasNextPage) {
    const res = await api.get(`${API_BASE_URL}/colors?offset=${offset}&limit=${limit}`);
    const { data, hasNextPage: next, total } = res.data;
    allColors = allColors.concat(data);
    offset += data.length;
    hasNextPage = next && data.length > 0;
  }
  return allColors;
}

export async function fetchColorById(id: string) {
  const res = await api.get(`${API_BASE_URL}/colors/${id}`);
  return res.data;
} 