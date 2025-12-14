/**
 * Shared types and interfaces for test results views.
 * Supports three assessment scenarios: OVERVIEW, JOB_FIT, TEAM_FIT
 */

import { TestResult, TestTemplate, CompetencyScore } from '@/types/domain';

/**
 * Base props for all result view components
 */
export interface BaseResultViewProps {
  result: TestResult;
  template: TestTemplate;
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
  questionsAnswered: number;
  totalQuestions: number;
  timeSpent: number;
}

/**
 * Props for profile competencies card (neutral presentation)
 */
export interface ProfileCompetenciesCardProps {
  competencies: CompetencyScore[];
  showAsProfile?: boolean; // true = neutral colors, false = pass/fail colors
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
  | 'share_with_team';

/**
 * Props for action buttons bar
 */
export interface ActionButtonsBarProps {
  templateId: string;
  resultId: string;
  actions: ActionType[];
}

/**
 * Factory function return type
 */
export type ResultViewComponent = React.ComponentType<BaseResultViewProps>;
