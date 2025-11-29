import { cache } from 'react';
import { revalidateCompetencyTags, revalidateQuestionTags, revalidateUserTags } from '@/app/actions';
import { getAuthHeaders } from './roleApi';

import { AssessmentQuestion, BehavioralIndicator, Competency } from '../../app/interfaces/domain-interfaces';
import { User, UserCreateInput, UserUpdateInput, UserRole } from '../../app/interfaces/user-interfaces';

const getApiBaseUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    return apiUrl ? `https://${apiUrl}/api` : "http://localhost:8080/api";
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
    level: string;
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


// const API_BASE_URL = "https://localhost:8080/api";
// Types for API responses and errors
export interface ApiError extends Error {
    status?: number;
    code?: string;
}

interface ErrorResponse {
    message?: string;
    code?: string;
}

// Helper function to handle responses with proper error typing
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error: ApiError = new Error('API request failed for url: ' + response.url);
        error.status = response.status;
        
        try {
            const errorData = await response.json() as ErrorResponse;
            error.message = errorData.message || `HTTP error! status: ${response.status}`;
            error.code = errorData.code;
        } catch {
            error.message = `HTTP error! status: ${response.status}`;
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

// API fetch wrapper with caching and revalidation
export async function fetchApi<T>(
    endpoint: string,
    options: RequestInit & {
        tags?: string[];
        revalidate?: false | 0 | number;
        cache?: RequestCache;
        authHeaders?: Record<string, string>;
    } = {}
): Promise<T> {
    const { tags = [], revalidate, cache = 'force-cache', authHeaders = {}, ...fetchOptions } = options;
    
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

        return handleResponse<T>(response);
    } catch (error) {
        // Handle connection errors gracefully during build time
        if (error instanceof Error) {
            // Handle CORS errors
            if (error.message.includes('CORS') || error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                const corsError: ApiError = new Error(`CORS error when accessing ${getApiBaseUrl()}${endpoint}. Check backend CORS configuration.`);
                corsError.code = 'CORS_ERROR';
                throw corsError;
            }
            
            // Handle connection errors during build
            if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
                // Return empty array for list endpoints, null for single item endpoints
                if (LIST_ENDPOINTS.some(path => endpoint.includes(path))) {
                    return [] as T;
                }
                return null as T;
            }
        }
        throw error;
    }
}

// Cached competencies fetcher
const getCompetenciesCached = cache(async () : Promise<Competency[] | null> => {
    return fetchApi(COMPETENCIES_ENDPOINT, {
        tags: ['competencies'],
        revalidate: 60, // Revalidate every minute
    });
});

export const competenciesApi = {
    getAllCompetencies: getCompetenciesCached,

    getCompetencyById: async (competencyId: string) : Promise<Competency | null> => {
        return fetchApi(`/competencies/${competencyId}`, {
            tags: [`competency-${competencyId}`],
            revalidate: 60,
        });
    },

    createCompetency: async (data: CompetencyInput): Promise<Competency> => {
        const result = await fetchApi<Competency>(COMPETENCIES_ENDPOINT, {
            method: 'POST',
            body: JSON.stringify(data),
            cache: 'no-store',
        });
        await revalidateCompetencyTags();
        return result;
    },

    updateCompetency: async (competencyId: string, data: CompetencyInput): Promise<Competency> => {
        const result = await fetchApi<Competency>(`/competencies/${competencyId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            cache: 'no-store',
        });
        await revalidateCompetencyTags(competencyId);
        return result;
    },

    deleteCompetency: async (competencyId: string) => {
        await fetchApi(`/competencies/${competencyId}`, {
            method: 'DELETE',
            cache: 'no-store',
        });
        // Note: Cache revalidation is handled in the server action
    },

    attachIndicator: async (competencyId: string, indicatorId: string): Promise<void> => {
        await fetchApi(`/competencies/${competencyId}/bi/${indicatorId}`, {
            method: 'POST',
            cache: 'no-store',
        });
        await revalidateCompetencyTags(competencyId);
    },

    detachIndicator: async (competencyId: string, indicatorId: string): Promise<void> => {
        await fetchApi(`/competencies/${competencyId}/bi/${indicatorId}`, {
            method: 'DELETE',
            cache: 'no-store',
        });
        await revalidateCompetencyTags(competencyId);
    },

    getAvailableIndicators: async (competencyId: string): Promise<BehavioralIndicator[]> => {
        return fetchApi(`/competencies/${competencyId}/available-bi`, {
            tags: [`available-indicators-${competencyId}`],
            revalidate: 60,
        });
    },
};

// Cached behavioral indicators fetcher
const getIndicatorsCached = cache(async (competencyId: string) : Promise<BehavioralIndicator[] | null> => {
    return fetchApi(`/competencies/${competencyId}/bi`, {
        tags: [`indicators-${competencyId}`],
        revalidate: 60,
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
    });
  },

  createIndicator: async (competencyId: string, data: IndicatorInput): Promise<BehavioralIndicator> => {
    return fetchApi<BehavioralIndicator>(`/behavioral-indicators`, {
      method: "POST",
      body: JSON.stringify(data),
      cache: "no-store",
    });
  },

  updateIndicator: async (
    competencyId: string,
    indicatorId: string,
    data: IndicatorInput
  ): Promise<BehavioralIndicator> => {
    return fetchApi<BehavioralIndicator>(
      `/behavioral-indicators/${indicatorId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        cache: "no-store",
      }
    );
  },

  deleteIndicator: async (competencyId: string, indicatorId: string) => {
    await fetchApi(`/behavioral-indicators/${indicatorId}`, {
      method: "DELETE",
      cache: "no-store",
    });
  },

  updateIndicatorQuestions: async (indicatorId: string, questionIds: string[]) => {
    return fetchApi(`/behavioral-indicators/${indicatorId}/questions`, {
      method: 'PUT',
      body: JSON.stringify({ questionIds }),
      cache: 'no-store',
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
    
    const result = await fetchApi<AssessmentQuestion>(
      `/questions?behavioralIndicatorId=${encodeURIComponent(behavioralIndicatorId)}`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        cache: "no-store",
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
    const result = await fetchApi<AssessmentQuestion>(
      `/questions/${questionId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        cache: "no-store",
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
    await fetchApi(
      `/questions/${questionId}`,
      {
        method: "DELETE",
        cache: "no-store",
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
    });
  },

  getUserByClerkId: async (clerkId: string): Promise<User | null> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${USERS_ENDPOINT}/clerk/${clerkId}`, {
      tags: [`user-clerk-${clerkId}`],
      revalidate: 60,
      authHeaders,
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
    const response = await fetch('/api/users/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Sync failed: ${response.status}`);
    }
    
    return response.json();
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
} from '../../app/interfaces/domain-interfaces';

const TESTS_BASE = '/v1/tests';

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
    return fetchApi(`${TESTS_BASE}/templates?page=${page}&size=${size}`, {
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
    return fetchApi(`${TESTS_BASE}/templates/active`, {
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
    return fetchApi(`${TESTS_BASE}/templates/${id}`, {
      tags: [`test-template-${id}`],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Create a new test template
   */
  createTemplate: async (data: CreateTestTemplateRequest): Promise<TestTemplate> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TESTS_BASE}/templates`, {
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
    return fetchApi(`${TESTS_BASE}/templates/${id}`, {
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
    return fetchApi(`${TESTS_BASE}/templates/search?name=${encodeURIComponent(name)}`, {
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
    return fetchApi(`${TESTS_BASE}/templates/by-competency/${competencyId}`, {
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
    return fetchApi(`${TESTS_BASE}/templates/statistics`, {
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
    await fetchApi(`${TESTS_BASE}/templates/${id}`, {
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
   * Start a new test session
   */
  startSession: async (request: StartTestSessionRequest): Promise<TestSession> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TESTS_BASE}/sessions`, {
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
    return fetchApi(`${TESTS_BASE}/sessions/${sessionId}`, {
      tags: [`test-session-${sessionId}`],
      cache: 'no-store',
      authHeaders,
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
    return fetchApi(`${TESTS_BASE}/sessions/user/${clerkUserId}?page=${page}&size=${size}`, {
      tags: [`user-sessions-${clerkUserId}`],
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Check for in-progress session
   */
  getInProgressSession: async (clerkUserId: string, templateId: string): Promise<TestSession | null> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TESTS_BASE}/sessions/user/${clerkUserId}/in-progress?templateId=${templateId}`, {
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Get current question for a session
   */
  getCurrentQuestion: async (sessionId: string): Promise<CurrentQuestionResponse | null> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TESTS_BASE}/sessions/${sessionId}/current-question`, {
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Submit an answer
   */
  submitAnswer: async (sessionId: string, request: SubmitAnswerRequest): Promise<TestAnswer> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TESTS_BASE}/sessions/${sessionId}/answers`, {
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
    return fetchApi(`${TESTS_BASE}/sessions/${sessionId}/navigate?questionIndex=${questionIndex}`, {
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
    return fetchApi(`${TESTS_BASE}/sessions/${sessionId}/time?timeRemainingSeconds=${timeRemainingSeconds}`, {
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
    return fetchApi(`${TESTS_BASE}/sessions/${sessionId}/complete`, {
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
    return fetchApi(`${TESTS_BASE}/sessions/${sessionId}/abandon`, {
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
    return fetchApi(`${TESTS_BASE}/sessions/${sessionId}/answers`, {
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
    return fetchApi(`${TESTS_BASE}/results/${resultId}`, {
      tags: [`test-result-${resultId}`],
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Get result by session ID
   */
  getResultBySession: async (sessionId: string): Promise<TestResult | null> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TESTS_BASE}/results/session/${sessionId}`, {
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
    return fetchApi(`${TESTS_BASE}/results/user/${clerkUserId}?page=${page}&size=${size}`, {
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
    return fetchApi(`${TESTS_BASE}/results/user/${clerkUserId}/statistics`, {
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
    return fetchApi(`${TESTS_BASE}/results/user/${clerkUserId}/passed`, {
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
    return fetchApi(`${TESTS_BASE}/results/template/${templateId}/statistics`, {
      tags: [`template-statistics-${templateId}`],
      revalidate: 60,
      authHeaders,
    });
  },
};