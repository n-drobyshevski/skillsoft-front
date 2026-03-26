"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { HeaderProvider } from "@/context/HeaderContext";
import { BreadcrumbProvider } from "@/context/BreadcrumbContext";
import { LensInitializer } from "@/components/providers/LensInitializer";
import { LensRouterSync } from "@/components/providers/LensRouterSync";
import { Skeleton } from "@/components/ui/skeleton";
import { ViewModeProvider, useViewMode, shouldBeFocused } from "@/context/ViewModeContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { CommandPalette } from "@/components/common/CommandPalette";

const SIDEBAR_PREFERENCE_KEY = "skillsoft-sidebar-open";

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
  const isMobile = useIsMobile();

  // Determine sidebar default: open on desktop, closed on mobile.
  // Check localStorage for user preference; fall back to !isMobile.
  const [sidebarOpen, setSidebarOpen] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_PREFERENCE_KEY);
      if (stored !== null) {
        setSidebarOpen(stored === "true");
      } else {
        // No stored preference: closed by default
        setSidebarOpen(false);
      }
    } catch {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Persist sidebar preference to localStorage
  const handleOpenChange = useCallback((open: boolean) => {
    setSidebarOpen(open);
    try {
      localStorage.setItem(SIDEBAR_PREFERENCE_KEY, String(open));
    } catch {
      // localStorage unavailable (e.g. private browsing quota exceeded)
    }
  }, []);

  // Use the resolved value, defaulting to false during SSR/hydration
  const resolvedOpen = sidebarOpen ?? false;

  return (
    <SidebarProvider
      open={resolvedOpen}
      onOpenChange={handleOpenChange}
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
          isImmersive ? "ml-0 p-0 h-dvh" : isFocused ? "h-dvh overflow-y-auto" : "min-h-screen",
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
            "flex flex-1 flex-col focus:outline-none overflow-y-auto mobile-container min-h-0",
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
 * WorkspaceShell - Client Component
 *
 * Contains all client-side providers and interactive layout for the workspace.
 * Extracted from the workspace layout to allow the layout to be a Server Component.
 *
 * Provider order matters:
 * 1. ViewModeProvider - manages immersive/focused mode
 * 2. LensInitializer - initializes role-based lens from Clerk (must be before sidebar)
 * 3. HeaderProvider - manages header title/subtitle state
 * 4. BreadcrumbProvider - manages custom breadcrumb titles
 * 5. WorkspaceLayoutContent - sidebar, header, main content area
 */
export default function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <ViewModeProvider>
      {/* LensInitializer must render BEFORE sidebar to prevent flash of wrong content */}
      <LensInitializer />
      <LensRouterSync />
      <HeaderProvider>
        <BreadcrumbProvider>
          <CommandPalette />
          <WorkspaceLayoutContent>
            {children}
          </WorkspaceLayoutContent>
        </BreadcrumbProvider>
      </HeaderProvider>
    </ViewModeProvider>
  );
}
