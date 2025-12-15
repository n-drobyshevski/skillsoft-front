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
  context?: Record<string, unknown>;
}

interface ErrorResponse {
  message?: string;
  code?: string;
  details?: string;
  timestamp?: string;
  context?: Record<string, unknown>;
}

/**
 * Competency issue details returned by TEST_NOT_READY errors
 */
export interface CompetencyIssue {
  competencyId: string;
  competencyName: string;
  questionsAvailable: number;
  questionsRequired: number;
  healthStatus: 'CRITICAL' | 'WARNING' | 'HEALTHY';
  issues: string[];
}

/**
 * Diagnostic information for template question availability
 */
export interface TemplateDiagnostics {
  templateId: string;
  templateName: string;
  goal: string;
  questionsPerIndicator: number;
  isActive: boolean;
  competencyCount: number;
  competencies: Array<{
    competencyId: string;
    competencyName: string;
    indicatorCount: number;
    activeQuestionCount: number;
    scenarioAEligibleCount: number | string;
    questionsRequired: number;
    questionsAvailable: number;
    shortfall: number;
    indicators: Array<{
      id: string;
      title: string;
      contextScope: string;
      isActive: boolean;
      activeQuestionCount: number;
    }>;
  }>;
  totalQuestionsAvailable: number;
  totalQuestionsRequired: number;
  canStartSession: boolean;
  issues: string[];
  troubleshootingTips?: string[];
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
      error.context = errorData.context;

      // Enhanced error messages for common scenarios
      if (errorData.code === 'TEST_NOT_READY') {
        // Test cannot start due to missing questions - keep original message from backend
        // The context contains detailed competency issues for display
        error.message = errorData.message || 'Тест не готов к запуску. Проверьте наличие вопросов для компетенций.';
      } else if (errorData.code === 'DUPLICATE_SESSION') {
        // User already has an in-progress session
        error.message = 'У вас уже есть активная сессия для этого теста. Продолжите её или отмените.';
      } else if (response.status === 404 && endpoint.includes('/current-question')) {
        error.message = 'Вопрос не найден. Возможно, тест был завершён или удалён.';
      } else if (response.status === 400 && endpoint.includes('/current-question')) {
        // Specific handling for abandoned session errors when getting current question
        if (errorData.message?.toLowerCase().includes('abandoned')) {
          error.message = 'Эта сессия была отменена. Вы можете начать новый тест.';
        } else {
          error.message = errorData.message || 'Недействительная сессия теста. Она могла быть завершена или отменена.';
        }
      } else if (response.status === 422) {
        // Unprocessable Entity - typically validation or business rule failure
        error.message = errorData.message || 'Невозможно выполнить операцию. Проверьте данные.';
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
      } else if (response.status === 422) {
        error.message = 'Невозможно выполнить операцию';
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

  /**
   * Get all answers for a session (for answer summary review)
   */
  getSessionAnswers: async (
    sessionId: string,
    authHeaders: Record<string, string>
  ): Promise<TestAnswer[]> => {
    return clientFetch(`${TESTS_BASE}/sessions/${sessionId}/answers`, authHeaders);
  },

  /**
   * Check if a template is ready to start a test session.
   * This pre-flight check validates that all competencies have sufficient questions.
   */
  checkTemplateReadiness: async (
    templateId: string,
    authHeaders: Record<string, string>
  ): Promise<{
    ready: boolean;
    templateId: string;
    templateName: string;
    totalQuestionsAvailable: number;
    questionsRequired: number;
    competencyHealth: Array<{
      competencyId: string;
      competencyName: string;
      questionsAvailable: number;
      questionsRequired: number;
      healthStatus: string;
      issues: string[];
    }>;
  }> => {
    return clientFetch(
      `${TESTS_BASE}/sessions/templates/${templateId}/readiness`,
      authHeaders
    );
  },

  /**
   * Get detailed diagnostics for question availability in a template.
   * Used by HR admins to debug why a test session cannot start.
   */
  getTemplateDiagnostics: async (
    templateId: string,
    authHeaders: Record<string, string>
  ): Promise<TemplateDiagnostics> => {
    return clientFetch(
      `${TESTS_BASE}/sessions/templates/${templateId}/diagnostics`,
      authHeaders
    );
  },
};

/**
 * Helper function to check if an error is a TEST_NOT_READY error
 */
export function isTestNotReadyError(error: unknown): error is ApiError & { code: 'TEST_NOT_READY' } {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as ApiError).code === 'TEST_NOT_READY'
  );
}

/**
 * Helper function to check if an error is a DUPLICATE_SESSION error
 */
export function isDuplicateSessionError(error: unknown): error is ApiError & { code: 'DUPLICATE_SESSION' } {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as ApiError).code === 'DUPLICATE_SESSION'
  );
}

/**
 * Extract competency issues from a TEST_NOT_READY error
 */
export function getCompetencyIssuesFromError(error: ApiError): CompetencyIssue[] {
  if (error.code !== 'TEST_NOT_READY' || !error.context) {
    return [];
  }
  return (error.context.competencyIssues as CompetencyIssue[]) || [];
}
