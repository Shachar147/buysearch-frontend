import axios from 'axios';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../utils/config';
import api from './axios-instance';

export async function register(username: string, password: string) {
  const res = await axios.post(`${API_BASE_URL}/auth/register`, { username, password }, { withCredentials: true });
  if (res.data && res.data.token) {
    Cookies.set('accessToken', res.data.token);
  }
  return res.data;
}

export async function login(username: string, password: string) {
  const res = await axios.post(`${API_BASE_URL}/auth/login`, { username, password }, { withCredentials: true });
  if (res.data && res.data.token) {
    Cookies.set('accessToken', res.data.token);
  }
  return res.data;
}

export async function getAllUsers() {
  const res = await api.get(`${API_BASE_URL}/auth/users`, { withCredentials: true });
  return res.data;
}

export async function getSourceStats() {
  const res = await api.get(`${API_BASE_URL}/auth/stats/sources`, { withCredentials: true });
  return res.data;
}

export async function getCategoryStats() {
  const res = await api.get(`${API_BASE_URL}/auth/stats/categories`, { withCredentials: true });
  return res.data;
}

export async function getBrandStats() {
  const res = await api.get(`${API_BASE_URL}/auth/stats/brands`, { withCredentials: true });
  return res.data;
}

export async function getTotalProducts() {
  const res = await api.get(`${API_BASE_URL}/auth/stats/total-products`, { withCredentials: true });
  return res.data;
} 