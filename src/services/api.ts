import { cache } from 'react';
import { revalidateCompetencyTags, revalidateQuestionTags, revalidateUserTags } from '@/app/actions';
import { getAuthHeaders } from './roleApi';
import { createLogger } from '@/lib/logger';

import { AssessmentQuestion, BehavioralIndicator, Competency, TemplateReadinessResponse } from '@/types/domain';
import { User, UserCreateInput, UserUpdateInput, UserRole } from '@/types/user';

// Logger for API service
const log = createLogger('API');

// Local O*NET data loaders (frontend-only, no backend API calls)
import { searchOccupations, getPopularOccupations, getOccupationBySocCode } from '@/lib/occupation-data-loader';
import { buildONetProfile } from '@/lib/onet-profile-builder';
import {
  ApiError,
  BackendErrorResponse,
  ErrorCategory,
  ErrorCode,
  createApiError,
  createNetworkError,
  getErrorCategory,
  getUserFriendlyMessage,
  isBackendErrorResponse,
  isRetryableError,
  getSuggestedAction,
} from '@/types/errors';

// API Version configuration
// Default: v1 (current production version)
// Set NEXT_PUBLIC_API_VERSION to override if needed
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

const getApiBaseUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const versionPath = API_VERSION ? `/${API_VERSION}` : '';
    if (!apiUrl) {
        return `http://localhost:8080/api${versionPath}`;
    }
    // For localhost, use http; for production domains, use https
    const protocol = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1') ? 'http' : 'https';
    return `${protocol}://${apiUrl}/api${versionPath}`;
};

// List of API endpoints that return arrays
const QUESTIONS_ENDPOINT = '/questions';
const COMPETENCIES_ENDPOINT = '/competencies';
const BEHAVIORAL_INDICATORS_ENDPOINT = '/behavioral-indicators';
const USERS_ENDPOINT = '/users';
const LIST_ENDPOINTS = [QUESTIONS_ENDPOINT, COMPETENCIES_ENDPOINT, BEHAVIORAL_INDICATORS_ENDPOINT, USERS_ENDPOINT];

// Input types for API operations
interface CompetencyInput {
    name: string;
    description?: string;
    category: string;
    isActive: boolean;
    approvalStatus: string;
    standardCodes?: Record<string, unknown>;
}

interface IndicatorInput {
    title: string;
    description?: string;
    competencyId: string;
    weight: number;
    orderIndex: number;
    observabilityLevel: string;
    measurementType: string;
    examples?: string;
    counterExamples?: string;
    isActive: boolean;
    approvalStatus: string;
}

interface QuestionInput {
    questionText: string;
    questionType: string;
    answerOptions?: Array<{
        text?: string;
        label?: string;
        value?: number;
        score?: number;
        correct?: boolean;
        explanation?: string;
    }>;
    scoringRubric: string;
    timeLimit?: number;
    difficultyLevel: string;
    isActive: boolean;
    orderIndex: number;
}


// Re-export ApiError type for backwards compatibility
export type { ApiError } from '@/types/errors';

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

        // Determine the user-facing message
        let message: string;
        if (backendError?.message) {
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

export const competenciesApi = {
    getAllCompetencies: async (): Promise<Competency[] | null> => {
        return fetchApi(COMPETENCIES_ENDPOINT, {
            tags: ['competencies'],
            revalidate: 300, // 5 minutes
        });
    },

    getCompetencyById: async (competencyId: string) : Promise<Competency | null> => {
        return fetchApi(`/competencies/${competencyId}`, {
            tags: [`competency-${competencyId}`],
            revalidate: 60,
            silentStatusCodes: [404], // 404 is expected for non-existent/deleted competencies
        });
    },

    createCompetency: async (data: CompetencyInput): Promise<Competency> => {
        const authHeaders = await getAuthHeaders();
        const result = await fetchApi<Competency>(COMPETENCIES_ENDPOINT, {
            method: 'POST',
            body: JSON.stringify(data),
            cache: 'no-store',
            authHeaders,
        });
        await revalidateCompetencyTags();
        return result;
    },

    updateCompetency: async (competencyId: string, data: CompetencyInput): Promise<Competency> => {
        const authHeaders = await getAuthHeaders();
        const result = await fetchApi<Competency>(`/competencies/${competencyId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            cache: 'no-store',
            authHeaders,
        });
        await revalidateCompetencyTags(competencyId);
        return result;
    },

    deleteCompetency: async (competencyId: string) => {
        const authHeaders = await getAuthHeaders();
        await fetchApi(`/competencies/${competencyId}`, {
            method: 'DELETE',
            cache: 'no-store',
            authHeaders,
        });
        // Note: Cache revalidation is handled in the server action
    },

    attachIndicator: async (competencyId: string, indicatorId: string): Promise<void> => {
        const authHeaders = await getAuthHeaders();
        await fetchApi(`/competencies/${competencyId}/bi/${indicatorId}`, {
            method: 'POST',
            cache: 'no-store',
            authHeaders,
        });
        await revalidateCompetencyTags(competencyId);
    },

    detachIndicator: async (competencyId: string, indicatorId: string): Promise<void> => {
        const authHeaders = await getAuthHeaders();
        await fetchApi(`/competencies/${competencyId}/bi/${indicatorId}`, {
            method: 'DELETE',
            cache: 'no-store',
            authHeaders,
        });
        await revalidateCompetencyTags(competencyId);
    },

    getAvailableIndicators: async (competencyId: string): Promise<BehavioralIndicator[]> => {
        return fetchApi(`/competencies/${competencyId}/available-bi`, {
            tags: [`available-indicators-${competencyId}`],
            revalidate: 60,
            silentStatusCodes: [404], // 404 is expected when competency doesn't exist
        });
    },
};

// Cached behavioral indicators fetcher
const getIndicatorsCached = cache(async (competencyId: string) : Promise<BehavioralIndicator[] | null> => {
    return fetchApi(`/competencies/${competencyId}/bi`, {
        tags: [`indicators-${competencyId}`],
        revalidate: 60,
        silentStatusCodes: [404], // 404 is expected when competency doesn't exist or has no indicators
    });
});
const getAllIndicatorsCached = cache(
  async (): Promise<BehavioralIndicator[] | null> => {
    return fetchApi(`/behavioral-indicators`, {
      tags: [`indicators-all`],
      revalidate: 60,
    });
  }
);

export const behavioralIndicatorsApi = {
  getIndicators: getIndicatorsCached,
  getAllIndicators: getAllIndicatorsCached,

  getIndicatorById: async (indicatorId: string) : Promise<BehavioralIndicator | null> => {
    return fetchApi(`/behavioral-indicators/${indicatorId}`, {
      tags: [`indicator-${indicatorId}`],
      revalidate: 60,
      silentStatusCodes: [404], // 404 is expected for non-existent/deleted indicators
    });
  },

  createIndicator: async (competencyId: string, data: IndicatorInput): Promise<BehavioralIndicator> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi<BehavioralIndicator>(`/behavioral-indicators`, {
      method: "POST",
      body: JSON.stringify(data),
      cache: "no-store",
      authHeaders,
    });
  },

  updateIndicator: async (
    competencyId: string,
    indicatorId: string,
    data: IndicatorInput
  ): Promise<BehavioralIndicator> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi<BehavioralIndicator>(
      `/behavioral-indicators/${indicatorId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        cache: "no-store",
        authHeaders,
      }
    );
  },

  deleteIndicator: async (competencyId: string, indicatorId: string) => {
    const authHeaders = await getAuthHeaders();
    await fetchApi(`/behavioral-indicators/${indicatorId}`, {
      method: "DELETE",
      cache: "no-store",
      authHeaders,
    });
  },

  updateIndicatorQuestions: async (indicatorId: string, questionIds: string[]) => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`/behavioral-indicators/${indicatorId}/questions`, {
      method: 'PUT',
      body: JSON.stringify({ questionIds }),
      cache: 'no-store',
      authHeaders,
    });
  },
};

// Cached assessment questions fetcher
const getIndicatorQuestionsCached = cache(async (competencyId: string, behavioralIndicatorId: string) : Promise<AssessmentQuestion[] | null> => {
    return fetchApi(
      `/behavioral-indicators/${behavioralIndicatorId}/questions`,
      {
        tags: [`questions-${competencyId}-${behavioralIndicatorId}`],
        revalidate: 60,
        silentStatusCodes: [404], // 404 is expected when indicator doesn't exist or has no questions
      }
    );
});
// Cached ALL assessment questions fetcher
const getAllQuestionsCached = cache(async () : Promise<AssessmentQuestion[] | null> => {
    return fetchApi(
        `/questions`,
        {
            tags: [`questions-all`],
            revalidate: 60,
        }
    );
});
export const assessmentQuestionsApi = {
  getIndicatorQuestions: getIndicatorQuestionsCached,
  getAllQuestions: getAllQuestionsCached,

  getQuestionById: async (
    questionId: string
  ) : Promise<AssessmentQuestion | null> => {
    return fetchApi(
      `/questions/${questionId}`,
      {
        tags: [`question-${questionId}`],
        revalidate: 60,
        silentStatusCodes: [404], // 404 is expected for non-existent/deleted questions
      }
    );
  },

  createQuestion: async (
    competencyId: string,
    behavioralIndicatorId: string,
    data: QuestionInput
  ): Promise<AssessmentQuestion> => {
    // Create a clean payload that exactly matches the backend DTO
    const payload = {
      id: null, // Backend will generate this
      behavioralIndicatorId: null, // Sent as query param, not in body
      questionText: String(data.questionText || ''),
      questionType: String(data.questionType || 'MULTIPLE_CHOICE'),
      answerOptions: Array.isArray(data.answerOptions) ? data.answerOptions.map(option => {
        const cleanOption: Record<string, unknown> = {};
        if (option.text !== undefined) cleanOption.text = String(option.text);
        if (option.label !== undefined) cleanOption.label = String(option.label);
        if (option.value !== undefined) cleanOption.value = Number(option.value);
        if (option.score !== undefined) cleanOption.score = Number(option.score);
        if (option.correct !== undefined) cleanOption.correct = Boolean(option.correct);
        if (option.explanation !== undefined) cleanOption.explanation = String(option.explanation);
        return cleanOption;
      }) : [],
      scoringRubric: String(data.scoringRubric || ''),
      timeLimit: data.timeLimit ? Number(data.timeLimit) : null,
      difficultyLevel: String(data.difficultyLevel || 'FOUNDATIONAL'),
      isActive: Boolean(data.isActive ?? true),
      orderIndex: Number(data.orderIndex || 0)
    };
    
    const authHeaders = await getAuthHeaders();
    const result = await fetchApi<AssessmentQuestion>(
      `/questions?behavioralIndicatorId=${encodeURIComponent(behavioralIndicatorId)}`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        cache: "no-store",
        authHeaders,
      }
    );
    await revalidateQuestionTags(competencyId, behavioralIndicatorId);
    return result;
  },

  updateQuestion: async (
    questionId: string,
    data: QuestionInput,
    competencyId: string,
    behavioralIndicatorId: string,
  ): Promise<AssessmentQuestion> => {
    const authHeaders = await getAuthHeaders();
    const result = await fetchApi<AssessmentQuestion>(
      `/questions/${questionId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        cache: "no-store",
        authHeaders,
      }
    );
    await revalidateQuestionTags(
      questionId,
      competencyId,
      behavioralIndicatorId
    );
    return result;
  },

  deleteQuestion: async (
    competencyId: string,
    behavioralIndicatorId: string,
    questionId: string
  ) => {
    const authHeaders = await getAuthHeaders();
    await fetchApi(
      `/questions/${questionId}`,
      {
        method: "DELETE",
        cache: "no-store",
        authHeaders,
      }
    );
    await revalidateQuestionTags(
      questionId,
      competencyId,
      behavioralIndicatorId,
    );
  },
};

// ==========================================
// USERS API - Clerk.js Integration
// Requires ADMIN role for all endpoints
// ==========================================

// Cached users fetcher with auth headers
const getAllUsersCached = cache(async (): Promise<User[] | null> => {
  const authHeaders = await getAuthHeaders();
  return fetchApi(USERS_ENDPOINT, {
    tags: ['users'],
    revalidate: 60,
    authHeaders,
  });
});

export const usersApi = {
  getAllUsers: getAllUsersCached,

  getUserById: async (userId: string): Promise<User | null> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${USERS_ENDPOINT}/${userId}`, {
      tags: [`user-${userId}`],
      revalidate: 60,
      authHeaders,
      silentStatusCodes: [404], // 404 is expected for non-existent users
    });
  },

  getUserByClerkId: async (clerkId: string): Promise<User | null> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${USERS_ENDPOINT}/clerk/${clerkId}`, {
      tags: [`user-clerk-${clerkId}`],
      revalidate: 60,
      authHeaders,
      silentStatusCodes: [404], // 404 is expected for non-existent users
    });
  },

  createUser: async (data: UserCreateInput): Promise<User> => {
    const authHeaders = await getAuthHeaders();
    const result = await fetchApi<User>(USERS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(data),
      cache: 'no-store',
      authHeaders,
    });
    await revalidateUserTags();
    return result;
  },

  updateUser: async (userId: string, data: UserUpdateInput): Promise<User> => {
    const authHeaders = await getAuthHeaders();
    const result = await fetchApi<User>(`${USERS_ENDPOINT}/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      cache: 'no-store',
      authHeaders,
    });
    await revalidateUserTags(userId);
    return result;
  },

  updateUserRole: async (userId: string, role: UserRole): Promise<User> => {
    const authHeaders = await getAuthHeaders();
    const result = await fetchApi<User>(`${USERS_ENDPOINT}/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
      cache: 'no-store',
      authHeaders,
    });
    await revalidateUserTags(userId);
    return result;
  },

  deactivateUser: async (userId: string): Promise<void> => {
    const authHeaders = await getAuthHeaders();
    await fetchApi(`${USERS_ENDPOINT}/${userId}/deactivate`, {
      method: 'PATCH',
      cache: 'no-store',
      authHeaders,
    });
    await revalidateUserTags(userId);
  },

  activateUser: async (userId: string): Promise<void> => {
    const authHeaders = await getAuthHeaders();
    await fetchApi(`${USERS_ENDPOINT}/${userId}/activate`, {
      method: 'PATCH',
      cache: 'no-store',
      authHeaders,
    });
    await revalidateUserTags(userId);
  },

  deleteUser: async (userId: string): Promise<void> => {
    const authHeaders = await getAuthHeaders();
    await fetchApi(`${USERS_ENDPOINT}/${userId}`, {
      method: 'DELETE',
      cache: 'no-store',
      authHeaders,
    });
    await revalidateUserTags(userId);
  },

  searchUsers: async (query: string): Promise<User[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${USERS_ENDPOINT}/search?query=${encodeURIComponent(query)}`, {
      cache: 'no-store',
      authHeaders,
    });
  },

  getUsersByRole: async (role: UserRole): Promise<User[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${USERS_ENDPOINT}/role/${role}`, {
      tags: [`users-role-${role}`],
      revalidate: 60,
      authHeaders,
    });
  },

  getUserStats: async (): Promise<{
    totalUsers: number;
    activeUsers: number;
    byRole: Record<string, number>;
  }> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${USERS_ENDPOINT}/stats`, {
      tags: ['users-stats'],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Manually sync all users from Clerk to the backend.
   * This calls the /api/users/sync endpoint which fetches users from Clerk
   * and syncs them to the Spring Boot backend.
   */
  syncAllFromClerk: async (): Promise<{
    success: boolean;
    message?: string;
    created?: number;
    updated?: number;
    failed?: number;
    total?: number;
    error?: string;
    errors?: string[];
  }> => {
    type SyncResponse = {
      success: boolean;
      message?: string;
      created?: number;
      updated?: number;
      failed?: number;
      total?: number;
      error?: string;
      errors?: string[];
    };

    const response = await fetch('/api/users/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData: { error?: string } = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(errorData.error || `Sync failed: ${response.status}`);
    }

    return response.json() as Promise<SyncResponse>;
  },
};

// ============================================
// TEST TEMPLATES API
// ============================================

import {
  TestTemplate,
  TestTemplateSummary,
  CreateTestTemplateRequest,
  UpdateTestTemplateRequest,
  TestSession,
  TestSessionSummary,
  StartTestSessionRequest,
  TestAnswer,
  SubmitAnswerRequest,
  TestResult,
  CurrentQuestionResponse,
  UserStatistics,
  TemplateStatistics,
} from '@/types/domain';

// Test endpoints - paths are relative to the v1 base URL
const TEST_TEMPLATES_BASE = '/tests/templates';
const TEST_SESSIONS_BASE = '/tests/sessions';
const TEST_RESULTS_BASE = '/tests/results';

export const testTemplatesApi = {
  /**
   * Get all test templates with pagination
   */
  getAllTemplates: async (page = 0, size = 20): Promise<{
    content: TestTemplateSummary[];
    totalElements: number;
    totalPages: number;
  }> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_TEMPLATES_BASE}?page=${page}&size=${size}`, {
      tags: ['test-templates'],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Get only active test templates
   */
  getActiveTemplates: async (): Promise<TestTemplateSummary[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_TEMPLATES_BASE}/active`, {
      tags: ['test-templates-active'],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Get a single test template by ID
   */
  getTemplateById: async (id: string): Promise<TestTemplate | null> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_TEMPLATES_BASE}/${id}`, {
      tags: [`test-template-${id}`],
      revalidate: 60,
      authHeaders,
      silentStatusCodes: [404], // 404 is expected for non-existent/deleted templates
    });
  },

  /**
   * Create a new test template
   */
  createTemplate: async (data: CreateTestTemplateRequest): Promise<TestTemplate> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_TEMPLATES_BASE}`, {
      method: 'POST',
      body: JSON.stringify(data),
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Update an existing test template
   */
  updateTemplate: async (id: string, data: UpdateTestTemplateRequest): Promise<TestTemplate> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_TEMPLATES_BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Search templates by name
   */
  searchByName: async (name: string): Promise<TestTemplateSummary[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_TEMPLATES_BASE}/search?name=${encodeURIComponent(name)}`, {
      tags: ['test-templates-search'],
      revalidate: 30,
      authHeaders,
    });
  },

  /**
   * Get templates by competency
   */
  getByCompetency: async (competencyId: string): Promise<TestTemplateSummary[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_TEMPLATES_BASE}/by-competency/${competencyId}`, {
      tags: [`test-templates-competency-${competencyId}`],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Get template statistics (admin only)
   */
  getStatistics: async (): Promise<{
    totalTemplates: number;
    activeTemplates: number;
    inactiveTemplates: number;
  }> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_TEMPLATES_BASE}/statistics`, {
      tags: ['test-templates-stats'],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Delete a test template
   */
  deleteTemplate: async (id: string): Promise<void> => {
    const authHeaders = await getAuthHeaders();
    await fetchApi(`${TEST_TEMPLATES_BASE}/${id}`, {
      method: 'DELETE',
      cache: 'no-store',
      authHeaders,
    });
  },
};

// ============================================
// TEST SESSIONS API
// ============================================

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
};

// ============================================
// TEST RESULTS API
// ============================================

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
};

// ============================================
// PSYCHOMETRICS API
// ============================================

import type {
  PsychometricHealthReport,
  ItemStatistics,
  ItemStatisticsDetail,
  CompetencyReliability,
  CompetencyReliabilityDetail,
  BigFiveReliability,
  FlaggedItemSummary,
  UpdateItemStatusRequest,
  AuditResult,
  ItemStatisticsFilterParams,
  CompetencyReliabilityFilterParams,
  Page,
  ItemValidityStatus,
} from '@/types/psychometrics';

const PSYCHOMETRICS_BASE = '/psychometrics';

export const psychometricsApi = {
  /**
   * Get psychometric dashboard overview
   */
  getDashboard: async (): Promise<PsychometricHealthReport> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${PSYCHOMETRICS_BASE}/dashboard`, {
      tags: ['psychometrics-dashboard'],
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Get paginated item statistics with optional filters
   */
  getItems: async (params: ItemStatisticsFilterParams = {}): Promise<Page<ItemStatistics>> => {
    const authHeaders = await getAuthHeaders();
    const searchParams = new URLSearchParams();

    if (params.status) searchParams.append('status', params.status);
    if (params.competencyId) searchParams.append('competencyId', params.competencyId);
    if (params.discriminationFlag) searchParams.append('discriminationFlag', params.discriminationFlag);
    if (params.search) searchParams.append('search', params.search);
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.size !== undefined) searchParams.append('size', params.size.toString());
    if (params.sort) searchParams.append('sort', params.sort);

    const queryString = searchParams.toString();
    const url = `${PSYCHOMETRICS_BASE}/items${queryString ? `?${queryString}` : ''}`;

    return fetchApi(url, {
      tags: ['psychometrics-items'],
      revalidate: 60, // 1 minute cache for better performance
      authHeaders,
    });
  },

  /**
   * Get detailed statistics for a specific question
   */
  getItemDetail: async (questionId: string): Promise<ItemStatisticsDetail> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${PSYCHOMETRICS_BASE}/items/${questionId}`, {
      tags: [`psychometrics-item-${questionId}`, 'psychometrics-items'],
      revalidate: 60, // 1 minute cache
      authHeaders,
    });
  },

  /**
   * Manually trigger recalculation for a question
   */
  recalculateItem: async (questionId: string): Promise<ItemStatistics> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${PSYCHOMETRICS_BASE}/items/${questionId}/recalculate`, {
      method: 'POST',
      authHeaders,
    });
  },

  /**
   * Manually update item validity status
   */
  updateItemStatus: async (questionId: string, request: UpdateItemStatusRequest): Promise<ItemStatistics> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${PSYCHOMETRICS_BASE}/items/${questionId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      authHeaders,
    });
  },

  /**
   * Get paginated competency reliability list
   */
  getCompetencies: async (params: CompetencyReliabilityFilterParams = {}): Promise<Page<CompetencyReliability>> => {
    const authHeaders = await getAuthHeaders();
    const searchParams = new URLSearchParams();

    if (params.status) searchParams.append('status', params.status);
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.size !== undefined) searchParams.append('size', params.size.toString());
    if (params.sort) searchParams.append('sort', params.sort);

    const queryString = searchParams.toString();
    const url = `${PSYCHOMETRICS_BASE}/competencies${queryString ? `?${queryString}` : ''}`;

    return fetchApi(url, {
      tags: ['psychometrics-competencies'],
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Get detailed reliability for a specific competency
   */
  getCompetencyDetail: async (competencyId: string): Promise<CompetencyReliabilityDetail> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${PSYCHOMETRICS_BASE}/competencies/${competencyId}`, {
      tags: [`psychometrics-competency-${competencyId}`],
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Get all flagged items sorted by severity
   */
  getFlaggedItems: async (): Promise<FlaggedItemSummary[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${PSYCHOMETRICS_BASE}/flagged`, {
      tags: ['psychometrics-flagged'],
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Get Big Five trait reliability
   */
  getBigFiveReliability: async (): Promise<BigFiveReliability[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${PSYCHOMETRICS_BASE}/big-five`, {
      tags: ['psychometrics-big-five'],
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Manually trigger a full psychometric audit
   */
  triggerAudit: async (): Promise<AuditResult> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${PSYCHOMETRICS_BASE}/audit/trigger`, {
      method: 'POST',
      authHeaders,
    });
  },

  /**
   * Batch update item statuses (calls individual updates in parallel)
   * Returns results for each item: { questionId, success, error? }
   */
  batchUpdateItemStatus: async (
    questionIds: string[],
    newStatus: ItemValidityStatus,
    reason: string
  ): Promise<{ questionId: string; success: boolean; error?: string }[]> => {
    const results = await Promise.allSettled(
      questionIds.map(async (questionId) => {
        await psychometricsApi.updateItemStatus(questionId, { newStatus, reason });
        return { questionId, success: true };
      })
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return {
        questionId: questionIds[index],
        success: false,
        error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
      };
    });
  },
};

// ============================================
// O*NET API (Goal-Aware Blueprint)
// ============================================

import type {
  ONetJobTitle,
  ONetProfile,
  Team,
  TeamProfile,
  CompetencyPassport,
  AssemblyProgress,
} from '@/types/domain';

// ============================================
// O*NET API (Frontend-Only, Local Data)
// ============================================
//
// Uses local JSON data files instead of backend API calls.
// Data sources: OccupationData.json, Abilities.json, Knowledge.json, WorkStyles.json
// This follows the same pattern as ESCO/O*NET standards integration for competencies.

export const onetApi = {
  /**
   * Search O*NET job titles by title or keyword.
   * Uses Fuse.js fuzzy search on local occupation data.
   */
  searchJobTitles: async (query: string, limit = 15): Promise<ONetJobTitle[]> => {
    if (!query.trim()) {
      return [];
    }
    // Use local data loader with fuzzy search
    return searchOccupations(query, limit);
  },

  /**
   * Get detailed O*NET profile for an occupation.
   * Builds profile from local element data (Abilities, Knowledge, WorkStyles).
   */
  getProfile: async (socCode: string): Promise<ONetProfile> => {
    // Build profile from local JSON data
    return buildONetProfile(socCode);
  },

  /**
   * Get popular/common job titles for quick selection.
   * Returns curated list of high-demand occupations.
   */
  getPopularJobTitles: async (): Promise<ONetJobTitle[]> => {
    // Return popular occupations from local data
    return getPopularOccupations(10);
  },
};

// ============================================
// TEAMS API (Goal-Aware Blueprint)
// ============================================

const TEAMS_BASE = '/teams';
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

/**
 * Mock teams for development when backend is not available.
 */
const MOCK_TEAMS: Team[] = [
  { id: 'team-1', name: 'Engineering Team', memberCount: 8, createdAt: '2024-01-15' },
  { id: 'team-2', name: 'Product Team', memberCount: 5, createdAt: '2024-02-20' },
  { id: 'team-3', name: 'Design Team', memberCount: 4, createdAt: '2024-03-10' },
  { id: 'team-4', name: 'Marketing Team', memberCount: 6, createdAt: '2024-01-25' },
  { id: 'team-5', name: 'Sales Team', memberCount: 10, createdAt: '2024-04-05' },
];

export const teamsApi = {
  /**
   * Get all teams for the current organization.
   * Used for team selection dropdown in TEAM_FIT configuration.
   */
  getAllTeams: async (): Promise<Team[]> => {
    if (USE_MOCK_API) {
      return MOCK_TEAMS;
    }

    try {
      const authHeaders = await getAuthHeaders();
      return await fetchApi(TEAMS_BASE, {
        tags: ['teams'],
        revalidate: 60, // Cache for 1 minute
        authHeaders,
      });
    } catch (error) {
      console.warn('Teams API not available, using mock data:', error);
      return MOCK_TEAMS;
    }
  },

  /**
   * Get team profile with saturation analysis.
   * Shows which competencies are under-represented in the team.
   */
  getTeamProfile: async (teamId: string): Promise<TeamProfile> => {
    if (USE_MOCK_API) {
      const team = MOCK_TEAMS.find(t => t.id === teamId);
      return {
        teamId,
        teamName: team?.name || 'Unknown Team',
        saturation: {
          'Problem Solving': 0.85,
          'Communication': 0.60,
          'Leadership': 0.40,
          'Technical Skills': 0.95,
          'Adaptability': 0.55,
          'Teamwork': 0.75,
        },
        undersaturatedCompetencies: ['Leadership', 'Adaptability', 'Communication'],
        memberSkills: [],
      };
    }

    try {
      const authHeaders = await getAuthHeaders();
      return await fetchApi(`${TEAMS_BASE}/${teamId}/profile`, {
        tags: [`team-profile-${teamId}`],
        revalidate: 60, // Cache for 1 minute
        authHeaders,
      });
    } catch (error) {
      console.warn('Team profile API not available, using mock data:', error);
      const team = MOCK_TEAMS.find(t => t.id === teamId);
      return {
        teamId,
        teamName: team?.name || 'Unknown Team',
        saturation: {
          'Problem Solving': 0.85,
          'Leadership': 0.40,
          'Adaptability': 0.55,
        },
        undersaturatedCompetencies: ['Leadership', 'Adaptability'],
        memberSkills: [],
      };
    }
  },
};

// ============================================
// PASSPORT API (Delta Testing)
// ============================================

const PASSPORT_BASE = '/passports';

export const passportApi = {
  /**
   * Get competency passport for a specific user.
   * Returns null if user doesn't have a passport yet.
   */
  getPassport: async (clerkUserId: string): Promise<CompetencyPassport | null> => {
    if (USE_MOCK_API) {
      // Return mock passport for demo purposes
      return {
        id: 'passport-1',
        candidateId: 'candidate-1',
        clerkUserId,
        lastUpdated: new Date().toISOString(),
        scores: {
          'Problem Solving': 78,
          'Communication': 82,
          'Leadership': 65,
          'Teamwork': 88,
          'Adaptability': 75,
        },
        bigFiveProfile: {
          openness: 72,
          conscientiousness: 85,
          extraversion: 60,
          agreeableness: 78,
          emotionalStability: 70,
        },
        isValid: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    try {
      const authHeaders = await getAuthHeaders();
      return await fetchApi(`${PASSPORT_BASE}/user/${clerkUserId}`, {
        tags: [`passport-${clerkUserId}`],
        cache: 'no-store',
        authHeaders,
        silentStatusCodes: [404],
      });
    } catch (error) {
      // Return null if passport doesn't exist (404)
      if (error instanceof Error && 'status' in error && (error as ApiError).status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Check if user has a valid (non-expired) passport.
   * Used to determine if delta testing is available.
   */
  hasValidPassport: async (clerkUserId: string): Promise<boolean> => {
    if (USE_MOCK_API) {
      return true; // Mock: always has passport
    }

    try {
      const authHeaders = await getAuthHeaders();
      const result = await fetchApi<{ valid: boolean }>(
        `${PASSPORT_BASE}/user/${clerkUserId}/valid`,
        {
          cache: 'no-store',
          authHeaders,
          silentStatusCodes: [404],
        }
      );
      return result?.valid ?? false;
    } catch {
      return false;
    }
  },
};

// ============================================
// ASSEMBLY PROGRESS API
// ============================================

const ASSEMBLY_BASE = '/tests/sessions/templates';

export const assemblyApi = {
  /**
   * Get real-time assembly progress for a template.
   * Used for progress modal during test session creation.
   */
  getProgress: async (templateId: string): Promise<AssemblyProgress | null> => {
    try {
      const authHeaders = await getAuthHeaders();
      return await fetchApi(`${ASSEMBLY_BASE}/${templateId}/assembly-progress`, {
        cache: 'no-store',
        authHeaders,
        silentStatusCodes: [404],
      });
    } catch {
      return null;
    }
  },
};

// ============================================
// ACTIVITY TRACKING API (Admin/Editor Dashboard)
// ============================================

import type {
  TestActivity,
  TemplateActivityStats,
  ActivityPage,
  ActivityFilterParams,
} from '@/types/activity';

const ACTIVITY_BASE = '/tests/activity';

export const activityApi = {
  /**
   * Get recent activity for dashboard widget.
   * Returns test completions, abandonments, and timeouts.
   * Requires ADMIN or EDITOR role.
   */
  getRecentActivity: async (limit = 10): Promise<TestActivity[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${ACTIVITY_BASE}/recent?limit=${limit}`, {
      tags: ['activity-recent'],
      cache: 'no-store', // Activity data should always be fresh
      authHeaders,
    });
  },

  /**
   * Get paginated activity for a specific template.
   * Supports filtering by status, passed, and date range.
   * Requires ADMIN or EDITOR role.
   */
  getTemplateActivity: async (
    templateId: string,
    params: ActivityFilterParams = {}
  ): Promise<ActivityPage> => {
    const authHeaders = await getAuthHeaders();
    const searchParams = new URLSearchParams();

    if (params.status) searchParams.append('status', params.status);
    if (params.passed !== undefined) searchParams.append('passed', String(params.passed));
    if (params.from) searchParams.append('from', params.from);
    if (params.to) searchParams.append('to', params.to);
    if (params.page !== undefined) searchParams.append('page', String(params.page));
    if (params.size !== undefined) searchParams.append('size', String(params.size));

    const queryString = searchParams.toString();
    const url = `${ACTIVITY_BASE}/template/${templateId}${queryString ? `?${queryString}` : ''}`;

    return fetchApi(url, {
      tags: [`activity-template-${templateId}`],
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Get aggregated activity statistics for a template.
   * Includes completion rate, pass rate, average score, etc.
   * Requires ADMIN or EDITOR role.
   */
  getTemplateActivityStats: async (templateId: string): Promise<TemplateActivityStats | null> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${ACTIVITY_BASE}/template/${templateId}/stats`, {
      tags: [`activity-stats-${templateId}`],
      revalidate: 60, // Cache for 1 minute since stats don't change rapidly
      authHeaders,
      silentStatusCodes: [404], // Template might not exist
    });
  },
};

// ============================================
// TEMPLATE VISIBILITY & SHARING API
// ============================================

import {
  VisibilityInfo,
  ChangeVisibilityRequest,
  TemplateShare,
  ShareUserRequest,
  ShareTeamRequest,
  UpdateShareRequest,
  BulkShareRequest,
  BulkShareResponse,
  ShareLink,
  CreateShareLinkRequest,
  LinkValidationResult,
  LinkCountInfo,
  TemplateVisibility,
  SharePermission,
  SharedTemplatesResponse,
} from '@/types/domain';

const TEMPLATES_BASE = '/tests/templates';

/**
 * Template visibility and sharing API.
 * Provides functions for managing template access control.
 */
export const templateSharingApi = {
  // ==================== VISIBILITY ====================

  /**
   * Get visibility information for a template.
   */
  getVisibility: async (templateId: string): Promise<VisibilityInfo> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/visibility`, {
      tags: [`visibility-${templateId}`],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Change template visibility setting.
   */
  changeVisibility: async (
    templateId: string,
    request: ChangeVisibilityRequest
  ): Promise<VisibilityInfo> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify(request),
      authHeaders,
    });
  },

  /**
   * Check if visibility can be changed to a specific value.
   */
  canChangeVisibility: async (
    templateId: string,
    visibility: TemplateVisibility
  ): Promise<boolean> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(
      `${TEMPLATES_BASE}/${templateId}/visibility/can-change?visibility=${visibility}`,
      { authHeaders }
    );
  },

  // ==================== USER/TEAM SHARES ====================

  /**
   * List all shares for a template.
   */
  listShares: async (templateId: string): Promise<TemplateShare[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/shares`, {
      tags: [`shares-${templateId}`],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * List only user shares for a template.
   */
  listUserShares: async (templateId: string): Promise<TemplateShare[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/shares/users`, {
      tags: [`shares-users-${templateId}`],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * List only team shares for a template.
   */
  listTeamShares: async (templateId: string): Promise<TemplateShare[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/shares/teams`, {
      tags: [`shares-teams-${templateId}`],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Share template with a user.
   */
  shareWithUser: async (
    templateId: string,
    request: ShareUserRequest
  ): Promise<TemplateShare> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/shares/users`, {
      method: 'POST',
      body: JSON.stringify(request),
      authHeaders,
    });
  },

  /**
   * Share template with a team.
   */
  shareWithTeam: async (
    templateId: string,
    request: ShareTeamRequest
  ): Promise<TemplateShare> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/shares/teams`, {
      method: 'POST',
      body: JSON.stringify(request),
      authHeaders,
    });
  },

  /**
   * Bulk share with multiple users and teams.
   */
  bulkShare: async (
    templateId: string,
    request: BulkShareRequest
  ): Promise<BulkShareResponse> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/shares/bulk`, {
      method: 'POST',
      body: JSON.stringify(request),
      authHeaders,
    });
  },

  /**
   * Update an existing share.
   */
  updateShare: async (
    templateId: string,
    shareId: string,
    request: UpdateShareRequest
  ): Promise<TemplateShare> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/shares/${shareId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
      authHeaders,
    });
  },

  /**
   * Revoke a share.
   */
  revokeShare: async (templateId: string, shareId: string): Promise<void> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/shares/${shareId}`, {
      method: 'DELETE',
      authHeaders,
    });
  },

  /**
   * Check if current user can grant a specific permission.
   */
  canGrantPermission: async (
    templateId: string,
    permission: SharePermission
  ): Promise<boolean> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(
      `${TEMPLATES_BASE}/${templateId}/shares/can-grant?permission=${permission}`,
      { authHeaders }
    );
  },

  /**
   * Get count of active shares.
   */
  countShares: async (templateId: string): Promise<number> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/shares/count`, {
      authHeaders,
    });
  },

  // ==================== SHARE LINKS ====================

  /**
   * Validate a share link token (PUBLIC - no auth required).
   */
  validateLink: async (token: string): Promise<LinkValidationResult> => {
    // No auth headers - this is a public endpoint
    return fetchApi(`${TEMPLATES_BASE}/validate-link?token=${encodeURIComponent(token)}`, {
      cache: 'no-store', // Always validate fresh
    });
  },

  /**
   * List all links for a template.
   */
  listLinks: async (templateId: string): Promise<ShareLink[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/links`, {
      tags: [`links-${templateId}`],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * List only active links for a template.
   */
  listActiveLinks: async (templateId: string): Promise<ShareLink[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/links/active`, {
      tags: [`links-active-${templateId}`],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Create a new share link.
   */
  createLink: async (
    templateId: string,
    request: CreateShareLinkRequest
  ): Promise<ShareLink> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/links`, {
      method: 'POST',
      body: JSON.stringify(request),
      authHeaders,
    });
  },

  /**
   * Revoke a share link.
   */
  revokeLink: async (templateId: string, linkId: string): Promise<void> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/links/${linkId}`, {
      method: 'DELETE',
      authHeaders,
    });
  },

  /**
   * Revoke all share links for a template.
   */
  revokeAllLinks: async (templateId: string): Promise<number> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/links`, {
      method: 'DELETE',
      authHeaders,
    });
  },

  /**
   * Check if a new link can be created.
   */
  canCreateLink: async (templateId: string): Promise<boolean> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/links/can-create`, {
      authHeaders,
    });
  },

  /**
   * Get link count information.
   */
  getLinkCount: async (templateId: string): Promise<LinkCountInfo> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/links/count`, {
      authHeaders,
    });
  },

  // ==================== SHARED WITH ME ====================

  /**
   * Get templates shared with the current user.
   * Returns templates where the user has been granted access via shares.
   *
   * NOTE: Backend endpoint pending implementation.
   * Required endpoint: GET /api/v1/tests/templates/shared-with-me
   * Should return: { items: SharedTemplateItem[], total: number }
   */
  getSharedWithMe: async (): Promise<SharedTemplatesResponse> => {
    try {
      const authHeaders = await getAuthHeaders();
      return await fetchApi(`${TEMPLATES_BASE}/shared-with-me`, {
        tags: ['shared-templates'],
        revalidate: 60,
        authHeaders,
      });
    } catch {
      // Graceful fallback if endpoint not yet implemented
      // Log warning but return empty result to keep UI functional
      log.warn('getSharedWithMe endpoint not available, returning empty result');
      return { items: [], total: 0 };
    }
  },

  /**
   * Get count of templates shared with the current user.
   *
   * NOTE: Backend endpoint pending implementation.
   * Required endpoint: GET /api/v1/tests/templates/shared-with-me/count
   */
  getSharedWithMeCount: async (): Promise<number> => {
    try {
      const authHeaders = await getAuthHeaders();
      return await fetchApi(`${TEMPLATES_BASE}/shared-with-me/count`, {
        authHeaders,
      });
    } catch {
      // Graceful fallback if endpoint not yet implemented
      return 0;
    }
  },
};