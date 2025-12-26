"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { HeaderProvider } from "@/src/context/HeaderContext";
import { BreadcrumbProvider } from "@/src/context/BreadcrumbContext";
import { LensInitializer } from "@/components/providers/LensInitializer";
import { Skeleton } from "@/components/ui/skeleton";
import { ViewModeProvider, useViewMode, shouldBeFocused } from "@/src/context/ViewModeContext";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Sidebar skeleton shown while auth loads
 */
function SidebarSkeleton() {
  return (
    <div className="hidden md:flex w-[15rem] border-r bg-sidebar flex-col">
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
      </div>
      <div className="flex-1 p-4 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * Header skeleton shown while auth loads
 */
function HeaderSkeleton() {
  return (
    <header className="h-14 border-b flex items-center px-4 gap-4">
      <Skeleton className="h-8 w-8 md:hidden" />
      <Skeleton className="h-6 w-32" />
      <div className="flex-1" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </header>
  );
}

/**
 * Content skeleton for initial page load
 */
function ContentSkeleton() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/**
 * Inner layout component that consumes ViewModeContext
 * Handles the "Zen Mode" transitions and "Focused Mode" for IDE-like pages
 */
function WorkspaceLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { viewMode, isTransitioning } = useViewMode();
  const isImmersive = viewMode === "immersive";
  // Focused mode: keeps sidebar visible but constrains height (e.g., builder page)
  const isFocused = shouldBeFocused(pathname);

  return (
    <SidebarProvider
      defaultOpen={false}
      style={{
        "--sidebar-width": "15rem",
        "--sidebar-width-mobile": "16rem",
      } as React.CSSProperties}
    >
      {/* Sidebar - hidden in immersive mode with smooth transition */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          isImmersive && "opacity-0 pointer-events-none w-0 overflow-hidden"
        )}
        aria-hidden={isImmersive}
      >
        {!isImmersive && <AppSidebar />}
      </div>

      <SidebarInset
        className={cn(
          "flex flex-col bg-background mobile-container",
          "transition-all duration-300 ease-in-out",
          // Immersive: full viewport, no sidebar
          // Focused: constrained height for scroll containment (builder, etc.)
          // Default: min-height allows natural document flow
          isImmersive ? "ml-0 p-0 h-dvh" : isFocused ? "h-dvh overflow-hidden" : "min-h-screen",
          isTransitioning && "will-change-transform"
        )}
      >
        {/* Header - hidden in immersive mode */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out shrink-0",
            isImmersive && "opacity-0 h-0 overflow-hidden pointer-events-none"
          )}
          aria-hidden={isImmersive}
        >
          {!isImmersive && <SiteHeader />}
        </div>

        <main
          id="main-content"
          className={cn(
            "flex flex-1 flex-col focus:outline-none overflow-hidden mobile-container min-h-0",
            "transition-all duration-300 ease-in-out",
            (isImmersive || isFocused) && "max-w-full h-full"
          )}
          tabIndex={-1}
          role="main"
        >
          <Suspense fallback={<ContentSkeleton />}>
            {children}
          </Suspense>
        </main>

        {/* Mobile bottom navigation - hidden in immersive mode (also auto-hides on focused paths) */}
        <MobileBottomNav hidden={isImmersive} />
      </SidebarInset>
    </SidebarProvider>
  );
}

/**
 * Workspace Layout
 * 
 * Layout for all authenticated workspace routes.
 * Includes sidebar, header, and lens context for role-based views.
 * 
 * Next.js 16 behavior: Layouts preserve state, remain interactive,
 * and do not re-render during navigation.
 */
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useAuth();

  // Wait for auth to load - show skeleton layout
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen">
        <SidebarSkeleton />
        <div className="flex flex-1 flex-col">
          <HeaderSkeleton />
          <main className="flex flex-1 flex-col">
            <ContentSkeleton />
          </main>
        </div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    redirect("/sign-in");
  }

  return (
    <ViewModeProvider>
      {/* LensInitializer must render BEFORE sidebar to prevent flash of wrong content */}
      <LensInitializer />
      <HeaderProvider>
        <BreadcrumbProvider>
          <WorkspaceLayoutContent>
            {children}
          </WorkspaceLayoutContent>
        </BreadcrumbProvider>
      </HeaderProvider>
    </ViewModeProvider>
  );
}
