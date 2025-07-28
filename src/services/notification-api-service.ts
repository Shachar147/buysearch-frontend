import { API_BASE_URL } from '../utils/config';
import api from './axios-instance';

export interface Notification {
  id: number;
  message: string;
  userId: number;
  productId: number;
  seenAt: Date | null;
  createdAt: Date;
  product?: {
    id: number;
    title: string;
    url: string;
    images: string[];
  };
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  hasMore: boolean;
}

export interface UnseenCountResponse {
  count: number;
}

export async function getNotifications(page: number = 1, limit: number = 10): Promise<NotificationsResponse> {
  const response = await api.get(`${API_BASE_URL}/notifications?page=${page}&limit=${limit}`);
  return response.data;
}

export async function getUnseenCount(): Promise<UnseenCountResponse> {
  const response = await api.get(`${API_BASE_URL}/notifications/unseen-count`);
  return response.data;
}

export async function markAsSeen(notificationId: number): Promise<{ success: boolean }> {
  const response = await api.post(`${API_BASE_URL}/notifications/${notificationId}/mark-seen`);
  return response.data;
}

export async function markAllAsSeen(): Promise<{ success: boolean }> {
  const response = await api.post(`${API_BASE_URL}/notifications/mark-all-seen`);
  return response.data;
} 