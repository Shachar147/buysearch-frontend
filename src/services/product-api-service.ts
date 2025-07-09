import { API_BASE_URL } from '../utils/config';
import api from './axios-instance';

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
  createdAt?: string | Date;
  updatedAt?: string | Date;
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
  priceFrom?: number;
  priceTo?: number;
  gender?: string;
}

export async function fetchProducts(offset = 0, limit = 20, filters: ProductFilters = {}): Promise<ProductApiResponse> {
  const params = new URLSearchParams();
  if (filters.color && filters.color !== 'All') params.append('color', filters.color);
  if (filters.brand && filters.brand !== 'All') params.append('brand', filters.brand);
  if (filters.category && filters.category !== 'All') params.append('category', filters.category);
  if (filters.priceFrom !== undefined) params.append('priceFrom', String(filters.priceFrom));
  if (filters.priceTo !== undefined) params.append('priceTo', String(filters.priceTo));

  if (params.size == 0 && filters.search) params.append('search', filters.search);

  if (filters.gender) params.append('gender', filters.gender);
  else params.append('gender', 'men'); // todo: add to a const of defaults
  if (filters.sort && filters.sort !== 'Relevance') params.append('sort', filters.sort);
  if (filters.offset !== undefined) params.append('offset', String(filters.offset));
  if (filters.limit !== undefined) params.append('limit', String(filters.limit));
  const res = await api.get<ProductApiResponse>(`${API_BASE_URL}/products?offset=${offset}&limit=${limit}&${params.toString()}`);
  return res.data;
}