import { API_BASE_URL } from '../utils/config';
import api from './axios-instance';

export async function fetchAllBrands() {
  const res = await api.get(`${API_BASE_URL}/brands?all=true`);
  return res.data;
}

export async function fetchBrandById(id: string) {
  const res = await api.get(`${API_BASE_URL}/brands/${id}`);
  return res.data;
} 