/**
 * Proxies images for sources that block referer headers
 * Currently handles New Balance images
 */

import { API_BASE_URL } from "./config";

export function shouldProxyImage(imageUrl: string, source?: string): boolean {
  if (!imageUrl) return false;
  
  // Only proxy if source is specifically "New Balance"
  return source === 'New Balance';
}

export function getProxiedImageUrl(imageUrl: string, source?: string): string {
  if (!shouldProxyImage(imageUrl, source)) {
    return imageUrl;
  }
  
  // Use the backend proxy endpoint
  return `${API_BASE_URL}/proxy/proxy-image?url=${encodeURIComponent(imageUrl)}`;
}

export function getProxiedImageUrls(imageUrls: string[], source?: string): string[] {
  return imageUrls.map(url => getProxiedImageUrl(url, source));
} 