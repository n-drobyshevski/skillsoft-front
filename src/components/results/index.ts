/**
 * Result Visualization Components
 *
 * Phase 4 components for enhanced test result presentation.
 * Mobile-first design with animated visualizations.
 */

export {
  ScoreCircle,
  MiniScoreCircle,
  ScoreRing,
  getVariantFromScore,
} from './ScoreCircle';

export {
  GapAnalysisChart,
  GapBar,
  GapLegend,
  calculateGapSummary,
  getGapStatus,
} from './GapAnalysisChart';

export {
  TeamSaturationRadar,
  analyzeTeamFit,
} from './TeamSaturationRadar';

export {
  DevelopmentRecommendations,
  RecommendationCard,
} from './DevelopmentRecommendations';

export {
  TrendLineChart,
  CompetencySparkline,
  ImprovementBadge,
  TrendOverview,
} from './trends';
