/**
 * Server-side API Functions for Test Sessions
 *
 * These functions run exclusively in Server Components and Server Actions.
 * They use getAuthHeaders() from roleApi.ts for HMAC-signed authentication.
 *
 * IMPORTANT: These functions must NOT be cached - session/question data
 * is user-specific and time-sensitive. Use 'cache: no-store' on all fetches.
 *
 * @module services/api.server
 */
'use server';

import { getAuthHeaders } from '@/services/roleApi';
import type {
  TestSession,
  CurrentQuestionResponse,
} from '@/types/domain';

// API Version - defaults to v1
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

function getApiBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return `http://localhost:8080/api/${API_VERSION}`;
  }
  const protocol = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1') ? 'http' : 'https';
  return `${protocol}://${apiUrl}/api/${API_VERSION}`;
}

const TEST_SESSIONS_BASE = '/tests/sessions';

// Error Types

export interface ServerApiError {
  message: string;
  status: number;
  code?: string;
}

// Server-Side Result Type

/**
 * Result type for server-side API calls.
 * Uses discriminated union to avoid throwing in Server Components
 * (which would trigger the error boundary instead of allowing graceful handling).
 */
export type ServerResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ServerApiError };

// Internal Helpers

async function serverFetch<T>(endpoint: string): Promise<ServerResult<T>> {
  const authHeaders = await getAuthHeaders();

  if (!authHeaders['X-User-Id']) {
    return {
      ok: false,
      error: { message: 'Not authenticated', status: 401 },
    };
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      let message = `HTTP error ${response.status}`;
      let code: string | undefined;

      try {
        const errorData = (await response.json()) as {
          message?: string;
          code?: string;
        };
        message = errorData.message || message;
        code = errorData.code;
      } catch {
        // Response body is not JSON, use default message
      }

      return {
        ok: false,
        error: { message, status: response.status, code },
      };
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType?.includes('application/json')) {
      return { ok: false, error: { message: 'Empty response', status: 204 } };
    }

    const text = await response.text();
    if (!text.trim()) {
      return { ok: false, error: { message: 'Empty response body', status: 204 } };
    }

    const data = JSON.parse(text) as T;
    return { ok: true, data };
  } catch (err) {
    // Re-throw Next.js internal errors (redirects, PPR bailout)
    if (typeof err === 'object' && err !== null && 'digest' in err) {
      throw err;
    }

    const message = err instanceof Error ? err.message : 'Network error';
    return {
      ok: false,
      error: { message, status: 0 },
    };
  }
}

// Public API: Test Sessions

/**
 * Fetch a test session by ID (server-side).
 * Returns null-safe result with error information for graceful handling.
 */
export async function fetchSessionServer(
  sessionId: string
): Promise<ServerResult<TestSession>> {
  return serverFetch<TestSession>(`${TEST_SESSIONS_BASE}/${sessionId}`);
}

/**
 * Fetch the current question for a session (server-side).
 * Returns null-safe result with error information for graceful handling.
 */
export async function fetchCurrentQuestionServer(
  sessionId: string
): Promise<ServerResult<CurrentQuestionResponse>> {
  return serverFetch<CurrentQuestionResponse>(
    `${TEST_SESSIONS_BASE}/${sessionId}/current-question`
  );
}
