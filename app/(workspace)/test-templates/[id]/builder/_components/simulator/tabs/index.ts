/**
 * Simulator Tabs Index
 *
 * Centralized exports for simulator tab components.
 * Includes both standard and optimized versions.
 */

// Tab components
export { default as FineTuneTab } from './FineTuneTab';
export { default as StrategyInsightsTab } from './StrategyInsightsTab';

// Optimized tabs (consolidated from legacy AnalyticsTab/TimelineTab)
export {
  TimelineTabOptimized,
  TimelineTabOptimized as TimelineTab,
  default as TimelineTabOptimizedDefault,
} from './TimelineTabOptimized';

export {
  AnalyticsTabOptimized,
  AnalyticsTabOptimized as AnalyticsTab,
  default as AnalyticsTabOptimizedDefault,
} from './AnalyticsTabOptimized';

// Re-export types for convenience
export type { SimulationResult } from '../types';
