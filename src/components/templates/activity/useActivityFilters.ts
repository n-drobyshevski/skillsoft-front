'use client';

import { useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { ActivityEventType } from '@/types/activity';

/**
 * Date range filter options
 */
export type DateRangeValue = '7d' | '30d' | '90d' | 'all';

/**
 * Filter state for activity page
 */
export interface ActivityFilters {
  status: ActivityEventType | 'all';
  passed: 'all' | 'true' | 'false';
  dateRange: DateRangeValue;
  page: number;
}

/**
 * Default filter values
 */
const DEFAULT_FILTERS: ActivityFilters = {
  status: 'all',
  passed: 'all',
  dateRange: 'all',
  page: 0,
};

/**
 * Parse URL search params to filter state
 */
function parseFiltersFromParams(searchParams: URLSearchParams): ActivityFilters {
  const status = searchParams.get('status');
  const passed = searchParams.get('passed');
  const dateRange = searchParams.get('dateRange');
  const page = searchParams.get('page');

  return {
    status: isValidStatus(status) ? status : 'all',
    passed: isValidPassed(passed) ? passed : 'all',
    dateRange: isValidDateRange(dateRange) ? dateRange : 'all',
    page: page ? Math.max(0, parseInt(page, 10) || 0) : 0,
  };
}

/**
 * Type guards for filter values
 */
function isValidStatus(value: string | null): value is ActivityEventType | 'all' {
  return value === 'all' || value === 'COMPLETED' || value === 'ABANDONED' || value === 'TIMED_OUT';
}

function isValidPassed(value: string | null): value is 'all' | 'true' | 'false' {
  return value === 'all' || value === 'true' || value === 'false';
}

function isValidDateRange(value: string | null): value is DateRangeValue {
  return value === 'all' || value === '7d' || value === '30d' || value === '90d';
}

/**
 * Calculate date range boundaries
 */
export function getDateRangeBounds(dateRange: DateRangeValue): { from?: string; to?: string } {
  if (dateRange === 'all') {
    return {};
  }

  const now = new Date();
  const to = now.toISOString();

  const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  return { from, to };
}

/**
 * useActivityFilters - Custom hook for managing activity filter state with URL sync.
 *
 * Features:
 * - Syncs filter state to URL search params
 * - Resets page when filters change
 * - Provides optimistic updates
 * - SSR-compatible
 *
 * @example
 * ```tsx
 * const { filters, setStatus, setPassed, setDateRange, setPage, resetFilters } = useActivityFilters();
 * ```
 */
export function useActivityFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse current filters from URL
  const filters = useMemo(() => parseFiltersFromParams(searchParams), [searchParams]);

  // Update URL with new params
  const updateParams = useCallback(
    (updates: Partial<ActivityFilters>, resetPage = false) => {
      const params = new URLSearchParams(searchParams.toString());

      // Apply updates
      Object.entries(updates).forEach(([key, value]) => {
        if (value === 'all' || value === DEFAULT_FILTERS[key as keyof ActivityFilters]) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      // Reset page when filters change
      if (resetPage) {
        params.delete('page');
      }

      // Build new URL
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;

      // Use replace to avoid adding to history for filter changes
      router.replace(newUrl, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  // Filter setters
  const setStatus = useCallback(
    (status: ActivityEventType | 'all') => {
      updateParams({ status }, true);
    },
    [updateParams]
  );

  const setPassed = useCallback(
    (passed: 'all' | 'true' | 'false') => {
      updateParams({ passed }, true);
    },
    [updateParams]
  );

  const setDateRange = useCallback(
    (dateRange: DateRangeValue) => {
      updateParams({ dateRange }, true);
    },
    [updateParams]
  );

  const setPage = useCallback(
    (page: number) => {
      updateParams({ page }, false);
    },
    [updateParams]
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.status !== 'all' ||
      filters.passed !== 'all' ||
      filters.dateRange !== 'all'
    );
  }, [filters]);

  return {
    filters,
    setStatus,
    setPassed,
    setDateRange,
    setPage,
    resetFilters,
    hasActiveFilters,
    getDateRangeBounds: () => getDateRangeBounds(filters.dateRange),
  };
}

export default useActivityFilters;
