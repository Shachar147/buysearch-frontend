import Cookies from 'js-cookie';
import { API_BASE_URL } from './config';

// Cache for token validation results
let tokenValidationCache: {
  token: string | undefined;
  isValid: boolean;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function isLoggedIn(): Promise<boolean> {
  try {
    const token = Cookies.get('token');
    if (!token) {
      tokenValidationCache = null;
      return false;
    }
    
    // Check if we have a valid cached result
    if (tokenValidationCache && 
        tokenValidationCache.token === token && 
        Date.now() - tokenValidationCache.timestamp < CACHE_DURATION) {
      return tokenValidationCache.isValid;
    }
    
    // Validate token with server
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const isValid = response.status === 200;
    
    // Cache the result
    tokenValidationCache = {
      token,
      isValid,
      timestamp: Date.now()
    };
    
    return isValid;
  } catch {
    tokenValidationCache = null;
    return false;
  }
}

// Clear cache when token changes (call this on logout)
export function clearAuthCache(): void {
  tokenValidationCache = null;
} 