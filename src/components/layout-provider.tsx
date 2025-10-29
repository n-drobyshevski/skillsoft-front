"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "next-themes";

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
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
    </ThemeProvider>
  );
}
