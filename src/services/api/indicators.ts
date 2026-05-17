import { cache } from 'react';
import { getAuthHeaders } from '../roleApi';
import { fetchApi } from './core';

import type { BehavioralIndicator } from '@/types/domain';

// Input types for API operations
interface IndicatorInput {
    title: string;
    description?: string;
    competencyId: string;
    weight: number;
    orderIndex: number;
    observabilityLevel: string;
    measurementType: string;
    examples?: string;
    counterExamples?: string;
    isActive: boolean;
    approvalStatus: string;
}

// Per-render memoization via React.cache, but no HTTP cache: every render
// pass fetches fresh from the backend. The list is consumed by weight-
// validation and indicator-manager UIs that must reflect writes immediately;
// the previous `cache: 'force-cache'` default served stale data after PUT
// updates and made the destructive weight Alert reappear with old totals.
const getIndicatorsCached = cache(async (competencyId: string) : Promise<BehavioralIndicator[] | null> => {
    return fetchApi(`/competencies/${competencyId}/behavioral-indicators`, {
        cache: 'no-store',
        silentStatusCodes: [404],
    });
});
const getAllIndicatorsCached = cache(
  async (): Promise<BehavioralIndicator[] | null> => {
    return fetchApi(`/behavioral-indicators`, {
      tags: [`indicators-all`],
      revalidate: 60,
    });
  }
);

export const behavioralIndicatorsApi = {
  getIndicators: getIndicatorsCached,
  getAllIndicators: getAllIndicatorsCached,

  getIndicatorById: async (indicatorId: string) : Promise<BehavioralIndicator | null> => {
    return fetchApi(`/behavioral-indicators/${indicatorId}`, {
      tags: [`indicator-${indicatorId}`],
      revalidate: 60,
      silentStatusCodes: [404], // 404 is expected for non-existent/deleted indicators
    });
  },

  createIndicator: async (competencyId: string, data: IndicatorInput): Promise<BehavioralIndicator> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi<BehavioralIndicator>(`/behavioral-indicators`, {
      method: "POST",
      body: JSON.stringify(data),
      cache: "no-store",
      authHeaders,
    });
  },

  updateIndicator: async (
    competencyId: string,
    indicatorId: string,
    data: IndicatorInput
  ): Promise<BehavioralIndicator> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi<BehavioralIndicator>(
      `/behavioral-indicators/${indicatorId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        cache: "no-store",
        authHeaders,
      }
    );
  },

  deleteIndicator: async (competencyId: string, indicatorId: string) => {
    const authHeaders = await getAuthHeaders();
    await fetchApi(`/behavioral-indicators/${indicatorId}`, {
      method: "DELETE",
      cache: "no-store",
      authHeaders,
    });
  },

  updateIndicatorQuestions: async (indicatorId: string, questionIds: string[]) => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`/behavioral-indicators/${indicatorId}/questions`, {
      method: 'PUT',
      body: JSON.stringify({ questionIds }),
      cache: 'no-store',
      authHeaders,
    });
  },
};
