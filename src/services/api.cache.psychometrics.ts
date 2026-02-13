/**
 * Server-side Cached API Functions for Psychometrics
 *
 * Migrated from React cache() to Next.js 16 'use cache' directive for
 * cross-request caching (not just request deduplication).
 *
 * Uses auth-outside-cache pattern: auth headers resolved by caller, passed as params.
 * This is required because auth() is a dynamic API that cannot be called inside 'use cache'.
 *
 * Cache profiles:
 * - entityData: 5min for items, competencies, dashboard, flagged
 * - referenceData: 1 hour for big five traits (stable data)
 *
 * Revalidation: uses cacheTag for on-demand invalidation via revalidateTag().
 */

import { cacheLife, cacheTag } from 'next/cache';
import { getAuthHeaders } from './roleApi';
import type {
  PsychometricHealthReport,
  ItemStatistics,
  ItemStatisticsDetail,
  ItemStatisticsFilterParams,
  CompetencyReliability,
  CompetencyReliabilityDetail,
  CompetencyReliabilityFilterParams,
  FlaggedItemSummary,
  BigFiveReliability,
  Page,
} from '@/types/psychometrics';

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

const PSYCHOMETRICS_BASE = '/psychometrics';

// ============================================================================
// Dashboard
// ============================================================================

/**
 * Cached psychometrics dashboard fetcher.
 * Uses 'use cache' for cross-request caching (replaces React cache()).
 */
export async function getPsychometricsDashboardCached(
  authHeaders: AuthHeaders,
): Promise<PsychometricHealthReport | null> {
  'use cache';
  cacheLife('entityData');
  cacheTag('psychometrics-dashboard', 'psychometrics');

  try {
    const response = await fetch(
      `${getApiBaseUrl()}${PSYCHOMETRICS_BASE}/dashboard`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      }
    );

    if (!response.ok) return null;
    return (await response.json()) as PsychometricHealthReport;
  } catch {
    return null;
  }
}

// ============================================================================
// Items (Assessment Questions Statistics)
// ============================================================================

/**
 * Cached items list fetcher with optional filters.
 * Filter params become part of the cache key automatically.
 */
export async function getPsychometricsItemsCached(
  authHeaders: AuthHeaders,
  params: ItemStatisticsFilterParams = {},
): Promise<Page<ItemStatistics> | null> {
  'use cache';
  cacheLife('entityData');
  cacheTag('psychometrics-items', 'psychometrics');

  try {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append('status', params.status);
    if (params.competencyId) searchParams.append('competencyId', params.competencyId);
    if (params.discriminationFlag) searchParams.append('discriminationFlag', params.discriminationFlag);
    if (params.search) searchParams.append('search', params.search);
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.size !== undefined) searchParams.append('size', params.size.toString());
    if (params.sort) searchParams.append('sort', params.sort);

    const queryString = searchParams.toString();
    const url = `${getApiBaseUrl()}${PSYCHOMETRICS_BASE}/items${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
    });

    if (!response.ok) return null;
    return (await response.json()) as Page<ItemStatistics>;
  } catch {
    return null;
  }
}

/**
 * Cached single item detail fetcher.
 */
export async function getPsychometricsItemDetailCached(
  questionId: string,
  authHeaders: AuthHeaders,
): Promise<ItemStatisticsDetail | null> {
  'use cache';
  cacheLife('entityData');
  cacheTag(`psychometrics-item-${questionId}`, 'psychometrics-items', 'psychometrics');

  try {
    const response = await fetch(
      `${getApiBaseUrl()}${PSYCHOMETRICS_BASE}/items/${questionId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      }
    );

    if (!response.ok) return null;
    return (await response.json()) as ItemStatisticsDetail;
  } catch {
    return null;
  }
}

// ============================================================================
// Competencies (Reliability Statistics)
// ============================================================================

/**
 * Cached competencies list fetcher with optional filters.
 */
export async function getPsychometricsCompetenciesCached(
  authHeaders: AuthHeaders,
  params: CompetencyReliabilityFilterParams = {},
): Promise<Page<CompetencyReliability> | null> {
  'use cache';
  cacheLife('entityData');
  cacheTag('psychometrics-competencies', 'psychometrics');

  try {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append('status', params.status);
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.size !== undefined) searchParams.append('size', params.size.toString());

    const queryString = searchParams.toString();
    const url = `${getApiBaseUrl()}${PSYCHOMETRICS_BASE}/competencies${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
    });

    if (!response.ok) return null;
    return (await response.json()) as Page<CompetencyReliability>;
  } catch {
    return null;
  }
}

/**
 * Cached single competency detail fetcher.
 */
export async function getPsychometricsCompetencyDetailCached(
  competencyId: string,
  authHeaders: AuthHeaders,
): Promise<CompetencyReliabilityDetail | null> {
  'use cache';
  cacheLife('entityData');
  cacheTag(`psychometrics-competency-${competencyId}`, 'psychometrics-competencies', 'psychometrics');

  try {
    const response = await fetch(
      `${getApiBaseUrl()}${PSYCHOMETRICS_BASE}/competencies/${competencyId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      }
    );

    if (!response.ok) return null;
    return (await response.json()) as CompetencyReliabilityDetail;
  } catch {
    return null;
  }
}

// ============================================================================
// Flagged Items
// ============================================================================

/**
 * Cached flagged items fetcher.
 * Returns FlaggedItemSummary[] sorted by severity.
 */
export async function getPsychometricsFlaggedItemsCached(
  authHeaders: AuthHeaders,
): Promise<FlaggedItemSummary[] | null> {
  'use cache';
  cacheLife('entityData');
  cacheTag('psychometrics-flagged', 'psychometrics');

  try {
    const response = await fetch(
      `${getApiBaseUrl()}${PSYCHOMETRICS_BASE}/flagged`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      }
    );

    if (!response.ok) return null;
    return (await response.json()) as FlaggedItemSummary[];
  } catch {
    return null;
  }
}

// ============================================================================
// Big Five Traits
// ============================================================================

/**
 * Cached Big Five reliability fetcher.
 * Uses referenceData (1h) since trait data rarely changes.
 */
export async function getPsychometricsBigFiveCached(
  authHeaders: AuthHeaders,
): Promise<BigFiveReliability[] | null> {
  'use cache';
  cacheLife('referenceData');
  cacheTag('psychometrics-big-five', 'psychometrics');

  try {
    const response = await fetch(
      `${getApiBaseUrl()}${PSYCHOMETRICS_BASE}/big-five`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      }
    );

    if (!response.ok) return null;
    return (await response.json()) as BigFiveReliability[];
  } catch {
    return null;
  }
}

// ============================================================================
// Aggregate Fetchers (for dashboard with parallel loading)
// ============================================================================

/**
 * Fetch all data needed for the psychometrics dashboard in parallel.
 * Returns individual results to allow partial display on failure.
 *
 * NOT cached itself -- orchestrates cached sub-calls.
 * Resolves auth headers internally (outside 'use cache' scope).
 */
export async function getPsychometricsDashboardDataCached(): Promise<{
  report: PsychometricHealthReport | null;
  items: ItemStatistics[];
  competencies: CompetencyReliability[];
}> {
  const authHeaders = await getAuthHeaders();

  const [report, itemsPage, competenciesPage] = await Promise.all([
    getPsychometricsDashboardCached(authHeaders),
    getPsychometricsItemsCached(authHeaders, { size: 1000 }),
    getPsychometricsCompetenciesCached(authHeaders, { size: 100 }),
  ]);

  return {
    report,
    items: itemsPage?.content ?? [],
    competencies: competenciesPage?.content ?? [],
  };
}
