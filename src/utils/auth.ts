import Cookies from 'js-cookie';

export function isLoggedIn() {
  return !!Cookies.get('token');
} 