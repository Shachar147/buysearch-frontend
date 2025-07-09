import { API_BASE_URL } from '../utils/config';
import api from './axios-instance';

export async function fetchAllBrands() {
  let allBrands = [];
  let offset = 0;
  const limit = 200;
  let hasNextPage = true;
  while (hasNextPage) {
    const res = await api.get(`${API_BASE_URL}/brands?offset=${offset}&limit=${limit}`);
    const { data, hasNextPage: next, total } = res.data;
    allBrands = allBrands.concat(data);
    offset += data.length;
    hasNextPage = next && data.length > 0;
  }
  return allBrands;
}

export async function fetchBrandById(id: string) {
  const res = await api.get(`${API_BASE_URL}/brands/${id}`);
  return res.data;
} 