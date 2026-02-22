/**
 * O*NET Occupation Data Loader
 *
 * Loads and indexes O*NET occupation data from local JSON files
 * for frontend-only job title search and profile building.
 *
 * This follows the same pattern as skill-data-loader.ts for consistency.
 */

import Fuse from 'fuse.js';
import type { ONetJobTitle } from '@/types/domain';

// Static import for build-time optimization
import occupationDataRaw from '@/data/standards/onet/OccupationData.json';

// =============================================================================
// Types
// =============================================================================

interface OccupationRaw {
  'O*NET-SOC Code': string;
  Title: string;
  Description: string;
}

// =============================================================================
// Data Transformation
// =============================================================================

const occupationData = occupationDataRaw as OccupationRaw[];

/**
 * Transform raw occupation data to ONetJobTitle format
 */
function transformOccupation(raw: OccupationRaw): ONetJobTitle {
  return {
    socCode: raw['O*NET-SOC Code'],
    title: raw.Title,
    description: raw.Description,
  };
}

// Pre-transform all data for faster access
const allOccupations: ONetJobTitle[] = occupationData.map(transformOccupation);

// =============================================================================
// Search Index (Fuse.js)
// =============================================================================

let fuseIndex: Fuse<ONetJobTitle> | null = null;

/**
 * Get or build the Fuse.js search index (singleton pattern)
 */
function getSearchIndex(): Fuse<ONetJobTitle> {
  if (fuseIndex) {
    return fuseIndex;
  }

  fuseIndex = new Fuse(allOccupations, {
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'description', weight: 0.3 },
    ],
    threshold: 0.35,
    includeScore: true,
    minMatchCharLength: 2,
    ignoreLocation: true,
  });

  return fuseIndex;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Search occupations by title, description, or SOC code.
 * Exact SOC code matches are prioritized, followed by Fuse.js fuzzy results.
 */
export function searchOccupations(query: string, limit = 15): ONetJobTitle[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  // Check for exact or partial SOC code match (e.g. "15-1252", "15-1252.00")
  const socCodePattern = /^\d{2}-?\d{0,4}\.?\d{0,2}$/;
  if (socCodePattern.test(trimmed)) {
    const codeQuery = trimmed.toLowerCase();
    const codeMatches = allOccupations
      .filter((o) => o.socCode.toLowerCase().startsWith(codeQuery))
      .slice(0, limit);
    if (codeMatches.length > 0) {
      return codeMatches;
    }
  }

  const fuse = getSearchIndex();
  const results = fuse.search(trimmed, { limit });

  return results.map((r) => r.item);
}

/**
 * Get occupation by exact SOC code.
 */
export function getOccupationBySocCode(socCode: string): ONetJobTitle | null {
  return allOccupations.find((o) => o.socCode === socCode) ?? null;
}

/**
 * Get popular/common job titles for quick selection.
 * Returns a curated list of high-demand occupations.
 */
export function getPopularOccupations(limit = 10): ONetJobTitle[] {
  // Curated list of popular SOC codes (high-demand jobs)
  const popularSocCodes = [
    '15-1252.00', // Software Developers
    '15-1299.08', // Computer Scientists
    '11-1021.00', // General and Operations Managers
    '13-2011.00', // Accountants and Auditors
    '29-1141.00', // Registered Nurses
    '41-4012.00', // Sales Representatives
    '13-1111.00', // Management Analysts
    '15-1211.00', // Computer Systems Analysts
    '17-2199.00', // Engineers, All Other
    '13-1161.00', // Market Research Analysts
    '15-1244.00', // Network and Computer Systems Administrators
    '43-6014.00', // Secretaries and Administrative Assistants
    '11-3021.00', // Computer and Information Systems Managers
    '15-1232.00', // Computer User Support Specialists
    '13-1071.00', // Human Resources Specialists
  ];

  const popular: ONetJobTitle[] = [];

  for (const socCode of popularSocCodes) {
    const occupation = getOccupationBySocCode(socCode);
    if (occupation) {
      popular.push(occupation);
    }
    if (popular.length >= limit) {
      break;
    }
  }

  return popular;
}

/**
 * Get all occupations (use with caution - large dataset)
 */
export function getAllOccupations(): ONetJobTitle[] {
  return allOccupations;
}

/**
 * Get occupation statistics
 */
export function getOccupationStats(): {
  total: number;
  indexed: boolean;
} {
  return {
    total: allOccupations.length,
    indexed: fuseIndex !== null,
  };
}

/**
 * Clear the search index cache (useful for testing)
 */
export function clearOccupationCache(): void {
  fuseIndex = null;
}

export default searchOccupations;
