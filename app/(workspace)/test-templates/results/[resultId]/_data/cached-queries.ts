import { cache } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { fetchApi } from '@/services/api/core';
import { testResultsApi } from '@/services/api';
import type { TestResult, TestTemplate, TrendDataPoint } from '@/types/domain';

// API paths (mirror the constants from service modules)
const TEST_RESULTS_BASE = '/tests/results';
const TEST_TEMPLATES_BASE = '/tests/templates';

/**
 * Cached result fetching with React.cache for request-level dedup.
 *
 * Results use no-store (always fresh) since they contain score data
 * that may change on retry/rescore. React.cache deduplicates within
 * a single render pass so multiple components reading the same result
 * only trigger one network request.
 *
 * Note: This calls the standard API methods which internally call
 * getAuthHeaders() — that's fine because React.cache is NOT 'use cache',
 * it only deduplicates within a single request, not across requests.
 */
export const getResult = cache(async (resultId: string): Promise<TestResult | null> => {
  try {
    return await testResultsApi.getResultById(resultId);
  } catch {
    try {
      return await testResultsApi.getResultBySession(resultId);
    } catch {
      return null;
    }
  }
});

/**
 * Cached template fetching with 'use cache' + cacheLife.
 *
 * Templates are semi-static entity data — they change only when an admin
 * edits the blueprint. Using the 'entityData' cacheLife profile
 * (stale: 60s, revalidate: 300s, expire: 600s) avoids re-fetching
 * on every result page load while staying reasonably fresh.
 *
 * IMPORTANT: 'use cache' cannot call runtime APIs (cookies, headers,
 * connection). Auth headers must be resolved OUTSIDE and passed in.
 * The headers become part of the cache key automatically.
 */
export async function getTemplate(
  templateId: string,
  authHeaders: Record<string, string>,
): Promise<TestTemplate | null> {
  'use cache';
  cacheLife('entityData');
  cacheTag(`template-${templateId}`);

  return fetchApi<TestTemplate | null>(`${TEST_TEMPLATES_BASE}/${templateId}`, {
    tags: [`test-template-${templateId}`],
    authHeaders,
    silentStatusCodes: [404],
  });
}

/**
 * Prefetch trend data server-side with 'use cache'.
 *
 * Trend data (historical scores) is read-only and changes only when
 * a new result is scored. Using 'realtime' cacheLife
 * (stale: 30s, revalidate: 30s, expire: 60s) keeps it fresh enough
 * while eliminating the client-side waterfall.
 *
 * Auth headers passed in from outside the cache boundary.
 * Returns null on failure — trend is a non-critical enhancement.
 */
export async function getTrendData(
  clerkUserId: string,
  templateId: string,
  authHeaders: Record<string, string>,
): Promise<TrendDataPoint[] | null> {
  'use cache';
  cacheLife('realtime');
  cacheTag(`trend-${clerkUserId}-${templateId}`);

  try {
    const params = templateId ? `?templateId=${templateId}` : '';
    const history = await fetchApi<TrendDataPoint[]>(
      `${TEST_RESULTS_BASE}/user/${clerkUserId}/history${params}`,
      {
        tags: [`user-history-${clerkUserId}`],
        authHeaders,
      },
    );
    return history ?? null;
  } catch {
    return null;
  }
}
