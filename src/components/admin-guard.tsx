"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL } from "../utils/config";

// Cache for admin validation results
let adminValidationCache: {
  token: string | undefined;
  isAdmin: boolean;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface Props {
  children: React.ReactNode;
}

interface DecodedToken {
    username: string;
  // Add other properties if needed
}

export async function isAdmin(): Promise<boolean> {
  try {
    const token = Cookies.get("token");
    if (!token) {
      adminValidationCache = null;
      return false;
    }
    
    // Check if we have a valid cached result
    if (adminValidationCache && 
        adminValidationCache.token === token && 
        Date.now() - adminValidationCache.timestamp < CACHE_DURATION) {
      return adminValidationCache.isAdmin;
    }
    
    // Validate token with server and get user profile
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status !== 200) {
      adminValidationCache = {
        token,
        isAdmin: false,
        timestamp: Date.now()
      };
      return false;
    }
    
    const user = await response.json();
    const isAdminUser = user.username === "Shachar";
    
    // Cache the result
    adminValidationCache = {
      token,
      isAdmin: isAdminUser,
      timestamp: Date.now()
    };
    
    return isAdminUser;
  } catch {
    adminValidationCache = null;
    return false;
  }
}

// Clear admin cache when token changes (call this on logout)
export function clearAdminCache(): void {
  adminValidationCache = null;
}

export default function AdminGuard({ children }: Props) {
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const adminStatus = await isAdmin();
      setIsAdminUser(adminStatus);
    };
    
    checkAdmin();
  }, []);

  if (isAdminUser === null) {
    return null; // Loading state
  }

  if (!isAdminUser) {
    return null; // Don't render admin content for non-admin users
  }

  return <>{children}</>;
}
