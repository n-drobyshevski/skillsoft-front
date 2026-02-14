import { searchOccupations, getPopularOccupations } from '@/lib/occupation-data-loader';
import { buildONetProfile } from '@/lib/onet-profile-builder';

import type { ONetJobTitle, ONetProfile } from '@/types/domain';

// ============================================
// O*NET API (Frontend-Only, Local Data)
// ============================================
//
// Uses local JSON data files instead of backend API calls.
// Data sources: OccupationData.json, Abilities.json, Knowledge.json, WorkStyles.json
// This follows the same pattern as ESCO/O*NET standards integration for competencies.

export const onetApi = {
  /**
   * Search O*NET job titles by title or keyword.
   * Uses Fuse.js fuzzy search on local occupation data.
   */
  searchJobTitles: async (query: string, limit = 15): Promise<ONetJobTitle[]> => {
    if (!query.trim()) {
      return [];
    }
    // Use local data loader with fuzzy search
    return searchOccupations(query, limit);
  },

  /**
   * Get detailed O*NET profile for an occupation.
   * Builds profile from local element data (Abilities, Knowledge, WorkStyles).
   */
  getProfile: async (socCode: string): Promise<ONetProfile> => {
    // Build profile from local JSON data
    return buildONetProfile(socCode);
  },

  /**
   * Get popular/common job titles for quick selection.
   * Returns curated list of high-demand occupations.
   */
  getPopularJobTitles: async (): Promise<ONetJobTitle[]> => {
    // Return popular occupations from local data
    return getPopularOccupations(10);
  },
};
