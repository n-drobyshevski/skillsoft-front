'use client';

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Client component that handles authentication redirects
 * This runs only on the client side after hydration
 */
export function AuthHandlerClient() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (isLoaded && user) {
      router.push("/dashboard");
    }
  }, [user, isLoaded, router]);

  // This component doesn't render anything visible
  return null;
}