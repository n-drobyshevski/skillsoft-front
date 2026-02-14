/**
 * Dashboard API Cache - Server-side caching for dashboard data.
 *
 * Provides aggregated dashboard data fetching with caching via 'use cache'.
 * Reduces N+1 API calls by batching data requirements.
 *
 * Uses function-level 'use cache' (not file-level) because getDashboardDataFresh
 * must remain uncached for post-mutation fresh fetches.
 */

import { cacheLife, cacheTag } from 'next/cache';
import {
  competenciesApi,
  testTemplatesApi,
  usersApi,
  assessmentQuestionsApi,
} from '@/services/api';
import { getPsychometricsDashboardCached } from '@/services/api.cache.psychometrics';
import type { Competency, TestTemplateSummary } from '@/types/domain';
import type { UserStats, User } from '@/types/user';
import type { PsychometricHealthReport } from '@/types/psychometrics';
import type {
  DashboardSummary,
  DashboardStats,
  PsychometricSummary,
} from '@/types/dashboard';
import { calculatePsychometricSummary } from '@/types/dashboard';

/**
 * Fetch all dashboard data in parallel.
 * Shared implementation used by both cached and fresh variants.
 *
 * @param clerkUserId - Current user's Clerk ID (optional, part of cache key)
 * @param userRole - Current user's role for conditional data fetching
 * @param authHeaders - Pre-resolved auth headers for psychometrics API calls
 */
async function fetchDashboardData(
  clerkUserId?: string,
  userRole?: 'ADMIN' | 'EDITOR' | 'USER',
  authHeaders?: Record<string, string>
): Promise<DashboardSummary> {
  const isAdmin = userRole === 'ADMIN';
  const isEditor = userRole === 'EDITOR' || isAdmin;

  // Parallel fetch all required data
  // Auth headers are passed through to API calls that need them (auth-outside-cache pattern).
  // This avoids calling getAuthHeaders() (which uses headers()) inside a 'use cache' scope.
  const resolvedAuth = authHeaders ?? {};
  const [
    competenciesResult,
    templatesResult,
    questionsResult,
    userStatsResult,
    recentUsersResult,
    psychometricsResult,
  ] = await Promise.all([
    competenciesApi.getAllCompetencies().catch(() => []),
    testTemplatesApi.getActiveTemplates(resolvedAuth).catch(() => []),
    assessmentQuestionsApi.getAllQuestions().catch(() => []),
    // Admin-only data
    isAdmin ? usersApi.getUserStats(resolvedAuth).catch(() => null) : Promise.resolve(null),
    isAdmin ? usersApi.getAllUsers(resolvedAuth).catch(() => []) : Promise.resolve([]),
    // Editor/Admin psychometric data
    isEditor ? fetchPsychometricHealth(resolvedAuth).catch(() => null) : Promise.resolve(null),
  ]);

  // Type-safe data extraction
  const competencies: Competency[] = Array.isArray(competenciesResult) ? competenciesResult : [];
  const templates: TestTemplateSummary[] = Array.isArray(templatesResult) ? templatesResult : [];
  const questions = Array.isArray(questionsResult) ? questionsResult : [];
  const recentUsers: User[] = Array.isArray(recentUsersResult) ? recentUsersResult.slice(0, 5) : [];

  // Calculate dashboard stats
  const stats: DashboardStats = {
    totalCompetencies: competencies.length,
    totalIndicators: competencies.reduce(
      (sum, comp) => sum + (comp.behavioralIndicators?.length || 0),
      0
    ),
    totalQuestions: questions.length,
    activeTemplates: templates.filter(t => t.isActive).length,
    competenciesByCategory: calculateCategoryDistribution(competencies),
    averageIndicatorsPerCompetency: calculateAverageIndicators(competencies),
  };

  // Map user stats
  const userStats: UserStats | undefined = userStatsResult
    ? {
        totalUsers: userStatsResult.totalUsers,
        activeUsers: userStatsResult.activeUsers,
        byRole: {
          admin: userStatsResult.byRole?.ADMIN || 0,
          editor: userStatsResult.byRole?.EDITOR || 0,
          user: userStatsResult.byRole?.USER || 0,
        },
        recentlyActive: userStatsResult.activeUsers,
      }
    : undefined;

  // Calculate psychometric summary if available
  const psychometrics: PsychometricSummary | undefined = psychometricsResult
    ? calculatePsychometricSummary(psychometricsResult)
    : undefined;

  return {
    stats,
    psychometrics,
    activeTemplates: templates.filter(t => t.isActive),
    userStats,
    recentUsers,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Fetch psychometric health report.
 * Uses the cached psychometrics API for request deduplication.
 *
 * @param authHeaders - Pre-resolved auth headers (auth-outside-cache pattern)
 */
async function fetchPsychometricHealth(authHeaders: Record<string, string>): Promise<PsychometricHealthReport | null> {
  try {
    return await getPsychometricsDashboardCached(authHeaders);
  } catch {
    return null;
  }
}

/**
 * Calculate competency count by category.
 */
function calculateCategoryDistribution(competencies: Competency[]): Record<string, number> {
  const distribution: Record<string, number> = {};

  competencies.forEach(comp => {
    const category = comp.category || 'UNCATEGORIZED';
    distribution[category] = (distribution[category] || 0) + 1;
  });

  return distribution;
}

/**
 * Calculate average indicators per competency.
 */
function calculateAverageIndicators(competencies: Competency[]): number {
  if (competencies.length === 0) return 0;

  const totalIndicators = competencies.reduce(
    (sum, comp) => sum + (comp.behavioralIndicators?.length || 0),
    0
  );

  return Number((totalIndicators / competencies.length).toFixed(1));
}

/**
 * Cached dashboard data fetcher.
 *
 * Uses function-level 'use cache' with realtime profile.
 * clerkUserId and userRole automatically become part of the cache key,
 * so different roles get separate cache entries (max 3: ADMIN, EDITOR, USER).
 *
 * @param clerkUserId - Current user's Clerk ID (optional, part of cache key)
 * @param userRole - Current user's role for conditional data fetching
 * @param authHeaders - Pre-resolved auth headers for psychometrics API calls (auth-outside-cache pattern)
 * @returns DashboardSummary with all dashboard data
 */
export async function getDashboardDataCached(
  clerkUserId?: string,
  userRole?: 'ADMIN' | 'EDITOR' | 'USER',
  authHeaders?: Record<string, string>
): Promise<DashboardSummary> {
  'use cache';
  cacheLife('realtime');
  cacheTag('dashboard', 'competencies', 'templates', 'questions');

  return fetchDashboardData(clerkUserId, userRole, authHeaders);
}

/**
 * Fetch dashboard data without caching.
 * Use when you need fresh data (e.g., after mutations).
 */
export async function getDashboardDataFresh(
  clerkUserId?: string,
  userRole?: 'ADMIN' | 'EDITOR' | 'USER'
): Promise<DashboardSummary> {
  return fetchDashboardData(clerkUserId, userRole);
}

/**
 * Fetch only stats (lightweight version).
 * Useful for polling or quick refresh.
 *
 * @param authHeaders - Pre-resolved auth headers (auth-outside-cache pattern).
 *   Required because getAuthHeaders() uses headers() which cannot be called inside 'use cache'.
 */
export async function getDashboardStatsCached(
  authHeaders: Record<string, string>,
): Promise<DashboardStats | null> {
  'use cache';
  cacheLife('realtime');
  cacheTag('dashboard-stats');

  try {
    const [competencies, templates, questions] = await Promise.all([
      competenciesApi.getAllCompetencies().catch(() => []),
      testTemplatesApi.getActiveTemplates(authHeaders).catch(() => []),
      assessmentQuestionsApi.getAllQuestions().catch(() => []),
    ]);

    const competencyList = Array.isArray(competencies) ? competencies : [];
    const templateList = Array.isArray(templates) ? templates : [];
    const questionList = Array.isArray(questions) ? questions : [];

    return {
      totalCompetencies: competencyList.length,
      totalIndicators: competencyList.reduce(
        (sum, comp: Competency) => sum + (comp.behavioralIndicators?.length || 0),
        0
      ),
      totalQuestions: questionList.length,
      activeTemplates: templateList.filter((t: TestTemplateSummary) => t.isActive).length,
      competenciesByCategory: calculateCategoryDistribution(competencyList as Competency[]),
      averageIndicatorsPerCompetency: calculateAverageIndicators(competencyList as Competency[]),
    };
  } catch {
    return null;
  }
}

// ============================================================================
// Section-level fetchers for Suspense streaming
// ============================================================================

/**
 * Data shape returned by the main column fetcher.
 * Contains stats, templates, and psychometrics for the primary content area.
 */
export interface MainColumnData {
  stats: DashboardStats;
  templates: TestTemplateSummary[];
  psychometrics?: PsychometricSummary;
}

/**
 * Data shape returned by the side column fetcher.
 * Contains admin-only user stats and activity data.
 */
export interface SideColumnData {
  userStats: UserStats | null;
}

/**
 * Cached fetcher for the main content column (stats + templates + psychometrics).
 *
 * Used by the DashboardMainSection Suspense boundary to independently stream
 * the primary content area (chart, psychometric health, progress, templates).
 *
 * @param userRole - Current user's role for conditional psychometrics fetching
 * @param authHeaders - Pre-resolved auth headers for psychometrics API calls
 */
export async function getMainColumnDataCached(
  userRole?: 'ADMIN' | 'EDITOR' | 'USER',
  authHeaders?: Record<string, string>,
): Promise<MainColumnData | null> {
  'use cache';
  cacheLife('realtime');
  cacheTag('dashboard-main', 'competencies', 'templates', 'questions');

  const isAdmin = userRole === 'ADMIN';
  const isEditor = userRole === 'EDITOR' || isAdmin;

  try {
    const resolvedAuth = authHeaders ?? {};
    const [competencies, templates, questions, psychometricsResult] = await Promise.all([
      competenciesApi.getAllCompetencies().catch(() => []),
      testTemplatesApi.getActiveTemplates(resolvedAuth).catch(() => []),
      assessmentQuestionsApi.getAllQuestions().catch(() => []),
      isEditor ? fetchPsychometricHealth(resolvedAuth).catch(() => null) : Promise.resolve(null),
    ]);

    const competencyList: Competency[] = Array.isArray(competencies) ? competencies : [];
    const templateList: TestTemplateSummary[] = Array.isArray(templates) ? templates : [];
    const questionList = Array.isArray(questions) ? questions : [];

    const stats: DashboardStats = {
      totalCompetencies: competencyList.length,
      totalIndicators: competencyList.reduce(
        (sum, comp) => sum + (comp.behavioralIndicators?.length || 0),
        0,
      ),
      totalQuestions: questionList.length,
      activeTemplates: templateList.filter(t => t.isActive).length,
      competenciesByCategory: calculateCategoryDistribution(competencyList),
      averageIndicatorsPerCompetency: calculateAverageIndicators(competencyList),
    };

    const psychometrics: PsychometricSummary | undefined = psychometricsResult
      ? calculatePsychometricSummary(psychometricsResult)
      : undefined;

    return {
      stats,
      templates: templateList.filter(t => t.isActive),
      psychometrics,
    };
  } catch {
    return null;
  }
}

/**
 * Cached fetcher for the side column (admin user stats).
 *
 * Used by the DashboardSideSection Suspense boundary to independently stream
 * the sidebar content (quick actions, activity, admin user stats).
 *
 * Only fetches admin-specific data when userRole is ADMIN;
 * returns null userStats for other roles.
 *
 * @param userRole - Current user's role for conditional data fetching
 * @param authHeaders - Pre-resolved auth headers (auth-outside-cache pattern)
 */
export async function getSideColumnDataCached(
  userRole?: 'ADMIN' | 'EDITOR' | 'USER',
  authHeaders?: Record<string, string>,
): Promise<SideColumnData> {
  'use cache';
  cacheLife('realtime');
  cacheTag('dashboard-side', 'users');

  const isAdmin = userRole === 'ADMIN';

  try {
    const userStatsResult = isAdmin
      ? await usersApi.getUserStats(authHeaders).catch(() => null)
      : null;

    const userStats: UserStats | null = userStatsResult
      ? {
          totalUsers: userStatsResult.totalUsers,
          activeUsers: userStatsResult.activeUsers,
          byRole: {
            admin: userStatsResult.byRole?.ADMIN || 0,
            editor: userStatsResult.byRole?.EDITOR || 0,
            user: userStatsResult.byRole?.USER || 0,
          },
          recentlyActive: userStatsResult.activeUsers,
        }
      : null;

    return { userStats };
  } catch {
    return { userStats: null };
  }
}
