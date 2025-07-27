"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface Props {
  children: React.ReactNode;
}

interface DecodedToken {
    username: string;
  // Add other properties if needed
}

export function isAdmin(){
  const token = Cookies.get("accessToken");
  if (!token) {
    return false;
  }
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.username === "Shachar";
  } catch {
    return false
  }
}

export default function AdminGuard({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const token = Cookies.get("accessToken");

    if (!token) {
    //   router.replace("/login");
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);

      if (decoded.username === "Shachar") {
        setIsAdmin(true);
      } else {
        // router.replace("/not-authorized"); // or home page
      }
    } catch (error) {
      console.error("Failed to decode token:", error);
    //   router.replace("/login");
    }
  }, [pathname, router]);

  if (isAdmin === null) return null; // or a loading spinner

  return <>{children}</>;
}
