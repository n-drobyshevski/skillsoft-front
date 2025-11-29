/**
 * Skill Data Loader
 * 
 * Loads and processes ESCO and O*NET JSON data into a unified format
 * for the client-side fuzzy search engine.
 * 
 * This module provides both static imports for build-time optimization
 * and dynamic loading functions for flexibility.
 */

import { buildSearchIndex, type SearchIndexData } from '@/lib/search-index-builder';
import type {
  ESCOSkillRaw,
  ONetAbilityRaw,
  ONetWorkStyleRaw,
  ONetKnowledgeRaw,
  UnifiedSkill,
} from '@/types/skills';

// =============================================================================
// Static Imports (for build-time optimization)
// =============================================================================

// ESCO Data
import escoSkillsData from '@/data/standards/esco/skills_en.json';

// O*NET Data
import onetAbilitiesData from '@/data/standards/onet/Abilities.json';
import onetWorkStylesData from '@/data/standards/onet/WorkStyles.json';
import onetKnowledgeData from '@/data/standards/onet/Knowledge.json';

// =============================================================================
// Data Caching
// =============================================================================

let cachedIndex: SearchIndexData | null = null;

/**
 * Get or build the search index (singleton pattern for performance)
 */
export function getSearchIndex(): SearchIndexData {
  if (cachedIndex) {
    return cachedIndex;
  }
  
  cachedIndex = buildSearchIndex(
    escoSkillsData as ESCOSkillRaw[],
    onetAbilitiesData as ONetAbilityRaw[],
    onetWorkStylesData as ONetWorkStyleRaw[],
    onetKnowledgeData as ONetKnowledgeRaw[]
  );
  
  return cachedIndex;
}

/**
 * Get all unified skills from the index
 */
export function getAllSkills(): UnifiedSkill[] {
  return getSearchIndex().skills;
}

/**
 * Get ESCO skills only
 */
export function getESCOSkills(): UnifiedSkill[] {
  return getSearchIndex().bySource.esco;
}

/**
 * Get O*NET skills only
 */
export function getONetSkills(): UnifiedSkill[] {
  return getSearchIndex().bySource.onet;
}

/**
 * Get skills by category
 */
export function getSkillsByCategory(category: string): UnifiedSkill[] {
  return getSearchIndex().byCategory.get(category) || [];
}

/**
 * Get all available categories
 */
export function getCategories(): string[] {
  return Array.from(getSearchIndex().byCategory.keys()).sort();
}

/**
 * Get index statistics
 */
export function getSkillStats(): {
  total: number;
  esco: number;
  onet: number;
  categories: number;
  buildTimeMs: number;
} {
  const index = getSearchIndex();
  return {
    total: index.totalCount,
    esco: index.bySource.esco.length,
    onet: index.bySource.onet.length,
    categories: index.byCategory.size,
    buildTimeMs: Math.round(index.buildTime),
  };
}

// =============================================================================
// Lazy Loading (alternative for code splitting)
// =============================================================================

/**
 * Lazy load only ESCO data (smaller bundle for ESCO-only use cases)
 */
export async function loadESCODataLazy(): Promise<UnifiedSkill[]> {
  const { processESCOSkills } = await import('@/lib/search-index-builder');
  const escoData = await import('@/data/standards/esco/skills_en.json');
  return processESCOSkills(escoData.default as ESCOSkillRaw[]);
}

/**
 * Lazy load only O*NET abilities
 */
export async function loadONetAbilitiesLazy(): Promise<UnifiedSkill[]> {
  const { processONetAbilities } = await import('@/lib/search-index-builder');
  const abilitiesData = await import('@/data/standards/onet/Abilities.json');
  return processONetAbilities(abilitiesData.default as ONetAbilityRaw[]);
}

/**
 * Clear the cached index (useful for testing or memory management)
 */
export function clearCache(): void {
  cachedIndex = null;
}

export default getAllSkills;
