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

export async function fetchProducts(offset = 0, limit = 20): Promise<ProductApiResponse> {
  const res = await axios.get<ProductApiResponse>(
    `${API_BASE}/products?offset=${offset}&limit=${limit}`
  );
  return res.data;
}

// TODO: Move product API logic to product-api-service.ts (renamed)
// TODO: Create brand-api-service.ts, category-api-service.ts, color-api-service.ts, source-api-service.ts 