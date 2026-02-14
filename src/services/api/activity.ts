import { getAuthHeaders } from '../roleApi';
import { fetchApi } from './core';

import type {
  TestActivity,
  TemplateActivityStats,
  ActivityPage,
  ActivityFilterParams,
} from '@/types/activity';

const ACTIVITY_BASE = '/tests/activity';

export const activityApi = {
  /**
   * Get recent activity for dashboard widget.
   * Returns test completions, abandonments, and timeouts.
   * Requires ADMIN or EDITOR role.
   */
  getRecentActivity: async (limit = 10): Promise<TestActivity[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${ACTIVITY_BASE}/recent?limit=${limit}`, {
      tags: ['activity-recent'],
      cache: 'no-store', // Activity data should always be fresh
      authHeaders,
    });
  },

  /**
   * Get paginated activity for a specific template.
   * Supports filtering by status, passed, and date range.
   * Requires ADMIN or EDITOR role.
   */
  getTemplateActivity: async (
    templateId: string,
    params: ActivityFilterParams = {}
  ): Promise<ActivityPage> => {
    const authHeaders = await getAuthHeaders();
    const searchParams = new URLSearchParams();

    if (params.status) searchParams.append('status', params.status);
    if (params.passed !== undefined) searchParams.append('passed', String(params.passed));
    if (params.from) searchParams.append('from', params.from);
    if (params.to) searchParams.append('to', params.to);
    if (params.page !== undefined) searchParams.append('page', String(params.page));
    if (params.size !== undefined) searchParams.append('size', String(params.size));

    const queryString = searchParams.toString();
    const url = `${ACTIVITY_BASE}/template/${templateId}${queryString ? `?${queryString}` : ''}`;

    return fetchApi(url, {
      tags: [`activity-template-${templateId}`],
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Get aggregated activity statistics for a template.
   * Includes completion rate, pass rate, average score, etc.
   * Requires ADMIN or EDITOR role.
   */
  getTemplateActivityStats: async (templateId: string): Promise<TemplateActivityStats | null> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${ACTIVITY_BASE}/template/${templateId}/stats`, {
      tags: [`activity-stats-${templateId}`],
      revalidate: 60, // Cache for 1 minute since stats don't change rapidly
      authHeaders,
      silentStatusCodes: [404], // Template might not exist
    });
  },
};
