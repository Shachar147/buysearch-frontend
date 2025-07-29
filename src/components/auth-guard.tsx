"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import { Loader } from "./loader/loader";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (!token && pathname !== "/login" && pathname !== "/register") {
      router.replace("/login");
    }
    setIsLoading(false);
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