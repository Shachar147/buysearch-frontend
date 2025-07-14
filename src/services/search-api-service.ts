import api from './axios-instance';
import { API_BASE_URL } from '../utils/config';

export interface ParsedFilters {
  colors: string[];
  categories: string[];
  brands: string[];
  maxPrice: number | null;
  minPrice: number | null;
  keywords: string[];
  gender: string | null;
  isOnSale?: boolean | null;
  sources?: string[];
}

export async function parseSearchQuery(query: string): Promise<ParsedFilters | null> {
  try {
    const res = await api.post(`${API_BASE_URL}/search/parse`, { search: query });
    return res.data.filters || null;
  } catch {
    return null;
  }
} 