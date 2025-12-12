'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TestSession, SessionQuestion, CurrentQuestionResponse, TestAnswer, SubmitAnswerRequest, QuestionType } from '@/types/domain';
import { testSessionsClientApi, type ApiError } from '@/services/api.client';
import { SessionHeader } from '@/components/layout/session-header';
import { QuestionCard, MIN_CHARS_OPEN_TEXT, MIN_CHARS_BEHAVIORAL } from './QuestionCard';
import { QuestionNavigation } from './QuestionNavigation';
import { CompletionDialog } from './CompletionDialog';
import { useUIStore } from '@/store/ui-store';
import { toast } from 'sonner';
import { retryWithBackoff, getUserFriendlyErrorMessage, isRetryableError } from '@/utils/retry';
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

interface ImmersivePlayerProps {
  session: TestSession;
  initialQuestion: CurrentQuestionResponse;
  authHeaders: Record<string, string>;
}

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
export function ImmersivePlayer({ session, initialQuestion, authHeaders }: ImmersivePlayerProps) {
  const router = useRouter();
  const enterImmersiveMode = useUIStore((state) => state.enterImmersiveMode);
  const exitImmersiveMode = useUIStore((state) => state.exitImmersiveMode);

  // Player state
  const [state, setState] = useState<PlayerState>({
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
  });

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

  // Validation state
  const [validationError, setValidationError] = useState<string | null>(null);

  // Track answer timing
  const questionStartTime = useRef(Date.now());

  /**
   * Handle time expiration
   */
  const handleTimeExpired = useCallback(() => {
    setShowTimeoutDialog(true);
  }, []);

  // Enter immersive mode on mount
  useEffect(() => {
    enterImmersiveMode();
    return () => exitImmersiveMode();
  }, [enterImmersiveMode, exitImmersiveMode]);

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
  const progress = state.totalQuestions > 0
    ? ((state.questionIndex + 1) / state.totalQuestions) * 100
    : 0;

  /**
   * Validate current answer based on question type
   */
  const validateAnswer = useCallback((value: string | number | string[] | undefined): { valid: boolean; error?: string } => {
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
  const isAnswerValid = React.useMemo(() => {
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
  }, [currentAnswer, validateAnswer, currentQuestion?.questionType]);

  /**
   * Build SubmitAnswerRequest from answer value
   */
  const buildAnswerRequest = useCallback((value: string | number | string[]): SubmitAnswerRequest => {
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
  }, [session.id, state.currentQuestion?.id, state.currentQuestion?.questionType]);

  /**
   * Handle answer selection
   */
  const handleAnswer = useCallback(async (value: string | number | string[]) => {
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
  }, [currentQuestion, state.isSubmitting]);

  /**
   * Fetch and display question at given index with retry logic
   */
  const loadQuestion = useCallback(async (direction: 'forward' | 'backward') => {
    try {
      const response = await retryWithBackoff(
        () => testSessionsClientApi.getCurrentQuestion(session.id, authHeaders),
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
  }, [session.id, authHeaders, router]);

  /**
   * Navigate to next question
   */
  const handleNext = useCallback(async () => {
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
        await testSessionsClientApi.submitAnswer(session.id, request, authHeaders);
        setState(prev => ({ ...prev, answeredCount: prev.answeredCount + 1 }));
      }

      // Check if last question
      if (state.questionIndex + 1 >= state.totalQuestions) {
        setShowCompletion(true);
        setState(prev => ({ ...prev, isSubmitting: false }));
        return;
      }

      // Navigate to next question
      const nextIndex = state.questionIndex + 1;
      await testSessionsClientApi.navigateToQuestion(session.id, nextIndex, authHeaders);
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
  }, [state.isSubmitting, state.questionIndex, state.totalQuestions, currentQuestion, currentAnswer, buildAnswerRequest, session.id, loadQuestion, authHeaders, validateAnswer, router]);

  /**
   * Navigate to previous question
   */
  const handlePrevious = useCallback(async () => {
    if (!state.allowBackNavigation || state.isSubmitting) return;

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const prevIndex = state.questionIndex - 1;
      await testSessionsClientApi.navigateToQuestion(session.id, prevIndex, authHeaders);
      await loadQuestion('backward');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to navigate back:', error);
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
      }

      toast.error('Не удалось вернуться к предыдущему вопросу');
    }

    setState(prev => ({ ...prev, isSubmitting: false }));
  }, [state.allowBackNavigation, state.isSubmitting, state.questionIndex, session.id, loadQuestion, authHeaders, router]);

  /**
   * Handle test completion
   */
  const handleComplete = useCallback(async () => {
    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Submit current answer if exists
      if (currentQuestion && currentAnswer !== undefined) {
        const request = buildAnswerRequest(currentAnswer);
        await testSessionsClientApi.submitAnswer(session.id, request, authHeaders);
      }

      const result = await testSessionsClientApi.completeSession(session.id, authHeaders);
      router.push(`/test-templates/results/${result.id}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to complete session:', error);
      toast.error('Не удалось завершить тест');
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [session.id, router, currentQuestion, currentAnswer, buildAnswerRequest, authHeaders]);

  /**
   * Handle exit/abandon
   */
  const handleExit = useCallback(() => {
    setShowAbandonDialog(true);
  }, []);

  /**
   * Abandon the test
   */
  const handleAbandonTest = useCallback(async () => {
    try {
      await testSessionsClientApi.abandonSession(session.id, authHeaders);
      router.push('/test-templates');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to abandon test:', error);
      toast.error('Не удалось отменить тест');
    } finally {
      setShowAbandonDialog(false);
    }
  }, [session.id, authHeaders, router]);

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
        case 'Escape':
          // Could show exit confirmation
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswerValid, handleNext, handlePrevious]);

  // Animation variants
  const slideVariants = {
    enter: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? -300 : 300,
      opacity: 0,
    }),
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-400">No questions available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Session Header */}
      <SessionHeader
        currentQuestion={state.questionIndex + 1}
        totalQuestions={state.totalQuestions}
        progress={progress}
        timeRemaining={timeRemaining}
        onExit={handleExit}
      />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 overflow-hidden">
        <div className="w-full max-w-3xl relative">
          <AnimatePresence mode="wait" custom={state.direction}>
            <motion.div
              key={currentQuestion.id}
              custom={state.direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
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
        isLastQuestion={state.questionIndex + 1 >= state.totalQuestions}
        isSubmitting={state.isSubmitting}
        onPrevious={handlePrevious}
        onNext={handleNext}
        validationError={validationError}
      />

      {/* Completion Dialog */}
      <CompletionDialog
        open={showCompletion}
        onOpenChange={setShowCompletion}
        onComplete={handleComplete}
        answeredCount={state.answeredCount}
        totalQuestions={state.totalQuestions}
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
    </div>
  );
}
