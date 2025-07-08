import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export async function fetchAllSources() {
  let allSources = [];
  let offset = 0;
  const limit = 200;
  let hasNextPage = true;
  while (hasNextPage) {
    const res = await axios.get(`${API_BASE}/sources?offset=${offset}&limit=${limit}`);
    const { data, hasNextPage: next, total } = res.data;
    allSources = allSources.concat(data);
    offset += data.length;
    hasNextPage = next && data.length > 0;
  }
  return allSources;
}

export async function fetchSourceById(id: string) {
  const res = await axios.get(`${API_BASE}/sources/${id}`);
  return res.data;
} 