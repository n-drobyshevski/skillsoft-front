import { useState, useRef, useEffect } from 'react';
import { TestSession, SessionQuestion, CurrentQuestionResponse, TestAnswer, QuestionType } from '@/types/domain';
import { testSessionsClientApi, type ApiError } from '@/services/api.client';
import { toast } from 'sonner';
import { retryWithBackoff, getUserFriendlyErrorMessage, isRetryableError } from '@/utils/retry';
import { useNavigationState, areAnswersEqual } from './useNavigationState';

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

  // ========== Dirty Tracking Integration ==========

  /** Original answer value when question was loaded (for dirty detection) */
  originalAnswer: string | number | string[] | undefined;

  /** Whether current answer differs from original (has unsaved changes) */
  hasUnsavedChanges: boolean;

  /** Check if the current question has unsaved changes */
  isDirty: () => boolean;

  /** Mark current answer as saved (clears dirty flag) */
  markAnswerSaved: () => void;

  /** Clear all dirty tracking state (e.g., on session end) */
  clearDirtyTracking: () => void;
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
export function extractAnswerValue(answer: TestAnswer | undefined): string | number | string[] | undefined {
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

  // ========== Dirty Tracking Integration ==========

  // Store original answer on mount for dirty detection
  useEffect(() => {
    const questionId = initialQuestion.question?.id;
    if (questionId) {
      const originalValue = extractAnswerValue(initialQuestion.previousAnswer);
      useNavigationState.getState().setOriginalAnswer(questionId, originalValue);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTimeSpent = () => {
    return Math.floor((Date.now() - questionStartTime.current) / 1000);
  };

  const resetQuestionTimer = () => {
    questionStartTime.current = Date.now();
  };

  // Update state from API response
  const updateFromResponse = (response: CurrentQuestionResponse, direction: 'forward' | 'backward') => {
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

      const answerValue = extractAnswerValue(response.previousAnswer);
      setCurrentAnswer(answerValue);
      questionStartTime.current = Date.now();

      // Store original answer for dirty tracking
      const questionId = response.question?.id;
      if (questionId) {
        useNavigationState.getState().setOriginalAnswer(questionId, answerValue);
        // Mark as clean since we just loaded it
        useNavigationState.getState().markClean(questionId);
      }
    };

  // Load question with retry logic
  const loadQuestion = async (direction: 'forward' | 'backward') => {
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
    };

  // State update helpers
  const setSubmitting = (isSubmitting: boolean) => {
    setState((prev) => ({ ...prev, isSubmitting }));
  };

  const markAnswered = () => {
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
  };

  const markSkipped = () => {
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
  };

  const incrementAnswered = () => {
    setState((prev) => ({
      ...prev,
      answeredCount: prev.answeredCount + 1,
    }));
  };

  const incrementSkipped = () => {
    setState((prev) => ({
      ...prev,
      skippedCount: prev.skippedCount + 1,
    }));
  };

  // ========== Dirty Tracking: Monitor Answer Changes ==========

  // Track dirty state when currentAnswer changes
  useEffect(() => {
    const questionId = state.currentQuestion?.id;
    if (!questionId) return;

    const navStore = useNavigationState.getState();
    const originalAnswer = navStore.getOriginalAnswer(questionId);

    // Mark dirty if current answer differs from original
    if (!areAnswersEqual(currentAnswer, originalAnswer)) {
      navStore.markDirty(questionId);
    } else {
      navStore.markClean(questionId);
    }
  }, [currentAnswer, state.currentQuestion?.id]);

  // Get original answer from navigation state
  const originalAnswer = (() => {
    const questionId = state.currentQuestion?.id;
    if (!questionId) return undefined;
    return useNavigationState.getState().getOriginalAnswer(questionId);
  })();

  // Computed: has unsaved changes
  const hasUnsavedChanges = !areAnswersEqual(currentAnswer, originalAnswer);

  // Check if current question is dirty
  const isDirty = () => {
    const questionId = state.currentQuestion?.id;
    if (!questionId) return false;
    return useNavigationState.getState().isDirty(questionId);
  };

  // Mark current answer as saved (clears dirty flag)
  const markAnswerSaved = () => {
    const questionId = state.currentQuestion?.id;
    if (questionId) {
      useNavigationState.getState().markClean(questionId);
      // Also update original answer to current value
      useNavigationState.getState().setOriginalAnswer(questionId, currentAnswer);
    }
  };

  // Clear all dirty tracking (e.g., on session end)
  const clearDirtyTracking = () => {
    useNavigationState.getState().clearAllDirty();
    useNavigationState.getState().clearAllOriginalAnswers();
  };

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
    // Dirty tracking
    originalAnswer,
    hasUnsavedChanges,
    isDirty,
    markAnswerSaved,
    clearDirtyTracking,
  };
}

export default usePlayerState;
