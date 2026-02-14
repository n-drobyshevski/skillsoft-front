import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePlayerState, type PlayerState, type QuestionState } from '../../components/test-player/hooks/usePlayerState';
import type {
  TestSession,
  CurrentQuestionResponse,
  SessionQuestion,
  TestAnswer,
} from '@/types/domain';
import { SessionStatus, QuestionType, DifficultyLevel } from '@/types/domain';

// Mock external dependencies
vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/api.client', () => ({
  testSessionsClientApi: {
    getCurrentQuestion: vi.fn(),
  },
}));

vi.mock('@/utils/retry', () => ({
  retryWithBackoff: vi.fn(async (fn: () => Promise<unknown>) => fn()),
  getUserFriendlyErrorMessage: vi.fn((error: Error) => error.message),
  isRetryableError: vi.fn(() => true),
}));

// Import mocked modules for test control
import { testSessionsClientApi } from '@/services/api.client';
import { retryWithBackoff } from '@/utils/retry';
import { toast } from 'sonner';

describe('usePlayerState', () => {
  // Test fixtures
  const createMockSession = (overrides: Partial<TestSession> = {}): TestSession => ({
    id: 'session-123',
    templateId: 'template-456',
    templateName: 'Test Assessment / Тестовая оценка',
    clerkUserId: 'clerk_user_789',
    status: SessionStatus.IN_PROGRESS,
    currentQuestionIndex: 0,
    questionOrder: ['q1', 'q2', 'q3', 'q4', 'q5'],
    totalQuestions: 5,
    answeredQuestions: 0,
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  const createMockQuestion = (overrides: Partial<SessionQuestion> = {}): SessionQuestion => ({
    id: 'question-1',
    questionText: 'How often do you demonstrate leadership? / Как часто вы проявляете лидерство?',
    questionType: QuestionType.LIKERT_SCALE,
    answerOptions: [
      { value: 1, label: 'Never / Никогда' },
      { value: 2, label: 'Rarely / Редко' },
      { value: 3, label: 'Sometimes / Иногда' },
      { value: 4, label: 'Often / Часто' },
      { value: 5, label: 'Always / Всегда' },
    ],
    difficultyLevel: DifficultyLevel.INTERMEDIATE,
    behavioralIndicatorId: 'bi-123',
    ...overrides,
  });

  const createMockCurrentQuestion = (
    overrides: Partial<CurrentQuestionResponse> = {}
  ): CurrentQuestionResponse => ({
    sessionId: 'session-123',
    question: createMockQuestion(),
    questionIndex: 0,
    totalQuestions: 5,
    allowSkip: true,
    allowBackNavigation: true,
    ...overrides,
  });

  const createMockAnswer = (overrides: Partial<TestAnswer> = {}): TestAnswer => ({
    sessionId: 'session-123',
    questionId: 'question-1',
    timeSpentSeconds: 30,
    isSkipped: false,
    ...overrides,
  });

  const authHeaders = { Authorization: 'Bearer test-token' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ============================================
  // INITIALIZATION TESTS
  // ============================================

  describe('Initialization', () => {
    it('should initialize with correct state from session and initial question', () => {
      const session = createMockSession({ answeredQuestions: 2 });
      const initialQuestion = createMockCurrentQuestion({ questionIndex: 2 });

      const { result } = renderHook(() =>
        usePlayerState({
          session,
          initialQuestion,
          authHeaders,
        })
      );

      expect(result.current.state.currentQuestion).toEqual(initialQuestion.question);
      expect(result.current.state.questionIndex).toBe(2);
      expect(result.current.state.totalQuestions).toBe(5);
      expect(result.current.state.allowSkip).toBe(true);
      expect(result.current.state.allowBackNavigation).toBe(true);
      expect(result.current.state.isSubmitting).toBe(false);
      expect(result.current.state.answeredCount).toBe(2);
      expect(result.current.state.skippedCount).toBe(0);
    });

    it('should initialize question states correctly', () => {
      const session = createMockSession({ answeredQuestions: 2 });
      const initialQuestion = createMockCurrentQuestion({ questionIndex: 2 });

      const { result } = renderHook(() =>
        usePlayerState({
          session,
          initialQuestion,
          authHeaders,
        })
      );

      // First 2 questions should be answered, third should be current
      expect(result.current.state.questionStates[0]).toBe('answered');
      expect(result.current.state.questionStates[1]).toBe('answered');
      expect(result.current.state.questionStates[2]).toBe('current');
      expect(result.current.state.questionStates[3]).toBe('pending');
      expect(result.current.state.questionStates[4]).toBe('pending');
    });

    it('should extract likert answer value from previous answer', () => {
      const session = createMockSession();
      const previousAnswer = createMockAnswer({ likertValue: 4 });
      const initialQuestion = createMockCurrentQuestion({ previousAnswer });

      const { result } = renderHook(() =>
        usePlayerState({
          session,
          initialQuestion,
          authHeaders,
        })
      );

      expect(result.current.currentAnswer).toBe(4);
    });

    it('should extract text response from previous answer', () => {
      const session = createMockSession();
      const previousAnswer = createMockAnswer({ textResponse: 'My answer / Мой ответ' });
      const initialQuestion = createMockCurrentQuestion({ previousAnswer });

      const { result } = renderHook(() =>
        usePlayerState({
          session,
          initialQuestion,
          authHeaders,
        })
      );

      expect(result.current.currentAnswer).toBe('My answer / Мой ответ');
    });

    it('should extract single selected option from previous answer', () => {
      const session = createMockSession();
      const previousAnswer = createMockAnswer({ selectedOptionIds: ['option-a'] });
      const initialQuestion = createMockCurrentQuestion({ previousAnswer });

      const { result } = renderHook(() =>
        usePlayerState({
          session,
          initialQuestion,
          authHeaders,
        })
      );

      expect(result.current.currentAnswer).toBe('option-a');
    });

    it('should extract multiple selected options as array from previous answer', () => {
      const session = createMockSession();
      const previousAnswer = createMockAnswer({ selectedOptionIds: ['opt-a', 'opt-b', 'opt-c'] });
      const initialQuestion = createMockCurrentQuestion({ previousAnswer });

      const { result } = renderHook(() =>
        usePlayerState({
          session,
          initialQuestion,
          authHeaders,
        })
      );

      expect(result.current.currentAnswer).toEqual(['opt-a', 'opt-b', 'opt-c']);
    });
  });

  // ============================================
  // ANSWER TRACKING TESTS
  // ============================================

  describe('Answer Tracking', () => {
    it('should update current answer when setCurrentAnswer is called', () => {
      const session = createMockSession();
      const initialQuestion = createMockCurrentQuestion();

      const { result } = renderHook(() =>
        usePlayerState({
          session,
          initialQuestion,
          authHeaders,
        })
      );

      act(() => {
        result.current.setCurrentAnswer(3);
      });

      expect(result.current.currentAnswer).toBe(3);
    });

    it('should track time spent on question', () => {
      const session = createMockSession();
      const initialQuestion = createMockCurrentQuestion();

      const { result } = renderHook(() =>
        usePlayerState({
          session,
          initialQuestion,
          authHeaders,
        })
      );

      // Advance time by 5 seconds
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      const timeSpent = result.current.getTimeSpent();
      expect(timeSpent).toBe(5);
    });

    it('should reset question timer', () => {
      const session = createMockSession();
      const initialQuestion = createMockCurrentQuestion();

      const { result } = renderHook(() =>
        usePlayerState({
          session,
          initialQuestion,
          authHeaders,
        })
      );

      // Advance time by 10 seconds
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Reset timer
      act(() => {
        result.current.resetQuestionTimer();
      });

      // Advance time by 3 more seconds
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      const timeSpent = result.current.getTimeSpent();
      expect(timeSpent).toBe(3);
    });
  });

  // ============================================
  // STATE UPDATE TESTS
  // ============================================

  describe('State Updates', () => {
    it('should update state from response when updateFromResponse is called', () => {
      const session = createMockSession();
      const initialQuestion = createMockCurrentQuestion();

      const { result } = renderHook(() =>
        usePlayerState({
          session,
          initialQuestion,
          authHeaders,
        })
      );

      const newQuestion = createMockQuestion({ id: 'question-2' });
      const newResponse: CurrentQuestionResponse = {
        sessionId: 'session-123',
        question: newQuestion,
        questionIndex: 1,
        totalQuestions: 5,
        allowSkip: false,
        allowBackNavigation: true,
        timeRemainingSeconds: 300,
      };

      act(() => {
        result.current.updateFromResponse(newResponse, 'forward');
      });

      expect(result.current.state.currentQuestion).toEqual(newQuestion);
      expect(result.current.state.questionIndex).toBe(1);
      expect(result.current.state.allowSkip).toBe(false);
      expect(result.current.state.timeRemainingSeconds).toBe(300);
      expect(result.current.state.direction).toBe('forward');
    });

    it('should set submitting state correctly', () => {
      const session = createMockSession();
      const initialQuestion = createMockCurrentQuestion();

      const { result } = renderHook(() =>
        usePlayerState({
          session,
          initialQuestion,
          authHeaders,
        })
      );

      expect(result.current.state.isSubmitting).toBe(false);

      act(() => {
        result.current.setSubmitting(true);
      });

      expect(result.current.state.isSubmitting).toBe(true);

      act(() => {
        result.current.setSubmitting(false);
      });

      expect(result.current.state.isSubmitting).toBe(false);
    });
  });

  // ============================================
  // QUESTION STATE MANAGEMENT TESTS
  // ============================================

  describe('Question State Management', () => {
    it('should mark current question as answered and update next to current', () => {
      const session = createMockSession();
      const initialQuestion = createMockCurrentQuestion();

      const { result } = renderHook(() =>
        usePlayerState({
          session,
          initialQuestion,
          authHeaders,
        })
      );

      expect(result.current.state.questionStates[0]).toBe('current');
      expect(result.current.state.questionStates[1]).toBe('pending');

      act(() => {
        result.current.markAnswered();
      });

      expect(result.current.state.questionStates[0]).toBe('answered');
      expect(result.current.state.questionStates[1]).toBe('current');
    });

    it('should mark current question as skipped', () => {
      const session = createMockSession();
      const initialQuestion = createMockCurrentQuestion();

      const { result } = renderHook(() =>
        usePlayerState({
          session,
          initialQuestion,
          authHeaders,
        })
      );

      act(() => {
        result.current.markSkipped();
      });

      expect(result.current.state.questionStates[0]).toBe('skipped');
      expect(result.current.state.questionStates[1]).toBe('current');
    });

    it('should increment answered count', () => {
      const session = createMockSession({ answeredQuestions: 0 });
      const initialQuestion = createMockCurrentQuestion();

      const { result } = renderHook(() =>
        usePlayerState({
          session,
          initialQuestion,
          authHeaders,
        })
      );

      expect(result.current.state.answeredCount).toBe(0);

      act(() => {
        result.current.incrementAnswered();
      });

      expect(result.current.state.answeredCount).toBe(1);

      act(() => {
        result.current.incrementAnswered();
      });

      expect(result.current.state.answeredCount).toBe(2);
    });

    it('should increment skipped count', () => {
      const session = createMockSession();
      const initialQuestion = createMockCurrentQuestion();

      const { result } = renderHook(() =>
        usePlayerState({
          session,
          initialQuestion,
          authHeaders,
        })
      );

      expect(result.current.state.skippedCount).toBe(0);

      act(() => {
        result.current.incrementSkipped();
      });

      expect(result.current.state.skippedCount).toBe(1);
    });

    it('should not crash when marking answered on last question', () => {
      const session = createMockSession({ answeredQuestions: 4 });
      const initialQuestion = createMockCurrentQuestion({
        questionIndex: 4,
        totalQuestions: 5,
      });

      const { result } = renderHook(() =>
        usePlayerState({
          session,
          initialQuestion,
          authHeaders,
        })
      );

      // This should not throw
      act(() => {
        result.current.markAnswered();
      });

      expect(result.current.state.questionStates[4]).toBe('answered');
    });
  });

  // ============================================
  // NAVIGATION TESTS
  // ============================================

  describe('Question Navigation', () => {
    it('should load question and update state on success', async () => {
      const session = createMockSession();
      const initialQuestion = createMockCurrentQuestion();

      const nextQuestion: CurrentQuestionResponse = {
        sessionId: 'session-123',
        question: createMockQuestion({ id: 'question-2' }),
        questionIndex: 1,
        totalQuestions: 5,
        allowSkip: true,
        allowBackNavigation: true,
      };

      vi.mocked(testSessionsClientApi.getCurrentQuestion).mockResolvedValue(nextQuestion);
      vi.mocked(retryWithBackoff).mockImplementation(async (fn) => fn());

      const { result } = renderHook(() =>
        usePlayerState({
          session,
          initialQuestion,
          authHeaders,
        })
      );

      await act(async () => {
        await result.current.loadQuestion('forward');
      });

      expect(result.current.state.currentQuestion?.id).toBe('question-2');
      expect(result.current.state.questionIndex).toBe(1);
      expect(result.current.state.direction).toBe('forward');
    });

    it('should call onNavigationError on API failure', async () => {
      const session = createMockSession();
      const initialQuestion = createMockCurrentQuestion();
      const onNavigationError = vi.fn();

      const error = new Error('Network error');
      vi.mocked(retryWithBackoff).mockRejectedValue(error);

      const { result } = renderHook(() =>
        usePlayerState({
          session,
          initialQuestion,
          authHeaders,
          onNavigationError,
        })
      );

      await act(async () => {
        await result.current.loadQuestion('forward');
      });

      expect(onNavigationError).toHaveBeenCalled();
    });

    it('should show toast error when no onNavigationError provided', async () => {
      const session = createMockSession();
      const initialQuestion = createMockCurrentQuestion();

      const error = new Error('Connection failed');
      vi.mocked(retryWithBackoff).mockRejectedValue(error);

      const { result } = renderHook(() =>
        usePlayerState({
          session,
          initialQuestion,
          authHeaders,
        })
      );

      await act(async () => {
        await result.current.loadQuestion('forward');
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  // ============================================
  // EDGE CASE TESTS
  // ============================================

  describe('Edge Cases', () => {
    it('should handle undefined previous answer', () => {
      const session = createMockSession();
      const initialQuestion = createMockCurrentQuestion({ previousAnswer: undefined });

      const { result } = renderHook(() =>
        usePlayerState({
          session,
          initialQuestion,
          authHeaders,
        })
      );

      expect(result.current.currentAnswer).toBeUndefined();
    });

    it('should handle empty selectedOptionIds array', () => {
      const session = createMockSession();
      const previousAnswer = createMockAnswer({ selectedOptionIds: [] });
      const initialQuestion = createMockCurrentQuestion({ previousAnswer });

      const { result } = renderHook(() =>
        usePlayerState({
          session,
          initialQuestion,
          authHeaders,
        })
      );

      expect(result.current.currentAnswer).toBeUndefined();
    });

    it('should handle session with no answered questions', () => {
      const session = createMockSession({ answeredQuestions: 0 });
      const initialQuestion = createMockCurrentQuestion({ questionIndex: 0 });

      const { result } = renderHook(() =>
        usePlayerState({
          session,
          initialQuestion,
          authHeaders,
        })
      );

      expect(result.current.state.questionStates[0]).toBe('current');
      expect(result.current.state.questionStates.filter((s) => s === 'answered').length).toBe(0);
    });

    it('should update currentAnswer to undefined when answer is cleared in response', () => {
      const session = createMockSession();
      const previousAnswer = createMockAnswer({ likertValue: 3 });
      const initialQuestion = createMockCurrentQuestion({ previousAnswer });

      const { result } = renderHook(() =>
        usePlayerState({
          session,
          initialQuestion,
          authHeaders,
        })
      );

      expect(result.current.currentAnswer).toBe(3);

      // Simulate navigating to a question without a previous answer
      const newResponse: CurrentQuestionResponse = {
        sessionId: 'session-123',
        question: createMockQuestion({ id: 'question-2' }),
        questionIndex: 1,
        totalQuestions: 5,
        allowSkip: true,
        allowBackNavigation: true,
        previousAnswer: undefined,
      };

      act(() => {
        result.current.updateFromResponse(newResponse, 'forward');
      });

      expect(result.current.currentAnswer).toBeUndefined();
    });
  });
});
