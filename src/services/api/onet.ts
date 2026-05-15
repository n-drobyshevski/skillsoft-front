import { searchOccupations, getPopularOccupations } from '@/lib/occupation-data-loader';
import { getONetProfileAction } from '@/app/actions/onet-actions';

import type { ONetJobTitle, ONetProfile } from '@/types/domain';

// O*NET API (Hybrid: Local Data + Server Action)
//
// Job title search uses local JSON (0.33 MB OccupationData.json).
// Profile building delegates to a server action to avoid bundling
// ~75 MB of raw O*NET element data client-side.

export const onetApi = {
  /**
   * Search O*NET job titles by title or keyword.
   * Uses Fuse.js fuzzy search on local occupation data.
   */
  searchJobTitles: async (query: string, limit = 15): Promise<ONetJobTitle[]> => {
    if (!query.trim()) {
      return [];
    }
    return searchOccupations(query, limit);
  },

  /**
   * Get detailed O*NET profile for an occupation.
   * Delegates to server action (data stays server-side).
   */
  getProfile: async (socCode: string): Promise<ONetProfile> => {
    return getONetProfileAction(socCode);
  },

  /**
   * Get popular/common job titles for quick selection.
   * Returns curated list of high-demand occupations.
   */
  getPopularJobTitles: async (): Promise<ONetJobTitle[]> => {
    return getPopularOccupations(10);
  },
};
