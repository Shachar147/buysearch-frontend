"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader } from "./loader/loader";
import { isLoggedIn } from "../utils/auth";
import Cookies from 'js-cookie';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = isLoggedIn();
      
      if (isAuthenticated) {
        console.log("AuthGuard - Authentication successful");
        setIsLoading(false);
      } else {
        console.log("AuthGuard - Authentication failed, redirecting to login");
        Cookies.remove('token');
        if (pathname !== "/login" && pathname !== "/register") {
          router.replace("/login");
        }
        setIsLoading(false);
      }
    };
    
    checkAuth();
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