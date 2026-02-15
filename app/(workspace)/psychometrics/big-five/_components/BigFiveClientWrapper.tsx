'use client';

import { ReactNode } from 'react';
import { useBigFiveStoreHydration } from '@/store/big-five-page-store';

interface BigFiveClientWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Client wrapper that handles Zustand store hydration for the Big Five page.
 * Ensures the store is hydrated from sessionStorage before rendering children
 * that depend on the store state.
 *
 * This prevents SSR hydration mismatches and infinite re-render loops.
 */
export function BigFiveClientWrapper({ children, fallback }: BigFiveClientWrapperProps) {
  const hydrated = useBigFiveStoreHydration();

  // During SSR and initial client render, show fallback or children with initial state
  // The store will be populated with persisted state after hydration
  if (!hydrated) {
    return fallback ?? children;
  }

  return <>{children}</>;
}
