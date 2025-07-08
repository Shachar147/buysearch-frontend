import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export async function fetchAllBrands() {
  let allBrands = [];
  let offset = 0;
  const limit = 200;
  let hasNextPage = true;
  while (hasNextPage) {
    const res = await axios.get(`${API_BASE}/brands?offset=${offset}&limit=${limit}`);
    const { data, hasNextPage: next, total } = res.data;
    allBrands = allBrands.concat(data);
    offset += data.length;
    hasNextPage = next && data.length > 0;
  }
  return allBrands;
}

export async function fetchBrandById(id: string) {
  const res = await axios.get(`${API_BASE}/brands/${id}`);
  return res.data;
} 