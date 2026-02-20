// Data display components barrel export
export { default as CompetencyCard } from './CompetencyCard';
export { default as CompetencyCardGrid } from './CompetencyCardGrid';
export { default as CompetencyTable } from './CompetencyTable';
export { EntityStatsCards, default as EntityStatsCardsDefault } from './EntityStatsCards';
export { default as FlexibleStatsCards } from './FlexibleStatsCards';
export { default as MobileStatsCard } from './MobileStatsCard';
export { default as ResponsiveStatsCards } from './ResponsiveStatsCards';
export { SSRSafeChart } from './SSRSafeChart';
export { default as StatsCard } from './StatsCard';
export { default as EntitiesTable } from './Table';
export { default as TableSkeleton } from './TableSkeleton';

// Unified stats card (Phase E consolidation - replaces 8 historical variants)
export { UnifiedStatsCard, UnifiedStatsGrid } from './UnifiedStatsCard';
export type {
  UnifiedStatsCardProps,
  UnifiedStatsCardTrend,
  UnifiedStatsGridProps,
} from './UnifiedStatsCard';

// Charts sub-module
export * from './charts';
