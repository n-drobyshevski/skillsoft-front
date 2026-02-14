'use client';

/**
 * useRoutePrefetch - Route-aware data prefetching for sidebar navigation
 *
 * Maps route paths to their React Query prefetch functions so that hovering
 * over a sidebar link pre-populates the cache for that page's data.
 *
 * Features:
 * - Network-aware: skips data prefetch on slow connections (2G / save-data)
 * - Lazy imports: avoids circular dependencies by dynamically importing query modules
 * - One-shot: each handler only fires once per mount to prevent redundant fetches
 *
 * The Next.js route JS prefetch still happens via PrefetchLink regardless
 * of network conditions -- this hook only controls the _data_ prefetch layer.
 */

import { useCallback, useRef } from 'react';
import { useQueryClient, QueryClient } from '@tanstack/react-query';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

// ---------------------------------------------------------------------------
// Route-to-prefetch mapping
// Each entry lazily imports the query module to avoid eager bundle inclusion
// and circular dependency issues. Functions receive the QueryClient directly.
// ---------------------------------------------------------------------------

type PrefetchFn = (queryClient: QueryClient) => void;

const PREFETCH_MAP: Record<string, PrefetchFn> = {
  '/psychometrics': (qc) => {
    import('@/hooks/queries/usePsychometricsQuery').then((mod) => {
      mod.prefetchPsychometricsDashboard(qc);
    });
  },
  '/psychometrics/items': (qc) => {
    import('@/hooks/queries/usePsychometricsQuery').then((mod) => {
      mod.prefetchPsychometricsItems(qc);
    });
  },
};

/**
 * Returns a `getPrefetchHandler` function that, given a route path, produces
 * a one-shot callback suitable for PrefetchLink's `onPrefetchData` prop.
 *
 * If no prefetch mapping exists for the path, `undefined` is returned so
 * PrefetchLink gracefully degrades to route-only prefetching.
 *
 * @example
 * ```tsx
 * const { getPrefetchHandler } = useRoutePrefetch();
 * <PrefetchLink href="/psychometrics" onPrefetchData={getPrefetchHandler('/psychometrics')}>
 *   Psychometrics
 * </PrefetchLink>
 * ```
 */
export function useRoutePrefetch() {
  const queryClient = useQueryClient();
  const { shouldPrefetch } = useNetworkStatus();

  // Track which paths have already been prefetched to enforce one-shot behaviour.
  // Using a ref (Set) instead of per-handler closure so the set persists across
  // re-renders without causing identity changes to the returned callback.
  const prefetchedPaths = useRef<Set<string>>(new Set());

  const getPrefetchHandler = useCallback(
    (path: string): (() => void) | undefined => {
      const prefetchFn = PREFETCH_MAP[path];
      if (!prefetchFn) return undefined;

      return () => {
        // Skip data prefetch on slow connections -- route JS prefetch still happens
        if (!shouldPrefetch) return;

        // Only prefetch once per path per component lifetime
        if (prefetchedPaths.current.has(path)) return;
        prefetchedPaths.current.add(path);

        prefetchFn(queryClient);
      };
    },
    [queryClient, shouldPrefetch]
  );

  return { getPrefetchHandler };
}
