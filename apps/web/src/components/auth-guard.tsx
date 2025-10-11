"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken, getRole } from "@/lib/auth";

// Enhanced AuthGuard with loading state and public route handling
export function AuthGuard({
  children,
  role,
  publicRoute = false,
}: {
  children: React.ReactNode;
  role?: "admin" | "voter";
  publicRoute?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(!publicRoute);
  const [authorized, setAuthorized] = useState(publicRoute);

  useEffect(() => {
    // Skip auth check for public routes
    if (publicRoute) {
      setAuthorized(true);
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const token = getToken();
        const currentRole = getRole();

        if (!token) {
          router.replace("/auth/login");
          return;
        }

        if (role && currentRole && currentRole !== role) {
          // Route to appropriate dashboard
          router.replace(
            currentRole === "admin" ? "/dashboard/admin" : "/dashboard/user"
          );
          return;
        }

        // User is authorized
        setAuthorized(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, role, publicRoute, pathname]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-600 border-solid rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Render children only if authorized
  return authorized ? <>{children}</> : null;
}
