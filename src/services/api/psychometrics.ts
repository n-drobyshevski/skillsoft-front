import { getAuthHeaders } from '../roleApi';
import { fetchApi } from './core';

import type {
  PsychometricHealthReport,
  ItemStatistics,
  ItemStatisticsDetail,
  CompetencyReliability,
  CompetencyReliabilityDetail,
  BigFiveReliability,
  FlaggedItemSummary,
  UpdateItemStatusRequest,
  AuditResult,
  ItemStatisticsFilterParams,
  CompetencyReliabilityFilterParams,
  Page,
  ItemValidityStatus,
} from '@/types/psychometrics';

const PSYCHOMETRICS_BASE = '/psychometrics';

export const psychometricsApi = {
  /**
   * Get psychometric dashboard overview
   */
  getDashboard: async (): Promise<PsychometricHealthReport> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${PSYCHOMETRICS_BASE}/dashboard`, {
      tags: ['psychometrics-dashboard'],
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Get paginated item statistics with optional filters
   */
  getItems: async (params: ItemStatisticsFilterParams = {}): Promise<Page<ItemStatistics>> => {
    const authHeaders = await getAuthHeaders();
    const searchParams = new URLSearchParams();

    if (params.status) searchParams.append('status', params.status);
    if (params.competencyId) searchParams.append('competencyId', params.competencyId);
    if (params.discriminationFlag) searchParams.append('discriminationFlag', params.discriminationFlag);
    if (params.search) searchParams.append('search', params.search);
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.size !== undefined) searchParams.append('size', params.size.toString());
    if (params.sort) searchParams.append('sort', params.sort);

    const queryString = searchParams.toString();
    const url = `${PSYCHOMETRICS_BASE}/items${queryString ? `?${queryString}` : ''}`;

    return fetchApi(url, {
      tags: ['psychometrics-items'],
      revalidate: 60, // 1 minute cache for better performance
      authHeaders,
    });
  },

  /**
   * Get detailed statistics for a specific question
   */
  getItemDetail: async (questionId: string): Promise<ItemStatisticsDetail> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${PSYCHOMETRICS_BASE}/items/${questionId}`, {
      tags: [`psychometrics-item-${questionId}`, 'psychometrics-items'],
      revalidate: 60, // 1 minute cache
      authHeaders,
    });
  },

  /**
   * Manually trigger recalculation for a question
   */
  recalculateItem: async (questionId: string): Promise<ItemStatistics> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${PSYCHOMETRICS_BASE}/items/${questionId}/recalculate`, {
      method: 'POST',
      authHeaders,
    });
  },

  /**
   * Manually update item validity status
   */
  updateItemStatus: async (questionId: string, request: UpdateItemStatusRequest): Promise<ItemStatistics> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${PSYCHOMETRICS_BASE}/items/${questionId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      authHeaders,
    });
  },

  /**
   * Get paginated competency reliability list
   */
  getCompetencies: async (params: CompetencyReliabilityFilterParams = {}): Promise<Page<CompetencyReliability>> => {
    const authHeaders = await getAuthHeaders();
    const searchParams = new URLSearchParams();

    if (params.status) searchParams.append('status', params.status);
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.size !== undefined) searchParams.append('size', params.size.toString());
    if (params.sort) searchParams.append('sort', params.sort);

    const queryString = searchParams.toString();
    const url = `${PSYCHOMETRICS_BASE}/competencies${queryString ? `?${queryString}` : ''}`;

    return fetchApi(url, {
      tags: ['psychometrics-competencies'],
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Get detailed reliability for a specific competency
   */
  getCompetencyDetail: async (competencyId: string): Promise<CompetencyReliabilityDetail> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${PSYCHOMETRICS_BASE}/competencies/${competencyId}`, {
      tags: [`psychometrics-competency-${competencyId}`],
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Get all flagged items sorted by severity
   */
  getFlaggedItems: async (): Promise<FlaggedItemSummary[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${PSYCHOMETRICS_BASE}/flagged`, {
      tags: ['psychometrics-flagged'],
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Get Big Five trait reliability
   */
  getBigFiveReliability: async (): Promise<BigFiveReliability[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${PSYCHOMETRICS_BASE}/big-five`, {
      tags: ['psychometrics-big-five'],
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Manually trigger a full psychometric audit
   */
  triggerAudit: async (): Promise<AuditResult> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${PSYCHOMETRICS_BASE}/audit/trigger`, {
      method: 'POST',
      authHeaders,
    });
  },

  /**
   * Batch update item statuses (calls individual updates in parallel)
   * Returns results for each item: { questionId, success, error? }
   */
  batchUpdateItemStatus: async (
    questionIds: string[],
    newStatus: ItemValidityStatus,
    reason: string
  ): Promise<{ questionId: string; success: boolean; error?: string }[]> => {
    const results = await Promise.allSettled(
      questionIds.map(async (questionId) => {
        await psychometricsApi.updateItemStatus(questionId, { newStatus, reason });
        return { questionId, success: true };
      })
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return {
        questionId: questionIds[index],
        success: false,
        error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
      };
    });
  },
};
