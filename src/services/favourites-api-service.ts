import { API_BASE_URL } from '../utils/config';
import api from './axios-instance';

export async function addToFavourite(productId: number) {
  const res = await api.post(`${API_BASE_URL}/favourites`, { productId });
  return res.data;
}

export async function removeFromFavourite(productId: number) {
  const res = await api.delete(`${API_BASE_URL}/favourites/${productId}`);
  return res.data;
}

export async function getFavourites() {
  const res = await api.get(`${API_BASE_URL}/favourites`);
  return res.data;
}

export async function isFavourite(productId: number) {
  const res = await api.get(`${API_BASE_URL}/favourites/is-favourite/${productId}`);
  return res.data.isFavourite;
} 