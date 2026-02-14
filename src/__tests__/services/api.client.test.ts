/**
 * Tests for Client-Side API Functions (api.client.ts)
 *
 * Comprehensive tests covering:
 * - clientFetch wrapper with auth headers
 * - testSessionsClientApi operations
 * - pollForResult with exponential backoff
 * - retryScoring for failed results
 * - Helper functions (shouldPollResult, canRetryResult)
 */
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse, delay } from 'msw';
import { setupServer } from 'msw/node';

// API base URL for tests
const API_BASE = 'http://localhost:8080/api/v1';

// ============================================
// INLINE TYPE DEFINITIONS
// ============================================
// Note: Importing from api.client.ts would cause fetch to execute
// during import. We define types inline to match the module.

interface ApiError extends Error {
  status?: number;
  code?: string;
  endpoint?: string;
  method?: string;
  context?: Record<string, unknown>;
}

type ResultStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

interface CompetencyScore {
  competencyId: string;
  competencyName: string;
  competencyCategory?: string;
  score: number;
  maxScore: number;
  percentage: number;
  questionsAnswered?: number;
  weight?: number;
  onetCode?: string;
  indicatorScores?: {
    indicatorId: string;
    indicatorTitle: string;
    score: number;
    maxScore: number;
    percentage: number;
    questionsAnswered: number;
  }[];
}

interface TestResult {
  id: string;
  sessionId: string;
  templateId: string;
  templateName: string;
  clerkUserId: string;
  overallScore: number | null;
  overallPercentage: number | null;
  passed: boolean | null;
  competencyScores: CompetencyScore[] | null;
  totalTimeSeconds: number;
  questionsAnswered: number;
  questionsSkipped: number;
  totalQuestions: number;
  completedAt: string;
  status: ResultStatus;
}

interface TestSession {
  id: string;
  templateId: string;
  templateName: string;
  clerkUserId: string;
  status: string;
  currentQuestionIndex: number;
  questionOrder: string[];
  totalQuestions: number;
  answeredQuestions: number;
  createdAt: string;
}

interface TestAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  timeSpentSeconds: number;
  isSkipped: boolean;
}

interface CurrentQuestionResponse {
  sessionId: string;
  question: {
    id: string;
    questionText: string;
    questionType: string;
  };
  questionIndex: number;
  totalQuestions: number;
  allowSkip: boolean;
  allowBackNavigation: boolean;
}

// ============================================
// MOCK DATA
// ============================================
const mockSession: TestSession = {
  id: 'session-123',
  templateId: 'template-1',
  templateName: 'Test Template',
  clerkUserId: 'user_123',
  status: 'IN_PROGRESS',
  currentQuestionIndex: 0,
  questionOrder: ['q-1', 'q-2', 'q-3'],
  totalQuestions: 3,
  answeredQuestions: 0,
  createdAt: new Date().toISOString(),
};

const mockCurrentQuestion: CurrentQuestionResponse = {
  sessionId: 'session-123',
  question: {
    id: 'q-1',
    questionText: 'Sample question text',
    questionType: 'LIKERT',
  },
  questionIndex: 0,
  totalQuestions: 3,
  allowSkip: true,
  allowBackNavigation: true,
};

const mockAnswer: TestAnswer = {
  id: 'answer-1',
  sessionId: 'session-123',
  questionId: 'q-1',
  timeSpentSeconds: 30,
  isSkipped: false,
};

const mockResult: TestResult = {
  id: 'result-123',
  sessionId: 'session-123',
  templateId: 'template-1',
  templateName: 'Test Template',
  clerkUserId: 'user_123',
  overallScore: 85,
  overallPercentage: 85,
  passed: true,
  competencyScores: [],
  totalTimeSeconds: 1200,
  questionsAnswered: 10,
  questionsSkipped: 0,
  totalQuestions: 10,
  completedAt: new Date().toISOString(),
  status: 'COMPLETED',
};

const mockPendingResult: TestResult = {
  ...mockResult,
  status: 'PENDING',
  overallScore: null,
  overallPercentage: null,
  passed: null,
};

const mockFailedResult: TestResult = {
  ...mockResult,
  status: 'FAILED',
  overallScore: null,
  overallPercentage: null,
  passed: null,
};

// ============================================
// DEFAULT HANDLERS
// ============================================
const defaultHandlers = [
  // Test Sessions
  http.post(`${API_BASE}/tests/sessions`, () => {
    return HttpResponse.json(mockSession, { status: 201 });
  }),

  http.get(`${API_BASE}/tests/sessions/:sessionId`, () => {
    return HttpResponse.json(mockSession);
  }),

  http.get(`${API_BASE}/tests/sessions/:sessionId/current-question`, () => {
    return HttpResponse.json(mockCurrentQuestion);
  }),

  http.post(`${API_BASE}/tests/sessions/:sessionId/answers`, () => {
    return HttpResponse.json(mockAnswer);
  }),

  http.post(`${API_BASE}/tests/sessions/:sessionId/navigate`, () => {
    return HttpResponse.json(mockSession);
  }),

  http.post(`${API_BASE}/tests/sessions/:sessionId/complete`, () => {
    return HttpResponse.json(mockResult);
  }),

  http.post(`${API_BASE}/tests/sessions/:sessionId/abandon`, () => {
    return HttpResponse.json({ ...mockSession, status: 'ABANDONED' });
  }),

  http.get(`${API_BASE}/tests/sessions/:sessionId/answers`, () => {
    return HttpResponse.json([mockAnswer]);
  }),

  http.get(`${API_BASE}/tests/sessions/user/:userId/in-progress`, () => {
    return HttpResponse.json(mockSession);
  }),

  http.get(`${API_BASE}/tests/sessions/templates/:templateId/readiness`, () => {
    return HttpResponse.json({
      ready: true,
      templateId: 'template-1',
      templateName: 'Test Template',
      totalQuestionsAvailable: 100,
      questionsRequired: 30,
      competencyHealth: [],
    });
  }),

  http.get(`${API_BASE}/tests/sessions/templates/:templateId/diagnostics`, () => {
    return HttpResponse.json({
      templateId: 'template-1',
      templateName: 'Test Template',
      goal: 'OVERVIEW',
      questionsPerIndicator: 3,
      isActive: true,
      competencyCount: 5,
      competencies: [],
      totalQuestionsAvailable: 100,
      totalQuestionsRequired: 30,
      canStartSession: true,
      issues: [],
    });
  }),

  // Test Results
  http.get(`${API_BASE}/tests/results/:resultId`, () => {
    return HttpResponse.json(mockResult);
  }),

  http.post(`${API_BASE}/tests/results/:resultId/retry`, () => {
    return HttpResponse.json(mockPendingResult);
  }),
];

const server = setupServer(...defaultHandlers);

// ============================================
// TEST SETUP
// ============================================
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ============================================
// HELPER FUNCTION TESTS
// ============================================
describe('Helper Functions', () => {
  describe('shouldPollResult', () => {
    it('returns true for PENDING status', async () => {
      const { shouldPollResult } = await import('@/services/api.client');
      const result = { ...mockResult, status: 'PENDING' as const };
      expect(shouldPollResult(result)).toBe(true);
    });

    it('returns false for COMPLETED status', async () => {
      const { shouldPollResult } = await import('@/services/api.client');
      const result = { ...mockResult, status: 'COMPLETED' as const };
      expect(shouldPollResult(result)).toBe(false);
    });

    it('returns false for FAILED status', async () => {
      const { shouldPollResult } = await import('@/services/api.client');
      const result = { ...mockResult, status: 'FAILED' as const };
      expect(shouldPollResult(result)).toBe(false);
    });
  });

  describe('canRetryResult', () => {
    it('returns true for FAILED status', async () => {
      const { canRetryResult } = await import('@/services/api.client');
      const result = { ...mockResult, status: 'FAILED' as const };
      expect(canRetryResult(result)).toBe(true);
    });

    it('returns false for COMPLETED status', async () => {
      const { canRetryResult } = await import('@/services/api.client');
      const result = { ...mockResult, status: 'COMPLETED' as const };
      expect(canRetryResult(result)).toBe(false);
    });

    it('returns false for PENDING status', async () => {
      const { canRetryResult } = await import('@/services/api.client');
      const result = { ...mockResult, status: 'PENDING' as const };
      expect(canRetryResult(result)).toBe(false);
    });
  });

  describe('formatPollTimeout', () => {
    it('formats timeout in seconds for short durations', async () => {
      const { formatPollTimeout } = await import('@/services/api.client');
      const result = formatPollTimeout({ maxAttempts: 5, initialIntervalMs: 1000 });
      expect(result).toMatch(/\d+ seconds/);
    });

    it('formats timeout in minutes for long durations', async () => {
      const { formatPollTimeout } = await import('@/services/api.client');
      const result = formatPollTimeout({ maxAttempts: 30, initialIntervalMs: 5000 });
      expect(result).toMatch(/\d+ minutes/);
    });

    it('uses default options when none provided', async () => {
      const { formatPollTimeout } = await import('@/services/api.client');
      const result = formatPollTimeout();
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('isTestNotReadyError', () => {
    it('returns true for TEST_NOT_READY error', async () => {
      const { isTestNotReadyError } = await import('@/services/api.client');
      const error = new Error('Test not ready') as ApiError;
      error.code = 'TEST_NOT_READY';
      expect(isTestNotReadyError(error)).toBe(true);
    });

    it('returns false for other errors', async () => {
      const { isTestNotReadyError } = await import('@/services/api.client');
      const error = new Error('Some error') as ApiError;
      error.code = 'OTHER_ERROR';
      expect(isTestNotReadyError(error)).toBe(false);
    });

    it('returns false for non-Error objects', async () => {
      const { isTestNotReadyError } = await import('@/services/api.client');
      expect(isTestNotReadyError({ code: 'TEST_NOT_READY' })).toBe(false);
    });
  });

  describe('isDuplicateSessionError', () => {
    it('returns true for DUPLICATE_SESSION error', async () => {
      const { isDuplicateSessionError } = await import('@/services/api.client');
      const error = new Error('Duplicate session') as ApiError;
      error.code = 'DUPLICATE_SESSION';
      expect(isDuplicateSessionError(error)).toBe(true);
    });

    it('returns false for other errors', async () => {
      const { isDuplicateSessionError } = await import('@/services/api.client');
      const error = new Error('Some error') as ApiError;
      error.code = 'OTHER_ERROR';
      expect(isDuplicateSessionError(error)).toBe(false);
    });
  });

  describe('getCompetencyIssuesFromError', () => {
    it('extracts competency issues from TEST_NOT_READY error', async () => {
      const { getCompetencyIssuesFromError } = await import('@/services/api.client');
      const issues = [
        { competencyId: 'comp-1', competencyName: 'Test', questionsAvailable: 5, questionsRequired: 10, healthStatus: 'CRITICAL' as const, issues: [] }
      ];
      const error = new Error('Test not ready') as ApiError;
      error.code = 'TEST_NOT_READY';
      error.context = { competencyIssues: issues };

      expect(getCompetencyIssuesFromError(error)).toEqual(issues);
    });

    it('returns empty array for non-TEST_NOT_READY errors', async () => {
      const { getCompetencyIssuesFromError } = await import('@/services/api.client');
      const error = new Error('Other error') as ApiError;
      error.code = 'OTHER_ERROR';

      expect(getCompetencyIssuesFromError(error)).toEqual([]);
    });

    it('returns empty array when context is missing', async () => {
      const { getCompetencyIssuesFromError } = await import('@/services/api.client');
      const error = new Error('Test not ready') as ApiError;
      error.code = 'TEST_NOT_READY';

      expect(getCompetencyIssuesFromError(error)).toEqual([]);
    });
  });
});

// ============================================
// TEST SESSIONS CLIENT API TESTS
// ============================================
describe('testSessionsClientApi', () => {
  const mockAuthHeaders = { 'X-User-Id': 'user_123', 'X-User-Role': 'USER' };

  describe('startSession', () => {
    it('starts session with auth headers', async () => {
      const { testSessionsClientApi } = await import('@/services/api.client');

      server.use(
        http.post(`${API_BASE}/tests/sessions`, async ({ request }) => {
          const headers = Object.fromEntries(request.headers.entries());
          expect(headers['x-user-id']).toBe('user_123');
          return HttpResponse.json(mockSession, { status: 201 });
        })
      );

      const result = await testSessionsClientApi.startSession(
        { templateId: 'template-1', clerkUserId: 'user_123' },
        mockAuthHeaders
      );

      expect(result).toEqual(mockSession);
    });

    it('handles TEST_NOT_READY error', async () => {
      const { testSessionsClientApi } = await import('@/services/api.client');

      server.use(
        http.post(`${API_BASE}/tests/sessions`, () => {
          return HttpResponse.json(
            { message: 'Test not ready', code: 'TEST_NOT_READY' },
            { status: 422 }
          );
        })
      );

      await expect(
        testSessionsClientApi.startSession(
          { templateId: 'template-1', clerkUserId: 'user_123' },
          mockAuthHeaders
        )
      ).rejects.toThrow();
    });

    it('handles DUPLICATE_SESSION error', async () => {
      const { testSessionsClientApi } = await import('@/services/api.client');

      server.use(
        http.post(`${API_BASE}/tests/sessions`, () => {
          return HttpResponse.json(
            { message: 'Session already exists', code: 'DUPLICATE_SESSION' },
            { status: 409 }
          );
        })
      );

      await expect(
        testSessionsClientApi.startSession(
          { templateId: 'template-1', clerkUserId: 'user_123' },
          mockAuthHeaders
        )
      ).rejects.toThrow();
    });
  });

  describe('getSessionById', () => {
    it('returns session for valid ID', async () => {
      const { testSessionsClientApi } = await import('@/services/api.client');

      const result = await testSessionsClientApi.getSessionById('session-123', mockAuthHeaders);
      expect(result).toEqual(mockSession);
    });

    it('returns null for 404 (silentStatusCodes)', async () => {
      const { testSessionsClientApi } = await import('@/services/api.client');

      server.use(
        http.get(`${API_BASE}/tests/sessions/:sessionId`, () => {
          return HttpResponse.json(
            { message: 'Session not found' },
            { status: 404 }
          );
        })
      );

      const result = await testSessionsClientApi.getSessionById('non-existent', mockAuthHeaders);
      expect(result).toBeNull();
    });
  });

  describe('getInProgressSession', () => {
    it('returns in-progress session', async () => {
      const { testSessionsClientApi } = await import('@/services/api.client');

      const result = await testSessionsClientApi.getInProgressSession(
        'user_123',
        'template-1',
        mockAuthHeaders
      );
      expect(result).toEqual(mockSession);
    });

    it('returns null when no in-progress session exists', async () => {
      const { testSessionsClientApi } = await import('@/services/api.client');

      server.use(
        http.get(`${API_BASE}/tests/sessions/user/:userId/in-progress`, () => {
          return HttpResponse.json(
            { message: 'No in-progress session' },
            { status: 404 }
          );
        })
      );

      const result = await testSessionsClientApi.getInProgressSession(
        'user_123',
        'template-1',
        mockAuthHeaders
      );
      expect(result).toBeNull();
    });
  });

  describe('getCurrentQuestion', () => {
    it('returns current question', async () => {
      const { testSessionsClientApi } = await import('@/services/api.client');

      const result = await testSessionsClientApi.getCurrentQuestion('session-123', mockAuthHeaders);
      expect(result).toEqual(mockCurrentQuestion);
    });

    it('handles abandoned session error', async () => {
      const { testSessionsClientApi } = await import('@/services/api.client');

      server.use(
        http.get(`${API_BASE}/tests/sessions/:sessionId/current-question`, () => {
          return HttpResponse.json(
            { message: 'Session has been abandoned' },
            { status: 400 }
          );
        })
      );

      await expect(
        testSessionsClientApi.getCurrentQuestion('session-123', mockAuthHeaders)
      ).rejects.toThrow();
    });
  });

  describe('submitAnswer', () => {
    it('submits answer successfully', async () => {
      const { testSessionsClientApi } = await import('@/services/api.client');

      const result = await testSessionsClientApi.submitAnswer(
        'session-123',
        { sessionId: 'session-123', questionId: 'q-1', likertValue: 4 },
        mockAuthHeaders
      );

      expect(result).toEqual(mockAnswer);
    });

    it('handles validation errors', async () => {
      const { testSessionsClientApi } = await import('@/services/api.client');

      server.use(
        http.post(`${API_BASE}/tests/sessions/:sessionId/answers`, () => {
          return HttpResponse.json(
            { message: 'Invalid answer format', code: 'VALIDATION_ERROR' },
            { status: 400 }
          );
        })
      );

      await expect(
        testSessionsClientApi.submitAnswer(
          'session-123',
          { sessionId: 'session-123', questionId: 'q-1' },
          mockAuthHeaders
        )
      ).rejects.toThrow();
    });
  });

  describe('navigateToQuestion', () => {
    it('navigates to specific question', async () => {
      const { testSessionsClientApi } = await import('@/services/api.client');

      server.use(
        http.post(`${API_BASE}/tests/sessions/:sessionId/navigate`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('questionIndex')).toBe('2');
          return HttpResponse.json({ ...mockSession, currentQuestionIndex: 2 });
        })
      );

      const result = await testSessionsClientApi.navigateToQuestion('session-123', 2, mockAuthHeaders);
      expect(result.currentQuestionIndex).toBe(2);
    });
  });

  describe('completeSession', () => {
    it('completes session and returns result', async () => {
      const { testSessionsClientApi } = await import('@/services/api.client');

      const result = await testSessionsClientApi.completeSession('session-123', mockAuthHeaders);
      expect(result).toEqual(mockResult);
    });

    it('handles session already completed', async () => {
      const { testSessionsClientApi } = await import('@/services/api.client');

      server.use(
        http.post(`${API_BASE}/tests/sessions/:sessionId/complete`, () => {
          return HttpResponse.json(
            { message: 'Session already completed' },
            { status: 400 }
          );
        })
      );

      await expect(
        testSessionsClientApi.completeSession('session-123', mockAuthHeaders)
      ).rejects.toThrow();
    });
  });

  describe('abandonSession', () => {
    it('abandons session successfully', async () => {
      const { testSessionsClientApi } = await import('@/services/api.client');

      const result = await testSessionsClientApi.abandonSession('session-123', mockAuthHeaders);
      expect(result.status).toBe('ABANDONED');
    });
  });

  describe('getSessionAnswers', () => {
    it('returns all answers for session', async () => {
      const { testSessionsClientApi } = await import('@/services/api.client');

      const result = await testSessionsClientApi.getSessionAnswers('session-123', mockAuthHeaders);
      expect(result).toEqual([mockAnswer]);
    });
  });

  describe('checkTemplateReadiness', () => {
    it('returns readiness status', async () => {
      const { testSessionsClientApi } = await import('@/services/api.client');

      const result = await testSessionsClientApi.checkTemplateReadiness('template-1', mockAuthHeaders);
      expect(result.ready).toBe(true);
    });

    it('returns not ready with issues', async () => {
      const { testSessionsClientApi } = await import('@/services/api.client');

      server.use(
        http.get(`${API_BASE}/tests/sessions/templates/:templateId/readiness`, () => {
          return HttpResponse.json({
            ready: false,
            templateId: 'template-1',
            templateName: 'Test Template',
            totalQuestionsAvailable: 10,
            questionsRequired: 30,
            competencyHealth: [
              {
                competencyId: 'comp-1',
                competencyName: 'Communication',
                questionsAvailable: 2,
                questionsRequired: 10,
                healthStatus: 'CRITICAL',
                issues: ['Insufficient questions'],
              },
            ],
          });
        })
      );

      const result = await testSessionsClientApi.checkTemplateReadiness('template-1', mockAuthHeaders);
      expect(result.ready).toBe(false);
      expect(result.competencyHealth).toHaveLength(1);
    });
  });

  describe('getTemplateDiagnostics', () => {
    it('returns diagnostics data', async () => {
      const { testSessionsClientApi } = await import('@/services/api.client');

      const result = await testSessionsClientApi.getTemplateDiagnostics('template-1', mockAuthHeaders);
      expect(result.templateId).toBe('template-1');
      expect(result.canStartSession).toBe(true);
    });
  });
});

// ============================================
// POLL FOR RESULT TESTS
// ============================================
describe('pollForResult', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns result immediately when COMPLETED', async () => {
    const { pollForResult } = await import('@/services/api.client');

    server.use(
      http.get(`${API_BASE}/tests/results/:resultId`, () => {
        return HttpResponse.json(mockResult);
      })
    );

    const result = await pollForResult('result-123');
    expect(result.status).toBe('COMPLETED');
  });

  it('returns result when FAILED', async () => {
    const { pollForResult } = await import('@/services/api.client');

    server.use(
      http.get(`${API_BASE}/tests/results/:resultId`, () => {
        return HttpResponse.json(mockFailedResult);
      })
    );

    const result = await pollForResult('result-123');
    expect(result.status).toBe('FAILED');
  });

  it('polls with exponential backoff when PENDING', async () => {
    const { pollForResult } = await import('@/services/api.client');

    let callCount = 0;
    server.use(
      http.get(`${API_BASE}/tests/results/:resultId`, () => {
        callCount++;
        if (callCount < 3) {
          return HttpResponse.json(mockPendingResult);
        }
        return HttpResponse.json(mockResult);
      })
    );

    const resultPromise = pollForResult('result-123', {
      initialIntervalMs: 100,
      maxAttempts: 5,
    });

    // Advance timers to allow polling
    await vi.runAllTimersAsync();

    const result = await resultPromise;
    expect(result.status).toBe('COMPLETED');
    expect(callCount).toBe(3);
  });

  it('calls onPending callback during polling', async () => {
    const { pollForResult } = await import('@/services/api.client');

    let callCount = 0;
    server.use(
      http.get(`${API_BASE}/tests/results/:resultId`, () => {
        callCount++;
        if (callCount < 2) {
          return HttpResponse.json(mockPendingResult);
        }
        return HttpResponse.json(mockResult);
      })
    );

    const onPending = vi.fn();
    const resultPromise = pollForResult('result-123', {
      initialIntervalMs: 100,
      maxAttempts: 5,
      onPending,
    });

    await vi.runAllTimersAsync();
    await resultPromise;

    expect(onPending).toHaveBeenCalled();
  });

  it('calls onCompleted callback when finished', async () => {
    const { pollForResult } = await import('@/services/api.client');

    server.use(
      http.get(`${API_BASE}/tests/results/:resultId`, () => {
        return HttpResponse.json(mockResult);
      })
    );

    const onCompleted = vi.fn();
    await pollForResult('result-123', { onCompleted });

    expect(onCompleted).toHaveBeenCalledWith(mockResult);
  });

  it('calls onFailed callback when result fails', async () => {
    const { pollForResult } = await import('@/services/api.client');

    server.use(
      http.get(`${API_BASE}/tests/results/:resultId`, () => {
        return HttpResponse.json(mockFailedResult);
      })
    );

    const onFailed = vi.fn();
    await pollForResult('result-123', { onFailed });

    expect(onFailed).toHaveBeenCalledWith(mockFailedResult);
  });

  it('throws PollTimeoutError after max attempts', async () => {
    const { pollForResult, PollTimeoutError } = await import('@/services/api.client');

    server.use(
      http.get(`${API_BASE}/tests/results/:resultId`, () => {
        return HttpResponse.json(mockPendingResult);
      })
    );

    // Use try-catch to handle floating promises properly
    let caughtError: Error | null = null;
    const resultPromise = pollForResult('result-123', {
      maxAttempts: 3,
      initialIntervalMs: 100,
    }).catch((e) => {
      caughtError = e;
    });

    await vi.runAllTimersAsync();
    await resultPromise;

    expect(caughtError).toBeInstanceOf(PollTimeoutError);
  });

  it('respects AbortSignal', async () => {
    const { pollForResult } = await import('@/services/api.client');

    server.use(
      http.get(`${API_BASE}/tests/results/:resultId`, async () => {
        await delay(100);
        return HttpResponse.json(mockPendingResult);
      })
    );

    const controller = new AbortController();
    const resultPromise = pollForResult('result-123', {
      signal: controller.signal,
      initialIntervalMs: 100,
    });

    // Abort after starting
    controller.abort();

    // The error message can be either 'AbortError' or 'Polling aborted'
    await expect(resultPromise).rejects.toThrow(/abort/i);
  });

  it('continues polling after network errors', async () => {
    const { pollForResult } = await import('@/services/api.client');

    let callCount = 0;
    server.use(
      http.get(`${API_BASE}/tests/results/:resultId`, () => {
        callCount++;
        if (callCount === 1) {
          return HttpResponse.error();
        }
        return HttpResponse.json(mockResult);
      })
    );

    const resultPromise = pollForResult('result-123', {
      initialIntervalMs: 100,
      maxAttempts: 5,
    });

    await vi.runAllTimersAsync();

    const result = await resultPromise;
    expect(result.status).toBe('COMPLETED');
  });
});

// ============================================
// RETRY SCORING TESTS
// ============================================
describe('retryScoring', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns result on success', async () => {
    const { retryScoring } = await import('@/services/api.client');

    server.use(
      http.post(`${API_BASE}/tests/results/:resultId/retry`, () => {
        return HttpResponse.json(mockResult);
      })
    );

    const result = await retryScoring('result-123');
    expect(result.status).toBe('COMPLETED');
  });

  it('retries on failure', async () => {
    const { retryScoring } = await import('@/services/api.client');

    let callCount = 0;
    server.use(
      http.post(`${API_BASE}/tests/results/:resultId/retry`, () => {
        callCount++;
        if (callCount < 2) {
          return HttpResponse.json(
            { message: 'Temporary error' },
            { status: 500 }
          );
        }
        return HttpResponse.json(mockResult);
      })
    );

    const resultPromise = retryScoring('result-123', {
      maxRetries: 3,
      retryDelayMs: 100,
    });

    await vi.runAllTimersAsync();

    const result = await resultPromise;
    expect(result.status).toBe('COMPLETED');
    expect(callCount).toBe(2);
  });

  it('throws RetryExhaustedError after max retries', async () => {
    const { retryScoring, RetryExhaustedError } = await import('@/services/api.client');

    server.use(
      http.post(`${API_BASE}/tests/results/:resultId/retry`, () => {
        return HttpResponse.json(
          { message: 'Scoring failed' },
          { status: 500 }
        );
      })
    );

    // Use try-catch to handle floating promises properly
    let caughtError: Error | null = null;
    const resultPromise = retryScoring('result-123', {
      maxRetries: 2,
      retryDelayMs: 100,
    }).catch((e) => {
      caughtError = e;
    });

    await vi.runAllTimersAsync();
    await resultPromise;

    expect(caughtError).toBeInstanceOf(RetryExhaustedError);
  });

  it('respects AbortSignal', async () => {
    const { retryScoring } = await import('@/services/api.client');

    server.use(
      http.post(`${API_BASE}/tests/results/:resultId/retry`, async () => {
        await delay(100);
        return HttpResponse.json({ message: 'Error' }, { status: 500 });
      })
    );

    const controller = new AbortController();
    const resultPromise = retryScoring('result-123', {
      signal: controller.signal,
      retryDelayMs: 100,
    });

    controller.abort();

    // The error message can be either 'AbortError' or contains 'abort'
    await expect(resultPromise).rejects.toThrow(/abort/i);
  });
});

// ============================================
// ERROR HANDLING TESTS
// ============================================
describe('Error Handling', () => {
  const mockAuthHeaders = { 'X-User-Id': 'user_123', 'X-User-Role': 'USER' };

  it('handles 401 Unauthorized', async () => {
    const { testSessionsClientApi } = await import('@/services/api.client');

    server.use(
      http.get(`${API_BASE}/tests/sessions/:sessionId`, () => {
        return HttpResponse.json(
          { message: 'Authentication required', code: 'UNAUTHORIZED' },
          { status: 401 }
        );
      })
    );

    await expect(
      testSessionsClientApi.getSessionById('session-123', mockAuthHeaders)
    ).rejects.toThrow();
  });

  it('handles 403 Forbidden', async () => {
    const { testSessionsClientApi } = await import('@/services/api.client');

    server.use(
      http.get(`${API_BASE}/tests/sessions/:sessionId`, () => {
        return HttpResponse.json(
          { message: 'Access denied', code: 'FORBIDDEN' },
          { status: 403 }
        );
      })
    );

    try {
      await testSessionsClientApi.getSessionById('session-123', mockAuthHeaders);
      expect.fail('Should have thrown');
    } catch (error) {
      const apiError = error as ApiError;
      expect(apiError.status).toBe(403);
    }
  });

  it('handles 500 Server Error', async () => {
    const { testSessionsClientApi } = await import('@/services/api.client');

    server.use(
      http.post(`${API_BASE}/tests/sessions/:sessionId/complete`, () => {
        return HttpResponse.json(
          { message: 'Internal server error' },
          { status: 500 }
        );
      })
    );

    try {
      await testSessionsClientApi.completeSession('session-123', mockAuthHeaders);
      expect.fail('Should have thrown');
    } catch (error) {
      const apiError = error as ApiError;
      expect(apiError.status).toBe(500);
    }
  });

  it('handles network errors', async () => {
    const { testSessionsClientApi } = await import('@/services/api.client');

    server.use(
      http.get(`${API_BASE}/tests/sessions/:sessionId`, () => {
        return HttpResponse.error();
      })
    );

    await expect(
      testSessionsClientApi.getSessionById('session-123', mockAuthHeaders)
    ).rejects.toThrow();
  });

  it('handles 204 No Content response', async () => {
    const { testSessionsClientApi } = await import('@/services/api.client');

    server.use(
      http.get(`${API_BASE}/tests/sessions/:sessionId`, () => {
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await testSessionsClientApi.getSessionById('session-123', mockAuthHeaders);
    expect(result).toBeNull();
  });

  it('handles empty JSON response', async () => {
    const { testSessionsClientApi } = await import('@/services/api.client');

    server.use(
      http.get(`${API_BASE}/tests/sessions/:sessionId`, () => {
        return new HttpResponse('', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );

    const result = await testSessionsClientApi.getSessionById('session-123', mockAuthHeaders);
    expect(result).toBeNull();
  });

  it('handles malformed JSON response', async () => {
    const { testSessionsClientApi } = await import('@/services/api.client');

    server.use(
      http.get(`${API_BASE}/tests/sessions/:sessionId`, () => {
        return new HttpResponse('{ invalid json }', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );

    const result = await testSessionsClientApi.getSessionById('session-123', mockAuthHeaders);
    expect(result).toBeNull();
  });

  it('extracts error code from response', async () => {
    const { testSessionsClientApi } = await import('@/services/api.client');

    server.use(
      http.post(`${API_BASE}/tests/sessions`, () => {
        return HttpResponse.json(
          {
            message: 'Test not ready',
            code: 'TEST_NOT_READY',
            context: { competencyIssues: [] }
          },
          { status: 422 }
        );
      })
    );

    try {
      await testSessionsClientApi.startSession(
        { templateId: 'template-1', clerkUserId: 'user_123' },
        mockAuthHeaders
      );
      expect.fail('Should have thrown');
    } catch (error) {
      const apiError = error as ApiError;
      expect(apiError.code).toBe('TEST_NOT_READY');
      expect(apiError.context).toBeDefined();
    }
  });
});
