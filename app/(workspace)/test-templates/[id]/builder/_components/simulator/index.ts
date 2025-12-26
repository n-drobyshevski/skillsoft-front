// Re-exports for simulator components

// Main panel
export { SimulatorPanel } from './SimulatorPanel';

// Core components
export { PersonaSelector } from './PersonaSelector';
export { ScoreDisplay } from './ScoreDisplay'; // Legacy - prefer StrategyScoreDisplay
export { WarningsList } from './WarningsList';

// Strategy-aware components
export { StrategyHeroBadge } from './StrategyHeroBadge';
export { StrategyScoreDisplay } from './StrategyScoreDisplay';
export { StrategyEmptyState } from './StrategyEmptyState';
export { StrategyLoadingSkeleton } from './StrategyLoadingSkeleton';
export { SimulatorErrorBoundary } from './SimulatorErrorBoundary';

// Strategy-specific cards
export { JobFitAlignmentCard } from './JobFitAlignmentCard';
export { TeamComparisonCard } from './TeamComparisonCard';

// Strategy context and configuration
export {
  type Strategy,
  type StrategySection,
  type StrategyDisplayConfig,
  type StrategyValidation,
  type StrategyContextData,
  type JobRequirement,
  type TeamMember,
  STRATEGY_CONFIG,
  STRATEGY_HELP_CONTENT,
  getStrategyConfig,
  validateStrategy,
  getAvailableSections,
  getDefaultSection,
  computeBlueprintHash,
  personaConfig,
} from './strategy-context';

// Types
export type { SimulationProfile, SimulationResult, Difficulty, SelectionReason } from './types';
