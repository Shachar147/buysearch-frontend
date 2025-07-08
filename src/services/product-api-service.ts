import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export interface ProductApi {
  id: number;
  title: string;
  url: string;
  images: string[];
  colors: { id: number; name: string }[];
  isSellingFast: boolean;
  price: number | null;
  oldPrice: number | null;
  salePercent: number | null;
  currency: string;
  brand: { id: number; name: string } | null;
  categories: { id: number; name: string }[];
  gender: string;
  source: { id: number; name: string } | null;
}

export interface ProductApiResponse {
  total: number;
  offset: number;
  limit: number;
  hasNextPage: boolean;
  data: ProductApi[];
}

export interface ProductFilters {
  color?: string;
  brand?: string;
  category?: string;
  priceRange?: { from?: number; to?: number; label: string };
  sort?: string;
  search?: string;
  offset?: number;
  limit?: number;
}

export async function fetchProducts(offset = 0, limit = 20, filters: ProductFilters = {}): Promise<ProductApiResponse> {
  const params = new URLSearchParams();
  if (filters.offset !== undefined) params.append('offset', String(filters.offset));
  if (filters.limit !== undefined) params.append('limit', String(filters.limit));
  if (filters.color && filters.color !== 'All') params.append('color', filters.color);
  if (filters.brand && filters.brand !== 'All') params.append('brand', filters.brand);
  if (filters.category && filters.category !== 'All') params.append('category', filters.category);
  if (filters.priceRange && filters.priceRange.label !== 'All') {
    if (filters.priceRange.from !== undefined) params.append('priceFrom', String(filters.priceRange.from));
    if (filters.priceRange.to !== undefined) params.append('priceTo', String(filters.priceRange.to));
  }
  if (filters.sort && filters.sort !== 'Relevance') params.append('sort', filters.sort);
  if (filters.search) params.append('search', filters.search);
  const res = await axios.get<ProductApiResponse>(`${API_BASE}/products?offset=${offset}&limit=${limit}&${params.toString()}`);
  return res.data;
}