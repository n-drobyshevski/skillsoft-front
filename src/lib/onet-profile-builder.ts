/**
 * O*NET Profile Builder
 *
 * Builds O*NET occupation profiles from local element data files.
 * Transforms Abilities, Knowledge, and WorkStyles data into
 * competency benchmarks for job fit assessments.
 *
 * Data Sources:
 * - Abilities.json: Cognitive abilities (e.g., Oral Comprehension, Problem Sensitivity)
 * - Knowledge.json: Knowledge areas (e.g., Engineering, Mathematics)
 * - WorkStyles.json: Work styles (e.g., Attention to Detail, Integrity)
 */

import type { ONetProfile, ONetBenchmark } from '@/types/domain';
import { getOccupationBySocCode } from './occupation-data-loader';

// Static imports for build-time optimization
import abilitiesDataRaw from '@/data/standards/onet/Abilities.json';
import knowledgeDataRaw from '@/data/standards/onet/Knowledge.json';
import workStylesDataRaw from '@/data/standards/onet/WorkStyles.json';

// =============================================================================
// Types
// =============================================================================

interface ONetElementRaw {
  'O*NET-SOC Code': string;
  Title: string;
  'Element ID': string;
  'Element Name': string;
  'Scale ID': string;
  'Scale Name': string;
  'Data Value': string;
  N?: string;
  'Standard Error'?: string;
  'Lower CI Bound'?: string;
  'Upper CI Bound'?: string;
  'Recommend Suppress'?: string;
  'Not Relevant'?: string;
  Date?: string;
  'Domain Source'?: string;
}

// =============================================================================
// Data Processing
// =============================================================================

const abilitiesData = abilitiesDataRaw as ONetElementRaw[];
const knowledgeData = knowledgeDataRaw as ONetElementRaw[];
const workStylesData = workStylesDataRaw as ONetElementRaw[];

/**
 * Filter elements by SOC code and scale type (IM = Importance, LV = Level)
 */
function filterElementsBySocCode(
  data: ONetElementRaw[],
  socCode: string,
  scaleId: 'IM' | 'LV' = 'IM'
): ONetElementRaw[] {
  return data.filter(
    (d) =>
      d['O*NET-SOC Code'] === socCode &&
      d['Scale ID'] === scaleId &&
      d['Recommend Suppress'] !== 'Y' &&
      d['Not Relevant'] !== 'Y'
  );
}

/**
 * Get top elements by importance value
 */
function getTopElements(
  elements: ONetElementRaw[],
  limit: number
): { name: string; value: number; elementId: string }[] {
  return elements
    .map((e) => ({
      name: e['Element Name'],
      value: parseFloat(e['Data Value']) || 0,
      elementId: e['Element ID'],
    }))
    .filter((e) => e.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

/**
 * Transform element data to ONetBenchmark format
 */
function elementToBenchmark(
  element: { name: string; value: number; elementId: string },
  index: number
): ONetBenchmark {
  // Generate competency code from element ID
  const codePrefix = element.elementId.split('.')[0] || 'EL';
  const competencyCode = `${codePrefix}-${String(index + 1).padStart(2, '0')}`;

  // O*NET uses 1-5 scale, convert to percentage-like score for consistency
  // Importance values typically range from 1.0 to 5.0
  const normalizedLevel = (element.value / 5) * 100;

  return {
    competencyCode,
    competencyName: element.name,
    requiredLevel: Math.round(normalizedLevel * 10) / 10, // Keep 1 decimal
    importance: element.value,
  };
}

// =============================================================================
// Profile Cache
// =============================================================================

const profileCache = new Map<string, ONetProfile>();

// =============================================================================
// Public API
// =============================================================================

/**
 * Build O*NET profile for a given SOC code from local element data.
 *
 * @param socCode - The O*NET SOC code (e.g., "15-1252.00")
 * @returns Complete ONetProfile with benchmarks, knowledge areas, and skills
 */
export function buildONetProfile(socCode: string): ONetProfile {
  // Check cache first
  const cached = profileCache.get(socCode);
  if (cached) {
    return cached;
  }

  // Get occupation title
  const occupation = getOccupationBySocCode(socCode);
  const occupationTitle = occupation?.title || 'Unknown Occupation';

  // Get importance-rated abilities for this occupation
  const abilities = filterElementsBySocCode(abilitiesData, socCode, 'IM');
  const topAbilities = getTopElements(abilities, 10);

  // Get importance-rated knowledge areas
  const knowledge = filterElementsBySocCode(knowledgeData, socCode, 'IM');
  const topKnowledge = getTopElements(knowledge, 8);

  // Get importance-rated work styles
  const workStyles = filterElementsBySocCode(workStylesData, socCode, 'IM');
  const topWorkStyles = getTopElements(workStyles, 6);

  // Build benchmarks from top abilities (primary competency indicators)
  const benchmarks: ONetBenchmark[] = topAbilities.map((ability, idx) =>
    elementToBenchmark(ability, idx)
  );

  // Extract knowledge area names
  const knowledgeAreas = topKnowledge.map((k) => k.name);

  // Extract work style names as "skills" (soft skills)
  const skills = topWorkStyles.map((w) => w.name);

  const profile: ONetProfile = {
    socCode,
    occupationTitle,
    benchmarks,
    knowledgeAreas,
    skills,
  };

  // Cache the result
  profileCache.set(socCode, profile);

  return profile;
}

/**
 * Clear profile cache (useful for testing)
 */
export function clearProfileCache(): void {
  profileCache.clear();
}

/**
 * Get profile statistics
 */
export function getProfileStats(): {
  abilitiesCount: number;
  knowledgeCount: number;
  workStylesCount: number;
  cachedProfiles: number;
} {
  return {
    abilitiesCount: abilitiesData.length,
    knowledgeCount: knowledgeData.length,
    workStylesCount: workStylesData.length,
    cachedProfiles: profileCache.size,
  };
}

export default buildONetProfile;
