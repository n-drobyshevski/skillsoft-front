import { getAuthHeaders } from '../roleApi';
import { fetchApi } from './core';

import type {
  TestResult,
  TrendDataPoint,
  UserStatistics,
  TemplateStatistics,
  QuestionScore,
  CandidateComparison,
} from '@/types/domain';

// Test endpoints - paths are relative to the v1 base URL
const TEST_RESULTS_BASE = '/tests/results';

export const testResultsApi = {
  /**
   * Get result by ID
   */
  getResultById: async (resultId: string): Promise<TestResult | null> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_RESULTS_BASE}/${resultId}`, {
      tags: [`test-result-${resultId}`],
      cache: 'no-store',
      authHeaders,
      silentStatusCodes: [404], // 404 is expected for non-existent/deleted results
    });
  },

  /**
   * Get result by session ID
   */
  getResultBySession: async (sessionId: string): Promise<TestResult | null> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_RESULTS_BASE}/session/${sessionId}`, {
      tags: [`test-result-session-${sessionId}`],
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Get all results for a user
   */
  getUserResults: async (clerkUserId: string, page = 0, size = 20): Promise<{
    content: TestResult[];
    totalElements: number;
    totalPages: number;
  }> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_RESULTS_BASE}/user/${clerkUserId}?page=${page}&size=${size}`, {
      tags: [`user-results-${clerkUserId}`],
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Get user statistics
   */
  getUserStatistics: async (clerkUserId: string): Promise<UserStatistics> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_RESULTS_BASE}/user/${clerkUserId}/statistics`, {
      tags: [`user-statistics-${clerkUserId}`],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Get passed results for a user
   */
  getUserPassedResults: async (clerkUserId: string): Promise<TestResult[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_RESULTS_BASE}/user/${clerkUserId}/passed`, {
      tags: [`user-passed-${clerkUserId}`],
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Get template statistics (admin only)
   */
  getTemplateStatistics: async (templateId: string): Promise<TemplateStatistics> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_RESULTS_BASE}/template/${templateId}/statistics`, {
      tags: [`template-statistics-${templateId}`],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Get historical trend data for a user.
   * Returns lightweight time-series data with competency-level scores.
   */
  getUserHistory: async (
    clerkUserId: string,
    templateId?: string
  ): Promise<TrendDataPoint[]> => {
    const authHeaders = await getAuthHeaders();
    const params = templateId ? `?templateId=${templateId}` : '';
    return fetchApi(`${TEST_RESULTS_BASE}/user/${clerkUserId}/history${params}`, {
      tags: [`user-history-${clerkUserId}`],
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Get question-level scores for a specific indicator within a result.
   * Lazy-loaded when user expands an indicator row in the results view.
   * Includes correct answers for learning/review purposes.
   */
  getIndicatorQuestionScores: async (
    resultId: string,
    indicatorId: string
  ): Promise<QuestionScore[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_RESULTS_BASE}/${resultId}/indicators/${indicatorId}/questions`, {
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Compare multiple Team Fit results side-by-side.
   * Requires ADMIN or EDITOR role.
   */
  compareCandidates: async (
    templateId: string,
    resultIds: string[]
  ): Promise<CandidateComparison> => {
    const authHeaders = await getAuthHeaders();
    const params = new URLSearchParams();
    params.set('templateId', templateId);
    resultIds.forEach(id => params.append('resultIds', id));
    return fetchApi(`${TEST_RESULTS_BASE}/compare?${params.toString()}`, {
      cache: 'no-store',
      authHeaders,
    });
  },
};
