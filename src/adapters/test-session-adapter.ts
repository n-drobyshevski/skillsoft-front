/**
 * Test Session Adapter Interface
 *
 * Abstracts the differences between authenticated (Clerk) and anonymous (token-based)
 * test session APIs, allowing the ImmersivePlayer component to work with both modes.
 *
 * @module adapters/test-session-adapter
 */

import type {
  TestSession,
  CurrentQuestionResponse,
  SubmitAnswerRequest,
  TestAnswer,
} from '@/types/domain';

// ============================================
// TYPES
// ============================================

/**
 * Session mode - determines authentication mechanism and available features.
 */
export type SessionMode = 'authenticated' | 'anonymous';

/**
 * Taker information collected for anonymous sessions.
 * Required before completing an anonymous test.
 */
export interface AnonymousTakerInfo {
  firstName: string;
  lastName: string;
  email?: string;
  notes?: string;
  gdprConsentGiven?: boolean;
}

/**
 * Competency breakdown in inline results.
 */
export interface CompetencyBreakdownItem {
  competencyId: string;
  competencyName: string;
  score: number;
  maxScore: number;
  percentage: number;
}

/**
 * Inline result data for immediate display (primarily for anonymous mode).
 */
export interface InlineResultData {
  id: string;
  sessionId: string;
  overallPercentage: number;
  totalCorrect: number;
  totalQuestions: number;
  totalTimeSeconds: number;
  passed: boolean;
  competencyBreakdown: CompetencyBreakdownItem[];
}

/**
 * Completion result returned after test completion.
 * Contains result ID for navigation and optional inline data for anonymous mode.
 */
export interface CompletionResult {
  /** Result ID for navigation to detailed results page */
  resultId: string;
  /** Inline result data for anonymous mode immediate display */
  inlineResult?: InlineResultData;
  /** HMAC-signed token for persistent result access (anonymous sessions only) */
  resultViewToken?: string;
}

/**
 * Session data returned on initial load or navigation.
 * Normalized structure used by both authenticated and anonymous adapters.
 */
export interface SessionData extends TestSession {
  /** Optional template info for display */
  template?: {
    id: string;
    name: string;
    description?: string;
    questionCount: number;
    timeLimitMinutes: number | null;
    allowSkip: boolean;
    allowBackNavigation: boolean;
  };
}

// ============================================
// ADAPTER INTERFACE
// ============================================

/**
 * TestSessionAdapter interface for abstracting API differences.
 *
 * Implementations handle:
 * - Authentication headers (X-User-Id vs X-Session-Token)
 * - API endpoint routing (/tests/sessions vs /anonymous/sessions)
 * - Response type normalization
 * - Feature availability (test-drive mode, etc.)
 */
export interface TestSessionAdapter {
  // ============================================
  // Mode Information
  // ============================================

  /** Session mode - affects available features and completion flow */
  readonly mode: SessionMode;

  /** Whether test-drive insights panel is available (HR mode) */
  readonly supportsTestDrive: boolean;

  /** Whether answer summary review is available before completion */
  readonly supportsAnswerReview: boolean;

  /** Whether the adapter requires taker info on completion */
  readonly requiresTakerInfo: boolean;

  // ============================================
  // Session Operations
  // ============================================

  /**
   * Get session metadata by ID.
   * @param sessionId - The session ID to fetch
   * @returns Session data with template info
   * @throws ApiError on 404 (not found) or 403 (forbidden)
   */
  getSession(sessionId: string): Promise<SessionData>;

  /**
   * Get current question with navigation context.
   * @param sessionId - The session ID
   * @returns Current question data with previous answer if resuming
   * @throws ApiError on session state errors (abandoned, completed)
   */
  getCurrentQuestion(sessionId: string): Promise<CurrentQuestionResponse>;

  // ============================================
  // Answer Operations
  // ============================================

  /**
   * Submit an answer to the current question.
   * Handles both regular answers and skip submissions.
   * @param sessionId - The session ID
   * @param request - Answer submission request
   * @returns The submitted answer
   */
  submitAnswer(
    sessionId: string,
    request: SubmitAnswerRequest
  ): Promise<TestAnswer>;

  /**
   * Navigate to a specific question by index.
   * @param sessionId - The session ID
   * @param questionIndex - Zero-based question index
   * @throws ApiError if navigation not allowed
   */
  navigateToQuestion(
    sessionId: string,
    questionIndex: number
  ): Promise<void>;

  /**
   * Get all submitted answers for the session.
   * Used for answer summary review screen.
   * @param sessionId - The session ID
   * @returns Array of all answers
   */
  getSessionAnswers(sessionId: string): Promise<TestAnswer[]>;

  // ============================================
  // Session Lifecycle
  // ============================================

  /**
   * Complete the test session.
   * For anonymous mode, takerInfo is required.
   * @param sessionId - The session ID
   * @param takerInfo - Optional taker information (required for anonymous)
   * @returns Completion result with result ID and optional inline data
   */
  completeSession(
    sessionId: string,
    takerInfo?: AnonymousTakerInfo
  ): Promise<CompletionResult>;

  /**
   * Abandon the test session.
   * Progress is saved but session is marked as abandoned.
   * @param sessionId - The session ID
   */
  abandonSession(sessionId: string): Promise<void>;

  // ============================================
  // Time Management
  // ============================================

  /**
   * Sync remaining time with server (for timed tests).
   * Called periodically to persist time state.
   * @param sessionId - The session ID
   * @param timeRemainingSeconds - Current remaining time
   */
  syncTimeRemaining(
    sessionId: string,
    timeRemainingSeconds: number
  ): Promise<void>;
}

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Check if a mode is authenticated.
 */
export function isAuthenticatedMode(mode: SessionMode): mode is 'authenticated' {
  return mode === 'authenticated';
}

/**
 * Check if a mode is anonymous.
 */
export function isAnonymousMode(mode: SessionMode): mode is 'anonymous' {
  return mode === 'anonymous';
}
