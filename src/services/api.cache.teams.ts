/**
 * Teams API Cache - Server-side caching for team data.
 *
 * Provides cached data fetching for the teams admin page using 'use cache'.
 * Uses auth-outside-cache pattern: auth headers resolved by caller, passed as params.
 *
 * Cache profiles:
 * - Teams list: entityData (5min) - teams don't change frequently
 * - Team stats: entityData (5min) - aggregate stats
 * - Team detail/profile: entityData (5min) - individual team data
 */

import { cacheLife, cacheTag } from 'next/cache';
import type {
  ManagedTeamSummary,
  ManagedTeam,
  ManagedTeamProfile,
  TeamStats,
  PageResponse,
} from '@/types/team';
import { getAuthHeaders } from './roleApi';

// Type for auth headers passed into cached functions
type AuthHeaders = Record<string, string>;

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

// ============================================================================
// Teams List
// ============================================================================

/**
 * Cached teams list fetcher.
 * Auth headers passed as params (become part of cache key).
 */
export async function getTeamsCached(
  authHeaders: AuthHeaders,
  size: number = 100,
): Promise<PageResponse<ManagedTeamSummary> | null> {
  'use cache';
  cacheLife('entityData');
  cacheTag('teams');

  try {
    const response = await fetch(
      `${getApiBaseUrl()}${TEAMS_ENDPOINT}?size=${size}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      }
    );

    if (!response.ok) return null;
    return (await response.json()) as PageResponse<ManagedTeamSummary>;
  } catch {
    return null;
  }
}

// ============================================================================
// Team Stats
// ============================================================================

/**
 * Cached team statistics fetcher.
 */
export async function getTeamStatsCached(
  authHeaders: AuthHeaders,
): Promise<TeamStats | null> {
  'use cache';
  cacheLife('entityData');
  cacheTag('team-stats');

  try {
    const response = await fetch(
      `${getApiBaseUrl()}${TEAMS_ENDPOINT}/stats`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      }
    );

    if (!response.ok) return null;
    return (await response.json()) as TeamStats;
  } catch {
    return null;
  }
}

// ============================================================================
// Team Detail
// ============================================================================

/**
 * Cached single team fetcher.
 */
export async function getTeamByIdCached(
  teamId: string,
  authHeaders: AuthHeaders,
): Promise<ManagedTeam | null> {
  'use cache';
  cacheLife('entityData');
  cacheTag('teams', `team-${teamId}`);

  try {
    const response = await fetch(
      `${getApiBaseUrl()}${TEAMS_ENDPOINT}/${teamId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      }
    );

    if (!response.ok) return null;
    return (await response.json()) as ManagedTeam;
  } catch {
    return null;
  }
}

// ============================================================================
// Team Profile
// ============================================================================

/**
 * Cached team competency profile fetcher.
 */
export async function getTeamProfileCached(
  teamId: string,
  authHeaders: AuthHeaders,
): Promise<ManagedTeamProfile | null> {
  'use cache';
  cacheLife('entityData');
  cacheTag(`team-${teamId}-profile`);

  try {
    const response = await fetch(
      `${getApiBaseUrl()}${TEAMS_ENDPOINT}/${teamId}/profile`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      }
    );

    if (!response.ok) return null;
    return (await response.json()) as ManagedTeamProfile;
  } catch {
    return null;
  }
}

// ============================================================================
// Combined Fetch (for Teams Admin Page)
// ============================================================================

export interface TeamsPageData {
  teams: ManagedTeamSummary[];
  stats: TeamStats | null;
}

/**
 * Fetch teams list and stats in parallel.
 * Primary data fetcher for the teams admin page.
 *
 * NOT cached itself -- orchestrates cached sub-calls.
 * Resolves auth headers internally (outside 'use cache' scope).
 */
export async function getTeamsPageDataCached(): Promise<TeamsPageData> {
  const authHeaders = await getAuthHeaders();

  const [teamsResponse, stats] = await Promise.all([
    getTeamsCached(authHeaders),
    getTeamStatsCached(authHeaders),
  ]);

  return {
    teams: teamsResponse?.content ?? [],
    stats,
  };
}
