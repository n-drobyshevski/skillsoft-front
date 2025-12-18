/**
 * Dashboard API Cache - Server-side caching for dashboard data.
 *
 * Provides aggregated dashboard data fetching with caching via unstable_cache.
 * Reduces N+1 API calls by batching data requirements.
 *
 * Note: Uses unstable_cache because cacheComponents is disabled in next.config.ts
 * due to Clerk compatibility.
 */

import { unstable_cache } from 'next/cache';
import {
  competenciesApi,
  testTemplatesApi,
  usersApi,
  assessmentQuestionsApi,
  psychometricsApi,
} from '@/services/api';
import { getPsychometricsDashboardCached } from '@/services/api.cache.psychometrics';
import type { Competency, TestTemplateSummary, TestSession } from '@/types/domain';
import type { UserStats, User } from '@/types/user';
import type { PsychometricHealthReport } from '@/types/psychometrics';
import type {
  DashboardSummary,
  DashboardStats,
  DashboardUserInfo,
  PsychometricSummary,
  RecentCompletion
} from '@/types/dashboard';
import { calculatePsychometricSummary } from '@/types/dashboard';

// Cache revalidation times (in seconds)
const REALTIME_REVALIDATE = 30; // 30 seconds for real-time data
const DASHBOARD_REVALIDATE = 60; // 1 minute for dashboard overview

/**
 * Fetch all dashboard data in parallel.
 * This is the internal fetcher used by the cached function.
 */
async function fetchDashboardData(
  clerkUserId?: string,
  userRole?: 'ADMIN' | 'EDITOR' | 'USER'
): Promise<DashboardSummary> {
  const isAdmin = userRole === 'ADMIN';
  const isEditor = userRole === 'EDITOR' || isAdmin;

  // Parallel fetch all required data
  const [
    competenciesResult,
    templatesResult,
    questionsResult,
    userStatsResult,
    recentUsersResult,
    psychometricsResult,
  ] = await Promise.all([
    competenciesApi.getAllCompetencies().catch(() => []),
    testTemplatesApi.getActiveTemplates().catch(() => []),
    assessmentQuestionsApi.getAllQuestions().catch(() => []),
    // Admin-only data
    isAdmin ? usersApi.getUserStats().catch(() => null) : Promise.resolve(null),
    isAdmin ? usersApi.getAllUsers().catch(() => []) : Promise.resolve([]),
    // Editor/Admin psychometric data
    isEditor ? fetchPsychometricHealth().catch(() => null) : Promise.resolve(null),
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
 */
async function fetchPsychometricHealth(): Promise<PsychometricHealthReport | null> {
  try {
    return await getPsychometricsDashboardCached();
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
 * Uses Next.js unstable_cache for server-side caching.
 * Cache invalidation tags: 'dashboard', 'competencies', 'templates', etc.
 *
 * @param clerkUserId - Current user's Clerk ID (optional)
 * @param userRole - Current user's role for conditional data fetching
 * @returns DashboardSummary with all dashboard data
 *
 * @example
 * ```tsx
 * // In a server component
 * const dashboardData = await getDashboardDataCached(userId, 'ADMIN');
 * ```
 */
export const getDashboardDataCached = unstable_cache(
  fetchDashboardData,
  ['dashboard-summary'],
  {
    revalidate: DASHBOARD_REVALIDATE,
    tags: ['dashboard', 'competencies', 'templates', 'questions'],
  }
);

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
 */
export async function getDashboardStatsCached(): Promise<DashboardStats | null> {
  try {
    const [competencies, templates, questions] = await Promise.all([
      competenciesApi.getAllCompetencies().catch(() => []),
      testTemplatesApi.getActiveTemplates().catch(() => []),
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
