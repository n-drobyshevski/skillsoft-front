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
 * Matches the actual AppSidebar structure with proper full-height styling
 */
function SidebarSkeleton() {
  return (
    <div className="flex min-h-screen w-60 shrink-0 flex-col border-r bg-sidebar">
      {/* Header skeleton - matches SidebarHeader with team logo */}
      <div className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      
      {/* Nav items skeleton - matches SidebarContent */}
      <div className="flex flex-1 flex-col gap-2 overflow-hidden p-4">
        {/* Platform section */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
        
        {/* Library section */}
        <div className="mt-4 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
        
        {/* Tools section */}
        <div className="mt-4 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </div>
      
      {/* Footer skeleton - matches SidebarFooter with user avatar */}
      <div className="shrink-0 border-t p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

/**
 * Header skeleton shown while auth loads
 * Matches SiteHeader structure
 */
function HeaderSkeleton() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      {/* Sidebar trigger */}
      <Skeleton className="h-8 w-8 rounded-md" />
      {/* Separator */}
      <div className="h-4 w-px bg-border" />
      {/* Breadcrumb */}
      <Skeleton className="h-5 w-32" />
      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </header>
  );
}

/**
 * Content skeleton for initial page load
 * Matches the structure of most workspace pages
 */
function ContentSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="space-y-1 sm:space-y-2">
          <Skeleton className="h-7 w-48 sm:h-8" />
          <Skeleton className="h-4 w-80 sm:h-5" />
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[110px] rounded-xl" />
        ))}
      </div>
      {/* Table area */}
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
