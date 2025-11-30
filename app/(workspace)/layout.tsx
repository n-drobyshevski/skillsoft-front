"use client";

import { useAuth } from "@clerk/nextjs";
import { usePathname, redirect } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { HeaderProvider } from "@/src/context/HeaderContext";
import { BreadcrumbProvider } from "@/src/context/BreadcrumbContext";
import { LensProvider } from "@/context/LensContext";

/**
 * Workspace Layout
 * 
 * Layout for all authenticated workspace routes.
 * Includes sidebar, header, and lens context for role-based views.
 */
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useAuth();
  const pathname = usePathname();

  // Wait for auth to load
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
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
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </BreadcrumbProvider>
      </HeaderProvider>
    </LensProvider>
  );
}
