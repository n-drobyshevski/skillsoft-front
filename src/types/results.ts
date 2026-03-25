/**
 * Result Visualization Types
 *
 * Enhanced type definitions for Phase 4 Results Enhancement.
 * Supports animated score circles, gap analysis, team saturation radar,
 * and development recommendations.
 */

import type { BigFiveDimension, CompetencyScore } from './domain';

// ============================================================================
// Score Circle Types
// ============================================================================

/**
 * Animation variants for score circles
 */
export type ScoreCircleVariant =
  | 'default'    // Blue primary color
  | 'success'    // Green for passing/high scores
  | 'warning'    // Amber for moderate scores
  | 'error'      // Red for low/failing scores
  | 'neutral';   // Gray for inactive/placeholder

/**
 * Size variants for score circles (mobile-first)
 */
export type ScoreCircleSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Props for animated score circle component
 */
export interface ScoreCircleProps {
  /** Score value (0-100) */
  value: number;
  /** Maximum value (default: 100) */
  maxValue?: number;
  /** Size variant (default: 'md') */
  size?: ScoreCircleSize;
  /** Color variant (default: 'default') */
  variant?: ScoreCircleVariant;
  /** Optional label displayed below score */
  label?: string;
  /** Optional sublabel/description */
  sublabel?: string;
  /** Whether to animate on mount (default: true) */
  animate?: boolean;
  /** Animation duration in ms (default: 1000) */
  animationDuration?: number;
  /** Stroke width for the circle (default: 8) */
  strokeWidth?: number;
  /** Whether to show the percentage symbol (default: true) */
  showPercent?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
}

/**
 * Size configuration for score circles
 */
export interface ScoreCircleSizeConfig {
  containerSize: number;
  fontSize: string;
  labelFontSize: string;
  strokeWidth: number;
  radius: number;
}

// ============================================================================
// Gap Analysis Types (JOB_FIT)
// ============================================================================

/**
 * Single data point for gap analysis visualization
 */
export interface GapDataPoint {
  /** Unique identifier */
  id: string;
  /** Display name (competency name) */
  name: string;
  /** Candidate's actual score (0-100) */
  actualScore: number;
  /** Required/benchmark score (0-100) */
  targetScore: number;
  /** Gap value (target - actual), negative means exceeds */
  gap: number;
  /** Category for grouping/coloring */
  category?: string;
  /** Weight/importance (0-1) */
  weight?: number;
  /** Confidence interval lower bound */
  ciLower?: number;
  /** Confidence interval upper bound */
  ciUpper?: number;
  /** Standard Error of Measurement */
  sem?: number;
  /** Additional metadata */
  metadata?: {
    onetCode?: string;
    escoUri?: string;
    questionsAnswered?: number;
  };
}

/**
 * Gap status classification
 */
export type GapStatus =
  | 'exceeds'    // Actual > target
  | 'meets'      // Actual ~= target (within threshold)
  | 'below'      // Actual < target but within acceptable range
  | 'critical';  // Actual significantly below target

/**
 * Props for enhanced gap analysis chart
 */
export interface GapAnalysisChartProps {
  /** Gap data points */
  data: GapDataPoint[];
  /** Passing threshold percentage (default: 70) */
  passingThreshold?: number;
  /** Tolerance for "meets" classification (default: 5) */
  meetsTolerance?: number;
  /** Chart height (default: responsive) */
  height?: number | string;
  /** Show legend (default: true) */
  showLegend?: boolean;
  /** Show grid lines (default: true) */
  showGrid?: boolean;
  /** Animate bars on mount (default: true) */
  animate?: boolean;
  /** Sort by: 'name' | 'gap' | 'score' | 'weight' */
  sortBy?: 'name' | 'gap' | 'score' | 'weight';
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Max items to display (for mobile truncation) */
  maxItems?: number;
  /** Callback when a bar is clicked */
  onBarClick?: (dataPoint: GapDataPoint) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Gap summary statistics
 */
export interface GapSummary {
  /** Average gap across all competencies */
  averageGap: number;
  /** Count of competencies exceeding target */
  exceedsCount: number;
  /** Count of competencies meeting target */
  meetsCount: number;
  /** Count of competencies below target */
  belowCount: number;
  /** Count of competencies with critical gaps */
  criticalCount: number;
  /** Overall pass/fail based on majority */
  overallStatus: GapStatus;
  /** Weighted average if weights provided */
  weightedAverageScore?: number;
}

// ============================================================================
// Team Saturation Types (TEAM_FIT)
// ============================================================================

/**
 * Single data point for team saturation radar
 */
export interface TeamSaturationDataPoint {
  /** Competency identifier */
  competencyId: string;
  /** Display name */
  competencyName: string;
  /** Candidate's score (0-100) */
  candidateScore: number;
  /** Team's average/saturation score (0-100) */
  teamSaturation: number;
  /** Ideal team saturation target (0-100) */
  targetSaturation?: number;
  /** Whether candidate fills a gap */
  fillsGap: boolean;
  /** Gap magnitude if fills gap */
  gapMagnitude?: number;
  /** Category for grouping */
  category?: string;
}

/**
 * Team role contribution classification
 */
export type TeamContributionType =
  | 'leader'        // High in leadership competencies
  | 'specialist'    // Deep expertise in specific area
  | 'generalist'    // Balanced across areas
  | 'collaborator'  // High in interpersonal skills
  | 'innovator';    // High in creativity/openness

/**
 * Props for team saturation radar chart
 */
export interface TeamSaturationRadarProps {
  /** Saturation data points */
  data: TeamSaturationDataPoint[];
  /** Show candidate line (default: true) */
  showCandidate?: boolean;
  /** Show team saturation line (default: true) */
  showTeam?: boolean;
  /** Show target saturation line (default: false) */
  showTarget?: boolean;
  /** Animate on mount (default: true) */
  animate?: boolean;
  /** Chart size (default: responsive) */
  size?: number | 'responsive';
  /** Color scheme */
  colorScheme?: {
    candidate: string;
    team: string;
    target?: string;
    fill?: string;
  };
  /** Show labels on radar points (default: true on desktop) */
  showLabels?: boolean;
  /** Callback when a point is clicked */
  onPointClick?: (dataPoint: TeamSaturationDataPoint) => void;
  /** Additional CSS classes */
  className?: string;
  /** When true, hides analysis sections (gaps, stats, growth areas) — render them externally */
  compact?: boolean;
}

/**
 * Team fit analysis result
 */
export interface TeamFitAnalysis {
  /** Overall compatibility score (0-100) */
  compatibilityScore: number;
  /** Contribution type classification */
  contributionType: TeamContributionType;
  /** Competencies where candidate fills team gaps */
  gapsFilledCompetencies: TeamSaturationDataPoint[];
  /** Competencies where team is already saturated */
  redundantCompetencies: TeamSaturationDataPoint[];
  /** Recommended areas for development to better fit team */
  developmentAreas: string[];
  /** Key strengths relative to team */
  relativeStrengths: string[];
}

// ============================================================================
// Development Recommendations Types
// ============================================================================

/**
 * Priority level for development recommendations
 */
export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Resource type for learning recommendations
 */
export type ResourceType =
  | 'course'
  | 'book'
  | 'article'
  | 'video'
  | 'workshop'
  | 'mentoring'
  | 'practice'
  | 'assessment';

/**
 * Development recommendation with actionable resources
 */
export interface DevelopmentRecommendation {
  /** Unique identifier */
  id: string;
  /** Target competency ID */
  competencyId: string;
  /** Competency name */
  competencyName: string;
  /** Current score */
  currentScore: number;
  /** Target score to achieve */
  targetScore: number;
  /** Gap to close */
  gap: number;
  /** Priority based on gap and importance */
  priority: RecommendationPriority;
  /** Short title for the recommendation */
  title: string;
  /** Detailed description */
  description: string;
  /** Estimated time to improve (in hours) */
  estimatedHours?: number;
  /** Suggested resources */
  resources?: DevelopmentResource[];
  /** Behavioral indicators to focus on */
  focusIndicators?: string[];
  /** Success metrics */
  successMetrics?: string[];
}

/**
 * Learning resource for development
 */
export interface DevelopmentResource {
  /** Resource title */
  title: string;
  /** Resource type */
  type: ResourceType;
  /** URL if available */
  url?: string;
  /** Provider/source */
  provider?: string;
  /** Duration in minutes */
  durationMinutes?: number;
  /** Whether free or paid */
  isFree?: boolean;
}

/**
 * Props for development recommendations component
 */
export interface DevelopmentRecommendationsProps {
  /** List of recommendations */
  recommendations: DevelopmentRecommendation[];
  /** Maximum recommendations to show initially */
  initialCount?: number;
  /** Show priority badges (default: true) */
  showPriority?: boolean;
  /** Show estimated time (default: true) */
  showEstimatedTime?: boolean;
  /** Show resources (default: true) */
  showResources?: boolean;
  /** Group by priority (default: false) */
  groupByPriority?: boolean;
  /** Compact mode for mobile (default: auto) */
  compact?: boolean;
  /** Callback when recommendation is clicked */
  onRecommendationClick?: (rec: DevelopmentRecommendation) => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Big Five Visualization Types
// ============================================================================

/**
 * Big Five trait display data
 */
export interface BigFiveTraitData {
  /** Trait dimension */
  trait: BigFiveDimension;
  /** Display name */
  displayName: string;
  /** Score value (0-100) */
  value: number;
  /** Description of the trait */
  description?: string;
  /** Interpretation based on score level */
  interpretation?: 'low' | 'moderate' | 'high';
  /** Color for visualization */
  color: string;
}

/**
 * Props for Big Five profile visualization
 */
export interface BigFiveProfileProps {
  /** Profile data */
  data: BigFiveTraitData[];
  /** Display variant */
  variant?: 'radar' | 'bars' | 'circles' | 'compact';
  /** Show descriptions (default: true on desktop) */
  showDescriptions?: boolean;
  /** Animate on mount (default: true) */
  animate?: boolean;
  /** Comparison data (e.g., team average) */
  comparisonData?: BigFiveTraitData[];
  /** Size (default: responsive) */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Result Transformer Types
// ============================================================================

/**
 * Options for transforming competency scores to gap data
 */
export interface GapTransformOptions {
  /** Target score if not provided per-competency */
  defaultTarget?: number;
  /** Whether to include weight calculations */
  includeWeights?: boolean;
  /** Filter by category */
  categoryFilter?: string;
  /** Minimum score to include */
  minScore?: number;
}

/**
 * Options for transforming to team saturation data
 */
export interface TeamSaturationTransformOptions {
  /** Team saturation data by competency ID */
  teamSaturation: Record<string, number>;
  /** Target saturation if not using team data */
  targetSaturation?: number;
  /** Gap threshold to consider significant (default: 20) */
  gapThreshold?: number;
}

/**
 * Options for generating development recommendations
 */
export interface RecommendationGeneratorOptions {
  /** Target scores by competency ID */
  targets: Record<string, number>;
  /** Minimum gap to generate recommendation */
  minGap?: number;
  /** Maximum recommendations to generate */
  maxRecommendations?: number;
  /** Sort by priority */
  sortByPriority?: boolean;
}

// ============================================================================
// Animation & Interaction Types
// ============================================================================

/**
 * Animation state for chart components
 */
export interface ChartAnimationState {
  isAnimating: boolean;
  progress: number;
  hasCompleted: boolean;
}

/**
 * Hover state for interactive charts
 */
export interface ChartHoverState<T = unknown> {
  isHovering: boolean;
  hoveredItem: T | null;
  position: { x: number; y: number } | null;
}

/**
 * Common chart interaction callbacks
 */
export interface ChartInteractionCallbacks<T = unknown> {
  onHover?: (item: T | null) => void;
  onClick?: (item: T) => void;
  onFocus?: (item: T) => void;
}
