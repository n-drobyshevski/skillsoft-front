'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { testSessionsApi } from '@/services/api';

/**
 * Revalidate caches after session deletion.
 */
async function revalidateSessionCache(templateId: string) {
  revalidatePath(`/test-templates/${templateId}/results`, 'page');
  revalidatePath(`/test-templates/${templateId}`, 'page');
  revalidatePath('/dashboard', 'page');
  revalidateTag('test-templates-stats');
}

/**
 * Delete a single test session (admin only).
 */
export async function deleteTestSession(
  sessionId: string,
  templateId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await testSessionsApi.deleteSession(sessionId);
    await revalidateSessionCache(templateId);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete test session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete session',
    };
  }
}

/**
 * Bulk delete test sessions (admin only, max 50).
 */
export async function bulkDeleteTestSessions(
  sessionIds: string[],
  templateId: string
): Promise<{ success: boolean; deleted?: number; failed?: number; error?: string }> {
  try {
    const result = await testSessionsApi.bulkDeleteSessions(sessionIds);
    await revalidateSessionCache(templateId);
    return { success: true, deleted: result.deleted, failed: result.failed };
  } catch (error) {
    console.error('Failed to bulk delete test sessions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete sessions',
    };
  }
}
