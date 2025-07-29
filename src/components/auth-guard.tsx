"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader } from "./loader/loader";
import { isLoggedIn } from "../utils/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // If client-side check fails, do a server-side check as fallback
      try {
        const isAuthenticated = await isLoggedIn();
        
        if (isAuthenticated) {
          console.log("AuthGuard - Server-side authentication successful");
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