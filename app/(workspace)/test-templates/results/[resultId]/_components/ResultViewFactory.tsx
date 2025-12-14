'use client';

import { AssessmentGoal } from '@/types/domain';
import { BaseResultViewProps, ResultViewComponent } from './shared/types';
import { OverviewResultView } from './overview/OverviewResultView';
import { JobFitResultView } from './job-fit/JobFitResultView';
import { TeamFitResultView } from './team-fit/TeamFitResultView';

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
 * Wrapper component that selects and renders the appropriate result view.
 * Use this in page.tsx for automatic scenario delegation.
 */
export function ResultViewWrapper({ result, template }: BaseResultViewProps) {
  const ViewComponent = getResultViewComponent(template.goal);

  return <ViewComponent result={result} template={template} />;
}
