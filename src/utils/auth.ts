import Cookies from 'js-cookie';

export function isLoggedIn(): boolean {
  try {
    const token = Cookies.get('token');
    if (!token) return false;
    
    // Just check if token exists - cookie maxAge handles expiration
    return true;
  } catch {
    // If there's any error decoding, remove the invalid token
    Cookies.remove('token');
    
    return false;
  }
} 