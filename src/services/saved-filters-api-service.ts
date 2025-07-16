import { API_BASE_URL } from '../utils/config';
import api from './axios-instance';

export interface SavedFilter {
  id: number;
  name: string;
  filters: {
    sort?: string;
    brand?: string[];
    category?: string[];
    color?: string[];
    priceRange?: { label: string; from?: number; to?: number };
    gender?: string;
    isFavourite?: boolean;
    withPriceChange?: boolean;
    source?: string[];
    isOnSale?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavedFilterRequest {
  name: string;
  filters: SavedFilter['filters'];
}

export interface UpdateSavedFilterRequest {
  name: string;
  filters: SavedFilter['filters'];
}

export async function fetchSavedFilters(): Promise<SavedFilter[]> {
  const res = await api.get<SavedFilter[]>(`${API_BASE_URL}/saved-filters`);
  return res.data;
}

export async function fetchSavedFilterById(id: number): Promise<SavedFilter> {
  const res = await api.get<SavedFilter>(`${API_BASE_URL}/saved-filters/${id}`);
  return res.data;
}

export async function createSavedFilter(data: CreateSavedFilterRequest): Promise<SavedFilter> {
  const res = await api.post<SavedFilter>(`${API_BASE_URL}/saved-filters`, data);
  return res.data;
}

export async function updateSavedFilter(id: number, data: UpdateSavedFilterRequest): Promise<SavedFilter> {
  const res = await api.put<SavedFilter>(`${API_BASE_URL}/saved-filters/${id}`, data);
  return res.data;
}

export async function deleteSavedFilter(id: number): Promise<void> {
  await api.delete(`${API_BASE_URL}/saved-filters/${id}`);
} 