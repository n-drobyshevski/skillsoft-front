import { testSessionsApi } from '@/services/api';

/**
 * Delete a single test session (admin only).
 * Calls the API directly — suitable for client components.
 */
export async function deleteTestSession(
  sessionId: string,
  _templateId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await testSessionsApi.deleteSession(sessionId);
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
 * Calls the API directly — suitable for client components.
 */
export async function bulkDeleteTestSessions(
  sessionIds: string[],
  _templateId: string
): Promise<{ success: boolean; deleted?: number; failed?: number; error?: string }> {
  try {
    const result = await testSessionsApi.bulkDeleteSessions(sessionIds);
    return { success: true, deleted: result.deleted, failed: result.failed };
  } catch (error) {
    console.error('Failed to bulk delete test sessions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete sessions',
    };
  }
}
