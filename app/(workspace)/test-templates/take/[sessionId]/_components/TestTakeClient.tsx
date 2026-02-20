'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useUIStore } from '@/store/ui-store';
import { testSessionsClientApi, type ApiError } from '@/services/api.client';
import type {
  TestSession,
  CurrentQuestionResponse,
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
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { retryWithBackoff, getUserFriendlyErrorMessage, isRetryableError } from '@/utils/retry';
import { ImmersivePlayer } from '@/components/test-player/ImmersivePlayer';
import { TestSessionProvider } from '@/context/test-session-context';
import { createAuthenticatedAdapter } from '@/adapters';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the case when session data was successfully fetched server-side.
 * The server component has already loaded session + question data.
 */
interface ReadyProps {
  mode: 'ready';
  session: TestSession;
  initialQuestion: CurrentQuestionResponse;
  userId: string;
  testDriveMode: boolean;
}

/**
 * Props for the case when sessionId is 'new' and the client needs
 * to handle session creation (requires router.replace).
 */
interface NewSessionProps {
  mode: 'new';
  userId: string;
  templateId: string | null;
  testDriveMode: boolean;
}

/**
 * Props for the case when the server encountered an error fetching data.
 * The error details are passed for client-side rendering.
 */
interface ServerErrorProps {
  mode: 'error';
  errorMessage: string;
  errorStatus: number;
  userId: string;
  templateId: string | null;
  testDriveMode: boolean;
}

export type TestTakeClientProps = ReadyProps | NewSessionProps | ServerErrorProps;

// ============================================================================
// Main Client Component
// ============================================================================

export default function TestTakeClient(props: TestTakeClientProps) {
  const { userId, testDriveMode } = props;
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('template.take');

  // Immersive mode (Zustand store)
  const enterImmersiveMode = useUIStore((state) => state.enterImmersiveMode);
  const exitImmersiveMode = useUIStore((state) => state.exitImmersiveMode);

  useEffect(() => {
    enterImmersiveMode();
    return () => exitImmersiveMode();
  }, [enterImmersiveMode, exitImmersiveMode]);

  // Create adapter (stable across renders as long as userId does not change)
  const adapter = useMemo(
    () => createAuthenticatedAdapter(userId),
    [userId]
  );

  // Completion and abandon handlers
  const handleComplete = useCallback(
    (result: { resultId?: string }) => {
      if (result.resultId) {
        router.push(`/test-templates/results/${result.resultId}`);
      } else {
        router.push('/test-templates');
      }
    },
    [router]
  );

  const handleAbandon = useCallback(() => {
    router.push('/test-templates');
  }, [router]);

  // Render based on mode
  switch (props.mode) {
    case 'ready':
      return (
        <TestSessionProvider adapter={adapter}>
          <ImmersivePlayer
            session={props.session}
            initialQuestion={props.initialQuestion}
            testDriveMode={testDriveMode}
            onComplete={handleComplete}
            onAbandon={handleAbandon}
          />
        </TestSessionProvider>
      );

    case 'new':
      return (
        <NewSessionHandler
          userId={userId}
          templateId={props.templateId}
          testDriveMode={testDriveMode}
          adapter={adapter}
          onComplete={handleComplete}
          onAbandon={handleAbandon}
        />
      );

    case 'error':
      return (
        <ServerErrorView
          errorMessage={props.errorMessage}
          errorStatus={props.errorStatus}
          templateId={props.templateId}
          sessionId={searchParams.get('sessionId')}
        />
      );
  }
}

// ============================================================================
// New Session Handler (client-side creation flow)
// ============================================================================

interface NewSessionHandlerProps {
  userId: string;
  templateId: string | null;
  testDriveMode: boolean;
  adapter: ReturnType<typeof createAuthenticatedAdapter>;
  onComplete: (result: { resultId?: string }) => void;
  onAbandon: () => void;
}

function NewSessionHandler({
  userId,
  templateId,
  testDriveMode,
  adapter,
  onComplete,
  onAbandon,
}: NewSessionHandlerProps) {
  const router = useRouter();
  const t = useTranslations('template.take');

  // State for new session creation
  const [session, setSession] = useState<TestSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Dialog state for existing session
  const [showExistingSessionDialog, setShowExistingSessionDialog] = useState(false);
  const [existingSessionId, setExistingSessionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent double-loads
  const hasStartedLoading = useRef(false);

  const authHeaders = useMemo(
    (): Record<string, string> => ({ 'X-User-Id': userId }),
    [userId]
  );

  // Create session flow
  const createSession = useCallback(async () => {
    if (!templateId) {
      setError(t('errors.templateNotSpecified'));
      setErrorStatus(400);
      setIsLoading(false);
      return;
    }

    const localAuthHeaders = { 'X-User-Id': userId };

    try {
      setIsLoading(true);
      setError(null);
      setErrorStatus(null);

      // Check if user already has an in-progress session for this template
      try {
        const existingSession = await testSessionsClientApi.getInProgressSession(
          userId,
          templateId,
          localAuthHeaders
        );
        if (existingSession) {
          setExistingSessionId(existingSession.id);
          setShowExistingSessionDialog(true);
          setIsLoading(false);
          return;
        }
      } catch {
        // No existing session found (404), proceed to create new
      }

      // Create a new session
      try {
        const newSession = await testSessionsClientApi.startSession(
          { templateId, clerkUserId: userId },
          localAuthHeaders
        );
        // Redirect to the actual session URL for clean URLs
        router.replace(`/test-templates/take/${newSession.id}`);
        return; // Redirect will cause a new server render
      } catch (createErr: unknown) {
        // Check if the error is about an existing session
        const errorMessage = createErr instanceof Error ? createErr.message : '';
        if (
          errorMessage.toLowerCase().includes('already has') ||
          errorMessage.toLowerCase().includes('in-progress') ||
          errorMessage.toLowerCase().includes('existing session')
        ) {
          try {
            const existingSession = await testSessionsClientApi.getInProgressSession(
              userId,
              templateId,
              localAuthHeaders
            );
            if (existingSession) {
              setExistingSessionId(existingSession.id);
              setShowExistingSessionDialog(true);
              setIsLoading(false);
              return;
            }
          } catch {
            // Couldn't find existing session, show generic error
          }
        }

        const apiError = createErr as ApiError;
        setError(getUserFriendlyErrorMessage(createErr));
        setErrorStatus(apiError.status ?? null);
        setIsLoading(false);
        return;
      }
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error('Failed to create session:', err);

      const apiError = err as ApiError;
      setError(getUserFriendlyErrorMessage(err));
      setErrorStatus(apiError.status ?? null);
      setIsLoading(false);
    }
  }, [userId, templateId, router, t]);

  // Run once on mount
  useEffect(() => {
    if (hasStartedLoading.current) return;
    hasStartedLoading.current = true;
    createSession();
  }, [createSession]);

  // Continue with existing session
  const handleContinueExistingSession = () => {
    if (existingSessionId) {
      setShowExistingSessionDialog(false);
      router.replace(`/test-templates/take/${existingSessionId}`);
    }
  };

  // Discard existing session and start new
  const handleDiscardAndStartNew = async () => {
    if (!existingSessionId || !templateId) return;

    try {
      setIsSubmitting(true);
      await testSessionsClientApi.abandonSession(existingSessionId, authHeaders);
      setShowExistingSessionDialog(false);

      const newSession = await testSessionsClientApi.startSession(
        { templateId, clerkUserId: userId },
        authHeaders
      );
      router.replace(`/test-templates/take/${newSession.id}`);
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error('Failed to discard and start new session:', err);
      toast.error(t('toasts.failedToStartNewSession'));
      setShowExistingSessionDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manual retry
  const handleManualRetry = useCallback(() => {
    hasStartedLoading.current = false;
    setRetryAttempt(0);
    setError(null);
    setErrorStatus(null);
    createSession();
  }, [createSession]);

  // Error state
  if (!isLoading && error) {
    return (
      <ErrorView
        error={error}
        errorStatus={errorStatus}
        templateId={templateId}
        onRetry={handleManualRetry}
        isRetrying={isRetrying}
      />
    );
  }

  // Loading / dialog state
  return (
    <>
      <TestTakeSkeleton retryAttempt={retryAttempt} isRetrying={isRetrying} />

      <AlertDialog
        open={showExistingSessionDialog}
        onOpenChange={setShowExistingSessionDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('dialogs.existingSession.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('dialogs.existingSession.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleDiscardAndStartNew}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t('dialogs.existingSession.loading')
                : t('dialogs.existingSession.startNew')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleContinueExistingSession}>
              {t('dialogs.existingSession.continue')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ============================================================================
// Server Error View
// ============================================================================

interface ServerErrorViewProps {
  errorMessage: string;
  errorStatus: number;
  templateId: string | null;
  sessionId: string | null;
}

function ServerErrorView({
  errorMessage,
  errorStatus,
  templateId,
}: ServerErrorViewProps) {
  const router = useRouter();
  const t = useTranslations('template.take');

  return (
    <ErrorView
      error={errorMessage}
      errorStatus={errorStatus}
      templateId={templateId}
      onRetry={() => router.refresh()}
      isRetrying={false}
    />
  );
}

// ============================================================================
// Shared Error View
// ============================================================================

interface ErrorViewProps {
  error: string;
  errorStatus: number | null;
  templateId: string | null;
  onRetry: () => void;
  isRetrying: boolean;
}

function ErrorView({
  error,
  errorStatus,
  templateId,
  onRetry,
  isRetrying,
}: ErrorViewProps) {
  const router = useRouter();
  const t = useTranslations('template.take');

  const isNotFound = errorStatus === 404;
  const isInvalidState = errorStatus === 400;
  const isServerError = errorStatus !== null && errorStatus >= 500;

  const getErrorConfig = () => {
    if (isNotFound) {
      return {
        title: t('errors.notFound'),
        description: error || t('errors.notFoundDescription'),
        icon: XCircle,
        actions: [
          {
            label: t('actions.toTestList'),
            onClick: () => router.push('/test-templates'),
            variant: 'default' as const,
          },
        ],
      };
    }

    if (isInvalidState) {
      const isAbandoned =
        error?.toLowerCase().includes('\u043e\u0442\u043c\u0435\u043d\u0435\u043d\u0430') ||
        error?.toLowerCase().includes('abandon') ||
        error?.toLowerCase().includes('cancelled');

      if (isAbandoned && templateId) {
        return {
          title: t('errors.abandoned'),
          description: error || t('errors.abandonedDescription'),
          icon: AlertTriangle,
          actions: [
            {
              label: t('actions.startNewTest'),
              onClick: () =>
                router.push(
                  `/test-templates/take/new?template=${templateId}`
                ),
              variant: 'default' as const,
            },
            {
              label: t('actions.toTestList'),
              onClick: () => router.push('/test-templates'),
              variant: 'outline' as const,
            },
          ],
        };
      }

      return {
        title: t('errors.invalidSession'),
        description: error || t('errors.invalidSessionDescription'),
        icon: AlertTriangle,
        actions: [
          {
            label: t('actions.toTestList'),
            onClick: () => router.push('/test-templates'),
            variant: 'default' as const,
          },
        ],
      };
    }

    if (isServerError) {
      return {
        title: t('errors.serverError'),
        description: error || t('errors.serverErrorDescription'),
        icon: AlertTriangle,
        actions: [
          {
            label: t('actions.tryAgain'),
            onClick: onRetry,
            variant: 'default' as const,
            icon: RefreshCw,
          },
          {
            label: t('actions.toTestList'),
            onClick: () => router.push('/test-templates'),
            variant: 'outline' as const,
          },
        ],
      };
    }

    return {
      title: t('errors.generic'),
      description: error || t('errors.genericDescription'),
      icon: XCircle,
      actions: [
        {
          label: t('actions.tryAgain'),
          onClick: onRetry,
          variant: 'default' as const,
          icon: RefreshCw,
        },
        {
          label: t('actions.toTestList'),
          onClick: () => router.push('/test-templates'),
          variant: 'outline' as const,
        },
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
          <CardTitle className="text-destructive">
            {errorConfig.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">
            {errorConfig.description}
          </p>
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
                disabled={
                  action.label === t('actions.tryAgain') && isRetrying
                }
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

// ============================================================================
// Loading Skeleton (with retry indicator)
// ============================================================================

function TestTakeSkeleton({
  retryAttempt = 0,
  isRetrying = false,
}: {
  retryAttempt?: number;
  isRetrying?: boolean;
}) {
  const t = useTranslations('template.take');

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
          {isRetrying && retryAttempt > 0 && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-sm">
                {t('loading.retrying', { attempt: retryAttempt, max: 3 })}
              </p>
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
