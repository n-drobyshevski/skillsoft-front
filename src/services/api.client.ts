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

// API Version - defaults to v1
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return `http://localhost:8080/api/${API_VERSION}`;
  }
  const protocol = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1') ? 'http' : 'https';
  return `${protocol}://${apiUrl}/api/${API_VERSION}`;
};

// Test endpoints - paths are relative to the v1 base URL
// Note: Backend uses /tests/sessions (plural 'tests', then 'sessions')
const TEST_SESSIONS_BASE = '/tests/sessions';

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

interface ClientFetchOptions extends RequestInit {
  /**
   * HTTP status codes that should return null instead of throwing.
   * Use for expected "not found" scenarios where 404 is a valid response.
   */
  silentStatusCodes?: number[];
}

async function clientFetch<T>(
  endpoint: string,
  authHeaders: Record<string, string>,
  options: ClientFetchOptions = {}
): Promise<T> {
  const { silentStatusCodes, ...fetchOptions } = options;
  const method = (fetchOptions.method || 'GET').toUpperCase();

  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...fetchOptions.headers,
    },
    mode: 'cors',
    credentials: 'include',
  });

  // Return null for expected "not found" status codes without throwing
  if (silentStatusCodes?.includes(response.status)) {
    return null as T;
  }

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
    return clientFetch(`${TEST_SESSIONS_BASE}`, authHeaders, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Get a session by ID
   * Returns null if the session is not found (handles 404 silently)
   */
  getSessionById: async (
    sessionId: string,
    authHeaders: Record<string, string>
  ): Promise<TestSession | null> => {
    return clientFetch(`${TEST_SESSIONS_BASE}/${sessionId}`, authHeaders, {
      silentStatusCodes: [404],
    });
  },

  /**
   * Check for in-progress session for a user and template
   * Returns null if no in-progress session exists (handles 404 silently)
   */
  getInProgressSession: async (
    clerkUserId: string,
    templateId: string,
    authHeaders: Record<string, string>
  ): Promise<TestSession | null> => {
    return clientFetch(
      `${TEST_SESSIONS_BASE}/user/${clerkUserId}/in-progress?templateId=${templateId}`,
      authHeaders,
      { silentStatusCodes: [404] }
    );
  },

  /**
   * Get current question for a session
   */
  getCurrentQuestion: async (
    sessionId: string,
    authHeaders: Record<string, string>
  ): Promise<CurrentQuestionResponse | null> => {
    return clientFetch(`${TEST_SESSIONS_BASE}/${sessionId}/current-question`, authHeaders);
  },

  /**
   * Submit an answer
   */
  submitAnswer: async (
    sessionId: string,
    request: SubmitAnswerRequest,
    authHeaders: Record<string, string>
  ): Promise<TestAnswer> => {
    return clientFetch(`${TEST_SESSIONS_BASE}/${sessionId}/answers`, authHeaders, {
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
      `${TEST_SESSIONS_BASE}/${sessionId}/navigate?questionIndex=${questionIndex}`,
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
    return clientFetch(`${TEST_SESSIONS_BASE}/${sessionId}/complete`, authHeaders, {
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
    return clientFetch(`${TEST_SESSIONS_BASE}/${sessionId}/abandon`, authHeaders, {
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
    return clientFetch(`${TEST_SESSIONS_BASE}/${sessionId}/answers`, authHeaders);
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
      `${TEST_SESSIONS_BASE}/templates/${templateId}/readiness`,
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
      `${TEST_SESSIONS_BASE}/templates/${templateId}/diagnostics`,
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
