import { useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SessionQuestion, TestAnswer, SubmitAnswerRequest, QuestionType } from '@/types/domain';
import { testSessionsClientApi, type ApiError } from '@/services/api.client';
import { toast } from 'sonner';
import { MIN_CHARS_OPEN_TEXT, MIN_CHARS_BEHAVIORAL } from '../QuestionCard';
import { retryWithBackoff, getUserFriendlyErrorMessage, isRetryableError } from '@/utils/retry';

/**
 * useAnswerSubmission Hook
 *
 * Manages answer validation, building, and submission for the ImmersivePlayer.
 * Handles validation rules for different question types and API submission with retry.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface UseAnswerSubmissionProps {
  sessionId: string;
  currentQuestion: SessionQuestion | null;
  authHeaders: Record<string, string>;
  onQuestionStateChange?: (update: { type: 'answered' | 'skipped'; index: number }) => void;
  onNavigationError?: (error: ApiError) => void;
}

export interface UseAnswerSubmissionReturn {
  /** Current answer value */
  currentAnswer: string | number | string[] | undefined;

  /** Set current answer */
  setCurrentAnswer: (value: string | number | string[] | undefined) => void;

  /** Validation error message */
  validationError: string | null;

  /** Clear validation error */
  clearValidationError: () => void;

  /** Check if current answer is valid */
  isAnswerValid: boolean;

  /** Validate answer value */
  validateAnswer: (value: string | number | string[] | undefined) => ValidationResult;

  /** Build submit request from answer value */
  buildAnswerRequest: (value: string | number | string[]) => SubmitAnswerRequest;

  /** Submit answer to API */
  submitAnswer: (value: string | number | string[]) => Promise<boolean>;

  /** Submit skip request */
  submitSkip: () => Promise<boolean>;

  /** Get time spent on current question */
  getTimeSpent: () => number;

  /** Reset question timer */
  resetQuestionTimer: () => void;

  /** Handle answer change (for QuestionCard) */
  handleAnswer: (value: string | number | string[]) => void;
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

export function useAnswerSubmission({
  sessionId,
  currentQuestion,
  authHeaders,
  onNavigationError,
}: UseAnswerSubmissionProps): UseAnswerSubmissionReturn {
  const router = useRouter();

  // Current answer state
  const [currentAnswer, setCurrentAnswer] = useState<string | number | string[] | undefined>(undefined);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Track answer timing
  const questionStartTime = useRef(Date.now());

  const getTimeSpent = useCallback(() => {
    return Math.floor((Date.now() - questionStartTime.current) / 1000);
  }, []);

  const resetQuestionTimer = useCallback(() => {
    questionStartTime.current = Date.now();
  }, []);

  const clearValidationError = useCallback(() => {
    setValidationError(null);
  }, []);

  /**
   * Validate current answer based on question type
   */
  const validateAnswer = useCallback((value: string | number | string[] | undefined): ValidationResult => {
    if (!currentQuestion) {
      return { valid: false, error: 'Нет текущего вопроса' };
    }

    // No answer provided (handle different empty states)
    if (value === undefined || value === null) {
      return { valid: false, error: 'Пожалуйста, выберите или введите ответ' };
    }

    // Empty string check (but allow numeric 0)
    if (value === '' && typeof value === 'string') {
      return { valid: false, error: 'Пожалуйста, выберите или введите ответ' };
    }

    // Validate array (multiple choice) - at least one selection
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return { valid: false, error: 'Пожалуйста, выберите хотя бы один вариант' };
      }
      return { valid: true };
    }

    // Validate text input questions
    const isTextQuestion = currentQuestion.questionType === QuestionType.OPEN_TEXT ||
                          currentQuestion.questionType === QuestionType.BEHAVIORAL_EXAMPLE;

    if (isTextQuestion) {
      if (typeof value !== 'string') {
        return { valid: false, error: 'Ответ должен быть текстом' };
      }

      const minChars = currentQuestion.questionType === QuestionType.BEHAVIORAL_EXAMPLE
        ? MIN_CHARS_BEHAVIORAL
        : MIN_CHARS_OPEN_TEXT;

      const charCount = value.trim().length;

      if (charCount === 0) {
        return { valid: false, error: 'Пожалуйста, введите ответ' };
      }

      if (charCount < minChars) {
        const remaining = minChars - charCount;
        return {
          valid: false,
          error: `Ответ слишком короткий. Необходимо еще ${remaining} ${remaining === 1 ? 'символ' : remaining < 5 ? 'символа' : 'символов'}`
        };
      }

      return { valid: true };
    }

    // Validate choice questions (Likert, MCQ, SJT)
    const isChoiceQuestion = currentQuestion.questionType === QuestionType.LIKERT ||
                            currentQuestion.questionType === QuestionType.LIKERT_SCALE ||
                            currentQuestion.questionType === QuestionType.FREQUENCY_SCALE ||
                            currentQuestion.questionType === QuestionType.MCQ ||
                            currentQuestion.questionType === QuestionType.MULTIPLE_CHOICE ||
                            currentQuestion.questionType === QuestionType.SINGLE_CHOICE ||
                            currentQuestion.questionType === QuestionType.SJT ||
                            currentQuestion.questionType === QuestionType.SITUATIONAL_JUDGMENT;

    if (isChoiceQuestion) {
      // Accept both string and number values for choices
      if (typeof value === 'string' || typeof value === 'number') {
        return { valid: true };
      }
      return { valid: false, error: 'Пожалуйста, выберите вариант ответа' };
    }

    // Default: if we have any value, it's valid
    return { valid: true };
  }, [currentQuestion]);

  /**
   * Check if current answer is valid
   */
  const isAnswerValid = useMemo(() => {
    const validation = validateAnswer(currentAnswer);

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[useAnswerSubmission] Validation check:', {
        currentAnswer,
        answerType: typeof currentAnswer,
        isArray: Array.isArray(currentAnswer),
        valid: validation.valid,
        error: validation.error,
        questionType: currentQuestion?.questionType,
      });
    }

    return validation.valid;
  }, [currentAnswer, validateAnswer, currentQuestion?.questionType]);

  /**
   * Build SubmitAnswerRequest from answer value
   */
  const buildAnswerRequest = useCallback((value: string | number | string[]): SubmitAnswerRequest => {
    const timeSpentSeconds = getTimeSpent();
    const request: SubmitAnswerRequest = {
      sessionId,
      questionId: currentQuestion?.id || '',
      timeSpentSeconds,
    };

    // Determine answer type based on question type and value
    const questionType = currentQuestion?.questionType;
    const isTextQuestion = questionType === QuestionType.OPEN_TEXT ||
                          questionType === QuestionType.BEHAVIORAL_EXAMPLE;

    if (typeof value === 'number') {
      // Likert scale value
      request.likertValue = value;
    } else if (typeof value === 'string' && isTextQuestion) {
      // Text response for open-ended questions
      request.textResponse = value;
    } else if (Array.isArray(value)) {
      // Multiple selection
      request.selectedOptionIds = value;
    } else {
      // Single selection
      request.selectedOptionIds = [value];
    }

    return request;
  }, [sessionId, currentQuestion?.id, currentQuestion?.questionType, getTimeSpent]);

  /**
   * Submit answer to API with retry
   */
  const submitAnswer = useCallback(async (value: string | number | string[]): Promise<boolean> => {
    if (!currentQuestion) return false;

    try {
      const request = buildAnswerRequest(value);
      await retryWithBackoff(
        () => testSessionsClientApi.submitAnswer(sessionId, request, authHeaders),
        {
          maxRetries: 3,
          initialDelayMs: 1000,
          shouldRetry: isRetryableError,
          onRetry: (_error, attempt) => {
            toast.info(`Сохранение... (попытка ${attempt}/3)`, { duration: 2000 });
          },
        }
      );
      return true;
    } catch (error) {
      console.error('Failed to submit answer:', error);
      const apiError = error as ApiError;

      // Handle session state errors
      if (apiError.status === 400 || apiError.status === 403) {
        const errorMessage = apiError.message || '';
        if (errorMessage.toLowerCase().includes('abandon')) {
          toast.error('Сессия была отменена');
          router.push('/test-templates');
          return false;
        } else if (errorMessage.toLowerCase().includes('complet')) {
          toast.info('Тест уже завершён');
          router.push('/test-templates');
          return false;
        }
        toast.error('Недействительный переход к следующему вопросу');
      } else if (apiError.status === 404) {
        toast.error('Вопрос не найден');
      } else {
        toast.error('Не удалось сохранить ответ');
      }

      if (onNavigationError) {
        onNavigationError(apiError);
      }

      return false;
    }
  }, [sessionId, currentQuestion, authHeaders, buildAnswerRequest, onNavigationError, router]);

  /**
   * Submit skip request
   */
  const submitSkip = useCallback(async (): Promise<boolean> => {
    if (!currentQuestion) return false;

    try {
      const request: SubmitAnswerRequest = {
        sessionId,
        questionId: currentQuestion.id,
        timeSpentSeconds: getTimeSpent(),
        skip: true,
      };

      await retryWithBackoff(
        () => testSessionsClientApi.submitAnswer(sessionId, request, authHeaders),
        {
          maxRetries: 2,
          initialDelayMs: 1000,
          shouldRetry: isRetryableError,
        }
      );
      return true;
    } catch (error) {
      console.error('Failed to skip question:', error);
      const apiError = error as ApiError;

      if (apiError.status === 400 || apiError.status === 403) {
        const errorMessage = apiError.message || '';
        if (errorMessage.toLowerCase().includes('abandon')) {
          toast.error('Сессия была отменена');
          router.push('/test-templates');
          return false;
        } else if (errorMessage.toLowerCase().includes('complet')) {
          toast.info('Тест уже завершён');
          router.push('/test-templates');
          return false;
        }
      }

      toast.error('Не удалось пропустить вопрос');
      return false;
    }
  }, [sessionId, currentQuestion, authHeaders, getTimeSpent, router]);

  /**
   * Handle answer selection (optimistic update)
   */
  const handleAnswer = useCallback((value: string | number | string[]) => {
    if (!currentQuestion) return;

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[useAnswerSubmission] Answer changed:', {
        questionType: currentQuestion.questionType,
        questionId: currentQuestion.id,
        newValue: value,
        valueType: typeof value,
        isArray: Array.isArray(value),
      });
    }

    // Clear validation error when user changes answer
    setValidationError(null);

    // Optimistic update
    setCurrentAnswer(value);
  }, [currentQuestion]);

  return {
    currentAnswer,
    setCurrentAnswer,
    validationError,
    clearValidationError,
    isAnswerValid,
    validateAnswer,
    buildAnswerRequest,
    submitAnswer,
    submitSkip,
    getTimeSpent,
    resetQuestionTimer,
    handleAnswer,
  };
}

export default useAnswerSubmission;
