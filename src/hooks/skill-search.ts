/**
 * Fuzzy Search Module Exports
 *
 * Client-side fuzzy search engine for skill mapping.
 * Data is loaded on-demand from pre-processed public assets.
 */

// Core search hook
export {
  useFuzzySearch,
  useExtendedFuzzySearch,
  highlightMatches,
  type UseFuzzySearchOptions,
  type FuzzySearchState,
  type FuzzySearchActions,
} from './use-fuzzy-search';

// Web Worker search hook (offloads search to separate thread)
export {
  useWorkerSearch,
  type UseWorkerSearchOptions,
  type WorkerSearchState,
  type WorkerSearchActions,
} from './use-worker-search';

// Data loading utilities
export {
  loadAllSkills,
  getCachedSkills,
  getESCOSkills,
  getONetSkills,
  getSkillsByCategory,
  getCategories,
  getSkillStats,
  clearCache,
} from '@/lib/skill-data-loader';

// Types
export type {
  UnifiedSkill,
  SkillSearchResult,
  SkillSearchMatch,
  SkillSearchFilters,
  SkillSearchConfig,
  ESCOSkillRaw,
  ESCOSkill,
  ESCOReuseLevel,
  ONetAbilityRaw,
  ONetWorkStyleRaw,
  ONetKnowledgeRaw,
  ONetElement,
  ONetOccupation,
  ONetCategory,
  BigFiveCode,
  BigFiveMapping,
  BigFiveProfile,
  SkillRecommendation,
  SkillMapperState,
} from '@/types/skills';
