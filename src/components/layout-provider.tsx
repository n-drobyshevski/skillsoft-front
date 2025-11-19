"use client";

import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "next-themes";
import { HeaderProvider } from "@/src/context/HeaderContext";
import { BreadcrumbProvider } from "@/src/context/BreadcrumbContext";

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  
  // Landing page should not have sidebar, even for authenticated users
  const isLandingPage = pathname === '/';
  const shouldShowSidebar = isSignedIn && !isLandingPage;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <HeaderProvider>
        <BreadcrumbProvider>
          {shouldShowSidebar ? (
            // Authenticated users on non-landing pages get the full dashboard layout with sidebar
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
          ) : (
            // Landing page OR unauthenticated users get a clean layout
            <div className="min-h-screen bg-background">
              {children}
            </div>
          )}
        </BreadcrumbProvider>
      </HeaderProvider>
    </ThemeProvider>
  );
}
