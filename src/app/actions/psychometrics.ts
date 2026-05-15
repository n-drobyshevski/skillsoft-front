'use server';
/**
 * Server Actions for Psychometrics Cache Revalidation
 *
 * These actions invalidate cached data after mutations using revalidatePath.
 *
 * Note: Since we use unstable_cache (not 'use cache' directive due to Clerk compatibility),
 * we use revalidatePath for cache invalidation. The unstable_cache tags work with
 * revalidatePath when the paths contain the cached data.
 *
 * Path Hierarchy:
 * - /psychometrics - Dashboard page
 * - /psychometrics/items - Items list
 * - /psychometrics/items/[questionId] - Individual item detail
 * - /psychometrics/competencies - Competencies list
 * - /psychometrics/competencies/[competencyId] - Individual competency detail
 * - /psychometrics/flagged - Flagged items list
 * - /psychometrics/flagged/[itemId] - Flagged item detail
 * - /psychometrics/big-five - Big Five reliability page
 */

import { revalidatePath } from 'next/cache';

// Path Constants

const PSYCHOMETRICS_PATH = '/psychometrics';

// Full Cache Invalidation (after audit)

/**
 * Invalidate all psychometrics cached data after an audit run.
 * This should be called after triggerAudit() completes successfully.
 *
 * Invalidates all psychometrics pages and their cached data.
 */
export async function revalidatePsychometricsAfterAudit(): Promise<void> {
  try {
    // Revalidate all psychometrics pages
    // Using 'layout' type invalidates the layout and all pages under it
    revalidatePath(PSYCHOMETRICS_PATH, 'layout');
  } catch {
    // Silently fail - cache will expire naturally
    // In production, you might want to log this to a monitoring service
  }
}

// Item-specific Invalidation

/**
 * Invalidate cached data for a specific item and related lists.
 * Use after recalculating item statistics or updating item status.
 *
 * @param questionId - The ID of the question/item that was modified
 */
export async function revalidatePsychometricsItem(questionId: string): Promise<void> {
  try {
    // Invalidate the specific item detail page
    revalidatePath(`${PSYCHOMETRICS_PATH}/items/${questionId}`);

    // Invalidate items list
    revalidatePath(`${PSYCHOMETRICS_PATH}/items`);

    // Invalidate flagged pages (item might appear/disappear from flagged list)
    revalidatePath(`${PSYCHOMETRICS_PATH}/flagged`);
    revalidatePath(`${PSYCHOMETRICS_PATH}/flagged/${questionId}`);

    // Invalidate dashboard (includes topFlaggedItems and aggregate stats)
    revalidatePath(PSYCHOMETRICS_PATH);
  } catch {
    // Silently fail
  }
}

// Competency-specific Invalidation

/**
 * Invalidate cached data for a specific competency and related lists.
 * Use after recalculating competency reliability.
 *
 * @param competencyId - The ID of the competency that was modified
 */
export async function revalidatePsychometricsCompetency(competencyId: string): Promise<void> {
  try {
    // Invalidate the specific competency detail page
    revalidatePath(`${PSYCHOMETRICS_PATH}/competencies/${competencyId}`);

    // Invalidate competencies list
    revalidatePath(`${PSYCHOMETRICS_PATH}/competencies`);

    // Invalidate dashboard (includes reliability stats)
    revalidatePath(PSYCHOMETRICS_PATH);
  } catch {
    // Silently fail
  }
}

// Flagged Items Invalidation

/**
 * Invalidate flagged items list and dashboard.
 * Use after batch status updates or when items are retired.
 */
export async function revalidatePsychometricsFlagged(): Promise<void> {
  try {
    // Invalidate flagged pages
    revalidatePath(`${PSYCHOMETRICS_PATH}/flagged`);

    // Invalidate dashboard (includes topFlaggedItems)
    revalidatePath(PSYCHOMETRICS_PATH);
  } catch {
    // Silently fail
  }
}

// Big Five Invalidation

/**
 * Invalidate Big Five reliability data.
 * Use after trait reliability recalculation.
 */
export async function revalidatePsychometricsBigFive(): Promise<void> {
  try {
    // Invalidate big-five page
    revalidatePath(`${PSYCHOMETRICS_PATH}/big-five`);

    // Invalidate dashboard (includes bigFiveReliabilitySummary)
    revalidatePath(PSYCHOMETRICS_PATH);
  } catch {
    // Silently fail
  }
}
