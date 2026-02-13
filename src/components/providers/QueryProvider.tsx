'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Stale time constants aligned with server-side cacheLife profiles (next.config.ts).
 * Use these in individual query hooks to match the server-side cache behavior.
 *
 * Mapping:
 * - realtime     → cacheLife stale=30s   → staleTime: 15s  (refetch frequently)
 * - entityData   → cacheLife stale=60s   → staleTime: 60s  (default)
 * - userData     → cacheLife stale=300s  → staleTime: 300s
 * - referenceData→ cacheLife stale=1800s → staleTime: 600s  (stable data)
 * - staticContent→ cacheLife stale=3600s → staleTime: 1800s (very stable)
 */
export const QUERY_STALE_TIMES = {
  /** Real-time data: sessions, live stats (15 seconds) */
  realtime: 15 * 1000,
  /** Entity data: competencies, questions, templates (60 seconds) */
  entityData: 60 * 1000,
  /** User data: profiles, roles, passport (5 minutes) */
  userData: 5 * 60 * 1000,
  /** Reference data: standards, categories, Big Five traits (10 minutes) */
  referenceData: 10 * 60 * 1000,
  /** Static content: docs, marketing pages (30 minutes) */
  staticContent: 30 * 60 * 1000,
} as const;

/**
 * QueryProvider - React Query client provider for client-side caching
 *
 * Provides a QueryClient with optimized defaults for the SkillSoft application:
 * - staleTime: 60 seconds (aligned with entityData cacheLife profile)
 * - gcTime: 5 minutes (garbage collection time)
 * - Automatic refetch on window focus disabled by default
 * - Retry with exponential backoff
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default aligned with entityData cacheLife profile (stale=60s)
            staleTime: QUERY_STALE_TIMES.entityData,
            // Keep unused data in cache for 5 minutes
            gcTime: 5 * 60 * 1000,
            // Don't refetch on window focus by default (can override per-query)
            refetchOnWindowFocus: false,
            // Retry failed requests with exponential backoff
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Retry mutations once
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}

export default QueryProvider;
