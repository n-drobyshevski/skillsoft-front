/**
 * Server-side Cached API Functions for Psychometrics
 *
 * This file provides cached data fetching for psychometrics pages.
 * Uses the original psychometricsApi with fetch-level caching via Next.js.
 *
 * Since psychometrics endpoints require authentication headers (X-User-Id, X-User-Role),
 * we use the original API that has access to Clerk auth context, rather than
 * unstable_cache which doesn't have request context access.
 *
 * Caching is achieved via:
 * - Next.js fetch cache with `next: { revalidate: N, tags: [...] }`
 * - React's cache() for request deduplication
 *
 * Revalidation times:
 * - entityData: 300s (5 minutes) for items, competencies, dashboard
 * - referenceData: 3600s (1 hour) for big five traits (stable data)
 */

import { cache } from 'react';
import { psychometricsApi } from './api';
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

// ============================================================================
// Dashboard - Request-deduplicated fetchers using React cache()
// ============================================================================

/**
 * Cached psychometrics dashboard fetcher
 * Uses React cache() for request deduplication within a single render
 */
export const getPsychometricsDashboardCached = cache(
  async (): Promise<PsychometricHealthReport | null> => {
    try {
      return await psychometricsApi.getDashboard();
    } catch (error) {
      console.error('[Psychometrics Cache] Dashboard fetch error:', error);
      return null;
    }
  }
);

// ============================================================================
// Items (Assessment Questions Statistics)
// ============================================================================

/**
 * Cached items list fetcher with optional filters
 * Uses React cache() for request deduplication
 */
export const getPsychometricsItemsCached = cache(
  async (params: ItemStatisticsFilterParams = {}): Promise<Page<ItemStatistics> | null> => {
    try {
      return await psychometricsApi.getItems(params);
    } catch (error) {
      console.error('[Psychometrics Cache] Items fetch error:', error);
      return null;
    }
  }
);

/**
 * Cached single item detail fetcher
 */
export const getPsychometricsItemDetailCached = cache(
  async (questionId: string): Promise<ItemStatisticsDetail | null> => {
    try {
      return await psychometricsApi.getItemDetail(questionId);
    } catch (error) {
      console.error('[Psychometrics Cache] Item detail fetch error:', error);
      return null;
    }
  }
);

// ============================================================================
// Competencies (Reliability Statistics)
// ============================================================================

/**
 * Cached competencies list fetcher with optional filters
 */
export const getPsychometricsCompetenciesCached = cache(
  async (params: CompetencyReliabilityFilterParams = {}): Promise<Page<CompetencyReliability> | null> => {
    try {
      return await psychometricsApi.getCompetencies(params);
    } catch (error) {
      console.error('[Psychometrics Cache] Competencies fetch error:', error);
      return null;
    }
  }
);

/**
 * Cached single competency detail fetcher
 */
export const getPsychometricsCompetencyDetailCached = cache(
  async (competencyId: string): Promise<CompetencyReliabilityDetail | null> => {
    try {
      return await psychometricsApi.getCompetencyDetail(competencyId);
    } catch (error) {
      console.error('[Psychometrics Cache] Competency detail fetch error:', error);
      return null;
    }
  }
);

// ============================================================================
// Flagged Items
// ============================================================================

/**
 * Cached flagged items fetcher
 * Returns FlaggedItemSummary[] sorted by severity
 */
export const getPsychometricsFlaggedItemsCached = cache(
  async (): Promise<FlaggedItemSummary[] | null> => {
    try {
      return await psychometricsApi.getFlaggedItems();
    } catch (error) {
      console.error('[Psychometrics Cache] Flagged items fetch error:', error);
      return null;
    }
  }
);

// ============================================================================
// Big Five Traits
// ============================================================================

/**
 * Cached Big Five reliability fetcher
 */
export const getPsychometricsBigFiveCached = cache(
  async (): Promise<BigFiveReliability[] | null> => {
    try {
      return await psychometricsApi.getBigFiveReliability();
    } catch (error) {
      console.error('[Psychometrics Cache] Big Five fetch error:', error);
      return null;
    }
  }
);

// ============================================================================
// Aggregate Fetchers (for dashboard with parallel loading)
// ============================================================================

/**
 * Fetch all data needed for the dashboard in parallel
 * Returns individual results to allow partial display on failure
 */
export async function getPsychometricsDashboardDataCached(): Promise<{
  report: PsychometricHealthReport | null;
  items: ItemStatistics[];
  competencies: CompetencyReliability[];
}> {
  const [report, itemsPage, competenciesPage] = await Promise.all([
    getPsychometricsDashboardCached(),
    getPsychometricsItemsCached({ size: 1000 }),
    getPsychometricsCompetenciesCached({ size: 100 }),
  ]);

  return {
    report,
    items: itemsPage?.content ?? [],
    competencies: competenciesPage?.content ?? [],
  };
}
