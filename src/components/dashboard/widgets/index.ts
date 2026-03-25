/**
 * Dashboard Widget Components
 *
 * Individual widget implementations for the unified dashboard:
 * - StatsWidget: Metric display with trends (legacy)
 * - CompactStatsWidget: Compact inline stats row (new)
 * - PsychometricInsightsWidget: Health score gauge (sidebar)
 * - PsychometricHealthWidget: Enlarged health widget (main content)
 * - QuickActionsWidget: Role-based action shortcuts
 * - RecentActivityWidget: Activity feed
 * - TestTemplatesWidget: Available assessments
 */

export { StatsWidget, StatsCardsRow } from './StatsWidget';
export type { StatsWidgetProps, StatsCardsRowProps } from './StatsWidget';

// Compact stats components (new)
export { CompactStatCard, CompactStatCardMobile, CompactStatsRow } from './CompactStatsWidget';
export type { CompactStatCardProps, CompactStatsRowProps } from './CompactStatsWidget';

export { PsychometricInsightsWidget } from './PsychometricInsightsWidget';
export type { PsychometricInsightsWidgetProps } from './PsychometricInsightsWidget';

// Enlarged psychometric health widget (new)
export { PsychometricHealthWidget } from './PsychometricHealthWidget';
export type { PsychometricHealthWidgetProps } from './PsychometricHealthWidget';

export { QuickActionsWidget } from './QuickActionsWidget';
export type { QuickActionsWidgetProps } from './QuickActionsWidget';

export { RecentActivityWidget } from './RecentActivityWidget';
export type { RecentActivityWidgetProps } from './RecentActivityWidget';

export { TestTemplatesWidget } from './TestTemplatesWidget';
export type { TestTemplatesWidgetProps } from './TestTemplatesWidget';

// User dashboard widgets
export { UserOnboardingCard } from './UserOnboardingCard';
export { UserActionBanner } from './UserActionBanner';
export { UserStatsRow } from './UserStatsRow';
export { RecentResultsGrid } from './RecentResultsGrid';
export { TopCompetenciesWidget } from './TopCompetenciesWidget';
export { BigFiveCompactWidget } from './BigFiveCompactWidget';

// Registry
export { WIDGET_REGISTRY, getWidgetIdsForLens, getWidgetConfig, MOBILE_WIDGET_ORDER } from './widget-registry';
export type { WidgetConfig } from './widget-registry';
