/**
 * Authenticated Test Session Adapter
 *
 * Implementation of TestSessionAdapter for authenticated users using Clerk.
 * Wraps testSessionsClientApi and passes HMAC-signed authentication headers.
 *
 * Each API call obtains fresh HMAC-signed headers via the getSignedAuthHeaders
 * server action so that timestamps remain valid and replay attacks are prevented.
 *
 * @module adapters/authenticated-test-session-adapter
 */

import {
  testSessionsClientApi,
} from '@/services/api.client';
import { getSignedAuthHeaders } from '@/services/roleApi';
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
 * Uses Clerk userId for authentication via HMAC-signed headers.
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

  private readonly userId: string;
  private readonly userRole: string;

  // ============================================
  // Constructor
  // ============================================

  /**
   * Create an authenticated adapter.
   *
   * @param userId - The Clerk user ID
   * @param userRole - The user's role string (e.g., 'ADMIN', 'EDITOR', 'USER')
   *
   * @example
   * ```typescript
   * const { userId } = useAuth();
   * const adapter = new AuthenticatedTestSessionAdapter(userId || '', 'USER');
   * ```
   */
  constructor(userId: string, userRole: string = 'USER') {
    this.userId = userId;
    this.userRole = userRole;
  }

  // ============================================
  // Internal: Fresh signed headers per request
  // ============================================

  /**
   * Get fresh HMAC-signed auth headers for a request.
   * Each call generates a new timestamp + signature via the server action.
   */
  private async getHeaders(): Promise<Record<string, string>> {
    return getSignedAuthHeaders(this.userId, this.userRole);
  }

  // ============================================
  // Session Operations
  // ============================================

  async getSession(sessionId: string): Promise<SessionData> {
    const headers = await this.getHeaders();
    const session = await testSessionsClientApi.getSessionById(sessionId, headers);

    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // SessionData extends TestSession, so we can return directly
    return session as SessionData;
  }

  async getCurrentQuestion(sessionId: string): Promise<CurrentQuestionResponse> {
    const headers = await this.getHeaders();
    const question = await testSessionsClientApi.getCurrentQuestion(sessionId, headers);

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
    const headers = await this.getHeaders();
    return testSessionsClientApi.submitAnswer(sessionId, request, headers);
  }

  async navigateToQuestion(
    sessionId: string,
    questionIndex: number
  ): Promise<void> {
    const headers = await this.getHeaders();
    await testSessionsClientApi.navigateToQuestion(sessionId, questionIndex, headers);
  }

  async getSessionAnswers(sessionId: string): Promise<TestAnswer[]> {
    const headers = await this.getHeaders();
    return testSessionsClientApi.getSessionAnswers(sessionId, headers);
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
    const headers = await this.getHeaders();
    const result = await testSessionsClientApi.completeSession(sessionId, headers);

    return {
      resultId: result.id,
      // Authenticated mode doesn't return inline results - we redirect to results page
    };
  }

  async abandonSession(sessionId: string): Promise<void> {
    const headers = await this.getHeaders();
    await testSessionsClientApi.abandonSession(sessionId, headers);
  }

  async discardSession(sessionId: string): Promise<void> {
    const headers = await this.getHeaders();
    await testSessionsClientApi.discardSession(sessionId, headers);
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
 * @param userRole - The user's role string (defaults to 'USER')
 * @returns Configured adapter
 *
 * @example
 * ```typescript
 * const { userId } = useAuth();
 * const adapter = createAuthenticatedAdapter(userId || '', 'ADMIN');
 * ```
 */
export function createAuthenticatedAdapter(
  userId: string,
  userRole: string = 'USER'
): AuthenticatedTestSessionAdapter {
  return new AuthenticatedTestSessionAdapter(userId, userRole);
}
