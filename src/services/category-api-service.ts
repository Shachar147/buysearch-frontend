import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export async function fetchAllCategories() {
  let allCategories = [];
  let offset = 0;
  const limit = 200;
  let hasNextPage = true;
  while (hasNextPage) {
    const res = await axios.get(`${API_BASE}/categories?offset=${offset}&limit=${limit}`);
    const { data, hasNextPage: next, total } = res.data;
    allCategories = allCategories.concat(data);
    offset += data.length;
    hasNextPage = next && data.length > 0;
  }
  return allCategories;
}

export async function fetchCategoryById(id: string) {
  const res = await axios.get(`${API_BASE}/categories/${id}`);
  return res.data;
} 