/**
 * Simulator Tabs Index
 *
 * Centralized exports for simulator tab components.
 * Two merged tabs: ResultsTab and QuestionsTab.
 */

// Merged tab components
export { ResultsTab, default as ResultsTabDefault } from './ResultsTab';
export { QuestionsTab, default as QuestionsTabDefault } from './QuestionsTab';

// Re-export types for convenience
export type { SimulationResult } from '../types';
