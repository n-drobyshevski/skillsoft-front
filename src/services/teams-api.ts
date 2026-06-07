/**
 * Teams API Service
 *
 * Provides API functions for team management operations.
 * Supports TEAM_FIT assessment scenarios.
 */

import { getAuthHeaders } from './roleApi';
import { createLogger } from '@/lib/logger';
import {
  ManagedTeam,
  ManagedTeamSummary,
  ManagedTeamProfile,
  ManagedTeamMember,
  TeamStats,
  TeamStatus,
  CreateTeamRequest,
  UpdateTeamRequest,
  AddMembersRequest,
  SetLeaderRequest,
  ActivationResult,
  MemberAdditionResult,
  LeaderChangeResult,
  FitScoreResult,
  PageResponse,
} from '@/types/team';
import type { TemplateShare, AddTeamTemplateRequest } from '@/types/domain';
import {
  createApiError,
  createNetworkError,
  ErrorCode,
  getErrorCategory,
  getUserFriendlyMessage,
  isBackendErrorResponse,
  BackendErrorResponse,
} from '@/types/errors';

const log = createLogger('TeamsAPI');

// API Version configuration
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const versionPath = API_VERSION ? `/${API_VERSION}` : '';
  if (!apiUrl) {
    return `http://localhost:8080/api${versionPath}`;
  }
  const protocol = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1') ? 'http' : 'https';
  return `${protocol}://${apiUrl}/api${versionPath}`;
};

const TEAMS_ENDPOINT = '/teams';

// ERROR HANDLING

async function parseErrorResponse(response: Response): Promise<BackendErrorResponse | null> {
  try {
    const text = await response.text();
    if (!text.trim()) return null;
    const data: unknown = JSON.parse(text);
    if (isBackendErrorResponse(data)) return data;
    if (typeof data === 'object' && data !== null && 'message' in data) {
      const errorObj = data as { message: unknown; code?: unknown; details?: unknown };
      return {
        status: response.status,
        message: String(errorObj.message),
        code: typeof errorObj.code === 'string' ? errorObj.code : undefined,
        details: typeof errorObj.details === 'string' ? errorObj.details : undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function handleResponse<T>(response: Response, silentStatusCodes: number[] = []): Promise<T> {
  if (!response.ok) {
    const backendError = await parseErrorResponse(response);
    const category = getErrorCategory(response.status);

    let message: string;
    if (backendError?.message) {
      message = backendError.message;
    } else {
      message = getUserFriendlyMessage(category);
    }

    const error = createApiError(message, response.status, backendError || undefined);

    if (!silentStatusCodes.includes(response.status)) {
      log.error('API Error', {
        status: response.status,
        message,
        url: response.url,
      });
    }

    throw error;
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return null as T;
  }

  try {
    return await response.json();
  } catch {
    return null as T;
  }
}

async function fetchTeamsApi<T>(
  endpoint: string,
  options: RequestInit & {
    tags?: string[];
    revalidate?: false | 0 | number;
    cache?: RequestCache;
    authHeaders?: Record<string, string>;
    silentStatusCodes?: number[];
  } = {}
): Promise<T> {
  const { tags = [], revalidate, cache = 'force-cache', authHeaders = {}, silentStatusCodes = [], ...fetchOptions } = options;

  try {
    const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...fetchOptions.headers,
      },
      next: {
        tags,
        revalidate,
      },
      cache,
      mode: 'cors',
      credentials: 'include',
    });

    return handleResponse<T>(response, silentStatusCodes);
  } catch (error) {
    if (error instanceof Error && 'category' in error) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.message.includes('CORS') || error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        const networkError = createNetworkError(error);
        networkError.code = ErrorCode.CORS_ERROR;
        throw networkError;
      }

      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        log.warn(`Connection failed for ${endpoint} - returning fallback data`);
        return null as T;
      }
    }

    const unknownError = createApiError('An unexpected error occurred', 0);
    unknownError.code = ErrorCode.INTERNAL_ERROR;
    throw unknownError;
  }
}

// TEAMS API

export interface TeamsListParams {
  status?: TeamStatus;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const teamsApi = {
  // ==================== Team CRUD ====================

  /**
   * Get paginated list of teams.
   */
  getTeams: async (params: TeamsListParams = {}): Promise<PageResponse<ManagedTeamSummary>> => {
    const authHeaders = await getAuthHeaders();
    const queryParams = new URLSearchParams();

    if (params.status) queryParams.set('status', params.status);
    if (params.search) queryParams.set('search', params.search);
    if (params.page !== undefined) queryParams.set('page', params.page.toString());
    if (params.size !== undefined) queryParams.set('size', params.size.toString());
    if (params.sort) queryParams.set('sort', params.sort);

    const queryString = queryParams.toString();
    const endpoint = `${TEAMS_ENDPOINT}${queryString ? `?${queryString}` : ''}`;

    return fetchTeamsApi<PageResponse<ManagedTeamSummary>>(endpoint, {
      tags: ['teams'],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Get team by ID with full details.
   */
  getTeamById: async (teamId: string): Promise<ManagedTeam | null> => {
    const authHeaders = await getAuthHeaders();
    return fetchTeamsApi<ManagedTeam>(`${TEAMS_ENDPOINT}/${teamId}`, {
      tags: [`team-${teamId}`],
      revalidate: 60,
      authHeaders,
      silentStatusCodes: [404],
    });
  },

  /**
   * Create a new team.
   */
  createTeam: async (data: CreateTeamRequest): Promise<ManagedTeam> => {
    const authHeaders = await getAuthHeaders();
    return fetchTeamsApi<ManagedTeam>(TEAMS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(data),
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Update team name/description.
   */
  updateTeam: async (teamId: string, data: UpdateTeamRequest): Promise<ManagedTeam> => {
    const authHeaders = await getAuthHeaders();
    return fetchTeamsApi<ManagedTeam>(`${TEAMS_ENDPOINT}/${teamId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Archive (soft delete) a team.
   */
  archiveTeam: async (teamId: string): Promise<void> => {
    const authHeaders = await getAuthHeaders();
    await fetchTeamsApi<void>(`${TEAMS_ENDPOINT}/${teamId}`, {
      method: 'DELETE',
      cache: 'no-store',
      authHeaders,
    });
  },

  // ==================== Team Lifecycle ====================

  /**
   * Activate a team (DRAFT -> ACTIVE).
   */
  activateTeam: async (teamId: string): Promise<ActivationResult> => {
    const authHeaders = await getAuthHeaders();
    return fetchTeamsApi<ActivationResult>(`${TEAMS_ENDPOINT}/${teamId}/activate`, {
      method: 'POST',
      cache: 'no-store',
      authHeaders,
    });
  },

  // ==================== Member Management ====================

  /**
   * Get team members.
   */
  getTeamMembers: async (teamId: string): Promise<ManagedTeamMember[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchTeamsApi<ManagedTeamMember[]>(`${TEAMS_ENDPOINT}/${teamId}/members`, {
      tags: [`team-${teamId}-members`],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Add members to a team.
   */
  addMembers: async (teamId: string, data: AddMembersRequest): Promise<MemberAdditionResult> => {
    const authHeaders = await getAuthHeaders();
    return fetchTeamsApi<MemberAdditionResult>(`${TEAMS_ENDPOINT}/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Remove a member from a team.
   */
  removeMember: async (teamId: string, userId: string): Promise<void> => {
    const authHeaders = await getAuthHeaders();
    await fetchTeamsApi<void>(`${TEAMS_ENDPOINT}/${teamId}/members/${userId}`, {
      method: 'DELETE',
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Set or change team leader.
   */
  setLeader: async (teamId: string, data: SetLeaderRequest): Promise<LeaderChangeResult> => {
    const authHeaders = await getAuthHeaders();
    return fetchTeamsApi<LeaderChangeResult>(`${TEAMS_ENDPOINT}/${teamId}/leader`, {
      method: 'PUT',
      body: JSON.stringify(data),
      cache: 'no-store',
      authHeaders,
    });
  },

  // ==================== Team Profile & Analytics ====================

  /**
   * Get team competency profile (for TEAM_FIT assessments).
   */
  getTeamProfile: async (teamId: string): Promise<ManagedTeamProfile | null> => {
    const authHeaders = await getAuthHeaders();
    return fetchTeamsApi<ManagedTeamProfile>(`${TEAMS_ENDPOINT}/${teamId}/profile`, {
      tags: [`team-${teamId}-profile`],
      revalidate: 300, // 5 minutes (profile is computed, can be cached longer)
      authHeaders,
      silentStatusCodes: [404],
    });
  },

  /**
   * Get team skill gaps (undersaturated competencies).
   */
  getSkillGaps: async (teamId: string, threshold: number = 0.3): Promise<string[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchTeamsApi<string[]>(`${TEAMS_ENDPOINT}/${teamId}/gaps?threshold=${threshold}`, {
      tags: [`team-${teamId}-gaps`],
      revalidate: 300,
      authHeaders,
    });
  },

  /**
   * Calculate fit score for a candidate against team gaps.
   */
  calculateFitScore: async (teamId: string, candidateCompetencies: Record<string, number>): Promise<FitScoreResult> => {
    const authHeaders = await getAuthHeaders();
    return fetchTeamsApi<FitScoreResult>(`${TEAMS_ENDPOINT}/${teamId}/fit-score`, {
      method: 'POST',
      body: JSON.stringify(candidateCompetencies),
      cache: 'no-store',
      authHeaders,
    });
  },

  // ==================== Current User's Teams ====================

  /**
   * Get teams where current user is a member.
   */
  getMyTeams: async (): Promise<ManagedTeamSummary[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchTeamsApi<ManagedTeamSummary[]>(`${TEAMS_ENDPOINT}/my-teams`, {
      tags: ['my-teams'],
      revalidate: 60,
      authHeaders,
    });
  },

  // ==================== Shared Templates (Tests) ====================

  /**
   * List all test templates currently shared with a team.
   * Powers the admin team "Tests" tab.
   */
  getSharedTemplates: async (teamId: string): Promise<TemplateShare[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchTeamsApi<TemplateShare[]>(`${TEAMS_ENDPOINT}/${teamId}/shared-templates`, {
      tags: [`team-${teamId}-templates`],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Grant a team access to a test template (add a test directly to the team).
   */
  addTemplateToTeam: async (
    teamId: string,
    data: AddTeamTemplateRequest
  ): Promise<TemplateShare> => {
    const authHeaders = await getAuthHeaders();
    return fetchTeamsApi<TemplateShare>(`${TEAMS_ENDPOINT}/${teamId}/shared-templates`, {
      method: 'POST',
      body: JSON.stringify(data),
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Remove (revoke) a team's access to a test template by share id.
   */
  removeTemplateFromTeam: async (teamId: string, shareId: string): Promise<void> => {
    const authHeaders = await getAuthHeaders();
    await fetchTeamsApi<void>(`${TEAMS_ENDPOINT}/${teamId}/shared-templates/${shareId}`, {
      method: 'DELETE',
      cache: 'no-store',
      authHeaders,
    });
  },

  // ==================== Statistics ====================

  /**
   * Get team statistics.
   */
  getStats: async (): Promise<TeamStats> => {
    const authHeaders = await getAuthHeaders();
    return fetchTeamsApi<TeamStats>(`${TEAMS_ENDPOINT}/stats`, {
      tags: ['team-stats'],
      revalidate: 60,
      authHeaders,
    });
  },
};

// Export for backwards compatibility with other patterns
export default teamsApi;
