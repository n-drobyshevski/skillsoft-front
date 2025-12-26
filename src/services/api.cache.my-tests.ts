/**
 * My Tests Page API Cache - Server-side caching for user sessions and results.
 *
 * Provides cached data fetching for the my-tests page using Next.js unstable_cache.
 * Uses user-specific cache keys to ensure proper data isolation per user.
 *
 * IMPORTANT: Auth headers must be obtained OUTSIDE of unstable_cache and passed in.
 * This is because headers() is a dynamic data source that cannot be used inside
 * cached functions. See: https://nextjs.org/docs/app/api-reference/functions/unstable_cache
 *
 * Revalidation times:
 * - Sessions: 30s (real-time needs - users expect to see new assignments quickly)
 * - Results: 60s (results don't change frequently after completion)
 */

import { unstable_cache } from 'next/cache';
import { TestSessionSummary, TestResult } from '@/types/domain';
import { getAuthHeaders } from './roleApi';

// Type for auth headers passed into cached functions
type AuthHeaders = Record<string, string>;

// API Version configuration
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const versionPath = API_VERSION ? `/${API_VERSION}` : '';
  if (!apiUrl) {
    return `http://localhost:8080/api${versionPath}`;
  }
  const protocol = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1') ? 'http' : 'https';
  return `${protocol}://${apiUrl}/api${versionPath}`;
};

// API Endpoints
const TEST_SESSIONS_BASE = '/tests/sessions';
const TEST_RESULTS_BASE = '/tests/results';

// Cache revalidation times (in seconds)
const SESSION_REVALIDATE = 30; // 30 seconds - sessions need real-time updates
const RESULTS_REVALIDATE = 60; // 60 seconds - results are more stable

// ============================================================================
// User Sessions
// ============================================================================

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

/**
 * Internal fetch function for user sessions.
 * Auth headers must be passed in (cannot call getAuthHeaders inside cached function).
 */
async function fetchUserSessions(
  clerkUserId: string,
  authHeaders: AuthHeaders,
  page: number = 0,
  size: number = 100
): Promise<PaginatedResponse<TestSessionSummary> | null> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}${TEST_SESSIONS_BASE}/user/${clerkUserId}?page=${page}&size=${size}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        next: { revalidate: SESSION_REVALIDATE },
      }
    );

    if (!response.ok) return null;
    return (await response.json()) as PaginatedResponse<TestSessionSummary>;
  } catch {
    return null;
  }
}

/**
 * Cached user sessions fetcher.
 *
 * Uses user-specific cache key for data isolation.
 * Cache tags allow on-demand invalidation when:
 * - A new test is assigned to the user
 * - A test session status changes
 * - A test is completed
 *
 * IMPORTANT: Auth headers are obtained OUTSIDE the cache scope to comply with
 * Next.js unstable_cache requirements (no dynamic data sources inside cache).
 *
 * @param userId - Clerk user ID
 * @param page - Page number (0-indexed)
 * @param size - Page size (default: 100)
 * @returns Paginated user sessions or null on error
 *
 * @example
 * ```tsx
 * // In a server component
 * const sessions = await getUserSessionsCached(userId);
 * ```
 */
export async function getUserSessionsCached(
  userId: string,
  page: number = 0,
  size: number = 100
): Promise<PaginatedResponse<TestSessionSummary> | null> {
  // Get auth headers OUTSIDE the cache scope (required by Next.js)
  const authHeaders = await getAuthHeaders();

  const cachedFetch = unstable_cache(
    () => fetchUserSessions(userId, authHeaders, page, size),
    ['user-sessions', userId, String(page), String(size)],
    {
      revalidate: SESSION_REVALIDATE,
      tags: ['user-sessions', `user-sessions-${userId}`],
    }
  );

  return cachedFetch();
}

// ============================================================================
// User Results
// ============================================================================

/**
 * Internal fetch function for user results.
 * Auth headers must be passed in (cannot call getAuthHeaders inside cached function).
 */
async function fetchUserResults(
  clerkUserId: string,
  authHeaders: AuthHeaders,
  page: number = 0,
  size: number = 100
): Promise<PaginatedResponse<TestResult> | null> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}${TEST_RESULTS_BASE}/user/${clerkUserId}?page=${page}&size=${size}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        next: { revalidate: RESULTS_REVALIDATE },
      }
    );

    if (!response.ok) return null;
    return (await response.json()) as PaginatedResponse<TestResult>;
  } catch {
    return null;
  }
}

/**
 * Cached user results fetcher.
 *
 * Uses user-specific cache key for data isolation.
 * Cache tags allow on-demand invalidation when a test is completed.
 *
 * IMPORTANT: Auth headers are obtained OUTSIDE the cache scope to comply with
 * Next.js unstable_cache requirements (no dynamic data sources inside cache).
 *
 * @param userId - Clerk user ID
 * @param page - Page number (0-indexed)
 * @param size - Page size (default: 100)
 * @returns Paginated user results or null on error
 *
 * @example
 * ```tsx
 * // In a server component
 * const results = await getUserResultsCached(userId);
 * ```
 */
export async function getUserResultsCached(
  userId: string,
  page: number = 0,
  size: number = 100
): Promise<PaginatedResponse<TestResult> | null> {
  // Get auth headers OUTSIDE the cache scope (required by Next.js)
  const authHeaders = await getAuthHeaders();

  const cachedFetch = unstable_cache(
    () => fetchUserResults(userId, authHeaders, page, size),
    ['user-results', userId, String(page), String(size)],
    {
      revalidate: RESULTS_REVALIDATE,
      tags: ['user-results', `user-results-${userId}`],
    }
  );

  return cachedFetch();
}

// ============================================================================
// Combined Fetch (Optimized for My Tests Page)
// ============================================================================

export interface MyTestsData {
  sessions: TestSessionSummary[];
  results: TestResult[];
  resultsBySessionId: Map<string, TestResult>;
}

/**
 * Fetch both sessions and results in parallel.
 * This is the primary data fetcher for the my-tests page.
 *
 * @param userId - Clerk user ID
 * @returns Combined sessions and results data
 */
export async function getMyTestsDataCached(userId: string): Promise<MyTestsData> {
  // Fetch in parallel for optimal performance
  const [sessionsResponse, resultsResponse] = await Promise.all([
    getUserSessionsCached(userId),
    getUserResultsCached(userId),
  ]);

  const sessions = sessionsResponse?.content || [];
  const results = resultsResponse?.content || [];

  // Create a map for quick result lookup by session ID
  const resultsBySessionId = new Map(results.map(r => [r.sessionId, r]));

  return {
    sessions,
    results,
    resultsBySessionId,
  };
}
