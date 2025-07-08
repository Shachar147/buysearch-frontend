import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export async function fetchAllColors() {
  let allColors = [];
  let offset = 0;
  const limit = 200;
  let hasNextPage = true;
  while (hasNextPage) {
    const res = await axios.get(`${API_BASE}/colors?offset=${offset}&limit=${limit}`);
    const { data, hasNextPage: next, total } = res.data;
    allColors = allColors.concat(data);
    offset += data.length;
    hasNextPage = next && data.length > 0;
  }
  return allColors;
}

export async function fetchColorById(id: string) {
  const res = await axios.get(`${API_BASE}/colors/${id}`);
  return res.data;
} 