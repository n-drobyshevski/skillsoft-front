'use client';

import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LayoutDashboard, Loader2 } from "lucide-react";

/**
 * Smart authentication buttons that show different states:
 * - Sign In / Sign Up for unauthenticated users
 * - Dashboard button for authenticated users
 * - Loading state during navigation
 */
export function DashboardAccessButtons() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleDashboardNavigation = async () => {
    setIsNavigating(true);
    try {
      // Add a small delay for smooth visual feedback
      await new Promise(resolve => setTimeout(resolve, 200));
      router.push("/dashboard");
    } catch (error) {
      console.error("Navigation error:", error);
      setIsNavigating(false);
    }
    // Note: Don't reset isNavigating here as the component will unmount during navigation
  };

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-20 h-9 bg-muted/50 animate-pulse rounded"></div>
        <div className="w-24 h-9 bg-muted/50 animate-pulse rounded"></div>
      </div>
    );
  }

  // Show Dashboard button for authenticated users
  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Button
          onClick={handleDashboardNavigation}
          disabled={isNavigating}
          className="btn-modern bg-primary text-primary-foreground hover:bg-primary/90 shadow-modern transition-all duration-300 group"
          size="sm"
        >
          {isNavigating ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <LayoutDashboard className="w-3 h-3 mr-2" />
              Dashboard
              <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>
    );
  }

  // Show Sign In / Sign Up for unauthenticated users
  return (
    <div className="flex items-center gap-3">
      <SignInButton>
        <Button variant="ghost" size="sm" className="hidden sm:flex hover-lift">
          Sign In
        </Button>
      </SignInButton>
      <SignUpButton>
        <Button size="sm" className="btn-modern bg-primary text-primary-foreground hover:bg-primary/90 shadow-modern transition-all duration-300 group">
          Get Started
          <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Button>
      </SignUpButton>
    </div>
  );
}