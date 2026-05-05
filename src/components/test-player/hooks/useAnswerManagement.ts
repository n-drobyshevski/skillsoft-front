import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { SessionQuestion, TestAnswer, SubmitAnswerRequest, QuestionType, CurrentQuestionResponse } from '@/types/domain';
import { MIN_CHARS_OPEN_TEXT, MIN_CHARS_BEHAVIORAL } from '../QuestionCard';
import { useNavigationState, areAnswersEqual } from './useNavigationState';

/**
 * useAnswerManagement Hook
 *
 * Manages the current answer state, validation, and request building
 * for the ImmersivePlayer. Handles:
 * 1. Current answer value state
 * 2. Answer validation based on question type
 * 3. Building SubmitAnswerRequest payloads
 * 4. Validation error state
 * 5. Dirty tracking (detecting unsaved changes)
 * 6. Answer change handling (optimistic update)
 */

// ============================================================================
// Types
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface UseAnswerManagementProps {
  sessionId: string;
  currentQuestion: SessionQuestion | null;
  initialQuestion: CurrentQuestionResponse;
}

export interface UseAnswerManagementReturn {
  /** Current answer value */
  currentAnswer: string | number | string[] | undefined;
  /** Set current answer */
  setCurrentAnswer: (value: string | number | string[] | undefined) => void;
  /** Validation error message */
  validationError: string | null;
  /** Set validation error */
  setValidationError: (error: string | null) => void;
  /** Whether current answer is valid */
  isAnswerValid: boolean;
  /** Validate an answer value against current question type */
  validateAnswer: (value: string | number | string[] | undefined) => ValidationResult;
  /** Build a SubmitAnswerRequest from an answer value */
  buildAnswerRequest: (value: string | number | string[]) => SubmitAnswerRequest;
  /** Handle answer change from QuestionCard (clears validation, optimistic update) */
  handleAnswer: (value: string | number | string[]) => void;
  /** Question start time ref */
  questionStartTime: React.MutableRefObject<number>;
}

// ============================================================================
// Utility: Extract answer value from TestAnswer
// ============================================================================

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

// ============================================================================
// Hook Implementation
// ============================================================================

export function useAnswerManagement({
  sessionId,
  currentQuestion,
  initialQuestion,
}: UseAnswerManagementProps): UseAnswerManagementReturn {
  const t = useTranslations('assessment');

  // Current answer value - initialized from initial question's previous answer
  const [currentAnswer, setCurrentAnswer] = useState<string | number | string[] | undefined>(
    () => extractAnswerValue(initialQuestion.previousAnswer)
  );

  // Validation error
  const [validationError, setValidationError] = useState<string | null>(null);

  // Track answer timing
  const questionStartTime = useRef(Date.now());

  // ========================================================================
  // Dirty Tracking: Monitor answer changes
  // ========================================================================

  useEffect(() => {
    const questionId = currentQuestion?.id;
    if (!questionId) return;

    const navStore = useNavigationState.getState();
    const originalAnswer = navStore.getOriginalAnswer(questionId);

    // Mark dirty if current answer differs from original
    if (!areAnswersEqual(currentAnswer, originalAnswer)) {
      navStore.markDirty(questionId);
    } else {
      navStore.markClean(questionId);
    }
  }, [currentAnswer, currentQuestion?.id]);

  // ========================================================================
  // Validation
  // ========================================================================

  const validateAnswer = (value: string | number | string[] | undefined): ValidationResult => {
    if (!currentQuestion) {
      return { valid: false, error: t('player.validation.noCurrentQuestion') };
    }

    // No answer provided (handle different empty states)
    if (value === undefined || value === null) {
      return { valid: false, error: t('player.validation.pleaseSelectOrEnter') };
    }

    // Empty string check (but allow numeric 0)
    if (value === '' && typeof value === 'string') {
      return { valid: false, error: t('player.validation.pleaseSelectOrEnter') };
    }

    // Validate array (multiple choice) - at least one selection
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return { valid: false, error: t('player.validation.pleaseSelectAtLeastOne') };
      }
      return { valid: true };
    }

    // Validate text input questions
    const isTextQuestion = currentQuestion.questionType === QuestionType.OPEN_TEXT ||
                          currentQuestion.questionType === QuestionType.BEHAVIORAL_EXAMPLE;

    if (isTextQuestion) {
      if (typeof value !== 'string') {
        return { valid: false, error: t('player.validation.answerMustBeText') };
      }

      const minChars = currentQuestion.questionType === QuestionType.BEHAVIORAL_EXAMPLE
        ? MIN_CHARS_BEHAVIORAL
        : MIN_CHARS_OPEN_TEXT;

      const charCount = value.trim().length;

      if (charCount === 0) {
        return { valid: false, error: t('player.validation.pleaseEnterAnswer') };
      }

      if (charCount < minChars) {
        const remaining = minChars - charCount;
        return {
          valid: false,
          error: t('player.validation.answerTooShort', { remaining }),
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
      return { valid: false, error: t('player.validation.pleaseSelectOption') };
    }

    // Default: if we have any value, it's valid
    return { valid: true };
  };

  // ========================================================================
  // Computed: is answer valid
  // ========================================================================

  const validation = validateAnswer(currentAnswer);

  const isAnswerValid = validation.valid;

  // ========================================================================
  // Build SubmitAnswerRequest
  // ========================================================================

  const buildAnswerRequest = (value: string | number | string[]): SubmitAnswerRequest => {
    const timeSpentSeconds = Math.floor((Date.now() - questionStartTime.current) / 1000);
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
  };

  // ========================================================================
  // Handle answer change (for QuestionCard)
  // ========================================================================

  const handleAnswer = (value: string | number | string[]) => {
    if (!currentQuestion) return;

    // Clear validation error when user changes answer
    setValidationError(null);

    // Optimistic update
    setCurrentAnswer(value);
  };

  return {
    currentAnswer,
    setCurrentAnswer,
    validationError,
    setValidationError,
    isAnswerValid,
    validateAnswer,
    buildAnswerRequest,
    handleAnswer,
    questionStartTime,
  };
}

export default useAnswerManagement;
