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
const TEMPLATES_BASE = '/tests/templates';

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

// ==================== ANONYMOUS RESULTS (Owner View) ====================

/**
 * Anonymous result summary returned by the backend.
 */
export interface AnonymousResultSummary {
  resultId: string;
  sessionId: string;
  takerName: string;
  takerEmail: string | null;
  overallPercentage: number;
  passed: boolean;
  completedAt: string;
  shareLinkLabel: string | null;
  totalTimeSeconds: number;
  questionsAnswered: number;
  questionsSkipped: number;
  /** True when time anomaly detection flagged this result (avg < 15s per question). Absent for normal results. */
  suspiciouslyFast?: boolean;
  /** Advisory: number of times the taker switched away from the test tab. Null for older sessions. */
  tabSwitchCount?: number;
}

/**
 * Anonymous session stats returned by the backend.
 */
export interface AnonymousSessionStats {
  totalSessions: number;
  completedSessions: number;
  abandonedSessions: number;
  inProgressSessions: number;
  completionRate: number;
}

/**
 * Paginated response wrapper.
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/**
 * Filter options for anonymous results.
 */
export interface AnonymousResultFilters {
  dateFrom?: string;  // ISO datetime string
  dateTo?: string;    // ISO datetime string
  minScore?: number;
  maxScore?: number;
  passed?: boolean;
  shareLinkId?: string;
}

/**
 * API functions for fetching anonymous results (owner view).
 * These call the TemplateAnonymousResultsController endpoints.
 */
export const anonymousResultsApi = {
  /**
   * Get anonymous session statistics for a template.
   */
  getStats: async (templateId: string): Promise<AnonymousSessionStats> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/anonymous-stats`, {
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * List anonymous results for a template (paginated, with optional filters).
   */
  listResults: async (
    templateId: string,
    page = 0,
    size = 20,
    filters?: AnonymousResultFilters
  ): Promise<PageResponse<AnonymousResultSummary>> => {
    const authHeaders = await getAuthHeaders();
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('size', String(size));
    params.set('sort', 'completedAt,desc');

    if (filters) {
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);
      if (filters.minScore != null) params.set('minScore', String(filters.minScore));
      if (filters.maxScore != null) params.set('maxScore', String(filters.maxScore));
      if (filters.passed != null) params.set('passed', String(filters.passed));
      if (filters.shareLinkId) params.set('shareLinkId', filters.shareLinkId);
    }

    return fetchApi(
      `${TEMPLATES_BASE}/${templateId}/anonymous-results?${params.toString()}`,
      {
        cache: 'no-store',
        authHeaders,
      }
    );
  },

  /**
   * Download anonymous results as CSV.
   * Uses authenticated fetch and triggers browser download via blob URL.
   */
  exportCsv: async (templateId: string): Promise<void> => {
    const authHeaders = await getAuthHeaders();
    const { getApiBaseUrl } = await import('./core');
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}${TEMPLATES_BASE}/${templateId}/anonymous-results/export`;

    const response = await fetch(url, {
      headers: {
        ...authHeaders,
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `anonymous-results-${templateId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  },
};
