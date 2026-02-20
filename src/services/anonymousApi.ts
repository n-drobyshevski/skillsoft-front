/**
 * Anonymous Test API Client
 *
 * Client-side API for anonymous test-taking via share links.
 * Uses session access tokens instead of Clerk JWT for authentication.
 *
 * @module services/anonymousApi
 */

import { createApiError, createNetworkError, isBackendErrorResponse, ApiError } from '@/types/errors';

// Re-export ApiError for convenience
export type { ApiError };

// API Configuration
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const versionPath = API_VERSION ? `/${API_VERSION}` : '';
  if (!apiUrl) {
    return `http://localhost:8080/api${versionPath}`;
  }
  const protocol = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1') ? 'http' : 'https';
  return `${protocol}://${apiUrl}/api${versionPath}`;
};

// Session credential storage key (localStorage for persistence across tab closes)
const SESSION_CREDENTIALS_KEY = 'skillsoft_anonymous_session';

// Client-side TTL for stored credentials (24 hours in milliseconds)
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

interface StoredCredentials {
  sessionId: string;
  accessToken: string;
  expiresAt: number; // Unix timestamp in ms
}

/**
 * Store session credentials in localStorage with a 24h TTL.
 * Uses localStorage so credentials persist across tab closes, enabling
 * session resume after browser crashes or accidental tab closes.
 */
export function storeSessionCredentials(sessionId: string, accessToken: string): void {
  if (typeof window !== 'undefined') {
    const credentials: StoredCredentials = {
      sessionId,
      accessToken,
      expiresAt: Date.now() + SESSION_TTL_MS,
    };
    localStorage.setItem(SESSION_CREDENTIALS_KEY, JSON.stringify(credentials));
  }
}

/**
 * Get stored session credentials, checking TTL before returning.
 * Returns null values if credentials are missing or expired.
 */
export function getStoredSessionCredentials(): { sessionId: string | null; accessToken: string | null } {
  if (typeof window === 'undefined') {
    return { sessionId: null, accessToken: null };
  }

  const raw = localStorage.getItem(SESSION_CREDENTIALS_KEY);
  if (!raw) {
    return { sessionId: null, accessToken: null };
  }

  try {
    const credentials: StoredCredentials = JSON.parse(raw);

    // Check client-side TTL
    if (Date.now() > credentials.expiresAt) {
      localStorage.removeItem(SESSION_CREDENTIALS_KEY);
      return { sessionId: null, accessToken: null };
    }

    return {
      sessionId: credentials.sessionId,
      accessToken: credentials.accessToken,
    };
  } catch {
    // Corrupted data — clear and return null
    localStorage.removeItem(SESSION_CREDENTIALS_KEY);
    return { sessionId: null, accessToken: null };
  }
}

/**
 * Clear stored session credentials.
 */
export function clearSessionCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_CREDENTIALS_KEY);
  }
}

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Response from creating an anonymous session.
 */
export interface AnonymousSessionResponse {
  sessionId: string;
  sessionAccessToken: string | null; // Only present on creation
  template: {
    id: string;
    name: string;
    description: string | null;
    questionCount: number;
    timeLimitMinutes: number | null;
    allowSkip: boolean;
    allowBackNavigation: boolean;
  };
  expiresAt: string;
}

/**
 * Current question response for anonymous sessions.
 */
export interface AnonymousCurrentQuestion {
  question: {
    id: string;
    questionText: string;
    questionType: string;
    answerOptions: Array<{
      id: string;
      text: string;
      score?: number;
    }>;
    timeLimit: number | null;
    difficultyLevel: string;
  };
  currentIndex: number;
  totalQuestions: number;
  timeRemainingSeconds: number | null;
  previousAnswer: {
    selectedOptionIds: string[];
  } | null;
  allowBackNavigation: boolean;
  allowSkip: boolean;
}

/**
 * Answer submission response.
 */
export interface AnonymousAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  selectedOptionIds: string[];
  answeredAt: string;
}

/**
 * Taker information for completing anonymous session.
 */
export interface AnonymousTakerInfo {
  firstName: string;
  lastName: string;
  email?: string;
  notes?: string;
  gdprConsentGiven?: boolean;
}

/**
 * Test result response.
 */
export interface AnonymousTestResult {
  id: string;
  sessionId: string;
  overallPercentage: number;
  totalCorrect: number;
  totalQuestions: number;
  totalTimeSeconds: number;
  passed: boolean;
  competencyBreakdown: Array<{
    competencyId: string;
    competencyName: string;
    score: number;
    maxScore: number;
    percentage: number;
  }>;
}

/**
 * Completion response wrapping result + persistent view token.
 */
export interface AnonymousCompletionResponse {
  result: AnonymousTestResult;
  resultViewToken: string;
}

/**
 * Public result accessible via HMAC-signed token.
 */
export interface PublicAnonymousResult {
  resultId: string;
  takerName: string;
  templateName: string;
  overallPercentage: number;
  passed: boolean;
  competencyBreakdown: Array<{
    competencyId: string;
    competencyName: string;
    score: number;
    maxScore: number;
    percentage: number;
  }>;
  totalTimeSeconds: number;
  questionsAnswered: number;
  questionsSkipped: number;
  totalQuestions: number;
  completedAt: string;
}

/**
 * Detailed result for viewing after completion.
 */
export interface AnonymousResultDetail {
  id: string;
  sessionId: string;
  overallPercentage: number;
  passed: boolean;
  totalTimeSeconds: number;
  completedAt: string;
  templateName: string;
  competencyBreakdown: Array<{
    competencyId: string;
    competencyName: string;
    score: number;
    maxScore: number;
    percentage: number;
  }>;
}

// ============================================
// API HELPER FUNCTIONS
// ============================================

/**
 * Make an authenticated request using the session access token.
 */
async function fetchWithSessionToken(
  endpoint: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<Response> {
  const token = accessToken || getStoredSessionCredentials().accessToken;

  if (!token && !endpoint.includes('/sessions') && options.method !== 'POST') {
    throw createApiError('Session token not found', 401, {
      status: 401,
      code: 'SESSION_TOKEN_MISSING',
      message: 'Session token not found',
      details: 'No session token available for authentication',
    });
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['X-Session-Token'] = token;
  }

  const response = await fetch(`${getApiBaseUrl()}/anonymous${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

/**
 * Handle API error responses.
 */
async function handleErrorResponse(response: Response): Promise<never> {
  let errorData: unknown;
  try {
    errorData = await response.json();
  } catch {
    throw createApiError(
      `Request failed with status ${response.status}`,
      response.status,
      {
        status: response.status,
        message: `Request failed with status ${response.status}`,
        code: 'UNKNOWN',
      }
    );
  }

  if (isBackendErrorResponse(errorData)) {
    throw createApiError(
      errorData.message,
      response.status,
      errorData
    );
  }

  throw createApiError(
    `Request failed with status ${response.status}`,
    response.status,
    {
      status: response.status,
      message: `Request failed with status ${response.status}`,
      code: 'UNKNOWN',
    }
  );
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * CAPTCHA configuration from the backend.
 */
export interface CaptchaConfig {
  enabled: boolean;
  siteKey: string | null;
}

/**
 * Fetch CAPTCHA configuration from the backend.
 * Used by the landing page to decide whether to show hCaptcha.
 */
export async function getCaptchaConfig(): Promise<CaptchaConfig> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/anonymous/config/captcha`);
    if (!response.ok) {
      return { enabled: false, siteKey: null };
    }
    return await response.json();
  } catch {
    return { enabled: false, siteKey: null };
  }
}

/**
 * Create a new anonymous session from a share link token.
 */
export async function createAnonymousSession(
  shareToken: string,
  captchaToken?: string
): Promise<AnonymousSessionResponse> {
  try {
    const body: Record<string, string> = { shareToken };
    if (captchaToken) {
      body.captchaToken = captchaToken;
    }

    const response = await fetch(`${getApiBaseUrl()}/anonymous/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    const data: AnonymousSessionResponse = await response.json();

    // Store session credentials
    if (data.sessionAccessToken) {
      storeSessionCredentials(data.sessionId, data.sessionAccessToken);
    }

    return data;
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      throw error; // Re-throw ApiError
    }
    throw createNetworkError(error instanceof Error ? error : undefined);
  }
}

/**
 * Get an existing anonymous session.
 */
export async function getAnonymousSession(
  sessionId: string,
  accessToken?: string
): Promise<AnonymousSessionResponse> {
  try {
    const response = await fetchWithSessionToken(`/sessions/${sessionId}`, {
      method: 'GET',
    }, accessToken);

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      throw error;
    }
    throw createNetworkError(error instanceof Error ? error : undefined);
  }
}

/**
 * Get the current question for the session.
 */
export async function getCurrentQuestion(
  sessionId: string,
  accessToken?: string
): Promise<AnonymousCurrentQuestion> {
  try {
    const response = await fetchWithSessionToken(`/sessions/${sessionId}/current-question`, {
      method: 'GET',
    }, accessToken);

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      throw error;
    }
    throw createNetworkError(error instanceof Error ? error : undefined);
  }
}

/**
 * Submit an answer to a question with automatic retry on network failure.
 * Uses exponential backoff (500ms, 1s, 2s) for up to 3 attempts.
 * Backend submitAnswer is idempotent, so retries are safe.
 */
export async function submitAnswer(
  sessionId: string,
  questionId: string,
  selectedOptionIndex: number,
  accessToken?: string
): Promise<AnonymousAnswer> {
  const RETRY_DELAYS = [500, 1000, 2000];
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    try {
      const response = await fetchWithSessionToken(`/sessions/${sessionId}/answers`, {
        method: 'POST',
        body: JSON.stringify({ questionId, selectedOptionIndex }),
      }, accessToken);

      if (!response.ok) {
        // Don't retry client errors (4xx) — only server/network errors
        if (response.status >= 400 && response.status < 500) {
          await handleErrorResponse(response);
        }
        // Server errors (5xx) — retry
        if (attempt < RETRY_DELAYS.length) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt]));
          continue;
        }
        await handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      // Re-throw API errors (4xx) immediately — don't retry
      if (error instanceof Error && 'status' in error && ((error as ApiError).status ?? 0) < 500) {
        throw error;
      }
      // Retry on network errors and 5xx
      if (attempt < RETRY_DELAYS.length) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt]));
        continue;
      }
    }
  }

  // All retries exhausted
  if (lastError instanceof Error && 'status' in lastError) {
    throw lastError;
  }
  throw createNetworkError(lastError instanceof Error ? lastError : undefined);
}

/**
 * Navigate to a specific question.
 */
export async function navigateToQuestion(
  sessionId: string,
  questionIndex: number,
  accessToken?: string
): Promise<AnonymousSessionResponse> {
  try {
    const response = await fetchWithSessionToken(
      `/sessions/${sessionId}/navigate?questionIndex=${questionIndex}`,
      { method: 'POST' },
      accessToken
    );

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      throw error;
    }
    throw createNetworkError(error instanceof Error ? error : undefined);
  }
}

/**
 * Update the remaining time for a timed test.
 */
export async function updateTimeRemaining(
  sessionId: string,
  timeRemainingSeconds: number,
  accessToken?: string
): Promise<AnonymousSessionResponse> {
  try {
    const response = await fetchWithSessionToken(
      `/sessions/${sessionId}/time?timeRemainingSeconds=${timeRemainingSeconds}`,
      { method: 'POST' },
      accessToken
    );

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      throw error;
    }
    throw createNetworkError(error instanceof Error ? error : undefined);
  }
}

/**
 * Complete the test session with taker information.
 * Returns the result wrapped with a persistent view token.
 */
export async function completeSession(
  sessionId: string,
  takerInfo: AnonymousTakerInfo,
  accessToken?: string
): Promise<AnonymousCompletionResponse> {
  try {
    const response = await fetchWithSessionToken(`/sessions/${sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify(takerInfo),
    }, accessToken);

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      throw error;
    }
    throw createNetworkError(error instanceof Error ? error : undefined);
  }
}

/**
 * Get the result for a completed session.
 */
export async function getResult(
  sessionId: string,
  accessToken?: string
): Promise<AnonymousResultDetail> {
  try {
    const response = await fetchWithSessionToken(`/sessions/${sessionId}/result`, {
      method: 'GET',
    }, accessToken);

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      throw error;
    }
    throw createNetworkError(error instanceof Error ? error : undefined);
  }
}

/**
 * Update advisory session metadata (e.g. tab switch count).
 *
 * This is fire-and-forget from the caller's perspective — failures are
 * intentionally swallowed so they never block the completion flow.
 * Returns the raw Response so callers can inspect status if needed.
 */
export async function updateSessionMetadata(
  sessionId: string,
  sessionToken: string,
  tabSwitchCount: number
): Promise<Response> {
  return fetchWithSessionToken(
    `/sessions/${sessionId}/metadata`,
    {
      method: 'PATCH',
      body: JSON.stringify({ tabSwitchCount }),
    },
    sessionToken
  );
}

/**
 * Get a public anonymous result by its HMAC-signed view token.
 * This endpoint does not require authentication.
 */
export async function getPublicResult(token: string): Promise<PublicAnonymousResult> {
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const versionPath = API_VERSION ? `/${API_VERSION}` : '';
  let baseUrl: string;
  if (!apiUrl) {
    baseUrl = `http://localhost:8080/api${versionPath}`;
  } else {
    const protocol = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1') ? 'http' : 'https';
    baseUrl = `${protocol}://${apiUrl}/api${versionPath}`;
  }

  try {
    const response = await fetch(`${baseUrl}/public/results/${token}`);

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      throw error;
    }
    throw createNetworkError(error instanceof Error ? error : undefined);
  }
}

/**
 * Anonymous Test API object for organized imports.
 */
export const anonymousTestApi = {
  createSession: createAnonymousSession,
  getSession: getAnonymousSession,
  getCurrentQuestion,
  submitAnswer,
  navigateToQuestion,
  updateTimeRemaining,
  updateSessionMetadata,
  completeSession,
  getResult,
  getPublicResult,
  getCaptchaConfig,
  // Utility functions
  storeCredentials: storeSessionCredentials,
  getCredentials: getStoredSessionCredentials,
  clearCredentials: clearSessionCredentials,
};

export default anonymousTestApi;
