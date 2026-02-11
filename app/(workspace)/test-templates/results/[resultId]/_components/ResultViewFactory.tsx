'use client';

import { AssessmentGoal, ResultStatus } from '@/types/domain';
import { BaseResultViewProps, ResultViewComponent } from './shared/types';
import { OverviewResultView } from './overview/OverviewResultView';
import { JobFitResultView } from './job-fit/JobFitResultView';
import { TeamFitResultView } from './team-fit/TeamFitResultView';
import { ScoringPendingView } from './status/ScoringPendingView';
import { ScoringFailedView } from './status/ScoringFailedView';

/**
 * Factory function to select the appropriate result view based on assessment goal.
 *
 * Implements Strategy pattern for scenario-appropriate visualizations:
 * - OVERVIEW: Competency Passport (Big Five profile, no scores/badges)
 * - JOB_FIT: Job Assessment (gap analysis with O*NET benchmarks)
 * - TEAM_FIT: Team Compatibility (team comparison, complementary skills)
 *
 * @param goal - Assessment goal from template
 * @returns Component for rendering the result view
 */
export function getResultViewComponent(goal: AssessmentGoal): ResultViewComponent {
  const viewMap: Record<AssessmentGoal, ResultViewComponent> = {
    [AssessmentGoal.OVERVIEW]: OverviewResultView,
    [AssessmentGoal.JOB_FIT]: JobFitResultView,
    [AssessmentGoal.TEAM_FIT]: TeamFitResultView,
  };

  return viewMap[goal] ?? OverviewResultView; // Default to OVERVIEW
}

/**
 * Type guard to check if result has PENDING status.
 * Used for safe status checking with proper TypeScript narrowing.
 */
function isPendingResult(status: ResultStatus | undefined): status is 'PENDING' {
  return status === 'PENDING';
}

/**
 * Type guard to check if result has FAILED status.
 * Used for safe status checking with proper TypeScript narrowing.
 */
function isFailedResult(status: ResultStatus | undefined): status is 'FAILED' {
  return status === 'FAILED';
}

/**
 * Wrapper component that handles result status routing.
 *
 * Status-based routing:
 * 1. PENDING -> ScoringPendingView (with polling for updates)
 * 2. FAILED -> ScoringFailedView (with retry options)
 * 3. COMPLETED -> Appropriate goal-based view
 *
 * This implements the Saga compensation pattern on the frontend:
 * - Backend may return PENDING status if scoring is still in progress
 * - Frontend polls for updates until COMPLETED or FAILED
 * - FAILED status shows recovery options (retry, contact support)
 *
 * @example
 * ```tsx
 * // In page.tsx (Server Component)
 * <ResultViewWrapper result={result} template={template} />
 * ```
 */
export function ResultViewWrapper({ result, template }: BaseResultViewProps) {
  // Handle PENDING status - show loading UI with polling
  if (isPendingResult(result.status)) {
    return <ScoringPendingView result={result} template={template} />;
  }

  // Handle FAILED status - show error recovery UI
  if (isFailedResult(result.status)) {
    return <ScoringFailedView result={result} template={template} />;
  }

  // COMPLETED status - render appropriate goal-based view
  const ViewComponent = getResultViewComponent(template.goal);
  return <ViewComponent result={result} template={template} />;
}

/**
 * Export status utilities for use in other components
 */
export { isPendingResult, isFailedResult };
