'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TestSession, SessionQuestion, CurrentQuestionResponse, TestAnswer, SubmitAnswerRequest, QuestionType } from '@/types/domain';
import { testSessionsClientApi, type ApiError } from '@/services/api.client';
import { competenciesApi, behavioralIndicatorsApi } from '@/services/api';
import { useTestSession, useTestSessionAdapter, useSessionFeatures } from '@/context/test-session-context';
import type { CompletionResult, AnonymousTakerInfo } from '@/adapters';
import { EnhancedSessionHeader } from '@/components/layout/enhanced-session-header';
import { QuestionCard, MIN_CHARS_OPEN_TEXT, MIN_CHARS_BEHAVIORAL } from './QuestionCard';
import { QuestionNavigation } from './QuestionNavigation';
import { CompletionDialog } from './CompletionDialog';
import { AnswerSummaryScreen } from './answer-summary';
import { useUIStore } from '@/store/ui-store';
import { useTestDriveStore } from '@/store/test-drive-store';
import {
  useReviewStore,
  AnswerSummaryItem,
  CompetencyGroup,
  createAnswerSummaryItem,
  isRetryableError as isRetryableSubmissionError,
} from '@/store/review-store';
import { toast } from 'sonner';
import { retryWithBackoff, getUserFriendlyErrorMessage, isRetryableError } from '@/utils/retry';
import { useNavigationState, areAnswersEqual, createNavigationError, type NavigationError } from './hooks/useNavigationState';
import { NavigationErrorDialog } from './components';
import { useSwipeNavigation, useReducedMotion } from '@/hooks/use-swipe-navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock, AlertTriangle } from 'lucide-react';
import { TestDriveInsights, InsightsToggle } from './insights';

interface ImmersivePlayerProps {
  session: TestSession;
  initialQuestion: CurrentQuestionResponse;
  /**
   * @deprecated Use TestSessionProvider with adapter instead.
   * Auth headers for backward compatibility during migration.
   */
  authHeaders?: Record<string, string>;
  /** Enable test-drive mode for HR insights panel */
  testDriveMode?: boolean;
  /**
   * Called when test is completed successfully.
   * If not provided, defaults to router.push to results page.
   */
  onComplete?: (result: CompletionResult) => void;
  /**
   * Called when test is abandoned.
   * If not provided, defaults to router.push to templates page.
   */
  onAbandon?: () => void;
  /**
   * Called on terminal errors.
   * If not provided, shows toast and redirects.
   */
  onError?: (error: ApiError) => void;
}

/** Question state for progress tracking */
export type QuestionState = 'answered' | 'skipped' | 'current' | 'pending';

interface PlayerState {
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

/**
 * ImmersivePlayer - Main test-taking experience
 *
 * Features:
 * - Animated question transitions
 * - Keyboard navigation
 * - Auto-save answers
 * - Progress tracking
 * - Timer management
 * - Error handling with retry
 * - Multiple dialog states
 */
export function ImmersivePlayer({
  session,
  initialQuestion,
  authHeaders,
  testDriveMode = false,
  onComplete,
  onAbandon,
  onError,
}: ImmersivePlayerProps) {
  const router = useRouter();
  const enterImmersiveMode = useUIStore((state) => state.enterImmersiveMode);
  const exitImmersiveMode = useUIStore((state) => state.exitImmersiveMode);

  // Try to get adapter from context (new pattern)
  // Falls back to null if not wrapped in TestSessionProvider (legacy mode)
  let adapter: ReturnType<typeof useTestSessionAdapter> | null = null;
  let sessionFeatures = { supportsTestDrive: true, supportsAnswerReview: true, requiresTakerInfo: false };
  try {
    adapter = useTestSessionAdapter();
    sessionFeatures = useSessionFeatures();
  } catch {
    // Not wrapped in TestSessionProvider - use legacy authHeaders mode
  }

  // Legacy mode: create a shim adapter from authHeaders
  const effectiveAuthHeaders = authHeaders || { 'X-User-Id': '' };

  // Determine if test-drive is actually available
  const testDriveAvailable = testDriveMode && sessionFeatures.supportsTestDrive;

  // Test-drive mode store actions
  const enableTestDrive = useTestDriveStore((state) => state.enableTestDriveMode);
  const disableTestDrive = useTestDriveStore((state) => state.disableTestDriveMode);
  const setCurrentQuestionData = useTestDriveStore((state) => state.setCurrentQuestionData);

  // Initialize question states based on session progress
  const initializeQuestionStates = (totalQuestions: number, currentIndex: number, answeredQuestions: number): QuestionState[] => {
    const states: QuestionState[] = Array.from({ length: totalQuestions }, () => 'pending' as QuestionState);
    // Mark questions before current as answered (simplified - actual state comes from session)
    for (let i = 0; i < Math.min(currentIndex, answeredQuestions); i++) {
      states[i] = 'answered';
    }
    // Mark current question
    if (currentIndex < totalQuestions) {
      states[currentIndex] = 'current';
    }
    return states;
  };

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
  const [currentAnswer, setCurrentAnswer] = useState<string | number | string[] | undefined>(() => {
    if (initialQuestion.previousAnswer) {
      if (initialQuestion.previousAnswer.likertValue !== undefined) {
        return initialQuestion.previousAnswer.likertValue;
      }
      if (initialQuestion.previousAnswer.textResponse) {
        return initialQuestion.previousAnswer.textResponse;
      }
      if (initialQuestion.previousAnswer.selectedOptionIds?.length) {
        return initialQuestion.previousAnswer.selectedOptionIds.length === 1
          ? initialQuestion.previousAnswer.selectedOptionIds[0]
          : initialQuestion.previousAnswer.selectedOptionIds;
      }
    }
    return undefined;
  });

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    initialQuestion.timeRemainingSeconds ?? null
  );

  // Dialog states
  const [showCompletion, setShowCompletion] = useState(false);
  const [showAbandonDialog, setShowAbandonDialog] = useState(false);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);

  // Navigation error dialog state
  const [showNavigationError, setShowNavigationError] = useState(false);
  const [navigationError, setNavigationError] = useState<NavigationError | null>(null);
  const [isRetryingNavigation, setIsRetryingNavigation] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{
    direction: 'forward' | 'backward';
    targetIndex?: number;
  } | null>(null);

  // Answer Summary Review state
  const [showSummary, setShowSummary] = useState(false);
  const [summaryAnswers, setSummaryAnswers] = useState<AnswerSummaryItem[]>([]);
  const [summaryGroups, setSummaryGroups] = useState<CompetencyGroup[]>([]);
  const [isSummarySubmitting, setIsSummarySubmitting] = useState(false);

  // Review store actions
  const enterReviewPhase = useReviewStore((state) => state.enterReviewPhase);
  const exitEditPhase = useReviewStore((state) => state.exitEditPhase);
  const startSubmission = useReviewStore((state) => state.startSubmission);
  const completeSubmission = useReviewStore((state) => state.completeSubmission);
  const failSubmission = useReviewStore((state) => state.failSubmission);
  const resetReviewStore = useReviewStore((state) => state.reset);

  // Validation state
  const [validationError, setValidationError] = useState<string | null>(null);

  // Track answer timing
  const questionStartTime = useRef(Date.now());

  /**
   * Handle time expiration
   */
  const handleTimeExpired = () => {
    setShowTimeoutDialog(true);
  };

  // Enter immersive mode on mount
  useEffect(() => {
    enterImmersiveMode();
    return () => exitImmersiveMode();
  }, [enterImmersiveMode, exitImmersiveMode]);

  // Initialize dirty tracking on mount
  useEffect(() => {
    const questionId = initialQuestion.question?.id;
    if (questionId) {
      // Extract initial answer value
      let initialValue: string | number | string[] | undefined;
      if (initialQuestion.previousAnswer) {
        if (initialQuestion.previousAnswer.likertValue !== undefined) {
          initialValue = initialQuestion.previousAnswer.likertValue;
        } else if (initialQuestion.previousAnswer.textResponse) {
          initialValue = initialQuestion.previousAnswer.textResponse;
        } else if (initialQuestion.previousAnswer.selectedOptionIds?.length) {
          initialValue = initialQuestion.previousAnswer.selectedOptionIds.length === 1
            ? initialQuestion.previousAnswer.selectedOptionIds[0]
            : initialQuestion.previousAnswer.selectedOptionIds;
        }
      }
      // Store original answer for dirty tracking
      useNavigationState.getState().setOriginalAnswer(questionId, initialValue);
    }

    // Cleanup on unmount
    return () => {
      useNavigationState.getState().clearAllDirty();
      useNavigationState.getState().clearAllOriginalAnswers();
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Enable/disable test-drive mode based on prop and adapter support
  useEffect(() => {
    if (testDriveAvailable) {
      enableTestDrive();
    }
    return () => {
      if (testDriveAvailable) {
        disableTestDrive();
      }
    };
  }, [testDriveAvailable, enableTestDrive, disableTestDrive]);

  // Update test-drive question data when current question changes
  useEffect(() => {
    const question = state.currentQuestion;
    if (!testDriveMode || !question) return;

    // Set initial data immediately with loading placeholders
    setCurrentQuestionData({
      question: question,
      psychometrics: {
        difficultyIndex: question.difficultyLevel === 'FOUNDATIONAL' ? 0.8
          : question.difficultyLevel === 'INTERMEDIATE' ? 0.6
          : question.difficultyLevel === 'ADVANCED' ? 0.4
          : question.difficultyLevel === 'EXPERT' ? 0.25
          : 0.5,
        discriminationIndex: 0.35,
      },
      scoring: {
        maxScore: question.answerOptions?.reduce((max, opt) =>
          Math.max(max, opt.score ?? opt.value ?? 0), 0) ?? 5,
        optionScores: question.answerOptions?.reduce((acc, opt, idx) => {
          const optId = opt.id || `option-${idx}`;
          acc[optId] = opt.score ?? opt.value ?? 0;
          return acc;
        }, {} as Record<string, number>),
      },
    });

    // Fetch full competency and behavioral indicator data
    const fetchHierarchyData = async () => {
      try {
        // First fetch the behavioral indicator
        const indicator = await behavioralIndicatorsApi.getIndicatorById(question.behavioralIndicatorId);

        // Then fetch the competency using competencyId from question or indicator
        const competencyId = question.competencyId || indicator?.competencyId;
        const competency = competencyId
          ? await competenciesApi.getCompetencyById(competencyId)
          : null;

        // Update store with full data
        setCurrentQuestionData({
          question: question,
          behavioralIndicator: indicator || undefined,
          competency: competency || undefined,
          psychometrics: {
            difficultyIndex: question.difficultyLevel === 'FOUNDATIONAL' ? 0.8
              : question.difficultyLevel === 'INTERMEDIATE' ? 0.6
              : question.difficultyLevel === 'ADVANCED' ? 0.4
              : question.difficultyLevel === 'EXPERT' ? 0.25
              : 0.5,
            discriminationIndex: 0.35,
          },
          scoring: {
            maxScore: question.answerOptions?.reduce((max, opt) =>
              Math.max(max, opt.score ?? opt.value ?? 0), 0) ?? 5,
            optionScores: question.answerOptions?.reduce((acc, opt, idx) => {
              const optId = opt.id || `option-${idx}`;
              acc[optId] = opt.score ?? opt.value ?? 0;
              return acc;
            }, {} as Record<string, number>),
          },
        });
      } catch (error) {
        console.error('Failed to fetch test-drive hierarchy data:', error);
        // Keep the basic data already set
      }
    };

    fetchHierarchyData();
  }, [testDriveMode, state.currentQuestion, setCurrentQuestionData]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, handleTimeExpired]);

  const currentQuestion = state.currentQuestion;

  /**
   * Validate current answer based on question type
   */
  const validateAnswer = (value: string | number | string[] | undefined): { valid: boolean; error?: string } => {
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
  };

  /**
   * Check if current answer is valid
   */
  const isAnswerValid = (() => {
    const validation = validateAnswer(currentAnswer);

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('[ImmersivePlayer] Validation check:', {
        currentAnswer,
        answerType: typeof currentAnswer,
        isArray: Array.isArray(currentAnswer),
        valid: validation.valid,
        error: validation.error,
        questionType: currentQuestion?.questionType,
      });
    }

    return validation.valid;
  })();

  /**
   * Build SubmitAnswerRequest from answer value
   */
  const buildAnswerRequest = (value: string | number | string[]): SubmitAnswerRequest => {
    const timeSpentSeconds = Math.floor((Date.now() - questionStartTime.current) / 1000);
    const request: SubmitAnswerRequest = {
      sessionId: session.id,
      questionId: state.currentQuestion?.id || '',
      timeSpentSeconds,
    };

    // Determine answer type based on question type and value
    const questionType = state.currentQuestion?.questionType;
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

  /**
   * Handle answer selection
   */
  const handleAnswer = async (value: string | number | string[]) => {
    if (!currentQuestion || state.isSubmitting) return;

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('[ImmersivePlayer] Answer changed:', {
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
  };

  /**
   * Fetch and display question at given index with retry logic
   * Supports both adapter pattern (new) and legacy authHeaders pattern.
   */
  const loadQuestion = async (direction: 'forward' | 'backward') => {
    try {
      const response = await retryWithBackoff(
        () => adapter
          ? adapter.getCurrentQuestion(session.id)
          : testSessionsClientApi.getCurrentQuestion(session.id, effectiveAuthHeaders),
        {
          maxRetries: 3,
          initialDelayMs: 1000,
          shouldRetry: isRetryableError,
          onRetry: (error, attempt) => {
            // eslint-disable-next-line no-console
            console.log(`Retrying getCurrentQuestion (attempt ${attempt}/3)...`);
            toast.info(`Повторная попытка... (${attempt}/3)`, { duration: 2000 });
          },
        }
      );

      if (response) {
        setState(prev => ({
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

        // Set previous answer if exists
        if (response.previousAnswer) {
          if (response.previousAnswer.likertValue !== undefined) {
            setCurrentAnswer(response.previousAnswer.likertValue);
          } else if (response.previousAnswer.textResponse) {
            setCurrentAnswer(response.previousAnswer.textResponse);
          } else if (response.previousAnswer.selectedOptionIds?.length) {
            setCurrentAnswer(
              response.previousAnswer.selectedOptionIds.length === 1
                ? response.previousAnswer.selectedOptionIds[0]
                : response.previousAnswer.selectedOptionIds
            );
          } else {
            setCurrentAnswer(undefined);
          }
        } else {
          setCurrentAnswer(undefined);
        }

        if (response.timeRemainingSeconds !== undefined) {
          setTimeRemaining(response.timeRemainingSeconds);
        }

        // Clear validation errors for new question
        setValidationError(null);

        // Store original answer for dirty tracking
        const questionId = response.question?.id;
        if (questionId) {
          let answerValue: string | number | string[] | undefined;
          if (response.previousAnswer) {
            if (response.previousAnswer.likertValue !== undefined) {
              answerValue = response.previousAnswer.likertValue;
            } else if (response.previousAnswer.textResponse) {
              answerValue = response.previousAnswer.textResponse;
            } else if (response.previousAnswer.selectedOptionIds?.length) {
              answerValue = response.previousAnswer.selectedOptionIds.length === 1
                ? response.previousAnswer.selectedOptionIds[0]
                : response.previousAnswer.selectedOptionIds;
            }
          }
          useNavigationState.getState().setOriginalAnswer(questionId, answerValue);
          useNavigationState.getState().markClean(questionId);
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load question:', error);
      const apiError = error as ApiError;

      // Handle session state errors - redirect to test templates
      if (apiError.status === 400 || apiError.status === 403) {
        const errorMessage = apiError.message || '';
        if (errorMessage.toLowerCase().includes('abandon')) {
          toast.error('Сессия была отменена');
          router.push('/test-templates');
        } else if (errorMessage.toLowerCase().includes('complet')) {
          toast.info('Тест уже завершён');
          router.push('/test-templates');
        } else {
          toast.error(getUserFriendlyErrorMessage(error));
          router.push('/test-templates');
        }
        return;
      }

      toast.error(getUserFriendlyErrorMessage(error));
    }
    questionStartTime.current = Date.now();
  };

  /**
   * Navigate to next question
   */
  const handleNext = async () => {
    if (state.isSubmitting) return;

    // Validate current answer
    const validation = validateAnswer(currentAnswer);
    if (!validation.valid) {
      setValidationError(validation.error || 'Пожалуйста, проверьте ваш ответ');
      toast.warning(validation.error || 'Пожалуйста, проверьте ваш ответ');
      return;
    }

    // Clear any validation errors
    setValidationError(null);
    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Submit answer
      if (currentQuestion && currentAnswer !== undefined) {
        const request = buildAnswerRequest(currentAnswer);
        if (adapter) {
          await adapter.submitAnswer(session.id, request);
        } else {
          await testSessionsClientApi.submitAnswer(session.id, request, effectiveAuthHeaders);
        }

        // Update question states - mark current as answered
        setState(prev => {
          const newQuestionStates = [...prev.questionStates];
          newQuestionStates[prev.questionIndex] = 'answered';
          const nextIndex = prev.questionIndex + 1;
          if (nextIndex < prev.totalQuestions) {
            newQuestionStates[nextIndex] = 'current';
          }
          return {
            ...prev,
            answeredCount: prev.answeredCount + 1,
            questionStates: newQuestionStates,
          };
        });
      }

      // Check if last question - show answer summary instead of completion dialog
      if (state.questionIndex + 1 >= state.totalQuestions) {
        setState(prev => ({ ...prev, isSubmitting: false }));
        // Enter answer summary review screen
        await handleEnterSummary();
        return;
      }

      // Navigate to next question
      const nextIndex = state.questionIndex + 1;
      if (adapter) {
        await adapter.navigateToQuestion(session.id, nextIndex);
      } else {
        await testSessionsClientApi.navigateToQuestion(session.id, nextIndex, effectiveAuthHeaders);
      }
      await loadQuestion('forward');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to submit answer:', error);
      const apiError = error as ApiError;

      // Handle session state errors
      if (apiError.status === 400 || apiError.status === 403) {
        const errorMessage = apiError.message || '';
        if (errorMessage.toLowerCase().includes('abandon')) {
          toast.error('Сессия была отменена');
          router.push('/test-templates');
          return;
        } else if (errorMessage.toLowerCase().includes('complet')) {
          toast.info('Тест уже завершён');
          router.push('/test-templates');
          return;
        }
        toast.error('Недействительный переход к следующему вопросу');
      } else if (apiError.status === 404) {
        toast.error('Вопрос не найден');
      } else {
        toast.error('Не удалось сохранить ответ');
      }
    }

    setState(prev => ({ ...prev, isSubmitting: false }));
  };

  /**
   * Navigate to previous question with auto-save
   *
   * If the current answer has unsaved changes (is dirty), automatically
   * saves the answer before navigating backward. This prevents data loss
   * when the user clicks the back button.
   */
  const handlePrevious = async () => {
    if (!state.allowBackNavigation || state.isSubmitting) return;
    if (state.questionIndex <= 0) return; // Already at first question

    setState(prev => ({ ...prev, isSubmitting: true }));

    const questionId = currentQuestion?.id;
    const navStore = useNavigationState.getState();

    try {
      // Check if current answer has unsaved changes
      const isDirty = questionId ? navStore.isDirty(questionId) : false;

      // Auto-save if dirty and answer exists
      if (isDirty && currentAnswer !== undefined && currentQuestion) {
        // Validate before saving (but don't block navigation for invalid answers)
        const validation = validateAnswer(currentAnswer);

        if (validation.valid) {
          // Save the answer
          const request = buildAnswerRequest(currentAnswer);
          await retryWithBackoff(
            () => adapter
              ? adapter.submitAnswer(session.id, request)
              : testSessionsClientApi.submitAnswer(session.id, request, effectiveAuthHeaders),
            {
              maxRetries: 2,
              initialDelayMs: 500,
              shouldRetry: isRetryableError,
              onRetry: (_error, attempt) => {
                toast.info(`Сохранение... (попытка ${attempt}/2)`, { duration: 1500 });
              },
            }
          );

          // Mark as clean after successful save
          if (questionId) {
            navStore.markClean(questionId);
            navStore.setOriginalAnswer(questionId, currentAnswer);
          }

          // Update question state to answered if not already
          setState(prev => {
            const currentState = prev.questionStates[prev.questionIndex];
            if (currentState === 'current' || currentState === 'pending') {
              const newQuestionStates = [...prev.questionStates];
              newQuestionStates[prev.questionIndex] = 'answered';
              return {
                ...prev,
                answeredCount: prev.answeredCount + 1,
                questionStates: newQuestionStates,
              };
            }
            return prev;
          });
        } else {
          // Answer is invalid - warn but still allow navigation
          // eslint-disable-next-line no-console
          console.log('[handlePrevious] Skipping auto-save: answer invalid', validation.error);
        }
      }

      // Navigate to previous question
      const prevIndex = state.questionIndex - 1;
      if (adapter) {
        await adapter.navigateToQuestion(session.id, prevIndex);
      } else {
        await testSessionsClientApi.navigateToQuestion(session.id, prevIndex, effectiveAuthHeaders);
      }
      await loadQuestion('backward');

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to navigate back:', error);
      const apiError = error as ApiError;

      // Handle session state errors - these are terminal, redirect immediately
      if (apiError.status === 400 || apiError.status === 403) {
        const errorMessage = apiError.message || '';
        if (errorMessage.toLowerCase().includes('abandon')) {
          toast.error('Сессия была отменена');
          navStore.clearAllDirty();
          router.push('/test-templates');
          setState(prev => ({ ...prev, isSubmitting: false }));
          return;
        } else if (errorMessage.toLowerCase().includes('complet')) {
          toast.info('Тест уже завершён');
          navStore.clearAllDirty();
          router.push('/test-templates');
          setState(prev => ({ ...prev, isSubmitting: false }));
          return;
        }
      }

      // Show error dialog for retryable errors
      const navError = createNavigationError(apiError, {
        fromIndex: state.questionIndex,
        toIndex: state.questionIndex - 1,
        direction: 'backward',
        questionId: currentQuestion?.id || null,
      });
      setNavigationError(navError);
      setPendingNavigation({ direction: 'backward', targetIndex: state.questionIndex - 1 });
      setShowNavigationError(true);
    }

    setState(prev => ({ ...prev, isSubmitting: false }));
  };

  /**
   * Navigate to a specific question by index (for dot navigation) with auto-save
   *
   * If the current answer has unsaved changes (is dirty), automatically
   * saves the answer before navigating. This prevents data loss when using
   * the progress dots to jump between questions.
   */
  const handleNavigateToQuestion = async (targetIndex: number) => {
    if (!state.allowBackNavigation || state.isSubmitting) return;
    if (targetIndex === state.questionIndex) return;
    if (targetIndex < 0 || targetIndex >= state.totalQuestions) return;

    // Only allow navigation to previously visited questions
    const targetState = state.questionStates[targetIndex];
    if (targetState === 'pending') return;

    setState(prev => ({ ...prev, isSubmitting: true }));

    const direction = targetIndex > state.questionIndex ? 'forward' : 'backward';
    const questionId = currentQuestion?.id;
    const navStore = useNavigationState.getState();

    try {
      // Check if current answer has unsaved changes
      const isDirty = questionId ? navStore.isDirty(questionId) : false;

      // Auto-save if dirty and answer exists
      if (isDirty && currentAnswer !== undefined && currentQuestion) {
        // Validate before saving (but don't block navigation for invalid answers)
        const validation = validateAnswer(currentAnswer);

        if (validation.valid) {
          // Save the answer
          const request = buildAnswerRequest(currentAnswer);
          await retryWithBackoff(
            () => adapter
              ? adapter.submitAnswer(session.id, request)
              : testSessionsClientApi.submitAnswer(session.id, request, effectiveAuthHeaders),
            {
              maxRetries: 2,
              initialDelayMs: 500,
              shouldRetry: isRetryableError,
              onRetry: (_error, attempt) => {
                toast.info(`Сохранение... (попытка ${attempt}/2)`, { duration: 1500 });
              },
            }
          );

          // Mark as clean after successful save
          if (questionId) {
            navStore.markClean(questionId);
            navStore.setOriginalAnswer(questionId, currentAnswer);
          }

          // Update question state to answered if not already
          setState(prev => {
            const currentState = prev.questionStates[prev.questionIndex];
            if (currentState === 'current' || currentState === 'pending') {
              const newQuestionStates = [...prev.questionStates];
              newQuestionStates[prev.questionIndex] = 'answered';
              return {
                ...prev,
                answeredCount: prev.answeredCount + 1,
                questionStates: newQuestionStates,
              };
            }
            return prev;
          });
        } else {
          // Answer is invalid - warn but still allow navigation
          // eslint-disable-next-line no-console
          console.log('[handleNavigateToQuestion] Skipping auto-save: answer invalid', validation.error);
        }
      }

      // Navigate to target question
      if (adapter) {
        await adapter.navigateToQuestion(session.id, targetIndex);
      } else {
        await testSessionsClientApi.navigateToQuestion(session.id, targetIndex, effectiveAuthHeaders);
      }
      await loadQuestion(direction);

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to navigate to question:', error);
      const apiError = error as ApiError;

      // Handle session state errors - these are terminal, redirect immediately
      if (apiError.status === 400 || apiError.status === 403) {
        const errorMessage = apiError.message || '';
        if (errorMessage.toLowerCase().includes('abandon')) {
          toast.error('Сессия была отменена');
          navStore.clearAllDirty();
          router.push('/test-templates');
          setState(prev => ({ ...prev, isSubmitting: false }));
          return;
        } else if (errorMessage.toLowerCase().includes('complet')) {
          toast.info('Тест уже завершён');
          navStore.clearAllDirty();
          router.push('/test-templates');
          setState(prev => ({ ...prev, isSubmitting: false }));
          return;
        }
      }

      // Show error dialog for retryable errors
      const navError = createNavigationError(apiError, {
        fromIndex: state.questionIndex,
        toIndex: targetIndex,
        direction,
        questionId: currentQuestion?.id || null,
      });
      setNavigationError(navError);
      setPendingNavigation({ direction, targetIndex });
      setShowNavigationError(true);
    }

    setState(prev => ({ ...prev, isSubmitting: false }));
  };

  /**
   * Skip current question without answering
   */
  const handleSkip = async () => {
    if (!state.allowSkip || state.isSubmitting) return;

    // Cannot skip the last question - must answer or go back
    if (state.questionIndex + 1 >= state.totalQuestions) {
      toast.warning('Последний вопрос нельзя пропустить');
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Submit answer with skip flag
      if (currentQuestion) {
        const request: SubmitAnswerRequest = {
          sessionId: session.id,
          questionId: currentQuestion.id,
          timeSpentSeconds: Math.floor((Date.now() - questionStartTime.current) / 1000),
          skip: true,
        };
        if (adapter) {
          await adapter.submitAnswer(session.id, request);
        } else {
          await testSessionsClientApi.submitAnswer(session.id, request, effectiveAuthHeaders);
        }
      }

      // Update question states - mark current as skipped
      setState(prev => {
        const newQuestionStates = [...prev.questionStates];
        newQuestionStates[prev.questionIndex] = 'skipped';
        const nextIndex = prev.questionIndex + 1;
        if (nextIndex < prev.totalQuestions) {
          newQuestionStates[nextIndex] = 'current';
        }
        return {
          ...prev,
          skippedCount: prev.skippedCount + 1,
          questionStates: newQuestionStates,
        };
      });

      // Navigate to next question
      const nextIndex = state.questionIndex + 1;
      if (adapter) {
        await adapter.navigateToQuestion(session.id, nextIndex);
      } else {
        await testSessionsClientApi.navigateToQuestion(session.id, nextIndex, effectiveAuthHeaders);
      }
      await loadQuestion('forward');

      // Clear answer for next question
      setCurrentAnswer(undefined);
      setValidationError(null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to skip question:', error);
      const apiError = error as ApiError;

      if (apiError.status === 400 || apiError.status === 403) {
        const errorMessage = apiError.message || '';
        if (errorMessage.toLowerCase().includes('abandon')) {
          toast.error('Сессия была отменена');
          router.push('/test-templates');
          return;
        } else if (errorMessage.toLowerCase().includes('complet')) {
          toast.info('Тест уже завершён');
          router.push('/test-templates');
          return;
        }
      }

      toast.error('Не удалось пропустить вопрос');
    }

    setState(prev => ({ ...prev, isSubmitting: false }));
  };

  /**
   * Handle test completion
   * Includes session status validation and graceful error handling
   * Supports both adapter pattern (new) and legacy authHeaders pattern.
   */
  const handleComplete = async () => {
    if (state.isSubmitting) return;

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Submit current answer if exists
      if (currentQuestion && currentAnswer !== undefined) {
        const request = buildAnswerRequest(currentAnswer);
        if (adapter) {
          await adapter.submitAnswer(session.id, request);
        } else {
          await testSessionsClientApi.submitAnswer(session.id, request, effectiveAuthHeaders);
        }
      }

      // Complete the session
      let completionResult: CompletionResult;
      if (adapter) {
        // Note: For anonymous mode, taker info is collected by the parent page
        // via the onComplete callback which will show a dialog
        completionResult = await adapter.completeSession(session.id);
      } else {
        const result = await testSessionsClientApi.completeSession(session.id, effectiveAuthHeaders);
        completionResult = { resultId: result.id };
      }

      // Use callback if provided, otherwise default navigation
      if (onComplete) {
        onComplete(completionResult);
      } else {
        router.push(`/test-templates/results/${completionResult.resultId}`);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to complete session:', error);
      const apiError = error as ApiError;
      const errorMessage = apiError.message?.toLowerCase() || '';

      // Handle "session not in progress" - session state changed
      if (errorMessage.includes('not in progress') || errorMessage.includes('cannot complete')) {
        try {
          let currentSession;
          if (adapter) {
            currentSession = await adapter.getSession(session.id);
          } else {
            currentSession = await testSessionsClientApi.getSessionById(session.id, effectiveAuthHeaders);
          }
          if (currentSession?.status === 'COMPLETED') {
            toast.info('Тест уже завершён');
            if (onError) {
              onError(apiError);
            } else {
              router.push('/test-templates');
            }
            return;
          }
        } catch {
          // Ignore fetch error
        }
        toast.error('Тест не может быть завершён');
        if (onError) {
          onError(apiError);
        } else {
          router.push('/test-templates');
        }
        return;
      }

      if (errorMessage.includes('abandon')) {
        toast.error('Сессия была отменена');
        if (onError) {
          onError(apiError);
        } else {
          router.push('/test-templates');
        }
        return;
      }

      toast.error('Не удалось завершить тест');
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  /**
   * Handle exit/abandon
   */
  const handleExit = () => {
    setShowAbandonDialog(true);
  };

  /**
   * Abandon the test
   * Supports both adapter pattern (new) and legacy authHeaders pattern.
   */
  const handleAbandonTest = async () => {
    try {
      if (adapter) {
        await adapter.abandonSession(session.id);
      } else {
        await testSessionsClientApi.abandonSession(session.id, effectiveAuthHeaders);
      }
      // Use callback if provided, otherwise default navigation
      if (onAbandon) {
        onAbandon();
      } else {
        router.push('/test-templates');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to abandon test:', error);
      toast.error('Не удалось отменить тест');
    } finally {
      setShowAbandonDialog(false);
    }
  };

  /**
   * Retry failed navigation (with auto-save)
   * Attempts the same navigation operation that failed
   */
  const handleRetryNavigation = async () => {
    if (!pendingNavigation) return;

    setIsRetryingNavigation(true);

    const { direction, targetIndex } = pendingNavigation;
    const navStore = useNavigationState.getState();
    const questionId = currentQuestion?.id;

    try {
      // Check if current answer has unsaved changes
      const isDirty = questionId ? navStore.isDirty(questionId) : false;

      // Auto-save if dirty and answer exists
      if (isDirty && currentAnswer !== undefined && currentQuestion) {
        const validation = validateAnswer(currentAnswer);

        if (validation.valid) {
          const request = buildAnswerRequest(currentAnswer);
          await retryWithBackoff(
            () => adapter
              ? adapter.submitAnswer(session.id, request)
              : testSessionsClientApi.submitAnswer(session.id, request, effectiveAuthHeaders),
            {
              maxRetries: 2,
              initialDelayMs: 500,
              shouldRetry: isRetryableError,
            }
          );

          if (questionId) {
            navStore.markClean(questionId);
            navStore.setOriginalAnswer(questionId, currentAnswer);
          }

          // Update question state to answered
          setState(prev => {
            const currentState = prev.questionStates[prev.questionIndex];
            if (currentState === 'current' || currentState === 'pending') {
              const newQuestionStates = [...prev.questionStates];
              newQuestionStates[prev.questionIndex] = 'answered';
              return {
                ...prev,
                answeredCount: prev.answeredCount + 1,
                questionStates: newQuestionStates,
              };
            }
            return prev;
          });
        }
      }

      // Navigate to target question
      const navIndex = targetIndex ?? (direction === 'backward' ? state.questionIndex - 1 : state.questionIndex + 1);
      if (adapter) {
        await adapter.navigateToQuestion(session.id, navIndex);
      } else {
        await testSessionsClientApi.navigateToQuestion(session.id, navIndex, effectiveAuthHeaders);
      }
      await loadQuestion(direction);

      // Success - close dialog and clear state
      setShowNavigationError(false);
      setNavigationError(null);
      setPendingNavigation(null);
      toast.success('Ответ сохранён');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Retry failed:', error);
      const apiError = error as ApiError;

      // Update error state for display
      const navError = createNavigationError(apiError, {
        fromIndex: state.questionIndex,
        toIndex: pendingNavigation.targetIndex ?? (pendingNavigation.direction === 'backward' ? state.questionIndex - 1 : state.questionIndex + 1),
        direction: pendingNavigation.direction,
        questionId: currentQuestion?.id || null,
      });
      setNavigationError(navError);
    } finally {
      setIsRetryingNavigation(false);
    }
  };

  /**
   * Dismiss navigation error dialog
   * User stays on current question without navigating
   */
  const handleDismissNavigationError = () => {
    setShowNavigationError(false);
    setNavigationError(null);
    setPendingNavigation(null);
  };

  /**
   * Continue navigation without saving
   * Discards current answer changes and proceeds with navigation
   */
  const handleContinueWithoutSaving = async () => {
    if (!pendingNavigation) return;

    const { direction, targetIndex } = pendingNavigation;
    const navStore = useNavigationState.getState();
    const questionId = currentQuestion?.id;

    try {
      // Clear dirty flag - we're intentionally discarding changes
      if (questionId) {
        navStore.markClean(questionId);
      }

      // Navigate to target question
      const navIndex = targetIndex ?? (direction === 'backward' ? state.questionIndex - 1 : state.questionIndex + 1);
      if (adapter) {
        await adapter.navigateToQuestion(session.id, navIndex);
      } else {
        await testSessionsClientApi.navigateToQuestion(session.id, navIndex, effectiveAuthHeaders);
      }
      await loadQuestion(direction);

      // Success - close dialog and clear state
      setShowNavigationError(false);
      setNavigationError(null);
      setPendingNavigation(null);
      toast.info('Изменения не сохранены');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Continue without saving failed:', error);
      toast.error('Не удалось перейти к вопросу');
    }
  };

  /**
   * Enter answer summary review screen
   * Fetches all answers and builds summary items for display
   * Supports both adapter pattern (new) and legacy authHeaders pattern.
   */
  const handleEnterSummary = async () => {
    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Fetch all answers for the session
      const answers = adapter
        ? await adapter.getSessionAnswers(session.id)
        : await testSessionsClientApi.getSessionAnswers(session.id, effectiveAuthHeaders);

      // Build answer summary items from answers
      // Each answer has questionId which maps to the question order
      const summaryItems: AnswerSummaryItem[] = [];
      const competencyCache = new Map<string, string>(); // competencyId -> competencyName

      // Create a map of questionId to answer for quick lookup
      const answerMap = new Map(answers.map(a => [a.questionId, a]));

      // Build summary items for each question in order
      for (let i = 0; i < session.questionOrder.length; i++) {
        const questionId = session.questionOrder[i];
        const answer = answerMap.get(questionId) || null;

        // Create summary item with minimal data from the answer
        // We don't have full question text from the answers endpoint,
        // so we use placeholder text that will show question number
        summaryItems.push({
          questionId,
          questionIndex: i,
          questionText: `Вопрос ${i + 1}`, // Placeholder - could be enhanced with batch question fetch
          questionType: 'LIKERT' as QuestionType, // Default type
          behavioralIndicatorId: '',
          answer,
          answerDisplayText: formatAnswerForSummary(answer),
          status: answer?.isSkipped ? 'skipped' : answer ? 'answered' : 'pending',
          timeSpentSeconds: answer?.timeSpentSeconds || 0,
          answeredAt: answer?.answeredAt || null,
        });
      }

      // Group by competency (will mostly be "Other" since we don't have competency data)
      const groups = groupAnswersByCompetency(summaryItems);

      // Update state
      setSummaryAnswers(summaryItems);
      setSummaryGroups(groups);
      setShowSummary(true);
      enterReviewPhase(session.id, summaryItems);

    } catch (error) {
      console.error('Failed to load answer summary:', error);
      toast.error('Не удалось загрузить сводку ответов');
      // Fallback to completion dialog
      setShowCompletion(true);
    }

    setState(prev => ({ ...prev, isSubmitting: false }));
  };

  /**
   * Format answer for display in summary
   */
  const formatAnswerForSummary = (answer: TestAnswer | null): string => {
    if (!answer || answer.isSkipped) {
      return 'Пропущено';
    }

    if (answer.likertValue !== undefined) {
      return `${answer.likertValue}/5`;
    }

    if (answer.selectedOptionIds?.length) {
      return `Выбрано: ${answer.selectedOptionIds.length}`;
    }

    if (answer.textResponse) {
      return answer.textResponse.substring(0, 50) + (answer.textResponse.length > 50 ? '...' : '');
    }

    return 'Ответ дан';
  };

  /**
   * Group answers by competency for summary display
   */
  const groupAnswersByCompetency = (items: AnswerSummaryItem[]): CompetencyGroup[] => {
    const groups = new Map<string, CompetencyGroup>();

    for (const item of items) {
      const competencyId = item.competencyId || 'uncategorized';
      const competencyName = item.competencyName || 'Другие вопросы';

      if (!groups.has(competencyId)) {
        groups.set(competencyId, {
          competencyId,
          competencyName,
          items: [],
          answeredCount: 0,
          skippedCount: 0,
        });
      }

      const group = groups.get(competencyId)!;
      group.items.push(item);

      if (item.status === 'answered') {
        group.answeredCount++;
      } else if (item.status === 'skipped') {
        group.skippedCount++;
      }
    }

    return Array.from(groups.values()).sort((a, b) => {
      if (a.competencyId === 'uncategorized') return 1;
      if (b.competencyId === 'uncategorized') return -1;
      return a.competencyName.localeCompare(b.competencyName);
    });
  };

  /**
   * Handle editing an answer from the summary screen
   * Navigates back to the specific question
   * Supports both adapter pattern (new) and legacy authHeaders pattern.
   */
  const handleEditFromSummary = async (questionId: string, questionIndex: number) => {
    setShowSummary(false);

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Navigate to the question
      if (adapter) {
        await adapter.navigateToQuestion(session.id, questionIndex);
      } else {
        await testSessionsClientApi.navigateToQuestion(session.id, questionIndex, effectiveAuthHeaders);
      }
      await loadQuestion(questionIndex < state.questionIndex ? 'backward' : 'forward');

      // Mark that we came from summary (for return behavior)
      // The user can use the normal navigation to go back through questions
      // and then click "Next" on the last question to return to summary
    } catch (error) {
      console.error('Failed to navigate to question for edit:', error);
      toast.error('Не удалось перейти к вопросу');
      // Return to summary on error
      setShowSummary(true);
    }

    setState(prev => ({ ...prev, isSubmitting: false }));
  };

  /**
   * Handle going back from summary to continue answering
   */
  const handleGoBackFromSummary = () => {
    setShowSummary(false);
    resetReviewStore();
  };

  /**
   * Handle submission from the summary screen
   * Includes pre-flight session status check and graceful error handling
   * Supports both adapter pattern (new) and legacy authHeaders pattern.
   */
  const handleSubmitFromSummary = async () => {
    // Prevent double-submission
    if (isSummarySubmitting) {
      return;
    }

    setIsSummarySubmitting(true);
    startSubmission();

    try {
      // Pre-flight check: verify session is still in a completable state
      const currentSession = adapter
        ? await adapter.getSession(session.id)
        : await testSessionsClientApi.getSessionById(session.id, effectiveAuthHeaders);

      if (!currentSession) {
        // Session was deleted
        toast.error('Сессия не найдена. Возможно, она была удалена.');
        if (onError) {
          onError({ message: 'Session not found', status: 404 } as ApiError);
        } else {
          router.push('/test-templates');
        }
        return;
      }

      // Check session status before attempting completion
      if (currentSession.status === 'COMPLETED') {
        // Session was already completed (maybe in another tab or timeout auto-complete)
        toast.info('Тест уже был завершён');
        if (onError) {
          onError({ message: 'Session already completed', status: 400 } as ApiError);
        } else {
          router.push('/test-templates');
        }
        return;
      }

      if (currentSession.status === 'ABANDONED') {
        toast.error('Сессия была отменена');
        if (onError) {
          onError({ message: 'Session was abandoned', status: 400 } as ApiError);
        } else {
          router.push('/test-templates');
        }
        return;
      }

      if (currentSession.status === 'TIMED_OUT') {
        toast.warning('Время выполнения теста истекло');
        if (onError) {
          onError({ message: 'Session timed out', status: 400 } as ApiError);
        } else {
          router.push('/test-templates');
        }
        return;
      }

      if (currentSession.status !== 'IN_PROGRESS' && currentSession.status !== 'NOT_STARTED') {
        toast.error(`Невозможно завершить тест в статусе: ${currentSession.status}`);
        if (onError) {
          onError({ message: `Invalid session status: ${currentSession.status}`, status: 400 } as ApiError);
        } else {
          router.push('/test-templates');
        }
        return;
      }

      // Session is in valid state - proceed with completion
      let completionResult: CompletionResult;
      if (adapter) {
        completionResult = await adapter.completeSession(session.id);
      } else {
        const result = await testSessionsClientApi.completeSession(session.id, effectiveAuthHeaders);
        completionResult = { resultId: result.id };
      }
      completeSubmission();

      // Use callback if provided, otherwise default navigation
      if (onComplete) {
        onComplete(completionResult);
      } else {
        router.push(`/test-templates/results/${completionResult.resultId}`);
      }
    } catch (error) {
      console.error('Failed to complete session from summary:', error);
      const apiError = error as ApiError;
      const errorMessage = apiError.message?.toLowerCase() || '';

      // Handle specific error cases with user-friendly messages and appropriate actions
      if (errorMessage.includes('not in progress') || errorMessage.includes('cannot complete')) {
        // Session state changed - try to determine what happened
        try {
          const currentSession = adapter
            ? await adapter.getSession(session.id)
            : await testSessionsClientApi.getSessionById(session.id, effectiveAuthHeaders);
          if (currentSession?.status === 'COMPLETED') {
            toast.info('Тест уже завершён');
            if (onError) {
              onError(apiError);
            } else {
              router.push('/test-templates');
            }
            return;
          }
        } catch {
          // Ignore secondary fetch error
        }
        toast.error('Тест не может быть завершён. Возможно, он уже был завершён или отменён.');
        if (onError) {
          onError(apiError);
        } else {
          router.push('/test-templates');
        }
        return;
      }

      if (errorMessage.includes('abandon')) {
        toast.error('Сессия была отменена');
        if (onError) {
          onError(apiError);
        } else {
          router.push('/test-templates');
        }
        return;
      }

      if (errorMessage.includes('timed out') || errorMessage.includes('expired')) {
        toast.warning('Время выполнения теста истекло');
        if (onError) {
          onError(apiError);
        } else {
          router.push('/test-templates');
        }
        return;
      }

      // Generic error - allow retry for server errors
      failSubmission({
        code: apiError.code,
        message: apiError.message || 'Не удалось завершить тест',
        isRetryable: isRetryableSubmissionError(apiError.status, apiError.code),
        timestamp: Date.now(),
      });

      // Only show toast for non-handled errors
      if (apiError.status && apiError.status >= 500) {
        toast.error('Ошибка сервера. Попробуйте ещё раз.');
      } else {
        toast.error('Не удалось завершить тест');
      }
    } finally {
      setIsSummarySubmitting(false);
    }
  };

  // Check if skip is available (not last question and allowSkip is enabled)
  const canSkip = state.allowSkip && state.questionIndex + 1 < state.totalQuestions;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'Enter':
          if (!e.shiftKey && isAnswerValid) {
            e.preventDefault();
            handleNext();
          }
          break;
        case 'ArrowRight':
          if (isAnswerValid) {
            handleNext();
          }
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 's':
        case 'S':
          // Skip question with 'S' key (when skip is allowed)
          if (canSkip && !state.isSubmitting) {
            e.preventDefault();
            handleSkip();
          }
          break;
        case 'Escape':
          // Could show exit confirmation
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswerValid, handleNext, handlePrevious, handleSkip, canSkip, state.isSubmitting]);

  // Responsive settings
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

  // Animation distance - smaller on mobile for better UX
  const animationDistance = isMobile ? 100 : 300;

  // Swipe navigation for mobile touch gestures
  const canSwipeNext = isAnswerValid && !state.isSubmitting;
  const canSwipePrevious = state.allowBackNavigation && state.questionIndex > 0 && !state.isSubmitting;

  const { swipeState, handlers: swipeHandlers } = useSwipeNavigation({
    enabled: isMobile && (canSwipeNext || canSwipePrevious),
    minSwipeDistance: 50,
    maxVerticalDistance: 100,
    onSwipeLeft: canSwipeNext ? handleNext : undefined,
    onSwipeRight: canSwipePrevious ? handlePrevious : undefined,
  });

  // Animation variants with responsive distances and reduced motion support
  const slideVariants = prefersReducedMotion
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        enter: (direction: 'forward' | 'backward') => ({
          x: direction === 'forward' ? animationDistance : -animationDistance,
          opacity: 0,
        }),
        center: {
          x: 0,
          opacity: 1,
        },
        exit: (direction: 'forward' | 'backward') => ({
          x: direction === 'forward' ? -animationDistance : animationDistance,
          opacity: 0,
        }),
      };

  // Optimized transition settings for mobile
  const transitionSettings = prefersReducedMotion
    ? { duration: 0.01 }
    : isMobile
      ? {
          x: { type: 'spring' as const, stiffness: 400, damping: 35 },
          opacity: { duration: 0.15 },
        }
      : {
          x: { type: 'spring' as const, stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-400">No questions available</p>
      </div>
    );
  }

  // Render Answer Summary Screen when in review mode
  if (showSummary) {
    return (
      <AnswerSummaryScreen
        session={session}
        answers={summaryAnswers}
        competencyGroups={summaryGroups}
        timeRemaining={timeRemaining}
        onGoBack={handleGoBackFromSummary}
        onSubmit={handleSubmitFromSummary}
        onEditAnswer={handleEditFromSummary}
        isSubmitting={isSummarySubmitting}
      />
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-neutral-950 flex flex-col safe-area-inset-all">
      {/* Enhanced Session Header - unified progress display */}
      <EnhancedSessionHeader
        testName={session.templateName}
        currentQuestion={state.questionIndex + 1}
        totalQuestions={state.totalQuestions}
        questionStates={state.questionStates}
        timeRemaining={timeRemaining}
        allowNavigation={state.allowBackNavigation}
        allowSkip={state.allowSkip}
        onExit={handleExit}
        onNavigate={handleNavigateToQuestion}
      />

      {/* Main Content - responsive padding for mobile with swipe support */}
      <main
        className="flex-1 flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8 overflow-hidden pb-safe swipe-container"
        {...swipeHandlers}
      >
        <div className="w-full max-w-3xl relative will-change-slide">
          {/* Swipe indicators for mobile */}
          {isMobile && swipeState.isSwiping && (
            <>
              {/* Left indicator (swipe right = go back) */}
              {canSwipePrevious && swipeState.direction === 1 && (
                <div
                  className="swipe-indicator swipe-indicator-left visible z-10"
                  style={{ opacity: Math.min(Math.abs(swipeState.offsetX) / 100, 0.8) }}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-800/80 backdrop-blur-sm">
                    <ChevronLeft className="w-6 h-6 text-neutral-300" />
                  </div>
                </div>
              )}
              {/* Right indicator (swipe left = go next) */}
              {canSwipeNext && swipeState.direction === -1 && (
                <div
                  className="swipe-indicator swipe-indicator-right visible z-10"
                  style={{ opacity: Math.min(Math.abs(swipeState.offsetX) / 100, 0.8) }}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600/80 backdrop-blur-sm">
                    <ChevronRight className="w-6 h-6 text-white" />
                  </div>
                </div>
              )}
            </>
          )}

          <AnimatePresence mode="wait" custom={state.direction}>
            <motion.div
              key={currentQuestion.id}
              custom={state.direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transitionSettings}
              className="gpu-accelerated"
            >
              <QuestionCard
                question={currentQuestion}
                selectedValue={currentAnswer}
                onAnswer={handleAnswer}
                questionNumber={state.questionIndex + 1}
                validationError={validationError || undefined}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Navigation Footer */}
      <QuestionNavigation
        canGoBack={state.allowBackNavigation && state.questionIndex > 0}
        canGoForward={isAnswerValid}
        canSkip={canSkip}
        isLastQuestion={state.questionIndex + 1 >= state.totalQuestions}
        isSubmitting={state.isSubmitting}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSkip={handleSkip}
        validationError={validationError}
        hasUnsavedChanges={currentQuestion?.id ? useNavigationState.getState().isDirty(currentQuestion.id) : false}
        backDisabledReason={
          !state.allowBackNavigation
            ? 'Возврат к предыдущим вопросам отключён для этого теста'
            : state.questionIndex <= 0
              ? 'Это первый вопрос'
              : undefined
        }
      />

      {/* Completion Dialog */}
      <CompletionDialog
        open={showCompletion}
        onOpenChange={setShowCompletion}
        onComplete={handleComplete}
        answeredCount={state.answeredCount}
        totalQuestions={state.totalQuestions}
        skippedCount={state.skippedCount}
        isSubmitting={state.isSubmitting}
      />

      {/* Abandon confirmation dialog */}
      <AlertDialog open={showAbandonDialog} onOpenChange={setShowAbandonDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Выйти из теста?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ваш прогресс будет сохранён. Вы сможете продолжить позже.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Продолжить тест</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAbandonTest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Выйти
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Timeout dialog */}
      <AlertDialog open={showTimeoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Время истекло
            </AlertDialogTitle>
            <AlertDialogDescription>
              Отведённое время на тест закончилось. Ваши ответы будут сохранены автоматически.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleComplete}>
              Посмотреть результаты
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Navigation Error Dialog */}
      <NavigationErrorDialog
        open={showNavigationError}
        onOpenChange={setShowNavigationError}
        error={navigationError}
        onRetry={handleRetryNavigation}
        onDismiss={handleDismissNavigationError}
        onContinueWithoutSaving={handleContinueWithoutSaving}
        isRetrying={isRetryingNavigation}
        hasUnsavedChanges={currentQuestion?.id ? useNavigationState.getState().isDirty(currentQuestion.id) : false}
      />

      {/* Test-Drive Mode Components */}
      <InsightsToggle />
      <TestDriveInsights />
    </div>
  );
}
