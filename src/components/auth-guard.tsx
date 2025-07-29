"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader } from "./loader/loader";
import api from "../services/axios-instance";
import { API_BASE_URL } from "../utils/config";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add a small delay to ensure cookies are properly set
    const checkAuth = async () => {
      // Clear any old accessToken cookies that might be lingering
      if (typeof document !== 'undefined') {
        document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
      
      // Since we're using HTTP-only cookies, we need to check authentication via API call
      try {

        
        const response = await api.get(`${API_BASE_URL}/auth/profile`);
        
        if (response.status === 200) {
          console.log("AuthGuard - Authentication successful");
          setIsLoading(false);
        } else {
          console.log("AuthGuard - Authentication failed, redirecting to login");
          if (pathname !== "/login" && pathname !== "/register") {
            router.replace("/login");
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.log("AuthGuard - Error checking auth:", error);
        if (pathname !== "/login" && pathname !== "/register") {
          router.replace("/login");
        }
        setIsLoading(false);
      }
    };

    // Check immediately
    checkAuth();
    
    // Also check after a short delay to handle timing issues
    const timeoutId = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timeoutId);
  }, [pathname, router]);

  if (isLoading){
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader isGray />
      </div>
    )
  }

  return <>{children}</>;
} 