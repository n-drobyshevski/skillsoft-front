import { useState, useCallback, useRef } from 'react';
import { TestSession, SessionQuestion, CurrentQuestionResponse, TestAnswer, QuestionType } from '@/types/domain';
import { testSessionsClientApi, type ApiError } from '@/services/api.client';
import { toast } from 'sonner';
import { retryWithBackoff, getUserFriendlyErrorMessage, isRetryableError } from '@/utils/retry';

/**
 * usePlayerState Hook
 *
 * Manages the core player state for the ImmersivePlayer component.
 * Handles question navigation, answer tracking, and state transitions.
 */

/** Question state for progress tracking */
export type QuestionState = 'answered' | 'skipped' | 'current' | 'pending';

export interface PlayerState {
  currentQuestion: SessionQuestion | null;
  questionIndex: number;
  totalQuestions: number;
  previousAnswer?: TestAnswer;
  allowSkip: boolean;
  allowBackNavigation: boolean;
  timeRemainingSeconds?: number;
  isSubmitting: boolean;
  direction: 'forward' | 'backward';
  answeredCount: number;
  skippedCount: number;
  questionStates: QuestionState[];
}

export interface UsePlayerStateProps {
  session: TestSession;
  initialQuestion: CurrentQuestionResponse;
  authHeaders: Record<string, string>;
  onNavigationError?: (error: ApiError) => void;
}

export interface UsePlayerStateReturn {
  /** Current player state */
  state: PlayerState;

  /** Current answer value */
  currentAnswer: string | number | string[] | undefined;

  /** Set current answer */
  setCurrentAnswer: (value: string | number | string[] | undefined) => void;

  /** Time spent on current question */
  getTimeSpent: () => number;

  /** Reset question timer */
  resetQuestionTimer: () => void;

  /** Load a question in the given direction */
  loadQuestion: (direction: 'forward' | 'backward') => Promise<void>;

  /** Update state with new question data */
  updateFromResponse: (response: CurrentQuestionResponse, direction: 'forward' | 'backward') => void;

  /** Set submitting state */
  setSubmitting: (isSubmitting: boolean) => void;

  /** Mark current question as answered */
  markAnswered: () => void;

  /** Mark current question as skipped */
  markSkipped: () => void;

  /** Increment answered count */
  incrementAnswered: () => void;

  /** Increment skipped count */
  incrementSkipped: () => void;
}

/**
 * Initialize question states based on session progress
 */
function initializeQuestionStates(
  totalQuestions: number,
  currentIndex: number,
  answeredQuestions: number
): QuestionState[] {
  const states: QuestionState[] = Array.from({ length: totalQuestions }, () => 'pending');

  // Mark questions before current as answered
  for (let i = 0; i < Math.min(currentIndex, answeredQuestions); i++) {
    states[i] = 'answered';
  }

  // Mark current question
  if (currentIndex < totalQuestions) {
    states[currentIndex] = 'current';
  }

  return states;
}

/**
 * Extract answer value from TestAnswer object
 */
function extractAnswerValue(answer: TestAnswer | undefined): string | number | string[] | undefined {
  if (!answer) return undefined;

  if (answer.likertValue !== undefined) {
    return answer.likertValue;
  }
  if (answer.textResponse) {
    return answer.textResponse;
  }
  if (answer.selectedOptionIds?.length) {
    return answer.selectedOptionIds.length === 1
      ? answer.selectedOptionIds[0]
      : answer.selectedOptionIds;
  }
  return undefined;
}

export function usePlayerState({
  session,
  initialQuestion,
  authHeaders,
  onNavigationError,
}: UsePlayerStateProps): UsePlayerStateReturn {
  // Player state
  const [state, setState] = useState<PlayerState>(() => ({
    currentQuestion: initialQuestion.question,
    questionIndex: initialQuestion.questionIndex,
    totalQuestions: initialQuestion.totalQuestions,
    previousAnswer: initialQuestion.previousAnswer,
    allowSkip: initialQuestion.allowSkip,
    allowBackNavigation: initialQuestion.allowBackNavigation,
    timeRemainingSeconds: initialQuestion.timeRemainingSeconds,
    isSubmitting: false,
    direction: 'forward',
    answeredCount: session.answeredQuestions,
    skippedCount: 0,
    questionStates: initializeQuestionStates(
      initialQuestion.totalQuestions,
      initialQuestion.questionIndex,
      session.answeredQuestions
    ),
  }));

  // Current answer value
  const [currentAnswer, setCurrentAnswer] = useState<string | number | string[] | undefined>(
    () => extractAnswerValue(initialQuestion.previousAnswer)
  );

  // Track answer timing
  const questionStartTime = useRef(Date.now());

  const getTimeSpent = useCallback(() => {
    return Math.floor((Date.now() - questionStartTime.current) / 1000);
  }, []);

  const resetQuestionTimer = useCallback(() => {
    questionStartTime.current = Date.now();
  }, []);

  // Update state from API response
  const updateFromResponse = useCallback(
    (response: CurrentQuestionResponse, direction: 'forward' | 'backward') => {
      setState((prev) => ({
        ...prev,
        currentQuestion: response.question,
        questionIndex: response.questionIndex,
        totalQuestions: response.totalQuestions,
        previousAnswer: response.previousAnswer,
        allowSkip: response.allowSkip,
        allowBackNavigation: response.allowBackNavigation,
        timeRemainingSeconds: response.timeRemainingSeconds,
        direction,
      }));

      setCurrentAnswer(extractAnswerValue(response.previousAnswer));
      questionStartTime.current = Date.now();
    },
    []
  );

  // Load question with retry logic
  const loadQuestion = useCallback(
    async (direction: 'forward' | 'backward') => {
      try {
        const response = await retryWithBackoff(
          () => testSessionsClientApi.getCurrentQuestion(session.id, authHeaders),
          {
            maxRetries: 3,
            initialDelayMs: 1000,
            shouldRetry: isRetryableError,
            onRetry: (_error, attempt) => {
              toast.info(`Повторная попытка... (${attempt}/3)`, { duration: 2000 });
            },
          }
        );

        if (response) {
          updateFromResponse(response, direction);
        }
      } catch (error) {
        console.error('Failed to load question:', error);
        const apiError = error as ApiError;

        if (onNavigationError) {
          onNavigationError(apiError);
        } else {
          toast.error(getUserFriendlyErrorMessage(error));
        }
      }
    },
    [session.id, authHeaders, updateFromResponse, onNavigationError]
  );

  // State update helpers
  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setState((prev) => ({ ...prev, isSubmitting }));
  }, []);

  const markAnswered = useCallback(() => {
    setState((prev) => {
      const newQuestionStates = [...prev.questionStates];
      newQuestionStates[prev.questionIndex] = 'answered';
      const nextIndex = prev.questionIndex + 1;
      if (nextIndex < prev.totalQuestions) {
        newQuestionStates[nextIndex] = 'current';
      }
      return {
        ...prev,
        questionStates: newQuestionStates,
      };
    });
  }, []);

  const markSkipped = useCallback(() => {
    setState((prev) => {
      const newQuestionStates = [...prev.questionStates];
      newQuestionStates[prev.questionIndex] = 'skipped';
      const nextIndex = prev.questionIndex + 1;
      if (nextIndex < prev.totalQuestions) {
        newQuestionStates[nextIndex] = 'current';
      }
      return {
        ...prev,
        questionStates: newQuestionStates,
      };
    });
  }, []);

  const incrementAnswered = useCallback(() => {
    setState((prev) => ({
      ...prev,
      answeredCount: prev.answeredCount + 1,
    }));
  }, []);

  const incrementSkipped = useCallback(() => {
    setState((prev) => ({
      ...prev,
      skippedCount: prev.skippedCount + 1,
    }));
  }, []);

  return {
    state,
    currentAnswer,
    setCurrentAnswer,
    getTimeSpent,
    resetQuestionTimer,
    loadQuestion,
    updateFromResponse,
    setSubmitting,
    markAnswered,
    markSkipped,
    incrementAnswered,
    incrementSkipped,
  };
}

export default usePlayerState;
