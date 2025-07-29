import { API_BASE_URL } from './config';

export async function isLoggedIn(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      credentials: 'include'
    });
    return response.ok;
  } catch {
    return false;
  }
} 