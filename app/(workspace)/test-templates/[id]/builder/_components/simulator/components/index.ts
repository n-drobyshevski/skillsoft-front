/**
 * Simulator Components Index
 *
 * Centralized exports for decomposed simulator components.
 */

// Phase 1 (P0): Core decomposed components
export { SimulatorResults, default as SimulatorResultsDefault } from './SimulatorResults';
export { SimulatorTabs, default as SimulatorTabsDefault } from './SimulatorTabs';

// Phase 3 (P1): Two-phase UI components
export { PreflightWarningsAlert, default as PreflightWarningsAlertDefault } from './PreflightWarningsAlert';
export { ConfigurePhase, default as ConfigurePhaseDefault } from './ConfigurePhase';
export { ResultsPhase, default as ResultsPhaseDefault } from './ResultsPhase';

// Phase 4 (P1): Mobile priority stack components
export { FineTuneSheet, default as FineTuneSheetDefault } from './FineTuneSheet';
export { MobilePriorityStack, default as MobilePriorityStackDefault } from './MobilePriorityStack';
export { MobileResultsView } from './MobileResultsView';
