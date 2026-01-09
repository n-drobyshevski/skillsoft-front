/**
 * Cached Data Layer - Server-side Data Fetching with Request Deduplication
 *
 * This module provides memoized data fetching functions using React's `cache()`.
 * Multiple calls to the same function within a single request will only hit the API once.
 *
 * This addresses the performance issue where `getAllCompetencies()` was called
 * in multiple places (overview page, builder layout) during a single page load.
 *
 * Usage in Server Components:
 * ```ts
 * import { getCachedCompetencies, getCachedTemplate } from '@/lib/cached-data';
 *
 * // In a Server Component - multiple calls are deduplicated automatically
 * const competencies = await getCachedCompetencies();
 * const template = await getCachedTemplate(id);
 * ```
 */
import { cache } from 'react';
import { testTemplatesApi, competenciesApi, activityApi } from '@/services/api';
import type { Competency } from '@/types/domain';
import type { TestActivity, TemplateActivityStats } from '@/types/activity';

// ============================================================================
// Competencies
// ============================================================================

/**
 * Get all competencies (cached per request).
 *
 * This function is memoized - multiple calls within the same request
 * will only make one API call.
 *
 * @returns Array of all competencies
 */
export const getCachedCompetencies = cache(async (): Promise<Competency[]> => {
  try {
    const competencies = await competenciesApi.getAllCompetencies();
    return Array.isArray(competencies) ? competencies : [];
  } catch (error) {
    console.error('[cached-data] Failed to fetch competencies:', error);
    return [];
  }
});

/**
 * Get active competencies only (cached per request).
 *
 * @returns Array of active competencies
 */
export const getCachedActiveCompetencies = cache(async (): Promise<Competency[]> => {
  const all = await getCachedCompetencies();
  return all.filter((c) => c.isActive);
});

// ============================================================================
// Test Templates
// ============================================================================

/**
 * Get a test template by ID (cached per request).
 *
 * Note: Each unique ID is cached separately within a request.
 *
 * @param id - Template ID
 * @returns Template or null if not found
 */
export const getCachedTemplate = cache(async (id: string) => {
  try {
    const template = await testTemplatesApi.getTemplateById(id);
    return template || null;
  } catch (error) {
    console.error(`[cached-data] Failed to fetch template ${id}:`, error);
    return null;
  }
});

// ============================================================================
// Activity Data
// ============================================================================

/**
 * Get recent activity for a template (cached per request).
 *
 * @param templateId - Template ID
 * @param size - Number of items to fetch (default: 5)
 * @returns Array of activities or empty array on error
 */
export const getCachedTemplateActivity = cache(
  async (templateId: string, size: number = 5): Promise<TestActivity[]> => {
    try {
      const activityPage = await activityApi.getTemplateActivity(templateId, { size });
      return activityPage?.content || [];
    } catch (error) {
      console.warn(`[cached-data] Failed to fetch activity for ${templateId}:`, error);
      return [];
    }
  }
);

/**
 * Get activity stats for a template (cached per request).
 *
 * @param templateId - Template ID
 * @returns Activity stats or null on error
 */
export const getCachedTemplateActivityStats = cache(
  async (templateId: string): Promise<TemplateActivityStats | null> => {
    try {
      return await activityApi.getTemplateActivityStats(templateId);
    } catch (error) {
      console.warn(`[cached-data] Failed to fetch activity stats for ${templateId}:`, error);
      return null;
    }
  }
);

// ============================================================================
// Composite Data Fetchers
// ============================================================================

/**
 * Get overview data for a template (template + competencies + activity).
 *
 * Uses cached functions internally for deduplication.
 *
 * @param templateId - Template ID
 * @returns Object with template, competencies, activities, and stats
 */
export async function getOverviewDataCached(templateId: string) {
  const [template, allCompetencies, activities, stats] = await Promise.all([
    getCachedTemplate(templateId),
    getCachedCompetencies(),
    getCachedTemplateActivity(templateId, 5),
    getCachedTemplateActivityStats(templateId),
  ]);

  // Filter competencies that belong to this template
  const competencies = template?.competencyIds
    ? allCompetencies.filter((c) => template.competencyIds?.includes(c.id))
    : [];

  return {
    template,
    competencies,
    activities,
    stats,
    error: template ? null : 'Template not found',
  };
}

/**
 * Get builder data for a template (template + active competencies).
 *
 * Uses cached functions internally for deduplication.
 *
 * @param templateId - Template ID
 * @returns Object with template and active competencies for the library
 */
export async function getBuilderDataCached(templateId: string) {
  const [template, activeCompetencies] = await Promise.all([
    getCachedTemplate(templateId),
    getCachedActiveCompetencies(),
  ]);

  return {
    template,
    competencies: activeCompetencies,
    error: template ? null : 'Template not found',
  };
}
