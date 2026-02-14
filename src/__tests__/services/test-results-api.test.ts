/**
 * Tests for Test Results API Service
 * Phase 5: Admin, Results, and Error Handling Tests
 *
 * Tests cover:
 * - READ operations (getResultById, getResultBySession, getUserResults)
 * - Statistics (getUserStatistics, getTemplateStatistics)
 * - Passed results filtering
 * - Error handling scenarios
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { resetMockStores } from '../mocks/handlers';
import type { TestResult, CompetencyScore, UserStatistics, TemplateStatistics } from '@/types/domain';

// API base URL for tests
const API_BASE = 'http://localhost:8080/api';
const TESTS_BASE = `${API_BASE}/v1/tests`;

// ============================================
// TEST DATA
// ============================================
const mockCompetencyScores: CompetencyScore[] = [
  {
    competencyId: 'comp-1',
    competencyName: 'Communication',
    competencyCategory: 'INTERPERSONAL',
    score: 85,
    maxScore: 100,
    percentage: 85,
    questionsAnswered: 5,
    weight: 0.4,
    onetCode: '2.A.1.a',
    indicatorScores: [
      {
        indicatorId: 'bi-1',
        indicatorTitle: 'Active Listening',
        score: 42,
        maxScore: 50,
        percentage: 84,
        questionsAnswered: 3,
      },
      {
        indicatorId: 'bi-2',
        indicatorTitle: 'Clear Articulation',
        score: 43,
        maxScore: 50,
        percentage: 86,
        questionsAnswered: 2,
      },
    ],
  },
  {
    competencyId: 'comp-2',
    competencyName: 'Problem Solving',
    competencyCategory: 'COGNITIVE',
    score: 72,
    maxScore: 100,
    percentage: 72,
    questionsAnswered: 4,
    weight: 0.6,
    onetCode: '2.A.2.b',
  },
];

const mockTestResult: TestResult = {
  id: 'result-1',
  sessionId: 'session-1',
  templateId: 'template-1',
  templateName: 'Communication Assessment',
  clerkUserId: 'clerk_user123',
  overallScore: 157,
  overallPercentage: 78.5,
  percentile: 65,
  passed: true,
  competencyScores: mockCompetencyScores,
  totalTimeSeconds: 1800,
  questionsAnswered: 9,
  questionsSkipped: 1,
  totalQuestions: 10,
  completedAt: new Date().toISOString(),
  status: 'COMPLETED',
};

const mockFailedResult: TestResult = {
  id: 'result-2',
  sessionId: 'session-2',
  templateId: 'template-1',
  templateName: 'Communication Assessment',
  clerkUserId: 'clerk_user123',
  overallScore: 55,
  overallPercentage: 55,
  percentile: 25,
  passed: false,
  competencyScores: [
    {
      competencyId: 'comp-1',
      competencyName: 'Communication',
      score: 55,
      maxScore: 100,
      percentage: 55,
    },
  ],
  totalTimeSeconds: 1200,
  questionsAnswered: 8,
  questionsSkipped: 2,
  totalQuestions: 10,
  completedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  status: 'FAILED',
};

const mockUserStatistics: UserStatistics = {
  clerkUserId: 'clerk_user123',
  totalTestsCompleted: 5,
  averageScore: 75.5,
  averagePercentage: 75.5,
  totalTimeSpent: 9000,
  passRate: 80,
};

const mockTemplateStatistics: TemplateStatistics = {
  templateId: 'template-1',
  templateName: 'Communication Assessment',
  totalCompletions: 150,
  averageScore: 72.3,
  passRate: 68.5,
  averageTimeSeconds: 1650,
};

// ============================================
// HELPER FUNCTIONS
// ============================================
async function fetchResultById(resultId: string): Promise<TestResult> {
  const response = await fetch(`${TESTS_BASE}/results/${resultId}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

async function fetchResultBySession(sessionId: string): Promise<TestResult> {
  const response = await fetch(`${TESTS_BASE}/results/session/${sessionId}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

async function fetchUserResults(clerkUserId: string, page = 0, size = 20): Promise<{
  content: TestResult[];
  totalElements: number;
  totalPages: number;
}> {
  const response = await fetch(`${TESTS_BASE}/results/user/${clerkUserId}?page=${page}&size=${size}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

async function fetchUserStatistics(clerkUserId: string): Promise<UserStatistics> {
  const response = await fetch(`${TESTS_BASE}/results/user/${clerkUserId}/statistics`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

async function fetchUserPassedResults(clerkUserId: string): Promise<TestResult[]> {
  const response = await fetch(`${TESTS_BASE}/results/user/${clerkUserId}/passed`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

async function fetchTemplateStatistics(templateId: string): Promise<TemplateStatistics> {
  const response = await fetch(`${TESTS_BASE}/results/template/${templateId}/statistics`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

// ============================================
// MOCK HANDLERS FOR TEST RESULTS
// ============================================
const testResultsHandlers = [
  // GET result by ID
  http.get(`${TESTS_BASE}/results/:resultId`, ({ params }) => {
    if (params.resultId === 'result-1') {
      return HttpResponse.json(mockTestResult);
    }
    if (params.resultId === 'result-2') {
      return HttpResponse.json(mockFailedResult);
    }
    return HttpResponse.json(
      { message: 'Result not found', code: 'NOT_FOUND' },
      { status: 404 }
    );
  }),

  // GET result by session ID
  http.get(`${TESTS_BASE}/results/session/:sessionId`, ({ params }) => {
    if (params.sessionId === 'session-1') {
      return HttpResponse.json(mockTestResult);
    }
    if (params.sessionId === 'session-2') {
      return HttpResponse.json(mockFailedResult);
    }
    return HttpResponse.json(
      { message: 'Result not found for session', code: 'NOT_FOUND' },
      { status: 404 }
    );
  }),

  // GET user results (paginated)
  http.get(`${TESTS_BASE}/results/user/:clerkUserId`, ({ params, request }) => {
    if (params.clerkUserId !== 'clerk_user123') {
      return HttpResponse.json({
        content: [],
        totalElements: 0,
        totalPages: 0,
      });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    const allResults = [mockTestResult, mockFailedResult];
    const start = page * size;
    const end = start + size;
    const content = allResults.slice(start, end);

    return HttpResponse.json({
      content,
      totalElements: allResults.length,
      totalPages: Math.ceil(allResults.length / size),
    });
  }),

  // GET user statistics
  http.get(`${TESTS_BASE}/results/user/:clerkUserId/statistics`, ({ params }) => {
    if (params.clerkUserId !== 'clerk_user123') {
      return HttpResponse.json(
        { message: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    return HttpResponse.json(mockUserStatistics);
  }),

  // GET user passed results
  http.get(`${TESTS_BASE}/results/user/:clerkUserId/passed`, ({ params }) => {
    if (params.clerkUserId !== 'clerk_user123') {
      return HttpResponse.json([]);
    }
    return HttpResponse.json([mockTestResult]); // Only passed results
  }),

  // GET template statistics (admin only)
  http.get(`${TESTS_BASE}/results/template/:templateId/statistics`, ({ params }) => {
    if (params.templateId !== 'template-1') {
      return HttpResponse.json(
        { message: 'Template not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    return HttpResponse.json(mockTemplateStatistics);
  }),
];

// ============================================
// TESTS
// ============================================
describe('Test Results API', () => {
  beforeEach(() => {
    resetMockStores();
    server.use(...testResultsHandlers);
  });

  // ==========================================
  // READ Operations
  // ==========================================
  describe('READ Operations', () => {
    describe('getResultById', () => {
      it('should fetch a result by ID', async () => {
        const result = await fetchResultById('result-1');

        expect(result).toBeDefined();
        expect(result.id).toBe('result-1');
        expect(result.templateName).toBe('Communication Assessment');
      });

      it('should return result with correct structure', async () => {
        const result = await fetchResultById('result-1');

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('sessionId');
        expect(result).toHaveProperty('templateId');
        expect(result).toHaveProperty('templateName');
        expect(result).toHaveProperty('clerkUserId');
        expect(result).toHaveProperty('overallScore');
        expect(result).toHaveProperty('overallPercentage');
        expect(result).toHaveProperty('passed');
        expect(result).toHaveProperty('competencyScores');
        expect(result).toHaveProperty('totalTimeSeconds');
        expect(result).toHaveProperty('questionsAnswered');
        expect(result).toHaveProperty('totalQuestions');
        expect(result).toHaveProperty('completedAt');
      });

      it('should include competency scores', async () => {
        const result = await fetchResultById('result-1');

        expect(result.competencyScores).toBeInstanceOf(Array);
        expect(result.competencyScores!.length).toBeGreaterThan(0);

        const firstCompetency = result.competencyScores![0];
        expect(firstCompetency).toHaveProperty('competencyId');
        expect(firstCompetency).toHaveProperty('competencyName');
        expect(firstCompetency).toHaveProperty('score');
        expect(firstCompetency).toHaveProperty('maxScore');
        expect(firstCompetency).toHaveProperty('percentage');
      });

      it('should include indicator scores when available', async () => {
        const result = await fetchResultById('result-1');
        const competencyWithIndicators = result.competencyScores!.find(
          (c) => c.indicatorScores && c.indicatorScores.length > 0
        );

        expect(competencyWithIndicators).toBeDefined();
        expect(competencyWithIndicators?.indicatorScores?.length).toBeGreaterThan(0);
      });

      it('should include percentile when available', async () => {
        const result = await fetchResultById('result-1');

        expect(result.percentile).toBeDefined();
        expect(result.percentile).toBe(65);
      });

      it('should return 404 for non-existent result', async () => {
        await expect(fetchResultById('non-existent-id')).rejects.toThrow();
      });
    });

    describe('getResultBySession', () => {
      it('should fetch a result by session ID', async () => {
        const result = await fetchResultBySession('session-1');

        expect(result).toBeDefined();
        expect(result.sessionId).toBe('session-1');
      });

      it('should return failed result correctly', async () => {
        const result = await fetchResultBySession('session-2');

        expect(result.passed).toBe(false);
        expect(result.overallPercentage).toBeLessThan(70);
      });

      it('should return 404 for non-existent session', async () => {
        await expect(fetchResultBySession('non-existent-session')).rejects.toThrow();
      });
    });

    describe('getUserResults', () => {
      it('should fetch paginated results for a user', async () => {
        const response = await fetchUserResults('clerk_user123');

        expect(response).toHaveProperty('content');
        expect(response).toHaveProperty('totalElements');
        expect(response).toHaveProperty('totalPages');
        expect(response.content).toBeInstanceOf(Array);
      });

      it('should return both passed and failed results', async () => {
        const response = await fetchUserResults('clerk_user123');

        const passedResults = response.content.filter((r) => r.passed);
        const failedResults = response.content.filter((r) => !r.passed);

        expect(passedResults.length).toBeGreaterThan(0);
        expect(failedResults.length).toBeGreaterThan(0);
      });

      it('should return empty content for user with no results', async () => {
        const response = await fetchUserResults('clerk_no_results');

        expect(response.content).toEqual([]);
        expect(response.totalElements).toBe(0);
      });

      it('should handle pagination parameters', async () => {
        const response = await fetchUserResults('clerk_user123', 0, 1);

        expect(response.content.length).toBeLessThanOrEqual(1);
      });
    });

    describe('getUserPassedResults', () => {
      it('should fetch only passed results', async () => {
        const results = await fetchUserPassedResults('clerk_user123');

        expect(results).toBeInstanceOf(Array);
        results.forEach((r) => {
          expect(r.passed).toBe(true);
        });
      });

      it('should return empty array for user with no passed results', async () => {
        const results = await fetchUserPassedResults('clerk_no_passed');

        expect(results).toEqual([]);
      });
    });
  });

  // ==========================================
  // Statistics
  // ==========================================
  describe('Statistics', () => {
    describe('getUserStatistics', () => {
      it('should fetch user statistics', async () => {
        const stats = await fetchUserStatistics('clerk_user123');

        expect(stats).toBeDefined();
        expect(stats.clerkUserId).toBe('clerk_user123');
      });

      it('should return statistics with correct structure', async () => {
        const stats = await fetchUserStatistics('clerk_user123');

        expect(stats).toHaveProperty('clerkUserId');
        expect(stats).toHaveProperty('totalTestsCompleted');
        expect(stats).toHaveProperty('averageScore');
        expect(stats).toHaveProperty('averagePercentage');
        expect(stats).toHaveProperty('totalTimeSpent');
        expect(stats).toHaveProperty('passRate');
      });

      it('should return correct test count', async () => {
        const stats = await fetchUserStatistics('clerk_user123');

        expect(stats.totalTestsCompleted).toBe(5);
      });

      it('should return correct pass rate', async () => {
        const stats = await fetchUserStatistics('clerk_user123');

        expect(stats.passRate).toBe(80);
        expect(stats.passRate).toBeGreaterThanOrEqual(0);
        expect(stats.passRate).toBeLessThanOrEqual(100);
      });

      it('should return 404 for non-existent user', async () => {
        await expect(fetchUserStatistics('clerk_nonexistent')).rejects.toThrow();
      });
    });

    describe('getTemplateStatistics', () => {
      it('should fetch template statistics', async () => {
        const stats = await fetchTemplateStatistics('template-1');

        expect(stats).toBeDefined();
        expect(stats.templateId).toBe('template-1');
      });

      it('should return statistics with correct structure', async () => {
        const stats = await fetchTemplateStatistics('template-1');

        expect(stats).toHaveProperty('templateId');
        expect(stats).toHaveProperty('templateName');
        expect(stats).toHaveProperty('totalCompletions');
        expect(stats).toHaveProperty('averageScore');
        expect(stats).toHaveProperty('passRate');
        expect(stats).toHaveProperty('averageTimeSeconds');
      });

      it('should return correct completion count', async () => {
        const stats = await fetchTemplateStatistics('template-1');

        expect(stats.totalCompletions).toBe(150);
      });

      it('should return correct pass rate', async () => {
        const stats = await fetchTemplateStatistics('template-1');

        expect(stats.passRate).toBe(68.5);
      });

      it('should return 404 for non-existent template', async () => {
        await expect(fetchTemplateStatistics('template-nonexistent')).rejects.toThrow();
      });
    });
  });

  // ==========================================
  // Score Calculations
  // ==========================================
  describe('Score Calculations', () => {
    it('should have percentage matching score/maxScore ratio', async () => {
      const result = await fetchResultById('result-1');

      result.competencyScores!.forEach((cs) => {
        const calculatedPercentage = (cs.score / cs.maxScore) * 100;
        expect(cs.percentage).toBeCloseTo(calculatedPercentage, 0);
      });
    });

    it('should have pass status matching passing threshold', async () => {
      const passedResult = await fetchResultById('result-1');
      const failedResult = await fetchResultById('result-2');

      expect(passedResult.passed).toBe(true);
      expect(passedResult.overallPercentage).toBeGreaterThanOrEqual(70);

      expect(failedResult.passed).toBe(false);
      expect(failedResult.overallPercentage).toBeLessThan(70);
    });

    it('should track answered and skipped questions', async () => {
      const result = await fetchResultById('result-1');

      expect(result.questionsAnswered + result.questionsSkipped).toBe(result.totalQuestions);
    });
  });

  // ==========================================
  // Error Handling
  // ==========================================
  describe('Error Handling', () => {
    it('should handle server errors', async () => {
      server.use(
        http.get(`${TESTS_BASE}/results/:resultId`, () => {
          return HttpResponse.json(
            { message: 'Internal server error', code: 'SERVER_ERROR' },
            { status: 500 }
          );
        })
      );

      await expect(fetchResultById('result-1')).rejects.toThrow();
    });

    it('should handle unauthorized errors', async () => {
      server.use(
        http.get(`${TESTS_BASE}/results/:resultId`, () => {
          return HttpResponse.json(
            { message: 'Authentication required', code: 'UNAUTHORIZED' },
            { status: 401 }
          );
        })
      );

      await expect(fetchResultById('result-1')).rejects.toThrow();
    });

    it('should handle forbidden errors for restricted results', async () => {
      server.use(
        http.get(`${TESTS_BASE}/results/:resultId`, () => {
          return HttpResponse.json(
            { message: 'Access denied to this result', code: 'FORBIDDEN' },
            { status: 403 }
          );
        })
      );

      await expect(fetchResultById('result-1')).rejects.toThrow();
    });

    it('should handle network errors gracefully', async () => {
      server.use(
        http.get(`${TESTS_BASE}/results/:resultId`, () => {
          return HttpResponse.error();
        })
      );

      await expect(fetchResultById('result-1')).rejects.toThrow();
    });
  });

  // ==========================================
  // Data Integrity
  // ==========================================
  describe('Data Integrity', () => {
    it('should have valid date formats', async () => {
      const result = await fetchResultById('result-1');

      expect(() => new Date(result.completedAt)).not.toThrow();
      expect(new Date(result.completedAt).getTime()).not.toBeNaN();
    });

    it('should have O*NET codes for mapped competencies', async () => {
      const result = await fetchResultById('result-1');
      const competencyWithOnet = result.competencyScores!.find((c) => c.onetCode);

      expect(competencyWithOnet).toBeDefined();
      expect(competencyWithOnet?.onetCode).toMatch(/^\d+\.[A-Z]\.\d+\.[a-z]$/);
    });

    it('should have non-negative scores', async () => {
      const result = await fetchResultById('result-1');

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      result.competencyScores!.forEach((cs) => {
        expect(cs.score).toBeGreaterThanOrEqual(0);
        expect(cs.maxScore).toBeGreaterThan(0);
      });
    });

    it('should have percentage between 0 and 100', async () => {
      const result = await fetchResultById('result-1');

      expect(result.overallPercentage).toBeGreaterThanOrEqual(0);
      expect(result.overallPercentage).toBeLessThanOrEqual(100);
      result.competencyScores!.forEach((cs) => {
        expect(cs.percentage).toBeGreaterThanOrEqual(0);
        expect(cs.percentage).toBeLessThanOrEqual(100);
      });
    });
  });
});
