import { API_BASE_URL } from '../utils/config';
import { DEFAULT_GENDER, DEFAULT_SORT_BY } from '../utils/consts';
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
  isFavourite?: boolean;
  withPriceChange?: boolean;
  source?: string[];
  isOnSale?: boolean;
}

export async function fetchProducts(offset = 0, limit = 20, filters: ProductFilters = {}): Promise<ProductApiResponse> {
  const params = new URLSearchParams();
  if (filters.color && filters.color !== 'All') params.append('color', filters.color);
  if (filters.brand && filters.brand !== 'All') params.append('brand', filters.brand);
  if (filters.category && filters.category !== 'All') params.append('category', filters.category);
  if (filters.priceFrom !== undefined) params.append('priceFrom', String(filters.priceFrom));
  else if (filters.priceRange?.from !== undefined) params.append('priceFrom', String(filters.priceRange.from));
  if (filters.priceTo !== undefined) params.append('priceTo', String(filters.priceTo));
  else if (filters.priceRange?.to !== undefined) params.append('priceTo', String(filters.priceRange.to));

  if (filters.source) {
    if (Array.isArray(filters.source)) {
      const filtered = filters.source.filter(s => s !== 'All');
      if (filtered.length > 0) params.append('source', filtered.join(','));
    } else if (filters.source !== 'All') {
      params.append('source', String(filters.source));
    }
  }
  if (filters.isOnSale !== undefined) params.append('isOnSale', String(filters.isOnSale));

  // if (filters.search && !(
  //   filters.brand != 'All' || filters.category != 'All' || filters.priceFrom || filters.priceRange?.from || filters.priceTo || filters.priceRange?.to
  // )) {
  //   params.append('search', filters.search);
  // }
  // console.log('filters.search', filters);
  if (filters.search) {
    params.append('search', filters.search);
  }
  // if (filters.search && (
  //   filters.brand == 'All' && filters.category == 'All' && filters.color == 'All' && !filters.priceFrom && !filters.priceRange?.from && !filters.priceTo && !filters.priceRange?.to
  // )){
  //   params.append('search', filters.search);
  // } 

  params.append('gender', filters.gender || DEFAULT_GENDER);
  if (filters.sort && filters.sort !== DEFAULT_SORT_BY) params.append('sort', filters.sort);
  if (filters.offset !== undefined) params.append('offset', String(filters.offset));
  if (filters.limit !== undefined) params.append('limit', String(filters.limit));
  if (filters.isFavourite) params.append('isFavourite', 'true');
  if (filters.withPriceChange) params.append('withPriceChange', 'true');

  const res = await api.get<ProductApiResponse>(`${API_BASE_URL}/products?offset=${offset}&limit=${limit}&${params.toString()}`);
  return res.data;
}

export async function fetchProductsByIds(ids: number[]): Promise<ProductApi[]> {
  if (!ids || ids.length === 0) return [];
  const params = ids.join(',');
  const res = await api.get<{ data: ProductApi[] }>(`${API_BASE_URL}/products/by-ids?ids=${params}`);
  return res.data.data;
}

export async function fetchPriceHistory(productId: number, limit = 5) {
  const res = await api.get(`${API_BASE_URL}/price-history/${productId}?limit=${limit}`);
  return res.data;
}

// todo: move to React Query
export async function fetchBulkPriceHistory(productIds: number[], limit = 5) {
  const ids = productIds.join(',');
  const res = await api.get(`${API_BASE_URL}/price-history/bulk?ids=${ids}&limit=${limit}`);
  return res.data;
}