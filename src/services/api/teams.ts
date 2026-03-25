import { getAuthHeaders } from '../roleApi';
import { fetchApi } from './core';

import type { Team, TeamProfile } from '@/types/domain';

const TEAMS_BASE = '/teams';

export const teamsApi = {
  /**
   * Get all teams for the current organization.
   * Used for team selection dropdown in TEAM_FIT configuration.
   */
  getAllTeams: async (): Promise<Team[]> => {
    try {
      const authHeaders = await getAuthHeaders();
      // Backend returns a Spring Page object, extract content array
      const pageResponse = await fetchApi<{ content: Team[] }>(TEAMS_BASE, {
        tags: ['teams'],
        revalidate: 60, // Cache for 1 minute
        authHeaders,
      });
      return pageResponse?.content || [];
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      return [];
    }
  },

  /**
   * Get team profile with saturation analysis.
   * Shows which competencies are under-represented in the team.
   */
  getTeamProfile: async (teamId: string): Promise<TeamProfile> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEAMS_BASE}/${teamId}/profile`, {
      tags: [`team-profile-${teamId}`],
      revalidate: 60, // Cache for 1 minute
      authHeaders,
      silentStatusCodes: [403, 404], // 403: user lacks team access; 404: non-ACTIVE teams
    });
  },
};
