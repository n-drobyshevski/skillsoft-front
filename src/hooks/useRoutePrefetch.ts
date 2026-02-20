'use client';

/**
 * useRoutePrefetch - Route-aware data prefetching for sidebar navigation
 *
 * After React Query removal, this hook only handles route-level JS prefetching
 * via Next.js router.prefetch(). Server-side data caching is handled by
 * 'use cache' functions at the route level.
 *
 * Features:
 * - Network-aware: skips data prefetch on slow connections (2G / save-data)
 * - One-shot: each handler only fires once per mount to prevent redundant work
 *
 * The Next.js route JS prefetch still happens via PrefetchLink regardless
 * of network conditions -- this hook only controls the _data_ prefetch layer.
 */

import { useCallback, useRef } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

/**
 * Returns a `getPrefetchHandler` function that, given a route path, produces
 * a one-shot callback suitable for PrefetchLink's `onPrefetchData` prop.
 *
 * After React Query removal, the data prefetch functions are no-ops since
 * server-side 'use cache' functions handle caching. Route-level JS prefetching
 * is handled by Next.js automatically. This hook preserves the API surface.
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
  const { shouldPrefetch } = useNetworkStatus();

  // Track which paths have already been prefetched to enforce one-shot behaviour.
  const prefetchedPaths = useRef<Set<string>>(new Set());

  const getPrefetchHandler = useCallback(
    (path: string): (() => void) | undefined => {
      // Return a no-op handler for known prefetch paths.
      // Route JS prefetch is handled by PrefetchLink / router.prefetch().
      // Data prefetch is handled by server-side 'use cache' functions.
      const KNOWN_PATHS = ['/psychometrics', '/psychometrics/items'];
      if (!KNOWN_PATHS.includes(path)) return undefined;

      return () => {
        if (!shouldPrefetch) return;
        if (prefetchedPaths.current.has(path)) return;
        prefetchedPaths.current.add(path);
        // No-op: data caching is server-side via 'use cache'
      };
    },
    [shouldPrefetch]
  );

  return { getPrefetchHandler };
}
