"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/store/ui-store";

type ViewMode = "default" | "immersive";

interface ViewModeContextValue {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isImmersive: boolean;
  isTransitioning: boolean;
}

const ViewModeContext = createContext<ViewModeContextValue | null>(null);

/**
 * Paths that should automatically trigger immersive mode
 */
const IMMERSIVE_PATHS = [
  '/test-templates/take/',
] as const;

/**
 * Check if a pathname should trigger immersive mode
 */
function shouldBeImmersive(pathname: string): boolean {
  return IMMERSIVE_PATHS.some(path => pathname.startsWith(path));
}

/**
 * ViewModeProvider
 * 
 * Manages view mode state and auto-triggers immersive mode for specific routes.
 * Uses Zustand store internally for global state management.
 * 
 * Features:
 * - Auto-detect immersive routes (test taking pages)
 * - Smooth transitions between modes
 * - SSR-safe with hydration handling
 */
export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { viewMode, setViewMode, isTransitioning } = useUIStore();
  
  // Track if component has mounted (for hydration safety)
  const hasMounted = useRef(false);
  // Track the last manually set mode to avoid overriding user intent
  const lastManualMode = useRef<ViewMode | null>(null);
  // Track if we auto-set the mode for current path
  const autoSetForPath = useRef<string | null>(null);

  // Auto-trigger immersive mode based on pathname
  useEffect(() => {
    // Skip on first render to avoid hydration mismatch
    if (!hasMounted.current) {
      hasMounted.current = true;
      // On mount, set initial mode based on path
      if (shouldBeImmersive(pathname)) {
        setViewMode('immersive');
        autoSetForPath.current = pathname;
      }
      return;
    }

    const shouldImmerse = shouldBeImmersive(pathname);
    const isCurrentlyImmersive = viewMode === 'immersive';
    
    if (shouldImmerse && !isCurrentlyImmersive) {
      // Entering an immersive path
      setViewMode('immersive');
      autoSetForPath.current = pathname;
    } else if (!shouldImmerse && isCurrentlyImmersive && autoSetForPath.current) {
      // Leaving an immersive path - only revert if we auto-set it
      setViewMode('default');
      autoSetForPath.current = null;
    }
  }, [pathname, viewMode, setViewMode]);

  // Cleanup on unmount - revert to default if we were in auto-immersive mode
  useEffect(() => {
    return () => {
      if (autoSetForPath.current) {
        useUIStore.getState().setViewMode('default');
      }
    };
  }, []);

  const contextValue: ViewModeContextValue = {
    viewMode,
    setViewMode: (mode: ViewMode) => {
      lastManualMode.current = mode;
      autoSetForPath.current = null; // Clear auto-set tracking on manual change
      setViewMode(mode);
    },
    isImmersive: viewMode === 'immersive',
    isTransitioning,
  };

  return (
    <ViewModeContext.Provider value={contextValue}>
      {children}
    </ViewModeContext.Provider>
  );
}

/**
 * Hook to access view mode context
 * @throws Error if used outside ViewModeProvider
 */
export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }
  return context;
}
