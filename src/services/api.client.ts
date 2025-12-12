/**
 * Client-side API Functions
 * 
 * This file provides API functions that can be used from Client Components.
 * Unlike the server-side API (api.ts) which uses server actions for auth,
 * this version requires the caller to pass authentication headers.
 * 
 * Usage:
 * ```tsx
 * 'use client';
 * import { useAuth } from '@clerk/nextjs';
 * import { testSessionsClientApi } from '@/services/api.client';
 * 
 * function MyComponent() {
 *   const { userId } = useAuth();
 *   
 *   const fetchData = async () => {
 *     const authHeaders = { 'X-User-Id': userId || '' };
 *     const session = await testSessionsClientApi.getSessionById(sessionId, authHeaders);
 *   };
 * }
 * ```
 */

import {
  TestSession,
  CurrentQuestionResponse,
  SubmitAnswerRequest,
  TestAnswer,
  StartTestSessionRequest,
  TestResult,
} from '@/types/domain';

const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return 'http://localhost:8080/api';
  }
  const protocol = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1') ? 'http' : 'https';
  return `${protocol}://${apiUrl}/api`;
};

const TESTS_BASE = '/v1/tests';

export interface ApiError extends Error {
  status?: number;
  code?: string;
  endpoint?: string;
  method?: string;
}

interface ErrorResponse {
  message?: string;
  code?: string;
  details?: string;
  timestamp?: string;
}

/**
 * Enhanced error response handler with detailed error information
 */
async function handleResponse<T>(response: Response, endpoint: string, method: string): Promise<T> {
  if (!response.ok) {
    const error: ApiError = new Error('API request failed');
    error.status = response.status;
    error.endpoint = endpoint;
    error.method = method;

    try {
      const errorData = (await response.json()) as ErrorResponse;
      error.message = errorData.message || `HTTP error! status: ${response.status}`;
      error.code = errorData.code;

      // Enhanced error messages for common scenarios
      if (response.status === 404 && endpoint.includes('/current-question')) {
        error.message = 'Вопрос не найден. Возможно, тест был завершён или удалён.';
      } else if (response.status === 400 && endpoint.includes('/current-question')) {
        // Specific handling for abandoned session errors when getting current question
        if (errorData.message?.toLowerCase().includes('abandoned')) {
          error.message = 'Эта сессия была отменена. Вы можете начать новый тест.';
        } else {
          error.message = errorData.message || 'Недействительная сессия теста. Она могла быть завершена или отменена.';
        }
      } else if (response.status === 400 && endpoint.includes('/sessions/')) {
        error.message = errorData.message || 'Недействительная сессия теста. Она могла быть завершена или отменена.';
      } else if (response.status === 403) {
        error.message = errorData.message || 'Доступ запрещён. Вы не имеете прав для выполнения этого действия.';
      } else if (response.status === 500) {
        error.message = 'Внутренняя ошибка сервера. Повторите попытку через несколько секунд.';
      }
    } catch {
      // Fallback error messages if response body is not JSON
      if (response.status === 404) {
        error.message = 'Запрошенный ресурс не найден';
      } else if (response.status === 400) {
        error.message = 'Некорректный запрос';
      } else if (response.status === 500) {
        error.message = 'Внутренняя ошибка сервера';
      } else {
        error.message = `HTTP error! status: ${response.status}`;
      }
    }
    throw error;
  }

  const contentType = response.headers.get('content-type');
  const contentLength = response.headers.get('content-length');

  if (response.status === 204 || contentLength === '0' || !contentType?.includes('application/json')) {
    return null as T;
  }

  try {
    const text = await response.text();
    if (!text.trim()) {
      return null as T;
    }
    return JSON.parse(text) as T;
  } catch (parseError) {
    if (parseError instanceof SyntaxError) {
      return null as T;
    }
    throw parseError;
  }
}

async function clientFetch<T>(
  endpoint: string,
  authHeaders: Record<string, string>,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();

  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
    mode: 'cors',
    credentials: 'include',
  });

  return handleResponse<T>(response, endpoint, method);
}

// ============================================
// CLIENT-SIDE TEST SESSIONS API
// ============================================

export const testSessionsClientApi = {
  /**
   * Start a new test session
   */
  startSession: async (
    request: StartTestSessionRequest,
    authHeaders: Record<string, string>
  ): Promise<TestSession> => {
    return clientFetch(`${TESTS_BASE}/sessions`, authHeaders, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Get a session by ID
   */
  getSessionById: async (
    sessionId: string,
    authHeaders: Record<string, string>
  ): Promise<TestSession | null> => {
    return clientFetch(`${TESTS_BASE}/sessions/${sessionId}`, authHeaders);
  },

  /**
   * Check for in-progress session for a user and template
   * Returns null if no in-progress session exists (handles 404 from backend)
   */
  getInProgressSession: async (
    clerkUserId: string,
    templateId: string,
    authHeaders: Record<string, string>
  ): Promise<TestSession | null> => {
    try {
      return await clientFetch(
        `${TESTS_BASE}/sessions/user/${clerkUserId}/in-progress?templateId=${templateId}`,
        authHeaders
      );
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
  getCurrentQuestion: async (
    sessionId: string,
    authHeaders: Record<string, string>
  ): Promise<CurrentQuestionResponse | null> => {
    return clientFetch(`${TESTS_BASE}/sessions/${sessionId}/current-question`, authHeaders);
  },

  /**
   * Submit an answer
   */
  submitAnswer: async (
    sessionId: string,
    request: SubmitAnswerRequest,
    authHeaders: Record<string, string>
  ): Promise<TestAnswer> => {
    return clientFetch(`${TESTS_BASE}/sessions/${sessionId}/answers`, authHeaders, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Navigate to a specific question
   */
  navigateToQuestion: async (
    sessionId: string,
    questionIndex: number,
    authHeaders: Record<string, string>
  ): Promise<TestSession> => {
    return clientFetch(
      `${TESTS_BASE}/sessions/${sessionId}/navigate?questionIndex=${questionIndex}`,
      authHeaders,
      { method: 'POST' }
    );
  },

  /**
   * Complete a session
   */
  completeSession: async (
    sessionId: string,
    authHeaders: Record<string, string>
  ): Promise<TestResult> => {
    return clientFetch(`${TESTS_BASE}/sessions/${sessionId}/complete`, authHeaders, {
      method: 'POST',
    });
  },

  /**
   * Abandon a session
   */
  abandonSession: async (
    sessionId: string,
    authHeaders: Record<string, string>
  ): Promise<TestSession> => {
    return clientFetch(`${TESTS_BASE}/sessions/${sessionId}/abandon`, authHeaders, {
      method: 'POST',
    });
  },
};
