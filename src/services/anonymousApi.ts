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

// Session token storage key
const SESSION_TOKEN_KEY = 'skillsoft_anonymous_session_token';
const SESSION_ID_KEY = 'skillsoft_anonymous_session_id';

/**
 * Store session credentials in sessionStorage.
 * Uses sessionStorage so credentials are cleared when browser tab closes.
 */
export function storeSessionCredentials(sessionId: string, accessToken: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_TOKEN_KEY, accessToken);
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
}

/**
 * Get stored session credentials.
 */
export function getStoredSessionCredentials(): { sessionId: string | null; accessToken: string | null } {
  if (typeof window === 'undefined') {
    return { sessionId: null, accessToken: null };
  }
  return {
    sessionId: sessionStorage.getItem(SESSION_ID_KEY),
    accessToken: sessionStorage.getItem(SESSION_TOKEN_KEY),
  };
}

/**
 * Clear stored session credentials.
 */
export function clearSessionCredentials(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_ID_KEY);
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
    throw createApiError('Session token not found', 401, 'UNAUTHORIZED', 'SESSION_TOKEN_MISSING');
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
      'UNKNOWN',
      'UNKNOWN'
    );
  }

  if (isBackendErrorResponse(errorData)) {
    throw createApiError(
      errorData.message,
      response.status,
      errorData.category || 'UNKNOWN',
      errorData.code || 'UNKNOWN'
    );
  }

  throw createApiError(
    `Request failed with status ${response.status}`,
    response.status,
    'UNKNOWN',
    'UNKNOWN'
  );
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Create a new anonymous session from a share link token.
 */
export async function createAnonymousSession(shareToken: string): Promise<AnonymousSessionResponse> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/anonymous/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ shareToken }),
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
    throw createNetworkError((error as Error).message);
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
    throw createNetworkError((error as Error).message);
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
    throw createNetworkError((error as Error).message);
  }
}

/**
 * Submit an answer to a question.
 */
export async function submitAnswer(
  sessionId: string,
  questionId: string,
  selectedOptionIndex: number,
  accessToken?: string
): Promise<AnonymousAnswer> {
  try {
    const response = await fetchWithSessionToken(`/sessions/${sessionId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ questionId, selectedOptionIndex }),
    }, accessToken);

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      throw error;
    }
    throw createNetworkError((error as Error).message);
  }
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
    throw createNetworkError((error as Error).message);
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
    throw createNetworkError((error as Error).message);
  }
}

/**
 * Complete the test session with taker information.
 */
export async function completeSession(
  sessionId: string,
  takerInfo: AnonymousTakerInfo,
  accessToken?: string
): Promise<AnonymousTestResult> {
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
    throw createNetworkError((error as Error).message);
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
    throw createNetworkError((error as Error).message);
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
  completeSession,
  getResult,
  // Utility functions
  storeCredentials: storeSessionCredentials,
  getCredentials: getStoredSessionCredentials,
  clearCredentials: clearSessionCredentials,
};

export default anonymousTestApi;
