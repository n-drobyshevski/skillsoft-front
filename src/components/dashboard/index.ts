/**
 * Dashboard Components - Unified SkillSoft Dashboard System
 *
 * Architecture:
 * - Layout components: Grid, WidgetCard, Skeletons
 * - Widget components: Stats, Psychometrics, Actions, Activity, Templates
 * - Registry: Widget configuration and filtering
 * - Hooks: useDashboardWidgets for role-based filtering
 *
 * @example
 * ```tsx
 * import {
 *   DashboardGrid,
 *   WidgetCard,
 *   StatsCardsRow,
 *   PsychometricInsightsWidget,
 * } from '@/components/dashboard';
 * ```
 */

// Layout components
export {
  WidgetCard,
  DashboardGrid,
  getGridSpanClass,
  GRID_SPANS,
  WidgetSkeleton,
  StatsCardSkeleton,
  StatsRowSkeleton,
} from './layout';
export type { WidgetCardProps, GridSpan } from './layout';

// Widget components
export {
  StatsWidget,
  StatsCardsRow,
  CompactStatCard,
  CompactStatCardMobile,
  CompactStatsRow,
  PsychometricInsightsWidget,
  PsychometricHealthWidget,
  QuickActionsWidget,
  RecentActivityWidget,
  TestTemplatesWidget,
  WIDGET_REGISTRY,
  getWidgetIdsForLens,
  getWidgetConfig,
  MOBILE_WIDGET_ORDER,
} from './widgets';
export type {
  StatsWidgetProps,
  StatsCardsRowProps,
  CompactStatCardProps,
  CompactStatsRowProps,
  PsychometricInsightsWidgetProps,
  PsychometricHealthWidgetProps,
  QuickActionsWidgetProps,
  RecentActivityWidgetProps,
  TestTemplatesWidgetProps,
  WidgetConfig,
} from './widgets';

// Legacy exports (for backward compatibility)
export { default as DashboardStatsCards } from './DasboardStatsCards';
export { DashboardAccessButtons } from './dashboard-access-buttons';
export { default as QuickActionsCard } from './QuickActionsCard';
export { default as RecentActivityCard } from './RecentActivityCard';
export { default as TopCompetenciesCard } from './TopCompetenciesCard';
