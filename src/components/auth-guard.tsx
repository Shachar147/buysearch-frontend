"use client";
import { useEffect } from "react";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (!token && pathname !== "/login" && pathname !== "/register") {
      router.replace("/login");
    }
  }, [pathname, router]);

  return <>{children}</>;
} 