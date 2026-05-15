/**
 * Skill Data Loader
 *
 * Loads pre-processed skill data from public assets for the
 * client-side fuzzy search engine. Data is fetched on-demand
 * rather than statically bundled to minimize initial JS payload.
 */

import type { UnifiedSkill } from '@/types/skills';

// Data Fetching

let cachedSkills: UnifiedSkill[] | null = null;
let loadPromise: Promise<UnifiedSkill[]> | null = null;

/**
 * Load all unified skills from the pre-processed public asset.
 * Returns cached data on subsequent calls.
 */
export async function loadAllSkills(): Promise<UnifiedSkill[]> {
  if (cachedSkills) {
    return cachedSkills;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = fetch('/data/standards/unified-skills.json')
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to load skills data: ${res.status}`);
      }
      return res.json() as Promise<UnifiedSkill[]>;
    })
    .then((skills) => {
      cachedSkills = skills;
      loadPromise = null;
      return skills;
    })
    .catch((err) => {
      loadPromise = null;
      throw err;
    });

  return loadPromise;
}

/**
 * Get cached skills synchronously (returns empty if not yet loaded).
 * Use loadAllSkills() to ensure data is available.
 */
export function getCachedSkills(): UnifiedSkill[] {
  return cachedSkills ?? [];
}

/**
 * Get ESCO skills only (requires data to be loaded first)
 */
export function getESCOSkills(skills: UnifiedSkill[]): UnifiedSkill[] {
  return skills.filter((s) => s.source === 'esco');
}

/**
 * Get O*NET skills only (requires data to be loaded first)
 */
export function getONetSkills(skills: UnifiedSkill[]): UnifiedSkill[] {
  return skills.filter((s) => s.source === 'onet');
}

/**
 * Get skills by category
 */
export function getSkillsByCategory(
  skills: UnifiedSkill[],
  category: string
): UnifiedSkill[] {
  return skills.filter((s) => s.category === category);
}

/**
 * Get all available categories
 */
export function getCategories(skills: UnifiedSkill[]): string[] {
  const cats = new Set<string>();
  for (const skill of skills) {
    cats.add(skill.category);
  }
  return Array.from(cats).sort();
}

/**
 * Get skill statistics
 */
export function getSkillStats(skills: UnifiedSkill[]): {
  total: number;
  esco: number;
  onet: number;
  categories: number;
} {
  let esco = 0;
  let onet = 0;
  const categories = new Set<string>();

  for (const skill of skills) {
    if (skill.source === 'esco') esco++;
    else onet++;
    categories.add(skill.category);
  }

  return { total: skills.length, esco, onet, categories: categories.size };
}

/**
 * Clear the cached data (useful for testing or memory management)
 */
export function clearCache(): void {
  cachedSkills = null;
  loadPromise = null;
}
