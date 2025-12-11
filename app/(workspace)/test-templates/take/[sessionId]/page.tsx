'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useUIStore } from "@/store/ui-store";
import { SessionHeader } from "@/components/layout/session-header";
import { testSessionsClientApi, type ApiError } from '@/services/api.client';
import {
  TestSession,
  CurrentQuestionResponse,
  SubmitAnswerRequest,
  TestAnswer
} from '@/types/domain';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { retryWithBackoff, getUserFriendlyErrorMessage, isRetryableError } from '@/utils/retry';

// Question type components
import SingleChoiceQuestion from './_components/SingleChoiceQuestion';
import MultipleChoiceQuestion from './_components/MultipleChoiceQuestion';
import LikertScaleQuestion from './_components/LikertScaleQuestion';
import OpenTextQuestion from './_components/OpenTextQuestion';

// Loading status type for clearer state management
type LoadingStatus = 
  | 'waiting-for-auth'    // Auth not yet loaded
  | 'auth-error'          // User not signed in
  | 'loading-session'     // Fetching session data
  | 'ready'               // Session loaded successfully
  | 'error';              // Error occurred

export default function TestTakePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;
  const templateId = searchParams.get('template');
  const { userId, isSignedIn, isLoaded } = useAuth();
  
  // Use Zustand store directly for immersive mode
  const enterImmersiveMode = useUIStore((state) => state.enterImmersiveMode);
  const exitImmersiveMode = useUIStore((state) => state.exitImmersiveMode);

  // Trigger Zen Mode on mount, exit on unmount
  useEffect(() => {
    enterImmersiveMode();
    return () => exitImmersiveMode();
  }, [enterImmersiveMode, exitImmersiveMode]);

  // State
  const [session, setSession] = useState<TestSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestionResponse | null>(null);
  const [status, setStatus] = useState<LoadingStatus>('waiting-for-auth');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Track if we've already started loading (to prevent double-loads)
  const hasStartedLoading = useRef(false);
  
  // Reset loading state when sessionId changes (e.g., after redirect from 'new' to actual ID)
  useEffect(() => {
    hasStartedLoading.current = false;
    setStatus('waiting-for-auth');
    setSession(null);
    setCurrentQuestion(null);
    setError(null);
    setErrorStatus(null);
    setRetryAttempt(0);
    setIsRetrying(false);
  }, [sessionId]);
  
  // Auth headers for API calls - memoized to prevent unnecessary recreations
  const authHeaders = useMemo((): Record<string, string> => {
    if (!userId) return {};
    return { 'X-User-Id': userId };
  }, [userId]);
  
  // Answer state
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [likertValue, setLikertValue] = useState<number | null>(null);
  const [textResponse, setTextResponse] = useState('');
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Dialog state
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showAbandonDialog, setShowAbandonDialog] = useState(false);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const [showExistingSessionDialog, setShowExistingSessionDialog] = useState(false);
  const [existingSessionId, setExistingSessionId] = useState<string | null>(null);

  // Reset answer state when question changes
  const resetAnswerState = useCallback((previousAnswer?: TestAnswer | null) => {
    if (previousAnswer) {
      // Restore previous answer based on what was stored
      if (previousAnswer.selectedOptionIds && previousAnswer.selectedOptionIds.length > 0) {
        setSelectedOptions(previousAnswer.selectedOptionIds);
      } else {
        setSelectedOptions([]);
      }
      
      if (previousAnswer.likertValue !== undefined && previousAnswer.likertValue !== null) {
        setLikertValue(previousAnswer.likertValue);
      } else {
        setLikertValue(null);
      }
      
      if (previousAnswer.textResponse) {
        setTextResponse(previousAnswer.textResponse);
      } else {
        setTextResponse('');
      }
    } else {
      setSelectedOptions([]);
      setLikertValue(null);
      setTextResponse('');
    }
  }, []);

  // Load session data - main loading logic with retry support
  const loadSessionData = useCallback(async (currentUserId: string, isManualRetry = false) => {
    // Build auth headers using the passed userId (guaranteed to be valid)
    const localAuthHeaders = { 'X-User-Id': currentUserId };

    try {
      setStatus('loading-session');
      setError(null);
      setErrorStatus(null);

      if (isManualRetry) {
        setIsRetrying(false);
      }

      // Handle 'new' session creation
      if (sessionId === 'new') {
        if (!templateId) {
          setError('Не указан шаблон теста');
          setErrorStatus(400);
          setStatus('error');
          return;
        }

        // First check if user already has an in-progress session for this template
        try {
          const existingSession = await testSessionsClientApi.getInProgressSession(currentUserId, templateId, localAuthHeaders);
          if (existingSession) {
            // Show dialog to let user choose: continue existing or start new
            setExistingSessionId(existingSession.id);
            setShowExistingSessionDialog(true);
            setStatus('ready'); // Not an error, just waiting for user choice
            return;
          }
        } catch {
          // No existing session found (404), which is fine - proceed to create new
        }

        // Try to create a new session
        try {
          const newSession = await testSessionsClientApi.startSession({
            templateId,
            clerkUserId: currentUserId,
          }, localAuthHeaders);
          // Redirect to the actual session URL for clean URLs
          router.replace(`/test-templates/take/${newSession.id}`);
          return; // The redirect will trigger a new load
        } catch (createErr: unknown) {
          // Check if the error is about existing session (in case the check above missed it)
          const errorMessage = createErr instanceof Error ? createErr.message : '';
          if (errorMessage.toLowerCase().includes('already has') ||
              errorMessage.toLowerCase().includes('in-progress') ||
              errorMessage.toLowerCase().includes('existing session')) {
            // Try to find and offer the existing session
            try {
              const existingSession = await testSessionsClientApi.getInProgressSession(currentUserId, templateId, localAuthHeaders);
              if (existingSession) {
                setExistingSessionId(existingSession.id);
                setShowExistingSessionDialog(true);
                setStatus('ready');
                return;
              }
            } catch {
              // Couldn't find existing session, show generic error
            }
          }

          const apiError = createErr as ApiError;
          setError(getUserFriendlyErrorMessage(createErr));
          setErrorStatus(apiError.status ?? null);
          setStatus('error');
          return;
        }
      }

      // Load existing session - wrap getCurrentQuestion in retry logic for 500 errors
      const sessionData = await testSessionsClientApi.getSessionById(sessionId, localAuthHeaders);

      const questionData = await retryWithBackoff(
        () => testSessionsClientApi.getCurrentQuestion(sessionId, localAuthHeaders),
        {
          maxRetries: 3,
          initialDelayMs: 1000,
          shouldRetry: isRetryableError,
          onRetry: (error, attempt) => {
            setRetryAttempt(attempt);
            setIsRetrying(true);
            // eslint-disable-next-line no-console
            console.log(`Retrying getCurrentQuestion (attempt ${attempt}/3)...`);
            toast.info(`Повторная попытка... (${attempt}/3)`, { duration: 2000 });
          },
        }
      );

      setSession(sessionData);
      setCurrentQuestion(questionData);
      resetAnswerState(questionData?.previousAnswer);
      setQuestionStartTime(Date.now());
      setRetryAttempt(0);
      setIsRetrying(false);

      // Initialize timer if session has time limit
      if (sessionData?.timeRemainingSeconds && sessionData.timeRemainingSeconds > 0) {
        setTimeRemaining(sessionData.timeRemainingSeconds);
      }

      setStatus('ready');
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error('Failed to load session:', err);

      const apiError = err as ApiError;
      const errorMessage = getUserFriendlyErrorMessage(err);
      const errorStatusCode = apiError.status;

      setError(errorMessage);
      setErrorStatus(errorStatusCode ?? null);
      setStatus('error');
      setRetryAttempt(0);
      setIsRetrying(false);

      // Handle specific error scenarios
      if (errorStatusCode === 404) {
        toast.error('Тест не найден');
      } else if (errorStatusCode === 400) {
        toast.error('Недействительная сессия теста');
      } else if (errorStatusCode && errorStatusCode >= 500) {
        toast.error('Ошибка сервера. Попробуйте ещё раз.');
      }
    }
  }, [sessionId, templateId, resetAnswerState, router]);

  // Manual retry function for user-initiated retries
  const handleManualRetry = useCallback(() => {
    if (!userId) return;
    hasStartedLoading.current = false;
    setRetryAttempt(0);
    loadSessionData(userId, true);
  }, [userId, loadSessionData]);

  // Main initialization effect - handles auth state transitions
  useEffect(() => {
    // Wait for auth to load
    if (!isLoaded) {
      setStatus('waiting-for-auth');
      return;
    }

    // Check if user is signed in
    if (!isSignedIn) {
      setStatus('auth-error');
      setError('Вы должны войти в систему для прохождения теста');
      return;
    }

    // Check if we have userId
    if (!userId) {
      setStatus('auth-error');
      setError('Не удалось получить данные пользователя');
      return;
    }

    // Prevent double-loading
    if (hasStartedLoading.current) {
      return;
    }

    // Start loading session data
    hasStartedLoading.current = true;
    loadSessionData(userId);
  }, [isLoaded, isSignedIn, userId, loadSessionData]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setShowTimeoutDialog(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeRemaining]);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if current answer is valid
  const isAnswerValid = useCallback((): boolean => {
    if (!currentQuestion) return false;
    
    const questionType = currentQuestion.question.questionType as string;
    
    switch (questionType) {
      case 'SINGLE_CHOICE':
      case 'SJT':
      case 'SITUATIONAL_JUDGMENT':
        return selectedOptions.length === 1;
      case 'MULTIPLE_CHOICE':
      case 'MCQ':
        return selectedOptions.length > 0;
      case 'LIKERT_SCALE':
      case 'LIKERT':
        return likertValue !== null;
      case 'OPEN_TEXT':
      case 'BEHAVIORAL_EXAMPLE':
      case 'SELF_REFLECTION':
      case 'PEER_FEEDBACK':
        return textResponse.trim().length > 0;
      default:
        return false;
    }
  }, [currentQuestion, selectedOptions, likertValue, textResponse]);

  // Submit answer and move to next question
  const handleSubmitAnswer = async (isSkipped: boolean = false) => {
    if (!currentQuestion || !session || isSubmitting) return;
    if (!isSkipped && !isAnswerValid()) return;

    try {
      setIsSubmitting(true);

      const timeSpentSeconds = Math.floor((Date.now() - questionStartTime) / 1000);

      const request: SubmitAnswerRequest = {
        sessionId: session.id,
        questionId: currentQuestion.question.id,
        selectedOptionIds: selectedOptions.length > 0 ? selectedOptions : undefined,
        likertValue: likertValue ?? undefined,
        textResponse: textResponse || undefined,
        timeSpentSeconds,
        skip: isSkipped,
      };

      // Submit the answer
      await testSessionsClientApi.submitAnswer(sessionId, request, authHeaders);

      // Check if this was the last question
      if (currentQuestion.questionNumber >= currentQuestion.totalQuestions) {
        setShowCompleteDialog(true);
      } else {
        // Navigate to the next question (increment the index)
        const nextIndex = session.currentQuestionIndex + 1;

        // Validate next index is within bounds
        if (nextIndex >= currentQuestion.totalQuestions) {
          // This shouldn't happen, but handle gracefully
          setShowCompleteDialog(true);
          return;
        }

        // Navigate to the next question in the backend
        await testSessionsClientApi.navigateToQuestion(sessionId, nextIndex, authHeaders);

        // Load the next question
        const nextQuestion = await testSessionsClientApi.getCurrentQuestion(sessionId, authHeaders);
        setCurrentQuestion(nextQuestion);
        resetAnswerState(nextQuestion?.previousAnswer);
        setQuestionStartTime(Date.now());

        // Update session state with new index
        setSession(prev => prev ? { ...prev, currentQuestionIndex: nextIndex } : null);

        if (isSkipped) {
          toast.info('Вопрос пропущен');
        }
      }
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error('Failed to submit answer:', err);

      // Provide more specific error messages
      const apiError = err as ApiError;
      if (apiError.status === 400) {
        toast.error('Недействительный переход к следующему вопросу');
      } else if (apiError.status === 404) {
        toast.error('Вопрос не найден');
      } else {
        toast.error('Не удалось сохранить ответ');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigate to previous question
  const handlePreviousQuestion = async () => {
    if (!currentQuestion || !session || session.currentQuestionIndex <= 0 || isSubmitting) return;
    
    // Check if back navigation is allowed
    if (!currentQuestion.allowBackNavigation) {
      toast.error('Возврат к предыдущим вопросам запрещён');
      return;
    }

    try {
      setIsSubmitting(true);
      // Navigate to previous question index
      const prevIndex = session.currentQuestionIndex - 1;
      await testSessionsClientApi.navigateToQuestion(sessionId, prevIndex, authHeaders);
      // Fetch the question after navigation
      const prevQuestion = await testSessionsClientApi.getCurrentQuestion(sessionId, authHeaders);
      setCurrentQuestion(prevQuestion);
      resetAnswerState(prevQuestion?.previousAnswer);
      setQuestionStartTime(Date.now());
      // Update session state
      setSession(prev => prev ? { ...prev, currentQuestionIndex: prevIndex } : null);
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error('Failed to navigate back:', err);
      toast.error('Не удалось вернуться к предыдущему вопросу');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete the test
  const handleCompleteTest = async () => {
    try {
      setIsSubmitting(true);
      const result = await testSessionsClientApi.completeSession(sessionId, authHeaders);
      router.push(`/test-templates/results/${result.id}`);
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error('Failed to complete test:', err);
      toast.error('Не удалось завершить тест');
    } finally {
      setIsSubmitting(false);
      setShowCompleteDialog(false);
    }
  };

  // Abandon the test
  const handleAbandonTest = async () => {
    try {
      await testSessionsClientApi.abandonSession(sessionId, authHeaders);
      router.push('/test-templates');
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error('Failed to abandon test:', err);
      toast.error('Не удалось отменить тест');
    } finally {
      setShowAbandonDialog(false);
    }
  };

  // Continue with existing session
  const handleContinueExistingSession = () => {
    if (existingSessionId) {
      setShowExistingSessionDialog(false);
      router.replace(`/test-templates/take/${existingSessionId}`);
    }
  };

  // Discard existing session and start new
  const handleDiscardAndStartNew = async () => {
    if (!existingSessionId || !templateId || !userId) return;
    
    try {
      setIsSubmitting(true);
      // Abandon the existing session
      await testSessionsClientApi.abandonSession(existingSessionId, authHeaders);
      setShowExistingSessionDialog(false);
      
      // Now create a new session
      const newSession = await testSessionsClientApi.startSession({
        templateId,
        clerkUserId: userId,
      }, authHeaders);
      router.replace(`/test-templates/take/${newSession.id}`);
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error('Failed to discard and start new session:', err);
      toast.error('Не удалось начать новую сессию');
      setShowExistingSessionDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the appropriate question component
  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const { question } = currentQuestion;
    const questionType = question.questionType as string;

    switch (questionType) {
      case 'SINGLE_CHOICE':
      case 'SJT':
      case 'SITUATIONAL_JUDGMENT':
        return (
          <SingleChoiceQuestion
            question={question}
            selectedOption={selectedOptions[0] || null}
            onSelectionChange={(id) => setSelectedOptions(id ? [id] : [])}
          />
        );
      case 'MULTIPLE_CHOICE':
      case 'MCQ':
        return (
          <MultipleChoiceQuestion
            question={question}
            selectedOptions={selectedOptions}
            onSelectionChange={setSelectedOptions}
          />
        );
      case 'LIKERT_SCALE':
      case 'LIKERT':
        return (
          <LikertScaleQuestion
            question={question}
            value={likertValue}
            onChange={setLikertValue}
          />
        );
      case 'OPEN_TEXT':
      case 'BEHAVIORAL_EXAMPLE':
      case 'SELF_REFLECTION':
      case 'PEER_FEEDBACK':
        return (
          <OpenTextQuestion
            question={question}
            value={textResponse}
            onChange={setTextResponse}
          />
        );
      default:
        return <p className="text-muted-foreground">Неизвестный тип вопроса</p>;
    }
  };

  // Keyboard navigation
  // Keyboard shortcut for submitting answer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && isAnswerValid() && !isSubmitting) {
        e.preventDefault();
        handleSubmitAnswer(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // Note: handleSubmitAnswer is stable due to deps, but we suppress the warning
    // to avoid recreation when session/currentQuestion change (handled by internal checks)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnswerValid, isSubmitting]);

  // Loading state - show skeleton while waiting for auth or loading session
  if (status === 'waiting-for-auth' || status === 'loading-session') {
    return <TestTakeSkeleton retryAttempt={retryAttempt} isRetrying={isRetrying} />;
  }

  // Error state (including auth errors)
  if (status === 'error' || status === 'auth-error' || error) {
    const isNotFound = errorStatus === 404;
    const isInvalidState = errorStatus === 400;
    const isServerError = errorStatus !== null && errorStatus >= 500;
    const canRetry = isServerError && !isRetrying;

    // Determine appropriate error message and actions
    const getErrorConfig = () => {
      if (isNotFound) {
        return {
          title: 'Тест не найден',
          description: error || 'Сессия тестирования не найдена. Возможно, она была удалена или завершена.',
          icon: XCircle,
          actions: [
            { label: 'К списку тестов', onClick: () => router.push('/test-templates'), variant: 'default' as const },
          ],
        };
      }

      if (isInvalidState) {
        return {
          title: 'Недействительная сессия',
          description: error || 'Эта сессия тестирования уже завершена или отменена.',
          icon: AlertTriangle,
          actions: [
            { label: 'К списку тестов', onClick: () => router.push('/test-templates'), variant: 'default' as const },
          ],
        };
      }

      if (isServerError) {
        return {
          title: 'Ошибка сервера',
          description: error || 'Не удалось загрузить тест из-за ошибки сервера. Попробуйте ещё раз через несколько секунд.',
          icon: AlertTriangle,
          actions: [
            { label: 'Попробовать снова', onClick: handleManualRetry, variant: 'default' as const, icon: RefreshCw },
            { label: 'К списку тестов', onClick: () => router.push('/test-templates'), variant: 'outline' as const },
          ],
        };
      }

      return {
        title: 'Ошибка',
        description: error || 'Произошла ошибка при загрузке теста',
        icon: XCircle,
        actions: [
          { label: 'Попробовать снова', onClick: handleManualRetry, variant: 'default' as const, icon: RefreshCw },
          { label: 'К списку тестов', onClick: () => router.push('/test-templates'), variant: 'outline' as const },
        ],
      };
    };

    const errorConfig = getErrorConfig();
    const ErrorIcon = errorConfig.icon;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <ErrorIcon className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-destructive">{errorConfig.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center">{errorConfig.description}</p>
            {errorStatus && (
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded text-center font-mono">
                HTTP {errorStatus}
              </div>
            )}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded overflow-auto max-h-32">
                <p className="font-medium mb-1">Dev Info:</p>
                <pre className="whitespace-pre-wrap">{error}</pre>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            {errorConfig.actions.map((action, index) => {
              const ActionIcon = 'icon' in action ? action.icon : null;
              return (
                <Button
                  key={index}
                  variant={action.variant}
                  onClick={action.onClick}
                  className="w-full"
                  disabled={action.label.includes('снова') && isRetrying}
                >
                  {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
                  {action.label}
                </Button>
              );
            })}
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Waiting for user choice (existing session dialog) or no data yet
  if ((showExistingSessionDialog && !session && !currentQuestion) ||
      (!session || !currentQuestion)) {
    return <TestTakeSkeleton retryAttempt={retryAttempt} isRetrying={isRetrying} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SessionHeader
        currentQuestion={currentQuestion.questionNumber}
        totalQuestions={currentQuestion.totalQuestions}
        progress={(currentQuestion.questionNumber / currentQuestion.totalQuestions) * 100}
        timeRemaining={timeRemaining}
        onExit={() => setShowAbandonDialog(true)}
      />

      <main className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full p-6">
        <div 
          className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" 
          key={currentQuestion.question.id}
        >
          {/* Question Text */}
          <h1 className="text-2xl md:text-4xl font-medium tracking-tight text-center leading-tight">
            {currentQuestion.question.questionText}
          </h1>

          {/* Answer Options */}
          <div className="w-full max-w-2xl mx-auto">
            {renderQuestion()}
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="sticky bottom-0 p-4 border-t bg-background/95 backdrop-blur safe-area-bottom">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={handlePreviousQuestion}
            disabled={
              !currentQuestion.allowBackNavigation || 
              currentQuestion.questionNumber <= 1 || 
              isSubmitting
            }
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Назад</span>
          </Button>

          {/* Keyboard hint */}
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            Press <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono">Enter ↵</kbd>
          </div>

          {/* Next/Submit button */}
          <Button 
            onClick={() => handleSubmitAnswer(false)} 
            disabled={isSubmitting || !isAnswerValid()}
            size="lg"
            className="min-w-[140px] rounded-xl shadow-lg shadow-primary/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Сохранение...
              </>
            ) : currentQuestion.questionNumber >= currentQuestion.totalQuestions ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Завершить
              </>
            ) : (
              <>
                Далее 
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </footer>

      {/* Complete confirmation dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Завершить тест?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы ответили на все вопросы. После завершения вы не сможете изменить свои ответы.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Проверить ответы</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteTest} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Завершить тест
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            <AlertDialogAction onClick={handleCompleteTest}>
              Посмотреть результаты
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Existing session dialog */}
      <AlertDialog open={showExistingSessionDialog} onOpenChange={setShowExistingSessionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Продолжить предыдущую сессию?</AlertDialogTitle>
            <AlertDialogDescription>
              У вас есть незавершённый тест. Вы можете продолжить его или начать заново.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardAndStartNew} disabled={isSubmitting}>
              {isSubmitting ? 'Загрузка...' : 'Начать заново'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleContinueExistingSession}>
              Продолжить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Loading skeleton with retry indicator
function TestTakeSkeleton({ retryAttempt = 0, isRetrying = false }: { retryAttempt?: number; isRetrying?: boolean }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header skeleton */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-6 w-48" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-2 w-32" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      </header>

      {/* Content skeleton */}
      <main className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full p-6">
        <div className="space-y-8">
          {/* Retry indicator */}
          {isRetrying && retryAttempt > 0 && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-sm">Повторная попытка {retryAttempt} из 3...</p>
            </div>
          )}

          <Skeleton className="h-12 w-full max-w-2xl mx-auto" />
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <div className="space-y-3 max-w-2xl mx-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </main>

      {/* Footer skeleton */}
      <footer className="sticky bottom-0 p-4 border-t bg-background">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-12 w-36 rounded-xl" />
        </div>
      </footer>
    </div>
  );
}
