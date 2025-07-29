"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface Props {
  children: React.ReactNode;
}

interface DecodedToken {
  username: string;
  exp: number;
  sub: number;
}

export function isAdmin(): boolean {
  try {
    const token = Cookies.get('token');
    if (!token) return false;
    
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (decoded.exp < currentTime) {
      // Token is expired, remove it
      Cookies.remove('token');
      return false;
    }
    
    return decoded.username === "Shachar";
  } catch {
    // If there's any error decoding, remove the invalid token
    Cookies.remove('token');
    return false;
  }
}

export default function AdminGuard({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);

  useEffect(() => {
    const adminStatus = isAdmin();
    setIsAdminUser(adminStatus);
  }, [pathname, router]);

  if (isAdminUser === null) return null; // or a loading spinner

  return <>{children}</>;
}
