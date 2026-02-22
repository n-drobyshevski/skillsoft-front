/**
 * Simulator Hooks Index
 *
 * Centralized exports for all simulator-related hooks.
 */

export {
  useStrategyTabs,
  useAvailableStrategyTabs,
  useDefaultTab,
  type TabConfig,
} from './useStrategyTabs';

export {
  usePreflightValidation,
  usePreflightWarnings,
  type PreflightWarning,
  type PreflightValidationResult,
} from './usePreflightValidation';
