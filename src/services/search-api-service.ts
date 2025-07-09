import { API_BASE_URL } from '../utils/config';

export interface ParsedFilters {
  colors: string[];
  categories: string[];
  brands: string[];
  maxPrice: number | null;
  minPrice: number | null;
  keywords: string[];
  gender: string | null;
}

export async function parseSearchQuery(query: string): Promise<ParsedFilters | null> {
  const res = await fetch(`${API_BASE_URL}/search/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ search: query })
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.filters || null;
} 