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

// CLIENT-SIDE TEST SESSIONS API

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
   * Discard a session (exit without saving).
   * Permanently deletes session and all answers.
   */
  discardSession: async (
    sessionId: string,
    authHeaders: Record<string, string>
  ): Promise<void> => {
    await clientFetch(`${TEST_SESSIONS_BASE}/${sessionId}/discard`, authHeaders, {
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

// SCORING WORKFLOW: POLLING & RETRY FUNCTIONS

import { ResultStatus } from '@/types/domain';

/**
 * Options for polling behavior.
 */
export interface PollOptions {
  /** Maximum number of poll attempts before timeout (default: 15) */
  maxAttempts?: number;
  /** Initial interval between polls in ms (default: 1000) */
  initialIntervalMs?: number;
  /** Maximum interval between polls in ms (default: 5000) */
  maxIntervalMs?: number;
  /** Multiplier for exponential backoff (default: 1.5) */
  backoffMultiplier?: number;
  /** Callback when result is still PENDING */
  onPending?: (attempt: number, maxAttempts: number) => void;
  /** Callback when result transitions to COMPLETED */
  onCompleted?: (result: TestResult) => void;
  /** Callback when result transitions to FAILED */
  onFailed?: (result: TestResult) => void;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
}

/**
 * Default polling configuration.
 * Optimized for typical scoring latency (< 3s p95).
 */
const DEFAULT_POLL_OPTIONS: Required<Omit<PollOptions, 'onPending' | 'onCompleted' | 'onFailed' | 'signal'>> = {
  maxAttempts: 15,
  initialIntervalMs: 1000,
  maxIntervalMs: 5000,
  backoffMultiplier: 1.5,
};

/**
 * Error thrown when polling times out.
 */
export class PollTimeoutError extends Error {
  constructor(
    public readonly resultId: string,
    public readonly attempts: number,
    public readonly lastStatus: ResultStatus
  ) {
    super(`Polling timed out after ${attempts} attempts. Last status: ${lastStatus}`);
    this.name = 'PollTimeoutError';
  }
}

/**
 * Sleep utility that respects AbortSignal.
 */
async function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, ms);

    if (signal) {
      const abortHandler = () => {
        clearTimeout(timeout);
        reject(new DOMException('Polling aborted', 'AbortError'));
      };

      if (signal.aborted) {
        abortHandler();
        return;
      }

      signal.addEventListener('abort', abortHandler, { once: true });
    }
  });
}

/**
 * Calculate next polling interval using exponential backoff.
 *
 * Formula: min(initialInterval * (multiplier ^ attempt), maxInterval)
 *
 * @param attempt - Current attempt number (0-indexed)
 * @param options - Polling options
 * @returns Interval in milliseconds
 */
function calculateBackoffInterval(
  attempt: number,
  options: Required<Omit<PollOptions, 'onPending' | 'onCompleted' | 'onFailed' | 'signal'>>
): number {
  const { initialIntervalMs, maxIntervalMs, backoffMultiplier } = options;
  const interval = initialIntervalMs * Math.pow(backoffMultiplier, attempt);
  return Math.min(interval, maxIntervalMs);
}

/**
 * Poll for test result completion with exponential backoff.
 *
 * Use this function after test completion when result may have PENDING status.
 * Implements resilient polling pattern to handle backend retry logic.
 *
 * @example
 * ```typescript
 * try {
 *   const result = await pollForResult(resultId, {
 *     maxAttempts: 10,
 *     onPending: (attempt, max) => setProgress(attempt / max * 100),
 *     onCompleted: (result) => console.log('Score:', result.overallPercentage),
 *   });
 *
 *   if (result.status === 'COMPLETED') {
 *     router.push(`/results/${result.id}`);
 *   }
 * } catch (error) {
 *   if (error instanceof PollTimeoutError) {
 *     // Show retry UI
 *   }
 * }
 * ```
 *
 * @param resultId - TestResult ID to poll
 * @param options - Polling configuration and callbacks
 * @returns Final TestResult (COMPLETED or FAILED)
 * @throws PollTimeoutError if max attempts reached
 * @throws DOMException if aborted via signal
 */
export async function pollForResult(
  resultId: string,
  options: PollOptions = {}
): Promise<TestResult> {
  const config = {
    ...DEFAULT_POLL_OPTIONS,
    ...options,
  };

  let attempt = 0;
  let lastResult: TestResult | null = null;

  while (attempt < config.maxAttempts) {
    // Check for abort
    if (options.signal?.aborted) {
      throw new DOMException('Polling aborted', 'AbortError');
    }

    try {
      // Fetch current result state - use direct fetch to avoid server-side caching
      const response = await fetch(`${getApiBaseUrl()}/tests/results/${resultId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        mode: 'cors',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch result: ${response.status}`);
      }

      const result = await response.json() as TestResult;

      if (!result) {
        throw new Error(`Result not found: ${resultId}`);
      }

      lastResult = result;

      // Check terminal states
      if (result.status === 'COMPLETED') {
        options.onCompleted?.(result);
        return result;
      }

      if (result.status === 'FAILED') {
        options.onFailed?.(result);
        return result;
      }

      // Still PENDING - notify and continue polling
      options.onPending?.(attempt + 1, config.maxAttempts);

      // Wait before next attempt with backoff
      const interval = calculateBackoffInterval(attempt, config);
      await sleep(interval, options.signal);

      attempt++;
    } catch (error) {
      // Re-throw abort errors
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }

      // Network errors - continue polling with backoff
      console.warn(`Poll attempt ${attempt + 1} failed:`, error);

      const interval = calculateBackoffInterval(attempt, config);
      await sleep(interval, options.signal);

      attempt++;
    }
  }

  // Max attempts reached
  throw new PollTimeoutError(
    resultId,
    attempt,
    lastResult?.status ?? 'PENDING'
  );
}

/**
 * Retry options for failed scoring.
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Delay between retries in ms (default: 1000) */
  retryDelayMs?: number;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
}

/**
 * Error thrown when retry attempts exhausted.
 */
export class RetryExhaustedError extends Error {
  constructor(
    public readonly resultId: string,
    public readonly attempts: number,
    public readonly lastError?: Error
  ) {
    super(`Retry exhausted after ${attempts} attempts`);
    this.name = 'RetryExhaustedError';
  }
}

/**
 * Retry scoring calculation for a failed result.
 *
 * This triggers the backend to re-attempt scoring calculation.
 * Use when result status is FAILED and user wants to retry.
 *
 * @example
 * ```typescript
 * try {
 *   const result = await retryScoring(resultId);
 *
 *   if (result.status === 'COMPLETED') {
 *     // Show results
 *   } else if (result.status === 'PENDING') {
 *     // Start polling
 *   }
 * } catch (error) {
 *   // Show contact support
 * }
 * ```
 *
 * @param resultId - TestResult ID to retry
 * @param options - Retry configuration
 * @returns Updated TestResult
 * @throws RetryExhaustedError if all retries fail
 */
export async function retryScoring(
  resultId: string,
  options: RetryOptions = {}
): Promise<TestResult> {
  const { maxRetries = 3, retryDelayMs = 1000, signal } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Check for abort
    if (signal?.aborted) {
      throw new DOMException('Retry aborted', 'AbortError');
    }

    try {
      // Call the retry endpoint
      const response = await fetch(`${getApiBaseUrl()}/tests/results/${resultId}/retry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData: { message?: string } = await response.json().catch(() => ({})) as { message?: string };
        throw new Error(errorData.message || `Retry failed: ${response.status}`);
      }

      const result: TestResult = await response.json() as TestResult;
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry abort errors
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }

      // Wait before next retry
      if (attempt < maxRetries - 1) {
        await sleep(retryDelayMs, signal);
      }
    }
  }

  throw new RetryExhaustedError(resultId, maxRetries, lastError);
}

/**
 * Check if a result needs polling.
 * Helper to determine if pollForResult should be called.
 */
export function shouldPollResult(result: TestResult): boolean {
  return result.status === 'PENDING';
}

/**
 * Check if a result can be retried.
 * Helper to determine if retryScoring should be available.
 */
export function canRetryResult(result: TestResult): boolean {
  return result.status === 'FAILED';
}

/**
 * Format poll timeout for user display.
 */
export function formatPollTimeout(options: PollOptions = {}): string {
  const {
    maxAttempts = DEFAULT_POLL_OPTIONS.maxAttempts,
    initialIntervalMs = DEFAULT_POLL_OPTIONS.initialIntervalMs,
    maxIntervalMs = DEFAULT_POLL_OPTIONS.maxIntervalMs,
    backoffMultiplier = DEFAULT_POLL_OPTIONS.backoffMultiplier,
  } = options;

  // Calculate approximate total wait time
  let totalMs = 0;
  for (let i = 0; i < maxAttempts; i++) {
    const interval = Math.min(initialIntervalMs * Math.pow(backoffMultiplier, i), maxIntervalMs);
    totalMs += interval;
  }

  const totalSeconds = Math.ceil(totalMs / 1000);
  return totalSeconds > 60
    ? `${Math.ceil(totalSeconds / 60)} minutes`
    : `${totalSeconds} seconds`;
}
