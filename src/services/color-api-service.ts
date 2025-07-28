import { API_BASE_URL } from '../utils/config';
import api from './axios-instance';

export async function fetchAllColors() {
  const res = await api.get(`${API_BASE_URL}/colors?all=true`);
  return res.data;
}

export async function fetchColorById(id: string) {
  const res = await api.get(`${API_BASE_URL}/colors/${id}`);
  return res.data;
} 