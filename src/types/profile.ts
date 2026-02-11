/**
 * Profile page types for user profile, assessment summary, and competency passport.
 */

import { AssessmentGoal, TestResult } from './domain';
import { BigFiveProfile } from '@/hooks/useBigFiveProjection';

// ============================================
// USER PROFILE TYPES
// ============================================

/**
 * User info from Clerk
 */
export interface ProfileUserInfo {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  organizationName: string | null;
  createdAt: Date;
}

// ============================================
// ASSESSMENT SUMMARY TYPES
// ============================================

/**
 * Summary of a recent test result for display on profile
 */
export interface RecentTestResult {
  resultId: string;
  sessionId: string;
  templateId: string;
  templateName: string;
  goal: AssessmentGoal;
  overallPercentage: number;
  passed: boolean;
  completedAt: string;
}

/**
 * Score improvement metrics for trajectory visualization
 */
export interface ImprovementMetrics {
  /** Percentage change in average score vs previous period */
  scoreChange: number;
  /** Whether the change is positive */
  isImproving: boolean;
  /** Number of tests in comparison period */
  comparisonPeriodTests: number;
  /** Label for the comparison (e.g., "vs last month") */
  comparisonLabel: string;
}

/**
 * User's assessment summary statistics
 */
export interface AssessmentSummary {
  totalCompleted: number;
  averageScore: number;
  passRate: number;
  lastAssessmentDate: string | null;
  recentResults: RecentTestResult[];
  byGoal: {
    overview: number;
    jobFit: number;
    teamFit: number;
  };
  /** Improvement trajectory metrics */
  improvement: ImprovementMetrics | null;
  /** Profile completeness percentage (0-100) */
  profileCompleteness: number;
  /** Recent scores for sparkline visualization (oldest to newest) */
  recentScores: number[];
}

// ============================================
// COMPETENCY PASSPORT TYPES
// ============================================

/**
 * Top competency with aggregated score across assessments
 */
export interface TopCompetency {
  competencyId: string;
  competencyName: string;
  category: string;
  averageScore: number;
  assessmentCount: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Confidence level for Big Five projection
 */
export type ProjectionConfidence = 'low' | 'medium' | 'high';

/**
 * User's competency passport data
 */
export interface CompetencyPassport {
  bigFiveProfile: BigFiveProfile;
  confidence: ProjectionConfidence;
  topCompetencies: TopCompetency[];
  totalAssessmentsUsed: number;
  lastUpdated: string | null;
}

// ============================================
// PROFILE STATE TYPES
// ============================================

/**
 * Loading state for profile sections
 */
export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Granular loading state for profile sections
 */
export interface ProfileLoadingState {
  summary: LoadingStatus;
  passport: LoadingStatus;
}

/**
 * Profile error with retry information
 */
export interface ProfileError {
  message: string;
  code?: string;
  retryable: boolean;
  timestamp: Date;
}

/**
 * Profile section errors
 */
export interface ProfileErrors {
  summary: ProfileError | null;
  passport: ProfileError | null;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Transform TestResult to RecentTestResult for profile display
 */
export function toRecentTestResult(result: TestResult, goal: AssessmentGoal = AssessmentGoal.OVERVIEW): RecentTestResult {
  return {
    resultId: result.id,
    sessionId: result.sessionId,
    templateId: result.templateId,
    templateName: result.templateName,
    goal,
    overallPercentage: result.overallPercentage ?? 0,
    passed: result.passed ?? false,
    completedAt: result.completedAt,
  };
}

/**
 * Calculate confidence level based on number of assessments and mapped competencies
 */
export function calculateConfidence(assessmentCount: number, mappedCompetencies: number): ProjectionConfidence {
  if (assessmentCount >= 5 && mappedCompetencies >= 10) return 'high';
  if (assessmentCount >= 2 && mappedCompetencies >= 5) return 'medium';
  return 'low';
}

/**
 * Create empty assessment summary for new users
 */
export function createEmptyAssessmentSummary(): AssessmentSummary {
  return {
    totalCompleted: 0,
    averageScore: 0,
    passRate: 0,
    lastAssessmentDate: null,
    recentResults: [],
    byGoal: {
      overview: 0,
      jobFit: 0,
      teamFit: 0,
    },
    improvement: null,
    profileCompleteness: 0,
    recentScores: [],
  };
}

/**
 * Calculate improvement metrics from test results
 */
export function calculateImprovementMetrics(results: TestResult[]): ImprovementMetrics | null {
  if (results.length < 2) return null;

  // Sort by date descending
  const sorted = [...results].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  // Split into recent (last 30 days) and previous periods
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const recentResults = sorted.filter(r => new Date(r.completedAt) >= thirtyDaysAgo);
  const previousResults = sorted.filter(r => {
    const date = new Date(r.completedAt);
    return date >= sixtyDaysAgo && date < thirtyDaysAgo;
  });

  // If not enough data in either period, compare first half vs second half
  if (recentResults.length === 0 || previousResults.length === 0) {
    const midpoint = Math.floor(sorted.length / 2);
    const recentHalf = sorted.slice(0, midpoint);
    const previousHalf = sorted.slice(midpoint);

    if (recentHalf.length === 0 || previousHalf.length === 0) return null;

    const recentAvg = recentHalf.reduce((sum, r) => sum + (r.overallPercentage ?? 0), 0) / recentHalf.length;
    const previousAvg = previousHalf.reduce((sum, r) => sum + (r.overallPercentage ?? 0), 0) / previousHalf.length;
    const scoreChange = Math.round(recentAvg - previousAvg);

    return {
      scoreChange,
      isImproving: scoreChange > 0,
      comparisonPeriodTests: previousHalf.length,
      comparisonLabel: 'vs previous tests',
    };
  }

  const recentAvg = recentResults.reduce((sum, r) => sum + (r.overallPercentage ?? 0), 0) / recentResults.length;
  const previousAvg = previousResults.reduce((sum, r) => sum + (r.overallPercentage ?? 0), 0) / previousResults.length;
  const scoreChange = Math.round(recentAvg - previousAvg);

  return {
    scoreChange,
    isImproving: scoreChange > 0,
    comparisonPeriodTests: previousResults.length,
    comparisonLabel: 'vs last month',
  };
}

/**
 * Calculate profile completeness percentage
 */
export function calculateProfileCompleteness(
  totalTests: number,
  hasCompetencies: boolean,
  hasBigFive: boolean
): number {
  let completeness = 0;

  // Base: 20% for having profile
  completeness += 20;

  // Tests: up to 40% (10% per test, max 4 tests)
  completeness += Math.min(totalTests * 10, 40);

  // Competencies: 20%
  if (hasCompetencies) completeness += 20;

  // Big Five: 20%
  if (hasBigFive) completeness += 20;

  return Math.min(completeness, 100);
}

/**
 * Create empty competency passport for users without assessments
 */
export function createEmptyCompetencyPassport(): CompetencyPassport {
  return {
    bigFiveProfile: {
      OPENNESS: 50,
      CONSCIENTIOUSNESS: 50,
      EXTRAVERSION: 50,
      AGREEABLENESS: 50,
      EMOTIONAL_STABILITY: 50,
    },
    confidence: 'low',
    topCompetencies: [],
    totalAssessmentsUsed: 0,
    lastUpdated: null,
  };
}

/**
 * Aggregate competency scores across multiple test results
 */
export function aggregateCompetencyScores(results: TestResult[]): Map<string, {
  competencyId: string;
  competencyName: string;
  category: string;
  scores: number[];
  onetCode?: string;
}> {
  const scoreMap = new Map<string, {
    competencyId: string;
    competencyName: string;
    category: string;
    scores: number[];
    onetCode?: string;
  }>();

  results.forEach(result => {
    result.competencyScores?.forEach(score => {
      const existing = scoreMap.get(score.competencyId);
      if (existing) {
        existing.scores.push(score.percentage);
      } else {
        scoreMap.set(score.competencyId, {
          competencyId: score.competencyId,
          competencyName: score.competencyName,
          category: score.competencyCategory || 'Unknown',
          scores: [score.percentage],
          onetCode: score.onetCode,
        });
      }
    });
  });

  return scoreMap;
}

/**
 * Calculate top competencies from aggregated scores
 */
export function calculateTopCompetencies(
  scoreMap: Map<string, {
    competencyId: string;
    competencyName: string;
    category: string;
    scores: number[];
    onetCode?: string;
  }>,
  limit: number = 5
): TopCompetency[] {
  const competencies = Array.from(scoreMap.values()).map(data => {
    const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;

    // Calculate trend (simplified: compare last score to average)
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (data.scores.length >= 2) {
      const lastScore = data.scores[data.scores.length - 1];
      if (lastScore > avg + 5) trend = 'up';
      else if (lastScore < avg - 5) trend = 'down';
    }

    return {
      competencyId: data.competencyId,
      competencyName: data.competencyName,
      category: data.category,
      averageScore: Math.round(avg),
      assessmentCount: data.scores.length,
      trend,
    };
  });

  // Sort by average score descending, take top N
  return competencies
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, limit);
}
