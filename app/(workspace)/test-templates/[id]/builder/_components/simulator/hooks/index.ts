/**
 * Simulator Hooks Index
 *
 * Centralized exports for all simulator-related hooks.
 */

export {
  useStrategyTabs,
  useAvailableStrategyTabs,
  useDefaultTab,
  useStrategyTabsSplit,
  getTabComponentType,
  TAB_COMPONENT_MAP,
  type TabConfig,
} from './useStrategyTabs';

export {
  usePreflightValidation,
  usePreflightWarnings,
  type PreflightWarning,
  type PreflightValidationResult,
} from './usePreflightValidation';

// Performance hooks
export {
  useChartDefer,
  useLazyLoad,
  useChartPreload,
} from './useChartDefer';
