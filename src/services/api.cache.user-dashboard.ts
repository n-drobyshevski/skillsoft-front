/**
 * User Dashboard API Cache - Server-side caching for user-specific dashboard data.
 *
 * Fetches sessions + results in parallel, computes personal stats server-side.
 * Uses existing backend endpoints — no new APIs needed.
 *
 * IMPORTANT: Auth headers must be resolved by the CALLER and passed as params.
 * This is because auth() is a dynamic API that cannot be called inside 'use cache'.
 *
 * Uses function-level 'use cache' (not file-level) because getUserDashboardData
 * must remain uncached — it orchestrates cached sub-calls and returns computed data.
 *
 * Cache profiles:
 * - Sessions: realtime (30s)
 * - Results: entityData (60s)
 */

import { cacheLife, cacheTag } from 'next/cache';
import type { TestSessionSummary, TestResult } from '@/types/domain';
import type {
  PersonalStats,
  AggregatedCompetency,
  BigFiveSnapshot,
  UserDashboardData,
} from '@/types/user-dashboard';
import { getAuthHeaders } from './roleApi';

type AuthHeaders = Record<string, string>;

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const versionPath = API_VERSION ? `/${API_VERSION}` : '';
  if (!apiUrl) return `http://localhost:8080/api${versionPath}`;
  const protocol = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1') ? 'http' : 'https';
  return `${protocol}://${apiUrl}/api${versionPath}`;
};

// ============================================================================
// Cached sub-fetchers
// ============================================================================

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

async function getUserSessionsCached(
  clerkUserId: string,
  authHeaders: AuthHeaders,
): Promise<TestSessionSummary[]> {
  'use cache';
  cacheLife('realtime');
  cacheTag('user-sessions', `user-sessions-${clerkUserId}`);

  try {
    const response = await fetch(
      `${getApiBaseUrl()}/tests/sessions/user/${clerkUserId}?page=0&size=100`,
      { headers: { 'Content-Type': 'application/json', ...authHeaders } },
    );
    if (!response.ok) return [];
    const data = (await response.json()) as PaginatedResponse<TestSessionSummary>;
    return data.content || [];
  } catch {
    return [];
  }
}

async function getUserResultsCached(
  clerkUserId: string,
  authHeaders: AuthHeaders,
): Promise<TestResult[]> {
  'use cache';
  cacheLife('entityData');
  cacheTag('user-results', `user-results-${clerkUserId}`);

  try {
    const response = await fetch(
      `${getApiBaseUrl()}/tests/results/user/${clerkUserId}/detailed?page=0&size=100`,
      { headers: { 'Content-Type': 'application/json', ...authHeaders } },
    );
    if (!response.ok) return [];
    const data = (await response.json()) as PaginatedResponse<TestResult>;
    return data.content || [];
  } catch {
    return [];
  }
}

// ============================================================================
// Aggregation helpers (pure functions)
// ============================================================================

function computePersonalStats(results: TestResult[]): PersonalStats | null {
  const completed = results.filter(r => r.status === 'COMPLETED' && r.overallPercentage != null);
  if (completed.length === 0) return null;

  const passCount = completed.filter(r => r.passed === true).length;
  const avgScore = Math.round(
    completed.reduce((sum, r) => sum + (r.overallPercentage ?? 0), 0) / completed.length,
  );

  return {
    testsTaken: completed.length,
    avgScore,
    passRate: `${passCount}/${completed.length}`,
    passCount,
    totalCompleted: completed.length,
  };
}

function computeTopCompetencies(results: TestResult[]): AggregatedCompetency[] {
  const completed = results.filter(r => r.status === 'COMPLETED' && r.competencyScores);
  if (completed.length < 2) return [];

  const map = new Map<string, { total: number; count: number; category?: string }>();
  for (const result of completed) {
    for (const cs of result.competencyScores ?? []) {
      const existing = map.get(cs.competencyName);
      if (existing) {
        existing.total += cs.percentage;
        existing.count += 1;
      } else {
        map.set(cs.competencyName, {
          total: cs.percentage,
          count: 1,
          category: cs.competencyCategory,
        });
      }
    }
  }

  return Array.from(map.entries())
    .map(([name, { total, count, category }]) => ({
      competencyName: name,
      competencyCategory: category,
      avgPercentage: Math.round(total / count),
      resultCount: count,
    }))
    .sort((a, b) => b.avgPercentage - a.avgPercentage)
    .slice(0, 5);
}

function extractBigFiveSnapshot(results: TestResult[]): BigFiveSnapshot | null {
  const withBigFive = results
    .filter(
      r =>
        r.status === 'COMPLETED' &&
        r.bigFiveProfile &&
        Object.keys(r.bigFiveProfile).length > 0,
    )
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  if (withBigFive.length === 0) return null;

  const source = withBigFive[0];
  return {
    profile: source.bigFiveProfile!,
    resultId: source.id,
    templateName: source.templateName,
  };
}

// ============================================================================
// Main orchestrator (NOT cached — calls cached sub-fetchers)
// ============================================================================

/**
 * Fetch and aggregate all data for the user dashboard.
 *
 * NOT cached itself — orchestrates cached sub-calls.
 * Resolves auth headers internally via getAuthHeaders() since this function
 * is NOT inside 'use cache' and can safely call dynamic APIs.
 *
 * @param clerkUserId - Clerk user ID
 * @returns Complete UserDashboardData with computed stats
 */
export async function getUserDashboardData(clerkUserId: string): Promise<UserDashboardData> {
  const authHeaders = await getAuthHeaders();

  const [sessions, results] = await Promise.all([
    getUserSessionsCached(clerkUserId, authHeaders),
    getUserResultsCached(clerkUserId, authHeaders),
  ]);

  const pendingSessions = sessions.filter(
    s => s.status === 'IN_PROGRESS' || s.status === 'NOT_STARTED',
  );

  pendingSessions.sort((a, b) => {
    if (a.status === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return -1;
    if (b.status === 'IN_PROGRESS' && a.status !== 'IN_PROGRESS') return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const completedResults = results
    .filter(r => r.status === 'COMPLETED')
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  return {
    pendingSessions,
    completedResults,
    personalStats: computePersonalStats(results),
    topCompetencies: computeTopCompetencies(results),
    bigFiveSnapshot: extractBigFiveSnapshot(results),
  };
}
