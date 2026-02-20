import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TestSession, SessionQuestion, SubmitAnswerRequest, QuestionType } from '@/types/domain';
import { testSessionsClientApi, type ApiError } from '@/services/api.client';
import type { TestSessionAdapter } from '@/adapters/test-session-adapter';
import type { CompletionResult } from '@/adapters';
import { toast } from 'sonner';
import { retryWithBackoff, getUserFriendlyErrorMessage, isRetryableError } from '@/utils/retry';
import { useNavigationState, createNavigationError, type NavigationError } from './useNavigationState';
import type { PlayerState, QuestionState } from './usePlayerState';
import type { AnswerSaveStatus } from '../components/SaveIndicator';

/**
 * useQuestionNavigation Hook
 *
 * Manages all navigation operations (next, previous, skip, jump-to-question).
 * Handles auto-save on back navigation, navigation error dialogs with retry,
 * and "continue without saving" fallback.
 */

// ============================================================================
// Types
// ============================================================================

export interface UseQuestionNavigationProps {
  session: TestSession;
  adapter: TestSessionAdapter | null;
  effectiveAuthHeaders: Record<string, string>;
  state: PlayerState;
  setState: React.Dispatch<React.SetStateAction<PlayerState>>;
  currentAnswer: string | number | string[] | undefined;
  setCurrentAnswer: (value: string | number | string[] | undefined) => void;
  currentQuestion: SessionQuestion | null;
  setValidationError: (error: string | null) => void;
  validateAnswer: (value: string | number | string[] | undefined) => { valid: boolean; error?: string };
  buildAnswerRequest: (value: string | number | string[]) => SubmitAnswerRequest;
  isAnswerValid: boolean;
  questionStartTime: React.MutableRefObject<number>;
  onTimerSync?: (seconds: number) => void;
  onEnterSummary: () => Promise<void>;
  /** Cache question data for answer summary */
  onQuestionLoaded?: (question: SessionQuestion) => void;
  onComplete?: (result: CompletionResult) => void;
  onAbandon?: () => void;
  onError?: (error: ApiError) => void;
}

export interface UseQuestionNavigationReturn {
  handleNext: () => Promise<void>;
  handlePrevious: () => Promise<void>;
  handleSkip: () => Promise<void>;
  handleNavigateToQuestion: (targetIndex: number) => Promise<void>;
  handleComplete: () => Promise<void>;
  handleExit: () => void;
  handleAbandonTest: () => Promise<void>;
  handleRetryNavigation: () => Promise<void>;
  handleDismissNavigationError: () => void;
  handleContinueWithoutSaving: () => Promise<void>;
  canSkip: boolean;
  showAbandonDialog: boolean;
  setShowAbandonDialog: (show: boolean) => void;
  showCompletion: boolean;
  setShowCompletion: (show: boolean) => void;
  showNavigationError: boolean;
  setShowNavigationError: (show: boolean) => void;
  navigationError: NavigationError | null;
  isRetryingNavigation: boolean;
  hasUnsavedChanges: boolean;
  /** Current save status for the answer submission indicator */
  saveStatus: AnswerSaveStatus;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useQuestionNavigation({
  session,
  adapter,
  effectiveAuthHeaders,
  state,
  setState,
  currentAnswer,
  setCurrentAnswer,
  currentQuestion,
  setValidationError,
  validateAnswer,
  buildAnswerRequest,
  isAnswerValid,
  questionStartTime,
  onTimerSync,
  onEnterSummary,
  onQuestionLoaded,
  onComplete,
  onAbandon,
  onError,
}: UseQuestionNavigationProps): UseQuestionNavigationReturn {
  const router = useRouter();
  const t = useTranslations('assessment');

  // Dialog states
  const [showCompletion, setShowCompletion] = useState(false);
  const [showAbandonDialog, setShowAbandonDialog] = useState(false);

  // Save status indicator state
  const [saveStatus, setSaveStatus] = useState<AnswerSaveStatus>('idle');

  // Navigation error dialog state
  const [showNavigationError, setShowNavigationError] = useState(false);
  const [navigationError, setNavigationError] = useState<NavigationError | null>(null);
  const [isRetryingNavigation, setIsRetryingNavigation] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{
    direction: 'forward' | 'backward';
    targetIndex?: number;
  } | null>(null);

  // Track unsaved changes via navigation state store
  const hasUnsavedChanges = useNavigationState(
    (navState) => currentQuestion?.id ? navState.isDirty(currentQuestion.id) : false
  );

  const canSkip = state.allowSkip && state.questionIndex + 1 < state.totalQuestions;

  // ========================================================================
  // Internal: Load Question
  // ========================================================================

  const loadQuestion = useCallback(async (direction: 'forward' | 'backward') => {
    try {
      const response = await retryWithBackoff(
        () => adapter
          ? adapter.getCurrentQuestion(session.id)
          : testSessionsClientApi.getCurrentQuestion(session.id, effectiveAuthHeaders),
        {
          maxRetries: 3,
          initialDelayMs: 1000,
          shouldRetry: isRetryableError,
          onRetry: (_error, attempt) => {
            // eslint-disable-next-line no-console
            console.log(`Retrying getCurrentQuestion (attempt ${attempt}/3)...`);
            toast.info(t('player.toast.retryAttempt', { attempt, maxRetries: 3 }), { duration: 2000 });
          },
        }
      );

      if (response) {
        // Cache question data for answer summary
        if (response.question && onQuestionLoaded) {
          onQuestionLoaded(response.question);
        }

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

        if (response.timeRemainingSeconds !== undefined && onTimerSync) {
          onTimerSync(response.timeRemainingSeconds);
        }

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

      if (apiError.status === 400 || apiError.status === 403) {
        const errorMessage = apiError.message || '';
        if (errorMessage.toLowerCase().includes('abandon')) {
          toast.error(t('player.toast.sessionCancelled'));
          router.push('/test-templates');
        } else if (errorMessage.toLowerCase().includes('complet')) {
          toast.info(t('player.toast.testAlreadyCompleted'));
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
  }, [adapter, session.id, effectiveAuthHeaders, setState, setCurrentAnswer, setValidationError, onTimerSync, onQuestionLoaded, questionStartTime, router, t]);

  // ========================================================================
  // Internal: Auto-save helper
  // ========================================================================

  const autoSaveIfDirty = useCallback(async (): Promise<boolean> => {
    const questionId = currentQuestion?.id;
    const navStore = useNavigationState.getState();
    const isDirty = questionId ? navStore.isDirty(questionId) : false;

    if (!isDirty || currentAnswer === undefined || !currentQuestion) {
      return true;
    }

    const validation = validateAnswer(currentAnswer);
    if (!validation.valid) {
      // eslint-disable-next-line no-console
      console.log('[useQuestionNavigation] Skipping auto-save: answer invalid', validation.error);
      return true;
    }

    setSaveStatus('saving');

    const request = buildAnswerRequest(currentAnswer);
    try {
      await retryWithBackoff(
        () => adapter
          ? adapter.submitAnswer(session.id, request)
          : testSessionsClientApi.submitAnswer(session.id, request, effectiveAuthHeaders),
        {
          maxRetries: 2,
          initialDelayMs: 500,
          shouldRetry: isRetryableError,
          onRetry: (_error, attempt) => {
            toast.info(t('player.toast.savingAttempt', { attempt, maxRetries: 2 }), { duration: 1500 });
          },
        }
      );

      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
      throw error;
    }

    if (questionId) {
      navStore.markClean(questionId);
      navStore.setOriginalAnswer(questionId, currentAnswer);
    }

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

    return true;
  }, [currentQuestion, currentAnswer, validateAnswer, buildAnswerRequest, adapter, session.id, effectiveAuthHeaders, setState, t]);

  // ========================================================================
  // Internal: Session error handler
  // ========================================================================

  const handleSessionStateError = useCallback((apiError: ApiError): boolean => {
    if (apiError.status === 400 || apiError.status === 403) {
      const errorMessage = apiError.message || '';
      if (errorMessage.toLowerCase().includes('abandon')) {
        toast.error(t('player.toast.sessionCancelled'));
        useNavigationState.getState().clearAllDirty();
        router.push('/test-templates');
        setState(prev => ({ ...prev, isSubmitting: false }));
        return true;
      } else if (errorMessage.toLowerCase().includes('complet')) {
        toast.info(t('player.toast.testAlreadyCompleted'));
        useNavigationState.getState().clearAllDirty();
        router.push('/test-templates');
        setState(prev => ({ ...prev, isSubmitting: false }));
        return true;
      }
    }
    return false;
  }, [router, setState, t]);

  // ========================================================================
  // Public: Navigate to next question
  // ========================================================================

  const handleNext = useCallback(async () => {
    if (state.isSubmitting) return;

    const validation = validateAnswer(currentAnswer);
    if (!validation.valid) {
      setValidationError(validation.error || t('player.validation.pleaseCheckAnswer'));
      toast.warning(validation.error || t('player.validation.pleaseCheckAnswer'));
      return;
    }

    setValidationError(null);
    setState(prev => ({ ...prev, isSubmitting: true }));
    setSaveStatus('saving');

    try {
      if (currentQuestion && currentAnswer !== undefined) {
        const request = buildAnswerRequest(currentAnswer);
        if (adapter) {
          await adapter.submitAnswer(session.id, request);
        } else {
          await testSessionsClientApi.submitAnswer(session.id, request, effectiveAuthHeaders);
        }

        setSaveStatus('saved');

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

      if (state.questionIndex + 1 >= state.totalQuestions) {
        setState(prev => ({ ...prev, isSubmitting: false }));
        await onEnterSummary();
        return;
      }

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
      setSaveStatus('error');
      const apiError = error as ApiError;

      if (apiError.status === 400 || apiError.status === 403) {
        const errorMessage = apiError.message || '';
        if (errorMessage.toLowerCase().includes('abandon')) {
          toast.error(t('player.toast.sessionCancelled'));
          router.push('/test-templates');
          return;
        } else if (errorMessage.toLowerCase().includes('complet')) {
          toast.info(t('player.toast.testAlreadyCompleted'));
          router.push('/test-templates');
          return;
        }
        toast.error(t('player.toast.invalidNavigation'));
      } else if (apiError.status === 404) {
        toast.error(t('player.toast.questionNotFound'));
      } else {
        toast.error(t('player.toast.failedToSaveAnswer'));
      }
    }

    setState(prev => ({ ...prev, isSubmitting: false }));
  }, [state.isSubmitting, state.questionIndex, state.totalQuestions, currentAnswer, currentQuestion, validateAnswer, setValidationError, setState, buildAnswerRequest, adapter, session.id, effectiveAuthHeaders, loadQuestion, onEnterSummary, router, t]);

  // ========================================================================
  // Public: Navigate to previous question with auto-save
  // ========================================================================

  const handlePrevious = useCallback(async () => {
    if (!state.allowBackNavigation || state.isSubmitting) return;
    if (state.questionIndex <= 0) return;

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      await autoSaveIfDirty();

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

      if (handleSessionStateError(apiError)) return;

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
  }, [state.allowBackNavigation, state.isSubmitting, state.questionIndex, adapter, session.id, effectiveAuthHeaders, setState, autoSaveIfDirty, loadQuestion, handleSessionStateError, currentQuestion?.id]);

  // ========================================================================
  // Public: Navigate to a specific question by index (dot navigation)
  // ========================================================================

  const handleNavigateToQuestion = useCallback(async (targetIndex: number) => {
    if (!state.allowBackNavigation || state.isSubmitting) return;
    if (targetIndex === state.questionIndex) return;
    if (targetIndex < 0 || targetIndex >= state.totalQuestions) return;

    const targetState = state.questionStates[targetIndex];
    if (targetState === 'pending') return;

    setState(prev => ({ ...prev, isSubmitting: true }));

    const direction = targetIndex > state.questionIndex ? 'forward' : 'backward';

    try {
      await autoSaveIfDirty();

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

      if (handleSessionStateError(apiError)) return;

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
  }, [state.allowBackNavigation, state.isSubmitting, state.questionIndex, state.totalQuestions, state.questionStates, adapter, session.id, effectiveAuthHeaders, setState, autoSaveIfDirty, loadQuestion, handleSessionStateError, currentQuestion?.id]);

  // ========================================================================
  // Public: Skip current question
  // ========================================================================

  const handleSkip = useCallback(async () => {
    if (!state.allowSkip || state.isSubmitting) return;

    if (state.questionIndex + 1 >= state.totalQuestions) {
      toast.warning(t('player.toast.cannotSkipLast'));
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));
    setSaveStatus('saving');

    try {
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

      setSaveStatus('saved');

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

      const nextIndex = state.questionIndex + 1;
      if (adapter) {
        await adapter.navigateToQuestion(session.id, nextIndex);
      } else {
        await testSessionsClientApi.navigateToQuestion(session.id, nextIndex, effectiveAuthHeaders);
      }
      await loadQuestion('forward');

      setCurrentAnswer(undefined);
      setValidationError(null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to skip question:', error);
      setSaveStatus('error');
      const apiError = error as ApiError;

      if (apiError.status === 400 || apiError.status === 403) {
        const errorMessage = apiError.message || '';
        if (errorMessage.toLowerCase().includes('abandon')) {
          toast.error(t('player.toast.sessionCancelled'));
          router.push('/test-templates');
          return;
        } else if (errorMessage.toLowerCase().includes('complet')) {
          toast.info(t('player.toast.testAlreadyCompleted'));
          router.push('/test-templates');
          return;
        }
      }

      toast.error(t('player.toast.failedToSkipQuestion'));
    }

    setState(prev => ({ ...prev, isSubmitting: false }));
  }, [state.allowSkip, state.isSubmitting, state.questionIndex, state.totalQuestions, currentQuestion, adapter, session.id, effectiveAuthHeaders, questionStartTime, setState, setCurrentAnswer, setValidationError, loadQuestion, router, t]);

  // ========================================================================
  // Public: Handle test completion
  // ========================================================================

  const handleComplete = useCallback(async () => {
    if (state.isSubmitting) return;

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      if (currentQuestion && currentAnswer !== undefined) {
        const request = buildAnswerRequest(currentAnswer);
        if (adapter) {
          await adapter.submitAnswer(session.id, request);
        } else {
          await testSessionsClientApi.submitAnswer(session.id, request, effectiveAuthHeaders);
        }
      }

      let completionResult: CompletionResult;
      if (adapter) {
        completionResult = await adapter.completeSession(session.id);
      } else {
        const result = await testSessionsClientApi.completeSession(session.id, effectiveAuthHeaders);
        completionResult = { resultId: result.id };
      }

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

      if (errorMessage.includes('not in progress') || errorMessage.includes('cannot complete')) {
        try {
          let currentSession;
          if (adapter) {
            currentSession = await adapter.getSession(session.id);
          } else {
            currentSession = await testSessionsClientApi.getSessionById(session.id, effectiveAuthHeaders);
          }
          if (currentSession?.status === 'COMPLETED') {
            toast.info(t('player.toast.testAlreadyCompleted'));
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
        toast.error(t('player.toast.testCannotBeCompleted'));
        if (onError) {
          onError(apiError);
        } else {
          router.push('/test-templates');
        }
        return;
      }

      if (errorMessage.includes('abandon')) {
        toast.error(t('player.toast.sessionCancelled'));
        if (onError) {
          onError(apiError);
        } else {
          router.push('/test-templates');
        }
        return;
      }

      toast.error(t('player.toast.failedToCompleteTest'));
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state.isSubmitting, currentQuestion, currentAnswer, buildAnswerRequest, adapter, session.id, effectiveAuthHeaders, setState, onComplete, onError, router, t]);

  // ========================================================================
  // Public: Handle exit/abandon
  // ========================================================================

  const handleExit = useCallback(() => {
    setShowAbandonDialog(true);
  }, []);

  const handleAbandonTest = useCallback(async () => {
    try {
      if (adapter) {
        await adapter.abandonSession(session.id);
      } else {
        await testSessionsClientApi.abandonSession(session.id, effectiveAuthHeaders);
      }
      if (onAbandon) {
        onAbandon();
      } else {
        router.push('/test-templates');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to abandon test:', error);
      toast.error(t('player.toast.failedToCancelTest'));
    } finally {
      setShowAbandonDialog(false);
    }
  }, [adapter, session.id, effectiveAuthHeaders, onAbandon, router, t]);

  // ========================================================================
  // Public: Navigation error recovery
  // ========================================================================

  const handleRetryNavigation = useCallback(async () => {
    if (!pendingNavigation) return;

    setIsRetryingNavigation(true);

    const { direction, targetIndex } = pendingNavigation;
    const navStore = useNavigationState.getState();
    const questionId = currentQuestion?.id;

    try {
      const isDirty = questionId ? navStore.isDirty(questionId) : false;

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

      const navIndex = targetIndex ?? (direction === 'backward' ? state.questionIndex - 1 : state.questionIndex + 1);
      if (adapter) {
        await adapter.navigateToQuestion(session.id, navIndex);
      } else {
        await testSessionsClientApi.navigateToQuestion(session.id, navIndex, effectiveAuthHeaders);
      }
      await loadQuestion(direction);

      setShowNavigationError(false);
      setNavigationError(null);
      setPendingNavigation(null);
      toast.success(t('player.toast.answerSaved'));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Retry failed:', error);
      const apiError = error as ApiError;

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
  }, [pendingNavigation, currentQuestion, currentAnswer, validateAnswer, buildAnswerRequest, adapter, session.id, effectiveAuthHeaders, setState, state.questionIndex, loadQuestion, t]);

  const handleDismissNavigationError = useCallback(() => {
    setShowNavigationError(false);
    setNavigationError(null);
    setPendingNavigation(null);
  }, []);

  const handleContinueWithoutSaving = useCallback(async () => {
    if (!pendingNavigation) return;

    const { direction, targetIndex } = pendingNavigation;
    const navStore = useNavigationState.getState();
    const questionId = currentQuestion?.id;

    try {
      if (questionId) {
        navStore.markClean(questionId);
      }

      const navIndex = targetIndex ?? (direction === 'backward' ? state.questionIndex - 1 : state.questionIndex + 1);
      if (adapter) {
        await adapter.navigateToQuestion(session.id, navIndex);
      } else {
        await testSessionsClientApi.navigateToQuestion(session.id, navIndex, effectiveAuthHeaders);
      }
      await loadQuestion(direction);

      setShowNavigationError(false);
      setNavigationError(null);
      setPendingNavigation(null);
      toast.info(t('player.toast.changesNotSaved'));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Continue without saving failed:', error);
      toast.error(t('player.toast.failedToNavigate'));
    }
  }, [pendingNavigation, currentQuestion?.id, adapter, session.id, effectiveAuthHeaders, state.questionIndex, loadQuestion, t]);

  return {
    handleNext,
    handlePrevious,
    handleSkip,
    handleNavigateToQuestion,
    handleComplete,
    handleExit,
    handleAbandonTest,
    handleRetryNavigation,
    handleDismissNavigationError,
    handleContinueWithoutSaving,
    canSkip,
    showAbandonDialog,
    setShowAbandonDialog,
    showCompletion,
    setShowCompletion,
    showNavigationError,
    setShowNavigationError,
    navigationError,
    isRetryingNavigation,
    hasUnsavedChanges,
    saveStatus,
  };
}

export default useQuestionNavigation;
