/**
 * Fuzzy Search Module Exports
 * 
 * Client-side fuzzy search engine for skill mapping.
 * Zero-latency, no network calls.
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
  getAllSkills,
  getESCOSkills,
  getONetSkills,
  getSkillsByCategory,
  getCategories,
  getSkillStats,
  getSearchIndex,
  clearCache,
} from '@/lib/skill-data-loader';

// Search index builder
export {
  buildSearchIndex,
  processESCOSkills,
  processONetAbilities,
  processONetWorkStyles,
  processONetKnowledge,
  getIndexStats,
  type SearchIndexData,
} from '@/lib/search-index-builder';

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
