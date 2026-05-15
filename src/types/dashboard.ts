/**
 * Dashboard Types for the unified SkillSoft Dashboard.
 * Supports role-based widget rendering and aggregated data fetching.
 */

import type { FlaggedItemSummary, PsychometricHealthReport } from './psychometrics';
import type { TestSession, TestTemplateSummary, AssessmentGoal } from './domain';
import type { UserStats, User } from './user';

// DASHBOARD SUMMARY (Aggregated Data)

/**
 * Aggregated dashboard data from backend.
 * Single request to fetch all dashboard data, reducing N+1 API calls.
 */
export interface DashboardSummary {
  // Core Stats
  stats: DashboardStats;

  // User context
  currentUser?: DashboardUserInfo;

  // Psychometrics (subset for dashboard)
  psychometrics?: PsychometricSummary;

  // Activity & Lists
  recentCompletions?: RecentCompletion[];
  activeTemplates?: TestTemplateSummary[];
  pendingSessions?: TestSession[];

  // Admin only
  userStats?: UserStats;
  recentUsers?: User[];

  // Conditional data (future)
  teamAnalytics?: TeamAnalyticsSummary;
  jobFitSummary?: JobFitSummary;

  // Metadata
  generatedAt: string;
}

/**
 * Core dashboard statistics
 */
export interface DashboardStats {
  totalCompetencies: number;
  totalIndicators: number;
  totalQuestions: number;
  activeTemplates: number;
  competenciesByCategory: Record<string, number>;
  averageIndicatorsPerCompetency: number;
}

/**
 * Current user information for dashboard
 */
export interface DashboardUserInfo {
  firstName?: string;
  role: 'ADMIN' | 'EDITOR' | 'USER';
}

// PSYCHOMETRIC SUMMARY

/**
 * Psychometric summary for dashboard widget.
 * Lightweight subset of full PsychometricHealthReport.
 */
export interface PsychometricSummary {
  /** Health score 0-100 */
  healthScore: number;
  /** Number of flagged items */
  flaggedItems: number;
  /** Number of reliable competencies */
  reliableCompetencies: number;
  /** Average Cronbach's alpha */
  averageAlpha: number | null;
  /** Last audit run timestamp */
  lastAuditRun: string | null;
  /** Whether audit is recommended */
  auditRecommended: boolean;
  /** Top flagged items for preview */
  topFlaggedItems: FlaggedItemSummary[];
}

/**
 * Calculate psychometric summary from full health report
 */
export function calculatePsychometricSummary(
  report: PsychometricHealthReport
): PsychometricSummary {
  // Calculate health score based on multiple factors
  const healthScore = calculateHealthScore(report);

  // Check if audit is recommended (> 7 days since last audit)
  const auditRecommended = isAuditRecommended(report.lastAuditRun);

  return {
    healthScore,
    flaggedItems: report.flaggedItems,
    reliableCompetencies: report.reliableCompetencies,
    averageAlpha: report.averageAlpha,
    lastAuditRun: report.lastAuditRun,
    auditRecommended,
    topFlaggedItems: report.topFlaggedItems?.slice(0, 3) ?? [],
  };
}

/**
 * Calculate overall health score from psychometric report.
 * Score is 0-100 based on item quality and reliability metrics.
 */
function calculateHealthScore(report: PsychometricHealthReport): number {
  const totalItems = report.totalItems || 1;
  const totalCompetencies = report.totalCompetencies || 1;

  // Factor 1: Active items ratio (40% weight)
  const activeRatio = report.activeItems / totalItems;
  const activeScore = activeRatio * 40;

  // Factor 2: Reliable competencies ratio (30% weight)
  const reliableRatio = report.reliableCompetencies / totalCompetencies;
  const reliableScore = reliableRatio * 30;

  // Factor 3: Low flagged items ratio (20% weight)
  const flaggedRatio = Math.max(0, 1 - (report.flaggedItems / totalItems));
  const flaggedScore = flaggedRatio * 20;

  // Factor 4: Average discrimination index (10% weight)
  const discriminationScore = report.averageDiscrimination
    ? Math.min(report.averageDiscrimination / 0.3, 1) * 10
    : 5;

  return Math.round(activeScore + reliableScore + flaggedScore + discriminationScore);
}

/**
 * Check if psychometric audit is recommended.
 * Returns true if > 7 days since last audit or no audit run yet.
 */
function isAuditRecommended(lastAuditRun: string | null): boolean {
  if (!lastAuditRun) return true;

  const lastAudit = new Date(lastAuditRun);
  const daysSinceAudit = (Date.now() - lastAudit.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceAudit > 7;
}

// RECENT COMPLETION (Activity Feed)

/**
 * Recent test completion for activity feed
 */
export interface RecentCompletion {
  id: string;
  userId: string;
  userName: string;
  templateName: string;
  templateGoal: AssessmentGoal | 'OVERVIEW' | 'JOB_FIT' | 'TEAM_FIT';
  completedAt: string;
  score?: number;
  passed?: boolean;
}

// TEAM ANALYTICS (Future)

/**
 * Team analytics summary for dashboard widget
 */
export interface TeamAnalyticsSummary {
  teamId: string;
  teamName: string;
  memberCount: number;
  averageFitScore: number;
  skillCoverage: number;
  topStrengths: string[];
  topGaps: string[];
  lastAssessmentDate: string;
}

// JOB FIT (Future)

/**
 * Job fit summary for dashboard widget
 */
export interface JobFitSummary {
  totalAssessments: number;
  averageMatchScore: number;
  topMatchingJobs: Array<{
    jobTitle: string;
    onetCode: string;
    matchPercentage: number;
  }>;
  commonGaps: string[];
}

// WIDGET TYPES

/**
 * Widget priority for mobile ordering
 */
export type WidgetPriority = 'high' | 'medium' | 'low';

/**
 * Widget variant for styling
 */
export type WidgetVariant = 'default' | 'success' | 'warning' | 'info' | 'destructive';

/**
 * Stats widget trend indicator
 */
export interface TrendIndicator {
  value: string;
  label: string;
  isPositive?: boolean;
}

// HELPER FUNCTIONS

/**
 * Get health status label from score
 */
export function getHealthLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Attention';
  return 'Critical';
}

/**
 * Get health color classes based on score
 */
export function getHealthColor(score: number): { bg: string; text: string } {
  if (score >= 80) {
    return {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-600 dark:text-emerald-400',
    };
  }
  if (score >= 60) {
    return {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-600 dark:text-amber-400',
    };
  }
  return {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
  };
}
