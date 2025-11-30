"use client";

import { ThemeProvider } from "next-themes";

/**
 * Root Layout Provider
 * 
 * Provides theme support for the entire application.
 * Route-specific layouts (auth, workspace) handle their own sidebar/header logic.
 */
export function LayoutProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </ThemeProvider>
  );
}
