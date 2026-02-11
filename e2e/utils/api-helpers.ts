import { APIRequestContext } from '@playwright/test';
import {
  DataFactory,
  CompetencyData,
  BehavioralIndicatorData,
  QuestionData,
  TestTemplateData,
} from '../fixtures/data-factory';

/**
 * API Helper class for E2E test setup and teardown.
 * Provides methods to create and delete test data via direct API calls.
 *
 * Benefits:
 * - Faster than UI-based setup
 * - More reliable (no UI flakiness)
 * - Isolated test data per test
 * - Easy cleanup
 */
export class ApiHelper {
  private baseUrl: string;
  private request: APIRequestContext;
  private authHeaders: Record<string, string>;

  constructor(request: APIRequestContext, authHeaders: Record<string, string> = {}) {
    // Construct API base URL
    const envApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    const isFullUrl = envApiUrl.startsWith("https://") || envApiUrl.startsWith('https://');
    this.baseUrl = isFullUrl ? envApiUrl : `https://${envApiUrl}/api`;
    this.request = request;
    this.authHeaders = authHeaders;
  }

  // ==========================================
  // Request Helpers
  // ==========================================

  private async get<T>(endpoint: string): Promise<T> {
    const response = await this.request.get(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        ...this.authHeaders,
      },
    });

    if (!response.ok()) {
      throw new Error(`GET ${endpoint} failed: ${response.status()} ${await response.text()}`);
    }

    return response.json();
  }

  private async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.request.post(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...this.authHeaders,
      },
      data: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok()) {
      throw new Error(`POST ${endpoint} failed: ${response.status()} ${await response.text()}`);
    }

    return response.json();
  }

  private async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await this.request.put(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...this.authHeaders,
      },
      data: JSON.stringify(data),
    });

    if (!response.ok()) {
      throw new Error(`PUT ${endpoint} failed: ${response.status()} ${await response.text()}`);
    }

    return response.json();
  }

  private async delete(endpoint: string): Promise<void> {
    const response = await this.request.delete(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        ...this.authHeaders,
      },
    });

    if (!response.ok() && response.status() !== 404) {
      throw new Error(`DELETE ${endpoint} failed: ${response.status()} ${await response.text()}`);
    }
  }

  // ==========================================
  // Competency Methods
  // ==========================================

  /**
   * Create a competency via API.
   */
  async createCompetency(data?: Partial<CompetencyData>): Promise<{ id: string; name: string }> {
    const competencyData = DataFactory.competency.valid(data);
    return this.post('/v1/competencies', competencyData);
  }

  /**
   * Get a competency by ID.
   */
  async getCompetency(id: string): Promise<unknown> {
    return this.get(`/v1/competencies/${id}`);
  }

  /**
   * Delete a competency by ID.
   */
  async deleteCompetency(id: string): Promise<void> {
    return this.delete(`/v1/competencies/${id}`);
  }

  /**
   * List all competencies.
   */
  async listCompetencies(): Promise<unknown[]> {
    return this.get('/v1/competencies');
  }

  // ==========================================
  // Behavioral Indicator Methods
  // ==========================================

  /**
   * Create a behavioral indicator via API.
   */
  async createIndicator(competencyId: string, data?: Partial<BehavioralIndicatorData>): Promise<{ id: string; title: string }> {
    const indicatorData = DataFactory.behavioralIndicator.valid(competencyId, data);
    return this.post('/v1/behavioral-indicators', indicatorData);
  }

  /**
   * Get an indicator by ID.
   */
  async getIndicator(id: string): Promise<unknown> {
    return this.get(`/v1/behavioral-indicators/${id}`);
  }

  /**
   * Delete an indicator by ID.
   */
  async deleteIndicator(id: string): Promise<void> {
    return this.delete(`/v1/behavioral-indicators/${id}`);
  }

  // ==========================================
  // Assessment Question Methods
  // ==========================================

  /**
   * Create a Likert question via API.
   */
  async createLikertQuestion(indicatorId: string, data?: Partial<QuestionData>): Promise<{ id: string; questionText: string }> {
    const questionData = DataFactory.question.likert(indicatorId, data);
    return this.post(`/v1/questions?behavioralIndicatorId=${indicatorId}`, questionData);
  }

  /**
   * Create an MCQ question via API.
   */
  async createMCQQuestion(indicatorId: string, data?: Partial<QuestionData>): Promise<{ id: string; questionText: string }> {
    const questionData = DataFactory.question.multipleChoice(indicatorId, data);
    return this.post(`/v1/questions?behavioralIndicatorId=${indicatorId}`, questionData);
  }

  /**
   * Create an SJT question via API.
   */
  async createSJTQuestion(indicatorId: string, data?: Partial<QuestionData>): Promise<{ id: string; questionText: string }> {
    const questionData = DataFactory.question.sjt(indicatorId, data);
    return this.post(`/v1/questions?behavioralIndicatorId=${indicatorId}`, questionData);
  }

  /**
   * Delete a question by ID.
   */
  async deleteQuestion(id: string): Promise<void> {
    return this.delete(`/v1/questions/${id}`);
  }

  // ==========================================
  // Test Template Methods
  // ==========================================

  /**
   * Create a test template via API.
   */
  async createTestTemplate(data?: Partial<TestTemplateData>): Promise<{ id: string; name: string }> {
    const templateData = DataFactory.testTemplate.overview(data);
    return this.post('/v1/tests/templates', templateData);
  }

  /**
   * Create a quick test template for flow testing.
   */
  async createQuickTemplate(data?: Partial<TestTemplateData>): Promise<{ id: string; name: string }> {
    const templateData = DataFactory.testTemplate.quick(data);
    return this.post('/v1/tests/templates', templateData);
  }

  /**
   * Get a template by ID.
   */
  async getTemplate(id: string): Promise<unknown> {
    return this.get(`/v1/tests/templates/${id}`);
  }

  /**
   * Delete a template by ID.
   */
  async deleteTemplate(id: string): Promise<void> {
    return this.delete(`/v1/tests/templates/${id}`);
  }

  /**
   * List all templates.
   */
  async listTemplates(): Promise<unknown[]> {
    return this.get('/v1/tests/templates');
  }

  /**
   * Activate a template.
   */
  async activateTemplate(id: string): Promise<unknown> {
    return this.put(`/v1/tests/templates/${id}`, { isActive: true });
  }

  /**
   * Deactivate a template.
   */
  async deactivateTemplate(id: string): Promise<unknown> {
    return this.put(`/v1/tests/templates/${id}`, { isActive: false });
  }

  // ==========================================
  // Test Session Methods
  // ==========================================

  /**
   * Start a test session via API.
   */
  async startSession(templateId: string, clerkUserId: string): Promise<{ id: string; status: string }> {
    return this.post('/v1/tests/sessions', { templateId, clerkUserId });
  }

  /**
   * Get a session by ID.
   */
  async getSession(sessionId: string): Promise<unknown> {
    return this.get(`/v1/tests/sessions/${sessionId}`);
  }

  /**
   * Abandon a test session.
   */
  async abandonSession(sessionId: string): Promise<void> {
    await this.post(`/v1/tests/sessions/${sessionId}/abandon`);
  }

  /**
   * Complete a test session.
   */
  async completeSession(sessionId: string): Promise<unknown> {
    return this.post(`/v1/tests/sessions/${sessionId}/complete`);
  }

  /**
   * Get user sessions.
   */
  async getUserSessions(clerkUserId: string): Promise<unknown[]> {
    return this.get(`/v1/tests/sessions/user/${clerkUserId}`);
  }

  // ==========================================
  // Test Results Methods
  // ==========================================

  /**
   * Get test result by ID.
   */
  async getResult(resultId: string): Promise<unknown> {
    return this.get(`/v1/tests/results/${resultId}`);
  }

  /**
   * Get user results.
   */
  async getUserResults(clerkUserId: string): Promise<unknown[]> {
    return this.get(`/v1/tests/results/user/${clerkUserId}`);
  }

  // ==========================================
  // Composite Setup Methods
  // ==========================================

  /**
   * Create a complete competency with indicators and questions.
   * Useful for setting up test data in a single call.
   */
  async setupCompetencyWithQuestions(options: {
    indicatorCount?: number;
    questionsPerIndicator?: number;
  } = {}): Promise<{
    competency: { id: string; name: string };
    indicators: { id: string; title: string }[];
    questions: { id: string; questionText: string }[];
  }> {
    const { indicatorCount = 2, questionsPerIndicator = 2 } = options;

    // Create competency
    const competency = await this.createCompetency();

    // Create indicators
    const indicators: { id: string; title: string }[] = [];
    const questions: { id: string; questionText: string }[] = [];

    for (let i = 0; i < indicatorCount; i++) {
      const indicator = await this.createIndicator(competency.id, {
        weight: 1 / indicatorCount,
        orderIndex: i + 1,
      });
      indicators.push(indicator);

      // Create questions for this indicator
      for (let j = 0; j < questionsPerIndicator; j++) {
        const question = await this.createLikertQuestion(indicator.id);
        questions.push(question);
      }
    }

    return { competency, indicators, questions };
  }

  /**
   * Create a complete test template with competencies, indicators, and questions.
   * Returns a ready-to-use template for test sessions.
   */
  async setupCompleteTemplate(): Promise<{
    template: { id: string; name: string };
    competencies: { id: string; name: string }[];
    indicators: { id: string; title: string }[];
    questions: { id: string; questionText: string }[];
  }> {
    // Create competency with questions
    const setup = await this.setupCompetencyWithQuestions({
      indicatorCount: 2,
      questionsPerIndicator: 3,
    });

    // Create template with the competency
    const template = await this.createTestTemplate({
      competencyIds: [setup.competency.id],
    });

    // Activate the template
    await this.activateTemplate(template.id);

    return {
      template,
      competencies: [setup.competency],
      indicators: setup.indicators,
      questions: setup.questions,
    };
  }

  // ==========================================
  // Cleanup Methods
  // ==========================================

  /**
   * Delete multiple competencies.
   */
  async cleanupCompetencies(ids: string[]): Promise<void> {
    for (const id of ids) {
      try {
        await this.deleteCompetency(id);
      } catch (e) {
        // Ignore errors during cleanup
        console.warn(`Failed to delete competency ${id}:`, e);
      }
    }
  }

  /**
   * Delete multiple templates.
   */
  async cleanupTemplates(ids: string[]): Promise<void> {
    for (const id of ids) {
      try {
        await this.deleteTemplate(id);
      } catch (e) {
        // Ignore errors during cleanup
        console.warn(`Failed to delete template ${id}:`, e);
      }
    }
  }

  /**
   * Cleanup all E2E test data (by prefix).
   * Deletes all entities with names starting with "E2E" or "e2e-".
   */
  async cleanupAllTestData(): Promise<void> {
    try {
      // Get all templates and delete E2E ones
      const templates = await this.listTemplates() as { id: string; name: string }[];
      const e2eTemplates = templates.filter(t =>
        t.name.startsWith('E2E') || t.name.startsWith('e2e-')
      );
      await this.cleanupTemplates(e2eTemplates.map(t => t.id));

      // Get all competencies and delete E2E ones
      const competencies = await this.listCompetencies() as { id: string; name: string }[];
      const e2eCompetencies = competencies.filter(c =>
        c.name.startsWith('E2E') ||
        c.name.startsWith('e2e-') ||
        c.name.startsWith('Test Competency') ||
        c.name.startsWith('Тестовая компетенция')
      );
      await this.cleanupCompetencies(e2eCompetencies.map(c => c.id));
    } catch (e) {
      console.warn('Failed to cleanup all test data:', e);
    }
  }
}

/**
 * Create an API helper instance with request context.
 */
export function createApiHelper(request: APIRequestContext, authHeaders: Record<string, string> = {}): ApiHelper {
  return new ApiHelper(request, authHeaders);
}
