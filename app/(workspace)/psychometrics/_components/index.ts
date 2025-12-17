/**
 * Psychometrics Module Shared Components
 *
 * This barrel export provides all shared components used across
 * the psychometrics module pages.
 */

// Badge components for status display
export { ValidityStatusBadge } from './ValidityStatusBadge';
export { ReliabilityStatusBadge } from './ReliabilityStatusBadge';

// Stats and dashboard components
export { PsychometricStatsCards } from './PsychometricStatsCards';
export { FlaggedItemsTable } from './FlaggedItemsTable';
export { CompetencyReliabilityCard, CompetencyReliabilityListItem } from './CompetencyReliabilityCard';
export { TriggerAuditButton } from './TriggerAuditButton';
export { DashboardHero } from './DashboardHero';
export {
  ActionableInsightCard,
  ActionableInsightsList,
  SingleInsightCard,
} from './ActionableInsightCard';

// Metric display components
export {
  MetricCell,
  MetricCellCompact,
  MetricBadge,
  type MetricType,
} from './MetricCell';

// Filter components
export {
  QuickFilterPills,
  StatusFilterPills,
  ReliabilityFilterPills,
  type FilterOption,
} from './QuickFilterPills';

// Empty state components
export {
  EmptyState,
  NoItemsFound,
  NoDataYet,
  AllItemsValid,
  NoFlaggedItems,
  SearchNoResults,
  InsufficientData,
  type EmptyStateVariant,
} from './EmptyState';

// Batch action components
export {
  BatchActionToolbar,
  PsychometricBatchToolbar,
  useBatchSelection,
} from './BatchActionToolbar';

// Help tooltip components
export {
  HelpTooltip,
  LabelWithHelp,
  DifficultyHelp,
  DiscriminationHelp,
  CronbachAlphaHelp,
  ValidityStatusHelp,
  ResponseCountHelp,
  BigFiveHelp,
  AverageDiscriminationHelp,
  AverageAlphaHelp,
  ActiveItemsHelp,
  ReliableCompetenciesHelp,
  FlaggedItemsHelp,
  TableHeaderWithHelp,
  psychometricHelp,
  // Section header helpers
  ItemStatusSectionHelp,
  CompetencyReliabilitySectionHelp,
  BigFiveReliabilitySectionHelp,
  // Item status helpers
  ActiveStatusHelp,
  ProbationStatusHelp,
  FlaggedForReviewStatusHelp,
  RetiredStatusHelp,
  // Competency reliability helpers
  ReliableCompetencyStatusHelp,
  AcceptableCompetencyStatusHelp,
  UnreliableCompetencyStatusHelp,
  InsufficientDataCompetencyHelp,
  // Big Five reliability status helpers
  ReliableTraitStatusHelp,
  AcceptableTraitStatusHelp,
  UnreliableTraitStatusHelp,
  InsufficientDataTraitHelp,
  // Big Five trait helpers
  TraitOpennessHelp,
  TraitConscientiousnessHelp,
  TraitExtraversionHelp,
  TraitAgreeablenessHelp,
  TraitEmotionalStabilityHelp,
  // Summary metrics helpers
  AverageBigFiveAlphaHelp,
  // Dashboard Hero helpers
  HealthScoreHelp,
  HealthScoreBreakdownHelp,
  ActiveItemsWeightHelp,
  ReliableCompetenciesWeightHelp,
  NonFlaggedItemsWeightHelp,
  HeroTotalItemsHelp,
  HeroActiveRateHelp,
  HeroIssuesHelp,
  // Item Quality Scatter chart helpers
  ItemQualityMapHelp,
  ZoneOptimalHelp,
  ZoneTooEasyHelp,
  ZoneTooHardHelp,
  ZoneToxicHelp,
} from './PsychometricHelpTooltip';

// Chart components
export {
  ItemQualityScatter,
  ReliabilityGauge,
  ReliabilityGaugeMini,
  DifficultyDistributionChart,
  DiscriminationDistributionChart,
  MetricDistributionCharts,
} from './charts';

// Mobile card components
export { MobileItemCard, MobileItemCardList } from './MobileItemCard';
export { MobileCompetencyCard, MobileCompetencyCardList } from './MobileCompetencyCard';

// Mobile-responsive utility components
export { MobileChartsSection } from './MobileChartsSection';

// Semi-circular gauge components
export {
  SemiCircularGauge,
  DifficultyGauge,
  DiscriminationGauge,
  AlphaGauge,
  DIFFICULTY_ZONES,
  DISCRIMINATION_ZONES,
  ALPHA_ZONES,
  type GaugeZone,
} from './SemiCircularGauge';

// Stat pill components
export { StatPill, StatPillGroup } from './StatPill';

// Metric comparison components
export { MetricComparisonRow, MetricComparisonList } from './MetricComparisonRow';

// Suggested actions components
export {
  SuggestedActionsCard,
  InlineActionsList,
  type SuggestedAction,
} from './SuggestedActionsCard';

// Similar items components
export {
  SimilarItemsCard,
  FlaggedItemsList,
  type SimilarItem,
} from './SimilarItemsCard';

// Re-export ValidityStatusIcon
export { ValidityStatusIcon } from './ValidityStatusBadge';
