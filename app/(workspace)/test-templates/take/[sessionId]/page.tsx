'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useUIStore } from "@/store/ui-store";
import { testSessionsClientApi, type ApiError } from '@/services/api.client';
import {
  TestSession,
  CurrentQuestionResponse,
  SessionStatus,
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
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { retryWithBackoff, getUserFriendlyErrorMessage, isRetryableError } from '@/utils/retry';
import { ImmersivePlayer } from '@/components/test-player/ImmersivePlayer';

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
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Dialog state for existing session
  const [showExistingSessionDialog, setShowExistingSessionDialog] = useState(false);
  const [existingSessionId, setExistingSessionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Load existing session
      const sessionData = await testSessionsClientApi.getSessionById(sessionId, localAuthHeaders);

      // Check session status before attempting to load questions
      if (!sessionData) {
        setError('Сессия не найдена');
        setErrorStatus(404);
        setStatus('error');
        return;
      }

      // Handle non-active session states
      if (sessionData.status === SessionStatus.ABANDONED) {
        setError('Эта сессия была отменена. Вы можете начать новый тест.');
        setErrorStatus(400);
        setStatus('error');
        toast.info('Сессия была отменена ранее');
        return;
      }

      if (sessionData.status === SessionStatus.COMPLETED) {
        setError('Этот тест уже был завершён');
        setErrorStatus(400);
        setStatus('error');
        return;
      }

      if (sessionData.status === SessionStatus.TIMED_OUT) {
        setError('Время выполнения теста истекло');
        setErrorStatus(400);
        setStatus('error');
        return;
      }

      // Only load current question if session is active (NOT_STARTED or IN_PROGRESS)
      if (sessionData.status !== SessionStatus.NOT_STARTED && sessionData.status !== SessionStatus.IN_PROGRESS) {
        setError(`Недействительный статус сессии: ${sessionData.status}`);
        setErrorStatus(400);
        setStatus('error');
        return;
      }

      // Load current question with retry logic for server errors
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
      setRetryAttempt(0);
      setIsRetrying(false);

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
  }, [sessionId, templateId, router]);

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

  // Loading state - show skeleton while waiting for auth or loading session
  if (status === 'waiting-for-auth' || status === 'loading-session') {
    return <TestTakeSkeleton retryAttempt={retryAttempt} isRetrying={isRetrying} />;
  }

  // Error state (including auth errors)
  if (status === 'error' || status === 'auth-error' || error) {
    const isNotFound = errorStatus === 404;
    const isInvalidState = errorStatus === 400;
    const isServerError = errorStatus !== null && errorStatus >= 500;

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
        // Check if this is an abandoned session and we have template info to restart
        const isAbandoned = error?.toLowerCase().includes('отменена') || error?.toLowerCase().includes('abandon');

        // If abandoned and we have template ID, allow starting a new test
        if (isAbandoned && templateId) {
          return {
            title: 'Тест был отменён',
            description: error || 'Эта сессия тестирования была отменена.',
            icon: AlertTriangle,
            actions: [
              { label: 'Начать новый тест', onClick: () => router.push(`/test-templates/take/new?template=${templateId}`), variant: 'default' as const },
              { label: 'К списку тестов', onClick: () => router.push('/test-templates'), variant: 'outline' as const },
            ],
          };
        }

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
    return (
      <>
        <TestTakeSkeleton retryAttempt={retryAttempt} isRetrying={isRetrying} />

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
      </>
    );
  }

  // Render ImmersivePlayer with loaded data
  return (
    <ImmersivePlayer
      session={session}
      initialQuestion={currentQuestion}
      authHeaders={authHeaders}
    />
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
