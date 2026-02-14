import { getAuthHeaders } from '../roleApi';
import { fetchApi, USE_MOCK_API } from './core';

import type { Team, TeamProfile } from '@/types/domain';

const TEAMS_BASE = '/teams';

/**
 * Mock teams for development when backend is not available.
 */
const MOCK_TEAMS: Team[] = [
  { id: 'team-1', name: 'Engineering Team', memberCount: 8, createdAt: '2024-01-15' },
  { id: 'team-2', name: 'Product Team', memberCount: 5, createdAt: '2024-02-20' },
  { id: 'team-3', name: 'Design Team', memberCount: 4, createdAt: '2024-03-10' },
  { id: 'team-4', name: 'Marketing Team', memberCount: 6, createdAt: '2024-01-25' },
  { id: 'team-5', name: 'Sales Team', memberCount: 10, createdAt: '2024-04-05' },
];

export const teamsApi = {
  /**
   * Get all teams for the current organization.
   * Used for team selection dropdown in TEAM_FIT configuration.
   */
  getAllTeams: async (): Promise<Team[]> => {
    if (USE_MOCK_API) {
      return MOCK_TEAMS;
    }

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
      console.warn('Teams API not available, using mock data:', error);
      return MOCK_TEAMS;
    }
  },

  /**
   * Get team profile with saturation analysis.
   * Shows which competencies are under-represented in the team.
   */
  getTeamProfile: async (teamId: string): Promise<TeamProfile> => {
    if (USE_MOCK_API) {
      const team = MOCK_TEAMS.find(t => t.id === teamId);
      return {
        teamId,
        teamName: team?.name || 'Unknown Team',
        saturation: {
          'Problem Solving': 0.85,
          'Communication': 0.60,
          'Leadership': 0.40,
          'Technical Skills': 0.95,
          'Adaptability': 0.55,
          'Teamwork': 0.75,
        },
        undersaturatedCompetencies: ['Leadership', 'Adaptability', 'Communication'],
        memberSkills: [],
      };
    }

    try {
      const authHeaders = await getAuthHeaders();
      return await fetchApi(`${TEAMS_BASE}/${teamId}/profile`, {
        tags: [`team-profile-${teamId}`],
        revalidate: 60, // Cache for 1 minute
        authHeaders,
        silentStatusCodes: [404], // Team profile may not exist for non-ACTIVE teams
      });
    } catch (error) {
      console.warn('Team profile API not available, using mock data:', error);
      const team = MOCK_TEAMS.find(t => t.id === teamId);
      return {
        teamId,
        teamName: team?.name || 'Unknown Team',
        saturation: {
          'Problem Solving': 0.85,
          'Leadership': 0.40,
          'Adaptability': 0.55,
        },
        undersaturatedCompetencies: ['Leadership', 'Adaptability'],
        memberSkills: [],
      };
    }
  },
};
