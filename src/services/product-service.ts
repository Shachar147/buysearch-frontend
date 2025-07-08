import axios from 'axios';

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
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/products`,
    { params: { offset, limit } }
  );
  return res.data;
} 