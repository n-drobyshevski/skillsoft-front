/**
 * Dashboard Layout Components
 *
 * Base layout components for the unified dashboard:
 * - WidgetCard: Base widget wrapper
 * - DashboardGrid: Bento grid container
 * - WidgetSkeleton: Loading skeletons
 */

export { WidgetCard } from './WidgetCard';
export type { WidgetCardProps } from './WidgetCard';

export { DashboardGrid, getGridSpanClass, GRID_SPANS } from './DashboardGrid';
export type { GridSpan } from './DashboardGrid';

export { WidgetSkeleton, StatsCardSkeleton, StatsRowSkeleton } from './WidgetSkeleton';
