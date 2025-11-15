import { cache } from 'react';
import { revalidateCompetencyTags, revalidateQuestionTags } from '@/app/actions';

import { AssessmentQuestion, BehavioralIndicator, Competency } from '../../app/interfaces/domain-interfaces';

const getApiBaseUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    return apiUrl ? `https://${apiUrl}/api` : "http://localhost:8080/api";
};

// List of API endpoints that return arrays
const QUESTIONS_ENDPOINT = '/questions';
const COMPETENCIES_ENDPOINT = '/competencies';
const BEHAVIORAL_INDICATORS_ENDPOINT = '/behavioral-indicators';
const LIST_ENDPOINTS = [QUESTIONS_ENDPOINT, COMPETENCIES_ENDPOINT, BEHAVIORAL_INDICATORS_ENDPOINT];

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
    } = {}
): Promise<T> {
    const { tags = [], revalidate, cache = 'force-cache', ...fetchOptions } = options;
    
    try {
        // Note: Removed console.log for production security
        const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
            ...fetchOptions,
            headers: {
                'Content-Type': 'application/json',
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
