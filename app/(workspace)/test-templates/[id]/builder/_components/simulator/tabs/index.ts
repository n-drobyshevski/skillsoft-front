/**
 * Simulator Tabs Index
 *
 * Centralized exports for simulator tab components.
 * Includes both standard and optimized versions.
 */

// Standard tabs (default exports)
export { default as TimelineTab } from './TimelineTab';
export { default as AnalyticsTab } from './AnalyticsTab';
export { default as FineTuneTab } from './FineTuneTab';
export { default as StrategyInsightsTab } from './StrategyInsightsTab';

// Optimized tabs (performance-enhanced)
export {
  TimelineTabOptimized,
  default as TimelineTabOptimizedDefault,
} from './TimelineTabOptimized';

export {
  AnalyticsTabOptimized,
  default as AnalyticsTabOptimizedDefault,
} from './AnalyticsTabOptimized';

// Re-export types for convenience
export type { SimulationResult } from '../types';
