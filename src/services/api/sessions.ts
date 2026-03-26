import { getAuthHeaders } from '../roleApi';
import { fetchApi } from './core';

import type {
  TestSession,
  TestSessionSummary,
  StartTestSessionRequest,
  TestAnswer,
  SubmitAnswerRequest,
  TestResult,
  CurrentQuestionResponse,
  TemplateReadinessResponse,
} from '@/types/domain';
import type { ApiError } from '@/types/errors';

// Test endpoints - paths are relative to the v1 base URL
const TEST_SESSIONS_BASE = '/tests/sessions';

export const testSessionsApi = {
  /**
   * Check if a template is ready to start a test session.
   * Pre-flight validation that all competencies have sufficient questions.
   */
  checkTemplateReadiness: async (templateId: string): Promise<TemplateReadinessResponse> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_SESSIONS_BASE}/templates/${templateId}/readiness`, {
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Start a new test session
   */
  startSession: async (request: StartTestSessionRequest): Promise<TestSession> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_SESSIONS_BASE}`, {
      method: 'POST',
      body: JSON.stringify(request),
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Get a session by ID
   */
  getSessionById: async (sessionId: string): Promise<TestSession | null> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_SESSIONS_BASE}/${sessionId}`, {
      tags: [`test-session-${sessionId}`],
      cache: 'no-store',
      authHeaders,
      silentStatusCodes: [404], // 404 is expected for non-existent/deleted sessions
    });
  },

  /**
   * Get all sessions for a user
   */
  getUserSessions: async (clerkUserId: string, page = 0, size = 20): Promise<{
    content: TestSessionSummary[];
    totalElements: number;
    totalPages: number;
  }> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_SESSIONS_BASE}/user/${clerkUserId}?page=${page}&size=${size}`, {
      tags: [`user-sessions-${clerkUserId}`],
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Check for in-progress session
   * Returns null if no in-progress session exists (handles 404 from backend)
   */
  getInProgressSession: async (clerkUserId: string, templateId: string): Promise<TestSession | null> => {
    const authHeaders = await getAuthHeaders();
    try {
      return await fetchApi(`${TEST_SESSIONS_BASE}/user/${clerkUserId}/in-progress?templateId=${templateId}`, {
        cache: 'no-store',
        authHeaders,
        silentStatusCodes: [404], // 404 is expected when no in-progress session exists
      });
    } catch (error) {
      // 404 means no in-progress session exists, which is expected
      if (error instanceof Error && 'status' in error && (error as ApiError).status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Get current question for a session
   */
  getCurrentQuestion: async (sessionId: string): Promise<CurrentQuestionResponse | null> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_SESSIONS_BASE}/${sessionId}/current-question`, {
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Submit an answer
   */
  submitAnswer: async (sessionId: string, request: SubmitAnswerRequest): Promise<TestAnswer> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_SESSIONS_BASE}/${sessionId}/answers`, {
      method: 'POST',
      body: JSON.stringify(request),
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Navigate to a specific question
   */
  navigateToQuestion: async (sessionId: string, questionIndex: number): Promise<TestSession> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_SESSIONS_BASE}/${sessionId}/navigate?questionIndex=${questionIndex}`, {
      method: 'POST',
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Update remaining time
   */
  updateTime: async (sessionId: string, timeRemainingSeconds: number): Promise<TestSession> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_SESSIONS_BASE}/${sessionId}/time?timeRemainingSeconds=${timeRemainingSeconds}`, {
      method: 'PUT',
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Complete a session
   */
  completeSession: async (sessionId: string): Promise<TestResult> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_SESSIONS_BASE}/${sessionId}/complete`, {
      method: 'POST',
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Abandon a session
   */
  abandonSession: async (sessionId: string): Promise<TestSession> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_SESSIONS_BASE}/${sessionId}/abandon`, {
      method: 'POST',
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Get session answers
   */
  getSessionAnswers: async (sessionId: string): Promise<TestAnswer[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_SESSIONS_BASE}/${sessionId}/answers`, {
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Delete a test session (admin only).
   * Cascade deletes associated result and answers.
   */
  deleteSession: async (sessionId: string): Promise<void> => {
    const authHeaders = await getAuthHeaders();
    await fetchApi(`${TEST_SESSIONS_BASE}/${sessionId}`, {
      method: 'DELETE',
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Bulk delete test sessions (admin only, max 50).
   * Returns counts of deleted and failed.
   */
  bulkDeleteSessions: async (sessionIds: string[]): Promise<{ deleted: number; failed: number }> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_SESSIONS_BASE}/bulk`, {
      method: 'DELETE',
      body: JSON.stringify({ sessionIds }),
      cache: 'no-store',
      authHeaders,
    });
  },
};
