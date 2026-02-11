/**
 * Authenticated Test Session Adapter
 *
 * Implementation of TestSessionAdapter for authenticated users using Clerk.
 * Wraps testSessionsClientApi and passes X-User-Id header for authentication.
 *
 * @module adapters/authenticated-test-session-adapter
 */

import {
  testSessionsClientApi,
} from '@/services/api.client';
import type {
  CurrentQuestionResponse,
  SubmitAnswerRequest,
  TestAnswer,
} from '@/types/domain';
import type {
  TestSessionAdapter,
  SessionMode,
  SessionData,
  CompletionResult,
  AnonymousTakerInfo,
} from './test-session-adapter';

/**
 * Authenticated Test Session Adapter
 *
 * Uses Clerk userId for authentication via X-User-Id header.
 * Supports all features including test-drive mode and answer review.
 */
export class AuthenticatedTestSessionAdapter implements TestSessionAdapter {
  // ============================================
  // Mode Information
  // ============================================

  readonly mode: SessionMode = 'authenticated';
  readonly supportsTestDrive = true;
  readonly supportsAnswerReview = true;
  readonly requiresTakerInfo = false;

  // ============================================
  // Private State
  // ============================================

  private readonly authHeaders: Record<string, string>;

  // ============================================
  // Constructor
  // ============================================

  /**
   * Create an authenticated adapter.
   *
   * @param authHeaders - Headers containing X-User-Id from Clerk
   *
   * @example
   * ```typescript
   * const { userId } = useAuth();
   * const adapter = new AuthenticatedTestSessionAdapter({ 'X-User-Id': userId || '' });
   * ```
   */
  constructor(authHeaders: Record<string, string>) {
    this.authHeaders = authHeaders;
  }

  // ============================================
  // Session Operations
  // ============================================

  async getSession(sessionId: string): Promise<SessionData> {
    const session = await testSessionsClientApi.getSessionById(sessionId, this.authHeaders);

    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // SessionData extends TestSession, so we can return directly
    return session as SessionData;
  }

  async getCurrentQuestion(sessionId: string): Promise<CurrentQuestionResponse> {
    const question = await testSessionsClientApi.getCurrentQuestion(sessionId, this.authHeaders);

    if (!question) {
      throw new Error(`Question not found for session: ${sessionId}`);
    }

    return question;
  }

  // ============================================
  // Answer Operations
  // ============================================

  async submitAnswer(
    sessionId: string,
    request: SubmitAnswerRequest
  ): Promise<TestAnswer> {
    return testSessionsClientApi.submitAnswer(sessionId, request, this.authHeaders);
  }

  async navigateToQuestion(
    sessionId: string,
    questionIndex: number
  ): Promise<void> {
    await testSessionsClientApi.navigateToQuestion(sessionId, questionIndex, this.authHeaders);
  }

  async getSessionAnswers(sessionId: string): Promise<TestAnswer[]> {
    return testSessionsClientApi.getSessionAnswers(sessionId, this.authHeaders);
  }

  // ============================================
  // Session Lifecycle
  // ============================================

  async completeSession(
    sessionId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _takerInfo?: AnonymousTakerInfo
  ): Promise<CompletionResult> {
    // Authenticated mode doesn't use takerInfo - user identity comes from Clerk
    const result = await testSessionsClientApi.completeSession(sessionId, this.authHeaders);

    return {
      resultId: result.id,
      // Authenticated mode doesn't return inline results - we redirect to results page
    };
  }

  async abandonSession(sessionId: string): Promise<void> {
    await testSessionsClientApi.abandonSession(sessionId, this.authHeaders);
  }

  // ============================================
  // Time Management
  // ============================================

  async syncTimeRemaining(
    sessionId: string,
    timeRemainingSeconds: number
  ): Promise<void> {
    // Authenticated API doesn't have a dedicated time sync endpoint
    // Time is tracked on the backend via session.lastActivityAt
    // For now, we could use the navigate endpoint to keep session active
    // or implement a dedicated endpoint in the backend
    //
    // For minimal MVP, we'll make this a no-op since the authenticated
    // player currently relies on backend stale session detection
    void sessionId;
    void timeRemainingSeconds;
  }
}

/**
 * Factory function to create an authenticated adapter from Clerk userId.
 *
 * @param userId - Clerk user ID
 * @returns Configured adapter
 *
 * @example
 * ```typescript
 * const { userId } = useAuth();
 * const adapter = createAuthenticatedAdapter(userId || '');
 * ```
 */
export function createAuthenticatedAdapter(userId: string): AuthenticatedTestSessionAdapter {
  return new AuthenticatedTestSessionAdapter({
    'X-User-Id': userId,
  });
}
