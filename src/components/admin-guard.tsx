"use client";

import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useMemo } from "react";

interface Props {
  children: React.ReactNode;
}

interface DecodedToken {
    username: string;
  // Add other properties if needed
}

export function isAdmin(){
  const token = Cookies.get("token");
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
  const isAdminUser = useMemo(() => isAdmin(), []);

  if (!isAdminUser) {
    return null; // Don't render admin content for non-admin users
  }

  return <>{children}</>;
}
