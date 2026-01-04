/**
 * Strategy Mapping Utilities
 *
 * Provides bidirectional mapping between frontend and backend strategy names.
 *
 * Frontend (Builder UI): UNIVERSAL_BASELINE, TARGETED_FIT, DYNAMIC_GAP_ANALYSIS
 * Backend (Jackson/Domain): OVERVIEW, JOB_FIT, TEAM_FIT
 */

export type Strategy = 'UNIVERSAL_BASELINE' | 'TARGETED_FIT' | 'DYNAMIC_GAP_ANALYSIS';
export type BackendStrategy = 'OVERVIEW' | 'JOB_FIT' | 'TEAM_FIT';

const STRATEGY_TO_BACKEND: Record<Strategy, BackendStrategy> = {
  UNIVERSAL_BASELINE: 'OVERVIEW',
  TARGETED_FIT: 'JOB_FIT',
  DYNAMIC_GAP_ANALYSIS: 'TEAM_FIT',
};

const BACKEND_TO_STRATEGY: Record<BackendStrategy, Strategy> = {
  OVERVIEW: 'UNIVERSAL_BASELINE',
  JOB_FIT: 'TARGETED_FIT',
  TEAM_FIT: 'DYNAMIC_GAP_ANALYSIS',
};

/**
 * Convert frontend strategy to backend strategy name
 */
export function toBackendStrategy(strategy: Strategy): BackendStrategy {
  return STRATEGY_TO_BACKEND[strategy];
}

/**
 * Convert backend strategy to frontend strategy name
 */
export function fromBackendStrategy(backendStrategy: string): Strategy {
  return BACKEND_TO_STRATEGY[backendStrategy as BackendStrategy] || 'UNIVERSAL_BASELINE';
}
