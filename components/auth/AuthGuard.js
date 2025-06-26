"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { Button, Spinner } from "@heroui/react";

// Pages that don't require authentication
const PUBLIC_ROUTES = [
  "/welcome",
  "/sign-in",
  "/sign-up",
  "/auth-test", // Debug page
];

// Pages that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile",
  "/settings",
  // Add any other protected routes
];

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, hydrated, sessionExpired, status } = useSelector(
    (state) => state.auth
  );
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!hydrated) return; // Wait for auth hydration to complete

    setIsInitializing(false);

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isProtectedRoute =
      PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) ||
      pathname === "/";

    console.log("AuthGuard Check:", {
      pathname,
      isAuthenticated,
      hydrated,
      sessionExpired,
      isPublicRoute,
      isProtectedRoute,
      status,
    });

    // Handle session expiration first
    if (sessionExpired && !isPublicRoute) {
      console.log("Session expired, redirecting to sign-in");
      router.replace("/sign-in?reason=session_expired");
      return;
    }

    // If user is authenticated and trying to access public routes, redirect to dashboard
    if (isAuthenticated && isPublicRoute && !sessionExpired) {
      console.log("User authenticated, redirecting to dashboard");
      router.replace("/dashboard");
      return;
    }

    // If user is not authenticated and trying to access protected routes, redirect to welcome
    if (!isAuthenticated && isProtectedRoute && !sessionExpired) {
      console.log("User not authenticated, redirecting to welcome");
      router.replace("/welcome");
      return;
    }
  }, [isAuthenticated, hydrated, sessionExpired, pathname, router, status]);

  // Show loading spinner while initializing
  if (isInitializing || !hydrated) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" color="primary" />
          <p className="text-white text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Show session expired message
  if (sessionExpired && !PUBLIC_ROUTES.includes(pathname)) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-red-400 text-lg font-semibold">
            Session Expired
          </div>
          <p className="text-zinc-400">
            Your session has expired due to inactivity.
          </p>
          <Button
            onPress={() => router.replace("/sign-in?reason=session_expired")}
            color="primary"
            size="lg"
            className="bg-white text-black hover:bg-zinc-200"
          >
            Login Again
          </Button>
        </div>
      </div>
    );
  }

  return children;
}
