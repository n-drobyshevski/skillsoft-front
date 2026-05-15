/**
 * My Tests Page API Cache - Server-side caching for user sessions and results.
 *
 * Provides cached data fetching for the my-tests page using 'use cache'.
 * Uses user-specific cache keys (via function params) for data isolation.
 *
 * IMPORTANT: Auth headers must be resolved by the CALLER and passed as params.
 * This is because auth() is a dynamic API that cannot be called inside 'use cache'.
 *
 * Uses function-level 'use cache' (not file-level) because getMyTestsDataCached
 * must remain uncached — it orchestrates cached sub-calls and returns a Map
 * (non-serializable by cache).
 *
 * Cache profiles:
 * - Sessions: realtime (30s) — users expect to see new assignments quickly
 * - Results: entityData (60s) — results don't change frequently after completion
 */

import { cacheLife, cacheTag } from 'next/cache';
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

// User Sessions

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

/**
 * Cached user sessions fetcher.
 *
 * Auth headers are passed as params (become part of cache key).
 * clerkUserId, page, size, and authHeaders all form the cache key automatically.
 *
 * Cache tags allow on-demand invalidation when:
 * - A new test is assigned to the user
 * - A test session status changes
 * - A test is completed
 */
export async function getUserSessionsCached(
  clerkUserId: string,
  authHeaders: AuthHeaders,
  page: number = 0,
  size: number = 100
): Promise<PaginatedResponse<TestSessionSummary> | null> {
  'use cache';
  cacheLife('realtime');
  cacheTag('user-sessions', `user-sessions-${clerkUserId}`);

  try {
    const response = await fetch(
      `${getApiBaseUrl()}${TEST_SESSIONS_BASE}/user/${clerkUserId}?page=${page}&size=${size}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      }
    );

    if (!response.ok) return null;
    return (await response.json()) as PaginatedResponse<TestSessionSummary>;
  } catch {
    return null;
  }
}

// User Results

/**
 * Cached user results fetcher.
 *
 * Auth headers are passed as params (become part of cache key).
 * Cache tags allow on-demand invalidation when a test is completed.
 */
export async function getUserResultsCached(
  clerkUserId: string,
  authHeaders: AuthHeaders,
  page: number = 0,
  size: number = 100
): Promise<PaginatedResponse<TestResult> | null> {
  'use cache';
  cacheLife('entityData');
  cacheTag('user-results', `user-results-${clerkUserId}`);

  try {
    const response = await fetch(
      `${getApiBaseUrl()}${TEST_RESULTS_BASE}/user/${clerkUserId}?page=${page}&size=${size}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      }
    );

    if (!response.ok) return null;
    return (await response.json()) as PaginatedResponse<TestResult>;
  } catch {
    return null;
  }
}

// Combined Fetch (Optimized for My Tests Page)

export interface MyTestsData {
  sessions: TestSessionSummary[];
  results: TestResult[];
  resultsBySessionId: Map<string, TestResult>;
}

/**
 * Fetch both sessions and results in parallel.
 * This is the primary data fetcher for the my-tests page.
 *
 * NOT cached itself — orchestrates cached sub-calls and returns a Map
 * (non-serializable). Individual fetchers handle their own caching.
 *
 * Resolves auth headers internally via getAuthHeaders() since this function
 * is NOT inside 'use cache' and can safely call dynamic APIs.
 *
 * @param userId - Clerk user ID
 * @returns Combined sessions and results data
 */
export async function getMyTestsDataCached(userId: string): Promise<MyTestsData> {
  // Resolve auth headers here (outside 'use cache' scope) and pass to cached functions
  const authHeaders = await getAuthHeaders();

  // Fetch in parallel for optimal performance
  const [sessionsResponse, resultsResponse] = await Promise.all([
    getUserSessionsCached(userId, authHeaders),
    getUserResultsCached(userId, authHeaders),
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
