"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { HeaderProvider } from "@/src/context/HeaderContext";
import { BreadcrumbProvider } from "@/src/context/BreadcrumbContext";
import { LensProvider } from "@/context/LensContext";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Sidebar skeleton shown while auth loads
 * Provides instant visual feedback with the same layout structure
 */
function SidebarSkeleton() {
  return (
    <div className="flex h-full w-60 flex-col border-r bg-sidebar">
      {/* Header skeleton */}
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-5 w-24" />
      </div>
      
      {/* Nav items skeleton */}
      <div className="flex-1 space-y-4 p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </div>
      
      {/* Footer skeleton */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Header skeleton shown while auth loads
 */
function HeaderSkeleton() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-5 w-32" />
      <div className="ml-auto flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </header>
  );
}

/**
 * Content skeleton for initial page load
 */
function ContentSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

/**
 * Workspace Layout
 * 
 * Layout for all authenticated workspace routes.
 * Includes sidebar, header, and lens context for role-based views.
 * 
 * Next.js 16 behavior: Layouts preserve state, remain interactive,
 * and do not re-render during navigation. This means the sidebar
 * and header will stay visible while page content loads.
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
    <LensProvider>
      <HeaderProvider>
        <BreadcrumbProvider>
          <SidebarProvider 
            defaultOpen={false}
            style={{
              "--sidebar-width": "15rem",
              "--sidebar-width-mobile": "16rem",
            } as React.CSSProperties}
          >
            <AppSidebar />
            <SidebarInset className="flex flex-col min-h-screen bg-background mobile-container">
              <SiteHeader />
              <main 
                id="main-content" 
                className="flex flex-1 flex-col focus:outline-none overflow-hidden mobile-container"
                tabIndex={-1}
              >
                <Suspense fallback={<ContentSkeleton />}>
                  {children}
                </Suspense>
              </main>
            </SidebarInset>
          </SidebarProvider>
        </BreadcrumbProvider>
      </HeaderProvider>
    </LensProvider>
  );
}
