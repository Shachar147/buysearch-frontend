import { API_BASE_URL } from '../utils/config';
import api from './axios-instance';

export async function fetchAllCategories(gender: string) {
  let allCategories = [];
  let offset = 0;
  const limit = 200;
  let hasNextPage = true;
  while (hasNextPage) {
    const genderParam = `&gender=${encodeURIComponent(gender)}`;
    const res = await api.get(`${API_BASE_URL}/categories?offset=${offset}&limit=${limit}${genderParam}`);
    const { data, hasNextPage: next, total } = res.data;
    allCategories = allCategories.concat(data);
    offset += data.length;
    hasNextPage = next && data.length > 0;
  }
  return allCategories;
}

export async function fetchCategoryById(id: string) {
  const res = await api.get(`${API_BASE_URL}/categories/${id}`);
  return res.data;
} 