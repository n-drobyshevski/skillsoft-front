import { createLogger } from '@/lib/logger';
import {
  ApiError,
  BackendErrorResponse,
  ErrorCode,
  createApiError,
  createNetworkError,
  getErrorCategory,
  getErrorCodeMessage,
  getUserFriendlyMessage,
  isBackendErrorResponse,
} from '@/types/errors';

// Re-export error utilities that consumers may need
export type { ApiError } from '@/types/errors';

// Logger for API service
export const log = createLogger('API');

// API Version configuration
// Default: v1 (current production version)
// Set NEXT_PUBLIC_API_VERSION to override if needed
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

export const getApiBaseUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const versionPath = API_VERSION ? `/${API_VERSION}` : '';
    if (!apiUrl) {
        return `http://localhost:8080/api${versionPath}`;
    }
    // For localhost, use http; for production domains, use https
    const protocol = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1') ? 'http' : 'https';
    return `${protocol}://${apiUrl}/api${versionPath}`;
};

// List of API endpoints that return arrays (used for connection fallback logic)
const QUESTIONS_ENDPOINT = '/questions';
const COMPETENCIES_ENDPOINT = '/competencies';
const BEHAVIORAL_INDICATORS_ENDPOINT = '/behavioral-indicators';
const USERS_ENDPOINT = '/users';
const LIST_ENDPOINTS = [QUESTIONS_ENDPOINT, COMPETENCIES_ENDPOINT, BEHAVIORAL_INDICATORS_ENDPOINT, USERS_ENDPOINT];

// Mock API flag shared by teams and passport modules
export const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

/**
 * Parse backend error response from JSON.
 * Handles various response formats gracefully.
 */
async function parseErrorResponse(response: Response): Promise<BackendErrorResponse | null> {
    try {
        const text = await response.text();
        if (!text.trim()) {
            return null;
        }
        const data: unknown = JSON.parse(text);
        if (isBackendErrorResponse(data)) {
            return data;
        }
        // Handle simple { message: string } responses
        if (typeof data === 'object' && data !== null && 'message' in data) {
            const errorObj = data as { message: unknown; code?: unknown; details?: unknown };
            return {
                status: response.status,
                message: String(errorObj.message),
                code: typeof errorObj.code === 'string' ? errorObj.code : undefined,
                details: typeof errorObj.details === 'string' ? errorObj.details : undefined,
            };
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Helper function to handle responses with comprehensive error typing.
 * Creates ApiError with full metadata for proper error handling in UI.
 * @param response - The fetch Response object
 * @param silentStatusCodes - Optional array of status codes to suppress error logging for (e.g., [404] for expected "not found" cases)
 */
async function handleResponse<T>(response: Response, silentStatusCodes: number[] = []): Promise<T> {
    if (!response.ok) {
        const backendError = await parseErrorResponse(response);
        const category = getErrorCategory(response.status);

        // Determine the user-facing message:
        // 1. Prefer code-specific Russian message for known error codes
        // 2. Fall back to backend message (English)
        // 3. Fall back to category-based Russian message
        const codeMessage = getErrorCodeMessage(backendError?.code);
        let message: string;
        if (codeMessage) {
            message = codeMessage;
        } else if (backendError?.message) {
            message = backendError.message;
        } else {
            message = getUserFriendlyMessage(category);
        }

        // Create a rich ApiError with all metadata
        const error = createApiError(message, response.status, backendError || undefined);

        // Add request URL for debugging
        if (process.env.NODE_ENV === 'development') {
            error.context = {
                ...error.context,
                url: response.url,
                method: 'GET', // Will be overridden by caller if needed
            };
        }

        // Log error details in development with structured output
        // Skip logging for expected status codes (e.g., 404 when checking for optional resources)
        const shouldLogError = process.env.NODE_ENV === 'development' && !silentStatusCodes.includes(response.status);
        if (shouldLogError) {
            // Use a single structured log for easier debugging
            log.error(`API Error [${response.status}] ${error.category}`, {
                message: error.message,
                url: response.url,
                correlationId: error.correlationId,
                code: error.code,
                details: error.details,
                retryable: error.isRetryable,
                backendError: backendError || undefined,
            });
        }

        throw error;
    }

    // Handle empty responses (like successful DELETE operations)
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');

    // If there's no content or it's not JSON, return null or empty object
    if (
        response.status === 204 || // No Content
        contentLength === '0' ||
        !contentType?.includes('application/json')
    ) {
        return null as T;
    }

    // Try to parse JSON, handle empty responses gracefully
    try {
        const text = await response.text();
        if (!text.trim()) {
            return null as T;
        }
        return JSON.parse(text) as T;
    } catch (parseError) {
        // If JSON parsing fails but response was successful, return null
        if (parseError instanceof SyntaxError) {
            return null as T;
        }
        throw parseError;
    }
}

/**
 * API fetch wrapper with caching, revalidation, and comprehensive error handling.
 * Provides consistent error handling across all API calls.
 */
export async function fetchApi<T>(
    endpoint: string,
    options: RequestInit & {
        tags?: string[];
        revalidate?: false | 0 | number;
        cache?: RequestCache;
        authHeaders?: Record<string, string>;
        /** Status codes to suppress error logging for (e.g., [404] for expected "not found" cases) */
        silentStatusCodes?: number[];
    } = {}
): Promise<T> {
    const { tags = [], revalidate, cache = 'force-cache', authHeaders = {}, silentStatusCodes = [], ...fetchOptions } = options;
    const method = fetchOptions.method || 'GET';

    try {
        // Auth headers can be passed in for RBAC (includes X-User-Id and X-User-Role)
        // For server components, use getAuthHeaders() from roleApi.ts
        // For client components, use useAuth() hook from Clerk

        const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
            ...fetchOptions,
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders,
                ...fetchOptions.headers,
            },
            next: {
                tags,
                revalidate,
            },
            cache,
            mode: 'cors',
            credentials: 'include',
        });

        return handleResponse<T>(response, silentStatusCodes);
    } catch (error) {
        // If error is already an ApiError (from handleResponse), re-throw it
        if (error instanceof Error && 'category' in error) {
            throw error;
        }

        // Handle connection/network errors
        if (error instanceof Error) {
            // Handle CORS errors
            if (error.message.includes('CORS') || error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                const networkError = createNetworkError(error);
                networkError.code = ErrorCode.CORS_ERROR;
                networkError.message = `CORS error when accessing ${getApiBaseUrl()}${endpoint}. Check backend CORS configuration.`;

                // Log in development
                if (process.env.NODE_ENV === 'development') {
                    log.error('Network Error (CORS)', {
                        endpoint,
                        method,
                        originalMessage: error.message,
                    });
                }

                throw networkError;
            }

            // Handle connection errors during build (graceful degradation)
            if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
                // Log connection error in development
                if (process.env.NODE_ENV === 'development') {
                    console.warn(`[API] Connection failed for ${method} ${endpoint} - returning fallback data`);
                }

                // Return empty array for list endpoints, null for single item endpoints
                if (LIST_ENDPOINTS.some(path => endpoint.includes(path))) {
                    return [] as T;
                }
                return null as T;
            }

            // Handle timeout errors
            if (error.message.includes('timeout') || error.name === 'AbortError') {
                const timeoutError = createNetworkError(error);
                timeoutError.code = ErrorCode.TIMEOUT;
                timeoutError.message = 'Request timed out. Please try again.';
                throw timeoutError;
            }

            // Generic network error
            const networkError = createNetworkError(error);
            if (process.env.NODE_ENV === 'development') {
                console.error('[API Network Error]', {
                    endpoint,
                    method,
                    originalMessage: error.message,
                });
            }
            throw networkError;
        }

        // Unknown error type - wrap it
        const unknownError = createApiError(
            'An unexpected error occurred',
            0
        );
        unknownError.code = ErrorCode.INTERNAL_ERROR;
        throw unknownError;
    }
}
