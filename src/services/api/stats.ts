import { getAuthHeaders } from '../roleApi';
import { fetchApi } from './core';

const STATS_BASE = '/stats';

export interface NavigationBadgeCounts {
  inProgressTests: number;
  sharedTemplates: number;
  pendingCompetencies: number;
  flaggedItems: number;
  newUsers: number;
}

export const statsApi = {
  /**
   * Get badge counts for the navigation sidebar.
   * Used by useNavigationBadgeCounts() to display live counters.
   * Revalidates every 60 seconds.
   */
  getNavigationBadgeCounts: async (clerkUserId?: string): Promise<NavigationBadgeCounts> => {
    const authHeaders = await getAuthHeaders();
    const params = clerkUserId ? `?clerkUserId=${encodeURIComponent(clerkUserId)}` : '';
    return fetchApi(`${STATS_BASE}/navigation-badges${params}`, {
      revalidate: 60,
      authHeaders,
    });
  },
};
