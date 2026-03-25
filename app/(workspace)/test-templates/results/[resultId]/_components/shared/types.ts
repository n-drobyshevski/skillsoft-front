/**
 * Shared types and interfaces for test results views.
 * Supports three assessment scenarios: OVERVIEW, JOB_FIT, TEAM_FIT
 *
 * Result Status Handling:
 * - PENDING: Use ScoringPendingView (polling for completion)
 * - FAILED: Use ScoringFailedView (error recovery)
 * - COMPLETED: Use goal-specific view (Overview/JobFit/TeamFit)
 */

import { TestResult, TestTemplate, CompetencyScore, ResultStatus, TrendDataPoint } from '@/types/domain';

/**
 * Base props for all result view components.
 *
 * Note: The result.status field determines which view is rendered:
 * - PENDING: ScoringPendingView with polling
 * - FAILED: ScoringFailedView with retry
 * - COMPLETED: Goal-based view with full data
 *
 * When status is COMPLETED, score fields (overallScore, overallPercentage,
 * competencyScores) are guaranteed to be non-null.
 */
export interface BaseResultViewProps {
  result: TestResult;
  template: TestTemplate;
  /** Server-prefetched trend data — avoids client-side waterfall */
  trendData?: TrendDataPoint[] | null;
}

/**
 * Props for status-aware views (PENDING/FAILED).
 * Same as BaseResultViewProps but with explicit status context.
 */
export interface StatusViewProps extends BaseResultViewProps {
  /** Callback when result transitions to a new status */
  onStatusChange?: (newStatus: ResultStatus) => void;
}

/**
 * Props for Overview (Scenario A) result view
 * Purpose: Build psychological profile (Competency Passport)
 */
export interface OverviewResultViewProps extends BaseResultViewProps {
  // No additional props needed - uses competencyScores for Big Five projection
}

/**
 * Props for Job Fit (Scenario B) result view
 * Purpose: Evaluate candidate against O*NET job benchmarks
 */
export interface JobFitResultViewProps extends BaseResultViewProps {
  onetSocCode?: string; // From template.blueprint.onet_soc_code
}

/**
 * Props for Team Fit (Scenario C) result view
 * Purpose: Analyze team fit and complementary skills
 */
export interface TeamFitResultViewProps extends BaseResultViewProps {
  teamId?: string; // From template.blueprint.team_id
}

/**
 * Hero section props for Competency Passport (Scenario A)
 */
export interface CompetencyPassportHeroProps {
  templateName: string;
  completedAt: string;
  questionsAnswered: number;
  totalQuestions: number;
  timeSpent: number;
  competencyCount: number;
}

/**
 * Hero section props for Job Fit (Scenario B)
 */
export interface JobFitHeroProps {
  templateName: string;
  completedAt: string;
  overallPercentage: number;
  passed: boolean;
  onetSocCode?: string;
  questionsAnswered: number;
  totalQuestions: number;
  timeSpent: number;
  percentile?: number;
}

/**
 * Hero section props for Team Fit (Scenario C)
 */
export interface TeamFitHeroProps {
  templateName: string;
  completedAt: string;
  overallPercentage: number;
  passed: boolean;
  teamId?: string;
  teamName?: string;
  questionsAnswered: number;
  totalQuestions: number;
  timeSpent: number;
}

/**
 * Props for competency detail accordion (reusable across scenarios)
 */
export interface CompetencyDetailAccordionProps {
  competencies: CompetencyScore[];
  showPassFail?: boolean; // Whether to show pass/fail color coding
  passingScore?: number;
}

/**
 * Action button types for different scenarios
 */
export type ActionType =
  | 'download_profile'
  | 'download_report'
  | 'retake'
  | 'save_to_profile'
  | 'share'
  | 'back_to_list'
  | 'team_dashboard'
  | 'share_with_team'
  | 'manager_summary';

/**
 * Props for action buttons bar
 */
export interface ActionButtonsBarProps {
  templateId: string;
  resultId: string;
  actions: ActionType[];
  /** Required when 'manager_summary' action is included */
  result?: import('@/types/domain').TestResult;
  /** Required when 'manager_summary' action is included */
  template?: import('@/types/domain').TestTemplate;
}

/**
 * Factory function return type
 */
export type ResultViewComponent = React.ComponentType<BaseResultViewProps>;

// ============================================================================
// Direction B "Command Center" Dashboard Types
// ============================================================================

export type HeroVariant = 'success' | 'warning' | 'info' | 'neutral';

export interface HeroStripProps {
  goal: 'OVERVIEW' | 'JOB_FIT' | 'TEAM_FIT';
  templateName: string;
  completedAt: string;
  totalTimeSeconds: number;
  questionsAnswered: number;
  totalQuestions: number;
  overallPercentage?: number | null;
  passed?: boolean | null;
  percentile?: number | null;
  /** e.g. "QUALIFIED", "COMPATIBLE", or null for OVERVIEW */
  statusLabel?: string;
  statusVariant: HeroVariant;
  /** Extra metadata pills (e.g. O*NET code, team info) */
  metadata?: HeroMetadataItem[];
  /** Action button types to render */
  actions: ActionType[];
  result: import('@/types/domain').TestResult;
  template: import('@/types/domain').TestTemplate;
}

export interface HeroMetadataItem {
  icon: React.ElementType;
  label: string;
}

export interface ResultTabDefinition {
  id: string;
  label: string;
  icon: React.ElementType;
}

export interface InsightPill {
  id: string;
  icon: React.ElementType;
  text: string;
  variant: 'success' | 'warning' | 'info';
}

export interface DashboardPanelProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  iconVariant?: 'default' | 'success' | 'warning' | 'info';
  /** Help tooltip text shown next to the title */
  tooltip?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export interface MetricCardItem {
  label: string;
  value: number | string;
  icon: React.ElementType;
  variant: 'success' | 'warning' | 'info' | 'default';
  /** Text below the value (default: "competencies") */
  sublabel?: string;
  /** Optional mini sparkline bars to display within the card */
  sparklines?: Array<{ name: string; value: number }>;
  /** Help tooltip text shown next to the label */
  tooltip?: string;
}
