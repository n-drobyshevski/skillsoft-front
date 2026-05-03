/**
 * Anonymous Test Session Adapter
 *
 * Implementation of TestSessionAdapter for anonymous users via share links.
 * Uses session access tokens for authentication instead of Clerk JWT.
 *
 * @module adapters/anonymous-test-session-adapter
 */

import {
  anonymousTestApi,
  type AnonymousCurrentQuestion,
  type AnonymousSessionResponse,
  type AnonymousTakerInfo as ApiTakerInfo,
} from '@/services/anonymousApi';
import type {
  CurrentQuestionResponse,
  SubmitAnswerRequest,
  TestAnswer,
  SessionQuestion,
  QuestionType,
  DifficultyLevel,
  SessionStatus,
} from '@/types/domain';
import type {
  TestSessionAdapter,
  SessionMode,
  SessionData,
  CompletionResult,
  AnonymousTakerInfo,
} from './test-session-adapter';

/**
 * Anonymous Test Session Adapter
 *
 * Uses session access tokens for authentication via X-Session-Token header.
 * Does not support test-drive mode (HR-only feature).
 * Requires taker info on completion.
 */
export class AnonymousTestSessionAdapter implements TestSessionAdapter {
  // ============================================
  // Mode Information
  // ============================================

  readonly mode: SessionMode = 'anonymous';
  readonly supportsTestDrive = false; // HR-only feature
  readonly supportsAnswerReview = true;
  readonly requiresTakerInfo = true;

  // ============================================
  // Private State
  // ============================================

  private readonly accessToken: string;

  // ============================================
  // Constructor
  // ============================================

  /**
   * Create an anonymous adapter.
   *
   * @param accessToken - Session access token from share link creation
   *
   * @example
   * ```typescript
   * const { accessToken } = anonymousTestApi.getCredentials();
   * if (accessToken) {
   *   const adapter = new AnonymousTestSessionAdapter(accessToken);
   * }
   * ```
   */
  constructor(accessToken: string) {
    if (!accessToken) {
      throw new Error('Session access token is required for anonymous adapter');
    }
    this.accessToken = accessToken;
  }

  // ============================================
  // Type Normalization Helpers
  // ============================================

  /**
   * Normalize anonymous session response to SessionData.
   */
  private normalizeSession(response: AnonymousSessionResponse): SessionData {
    return {
      id: response.sessionId,
      templateId: response.template.id,
      templateName: response.template.name,
      clerkUserId: '', // Anonymous sessions don't have a Clerk user
      status: 'IN_PROGRESS' as SessionStatus, // Anonymous sessions are always in progress when accessed
      currentQuestionIndex: 0,
      questionOrder: [], // Not exposed in anonymous API
      totalQuestions: response.template.questionCount,
      answeredQuestions: 0,
      createdAt: new Date().toISOString(),
      template: {
        id: response.template.id,
        name: response.template.name,
        description: response.template.description ?? undefined,
        questionCount: response.template.questionCount,
        timeLimitMinutes: response.template.timeLimitMinutes,
        allowSkip: response.template.allowSkip,
        allowBackNavigation: response.template.allowBackNavigation,
      },
    };
  }

  /**
   * Normalize anonymous current question to CurrentQuestionResponse.
   * This is the key type mapping between APIs.
   */
  private normalizeCurrentQuestion(response: AnonymousCurrentQuestion): CurrentQuestionResponse {
    // Build the SessionQuestion from anonymous API format
    const question: SessionQuestion = {
      id: response.question.id,
      questionText: response.question.questionText,
      questionType: response.question.questionType as QuestionType,
      answerOptions: response.question.answerOptions.map((opt, idx) => ({
        id: opt.id || `option-${idx}`,
        text: opt.text,
        score: opt.score,
      })),
      difficultyLevel: (response.question.difficultyLevel || 'INTERMEDIATE') as DifficultyLevel,
      timeLimit: response.question.timeLimit ?? undefined,
      // Fields not exposed in anonymous API - use sensible defaults
      behavioralIndicatorId: '',
      competencyId: undefined,
    };

    // Build previous answer if exists
    let previousAnswer: TestAnswer | undefined;
    if (response.previousAnswer && response.previousAnswer.selectedOptionIds?.length > 0) {
      previousAnswer = {
        sessionId: '', // Not provided by anonymous API
        questionId: response.question.id,
        selectedOptionIds: response.previousAnswer.selectedOptionIds,
        timeSpentSeconds: 0,
        isSkipped: false,
      };
    }

    return {
      sessionId: '', // Not provided by anonymous API in this response
      question,
      questionIndex: response.currentIndex,
      totalQuestions: response.totalQuestions,
      previousAnswer,
      allowSkip: response.allowSkip,
      allowBackNavigation: response.allowBackNavigation,
      timeRemainingSeconds: response.timeRemainingSeconds ?? undefined,
    };
  }

  /**
   * Map SubmitAnswerRequest to anonymous API format.
   * Anonymous API uses selectedOptionIndex instead of selectedOptionIds.
   */
  private normalizeSubmitRequest(
    questionId: string,
    request: SubmitAnswerRequest
  ): { questionId: string; selectedOptionIndex: number } {
    // Extract the option index from the first selected option ID
    // Anonymous API expects a single option index
    let selectedOptionIndex = 0;

    if (request.selectedOptionIds && request.selectedOptionIds.length > 0) {
      const optionId = request.selectedOptionIds[0];
      // Option IDs are typically "option-0", "option-1", etc.
      const match = optionId.match(/option-(\d+)/);
      if (match) {
        selectedOptionIndex = parseInt(match[1], 10);
      }
    } else if (request.likertValue !== undefined) {
      // For Likert scales, the value IS the index (0-4 for 1-5 scale)
      selectedOptionIndex = request.likertValue - 1;
    }

    return { questionId, selectedOptionIndex };
  }

  // ============================================
  // Session Operations
  // ============================================

  async getSession(sessionId: string): Promise<SessionData> {
    const response = await anonymousTestApi.getSession(sessionId, this.accessToken);
    return this.normalizeSession(response);
  }

  async getCurrentQuestion(sessionId: string): Promise<CurrentQuestionResponse> {
    const response = await anonymousTestApi.getCurrentQuestion(sessionId, this.accessToken);
    const normalized = this.normalizeCurrentQuestion(response);
    // Add sessionId since it wasn't in the response
    normalized.sessionId = sessionId;
    return normalized;
  }

  // ============================================
  // Answer Operations
  // ============================================

  async submitAnswer(
    sessionId: string,
    request: SubmitAnswerRequest
  ): Promise<TestAnswer> {
    const { questionId, selectedOptionIndex } = this.normalizeSubmitRequest(
      request.questionId,
      request
    );

    const response = await anonymousTestApi.submitAnswer(
      sessionId,
      questionId,
      selectedOptionIndex,
      this.accessToken
    );

    // Normalize response to TestAnswer
    return {
      id: response.id,
      sessionId: response.sessionId,
      questionId: response.questionId,
      selectedOptionIds: response.selectedOptionIds,
      timeSpentSeconds: 0, // Not tracked in anonymous API response
      isSkipped: false,
      answeredAt: response.answeredAt,
    };
  }

  async navigateToQuestion(
    sessionId: string,
    questionIndex: number
  ): Promise<void> {
    await anonymousTestApi.navigateToQuestion(sessionId, questionIndex, this.accessToken);
  }

  async getSessionAnswers(sessionId: string): Promise<TestAnswer[]> {
    // Anonymous API doesn't have a dedicated endpoint for all answers
    // We need to work around this by returning an empty array
    // The answer summary will be built from state accumulated during the session
    //
    // Alternative: We could add a getAnswers endpoint to the anonymous API
    void sessionId;
    return [];
  }

  // ============================================
  // Session Lifecycle
  // ============================================

  async completeSession(
    sessionId: string,
    takerInfo?: AnonymousTakerInfo
  ): Promise<CompletionResult> {
    if (!takerInfo) {
      throw new Error('Taker info is required for anonymous session completion');
    }

    // Map to API format
    const apiTakerInfo: ApiTakerInfo = {
      firstName: takerInfo.firstName,
      lastName: takerInfo.lastName,
      email: takerInfo.email,
      notes: takerInfo.notes,
      gdprConsentGiven: takerInfo.gdprConsentGiven,
    };

    const response = await anonymousTestApi.completeSession(
      sessionId,
      apiTakerInfo,
      this.accessToken
    );

    const result = response.result;

    return {
      resultId: result.id,
      resultViewToken: response.resultViewToken,
      inlineResult: {
        id: result.id,
        sessionId: result.sessionId,
        overallPercentage: result.overallPercentage,
        totalCorrect: result.totalCorrect,
        totalQuestions: result.totalQuestions,
        totalTimeSeconds: result.totalTimeSeconds,
        passed: result.passed,
        competencyBreakdown: result.competencyBreakdown.map((comp) => ({
          competencyId: comp.competencyId,
          competencyName: comp.competencyName,
          score: comp.score,
          maxScore: comp.maxScore,
          percentage: comp.percentage,
        })),
      },
    };
  }

  async abandonSession(sessionId: string): Promise<void> {
    // Anonymous API doesn't have an abandon endpoint
    // The session will be cleaned up automatically after expiry
    // Clear local credentials instead
    void sessionId;
    anonymousTestApi.clearCredentials();
  }

  async discardSession(sessionId: string): Promise<void> {
    // Anonymous API doesn't have a discard endpoint
    // The session will be cleaned up automatically after expiry
    void sessionId;
    anonymousTestApi.clearCredentials();
  }

  // ============================================
  // Time Management
  // ============================================

  async syncTimeRemaining(
    sessionId: string,
    timeRemainingSeconds: number
  ): Promise<void> {
    await anonymousTestApi.updateTimeRemaining(
      sessionId,
      timeRemainingSeconds,
      this.accessToken
    );
  }
}

/**
 * Factory function to create an anonymous adapter from stored credentials.
 *
 * @returns Configured adapter, or null if no credentials stored
 *
 * @example
 * ```typescript
 * const adapter = createAnonymousAdapterFromStorage();
 * if (!adapter) {
 *   // No session - redirect to landing page
 * }
 * ```
 */
export function createAnonymousAdapterFromStorage(): AnonymousTestSessionAdapter | null {
  const { accessToken } = anonymousTestApi.getCredentials();

  if (!accessToken) {
    return null;
  }

  return new AnonymousTestSessionAdapter(accessToken);
}

/**
 * Factory function to create an anonymous adapter with explicit token.
 *
 * @param accessToken - Session access token
 * @returns Configured adapter
 */
export function createAnonymousAdapter(accessToken: string): AnonymousTestSessionAdapter {
  return new AnonymousTestSessionAdapter(accessToken);
}
