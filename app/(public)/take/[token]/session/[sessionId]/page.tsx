'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  anonymousTestApi,
  type AnonymousTakerInfo as ApiTakerInfo,
  type AnonymousTestResult,
  type ApiError,
} from '@/services/anonymousApi';
import { useUIStore } from '@/store/ui-store';
import { TestSessionProvider } from '@/context/test-session-context';
import { createAnonymousAdapter, type AnonymousTakerInfo, type CompletionResult } from '@/adapters';
import { ImmersivePlayer } from '@/components/test-player/ImmersivePlayer';
import { TestSession, CurrentQuestionResponse, SessionStatus, QuestionType, DifficultyLevel } from '@/types/domain';
import { type ApiError as ClientApiError } from '@/services/api.client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Clock,
  Send,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Trophy,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type PageStatus = 'loading' | 'ready' | 'error';

/**
 * Anonymous Test Session Page
 *
 * Uses the ImmersivePlayer component for a consistent test-taking experience
 * between authenticated and anonymous users.
 *
 * Flow:
 * 1. Load session and question data
 * 2. Show ImmersivePlayer for test-taking
 * 3. On completion, show taker info dialog
 * 4. Submit and show inline results
 */
export default function AnonymousTestSessionPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const sessionId = params.sessionId as string;
  const t = useTranslations('anonymousTest');

  // Zustand store for immersive mode
  const enterImmersiveMode = useUIStore((state) => state.enterImmersiveMode);
  const exitImmersiveMode = useUIStore((state) => state.exitImmersiveMode);

  // State
  const [status, setStatus] = useState<PageStatus>('loading');
  const [session, setSession] = useState<TestSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Completion flow state
  const [showTakerInfoDialog, setShowTakerInfoDialog] = useState(false);
  const [pendingResult, setPendingResult] = useState<CompletionResult | null>(null);
  const [takerInfo, setTakerInfo] = useState<AnonymousTakerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    notes: '',
  });
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);

  // Final results state
  const [finalResult, setFinalResult] = useState<AnonymousTestResult | null>(null);

  // Get access token from storage
  const accessToken = useMemo(() => {
    const credentials = anonymousTestApi.getCredentials();
    return credentials.accessToken;
  }, []);

  // Create adapter - memoized to prevent unnecessary recreations
  const adapter = useMemo(() => {
    if (!accessToken) return null;
    return createAnonymousAdapter(accessToken);
  }, [accessToken]);

  // Enter immersive mode on mount
  useEffect(() => {
    enterImmersiveMode();
    return () => exitImmersiveMode();
  }, [enterImmersiveMode, exitImmersiveMode]);

  /**
   * Load the session and current question.
   * Normalizes anonymous API responses to match the authenticated API types.
   */
  const loadSession = useCallback(async () => {
    try {
      const credentials = anonymousTestApi.getCredentials();
      if (!credentials.accessToken || credentials.sessionId !== sessionId) {
        // Redirect to landing page if no valid session
        router.replace(`/take/${token}`);
        return;
      }

      // Load session and question data in parallel
      const [sessionData, questionData] = await Promise.all([
        anonymousTestApi.getSession(sessionId, credentials.accessToken),
        anonymousTestApi.getCurrentQuestion(sessionId, credentials.accessToken),
      ]);

      // Normalize session data to TestSession type
      const normalizedSession: TestSession = {
        id: sessionData.sessionId,
        templateId: sessionData.template.id,
        templateName: sessionData.template.name,
        clerkUserId: '', // Anonymous sessions don't have a Clerk user
        status: 'IN_PROGRESS' as SessionStatus,
        currentQuestionIndex: questionData.currentIndex,
        questionOrder: [], // Not exposed in anonymous API
        totalQuestions: sessionData.template.questionCount,
        answeredQuestions: 0, // Not tracked in anonymous API
        createdAt: new Date().toISOString(),
      };

      // Normalize question data to CurrentQuestionResponse type
      const normalizedQuestion: CurrentQuestionResponse = {
        sessionId: sessionId,
        question: {
          id: questionData.question.id,
          questionText: questionData.question.questionText,
          questionType: questionData.question.questionType as QuestionType,
          answerOptions: questionData.question.answerOptions.map((opt, idx) => ({
            id: opt.id || `option-${idx}`,
            text: opt.text,
            score: opt.score,
          })),
          difficultyLevel: (questionData.question.difficultyLevel || 'INTERMEDIATE') as DifficultyLevel,
          timeLimit: questionData.question.timeLimit ?? undefined,
          behavioralIndicatorId: '',
          competencyId: undefined,
        },
        questionIndex: questionData.currentIndex,
        totalQuestions: questionData.totalQuestions,
        previousAnswer: questionData.previousAnswer?.selectedOptionIds?.length
          ? {
              sessionId: sessionId,
              questionId: questionData.question.id,
              selectedOptionIds: questionData.previousAnswer.selectedOptionIds,
              timeSpentSeconds: 0,
              isSkipped: false,
            }
          : undefined,
        allowSkip: questionData.allowSkip,
        allowBackNavigation: questionData.allowBackNavigation,
        timeRemainingSeconds: questionData.timeRemainingSeconds ?? undefined,
      };

      setSession(normalizedSession);
      setCurrentQuestion(normalizedQuestion);
      setStatus('ready');
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.status === 401 || apiError.status === 410) {
        // Session invalid or expired
        anonymousTestApi.clearCredentials();
        router.replace(`/take/${token}`);
        return;
      }
      setError(apiError.message);
      setStatus('error');
    }
  }, [sessionId, token, router]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  /**
   * Handle test completion from ImmersivePlayer.
   * This intercepts the completion to show the taker info dialog.
   */
  const handleReadyToComplete = useCallback((result: CompletionResult) => {
    // Store the pending result and show taker info dialog
    setPendingResult(result);
    setShowTakerInfoDialog(true);
  }, []);

  /**
   * Submit taker info and complete the session.
   */
  const handleSubmitTakerInfo = useCallback(async () => {
    if (!takerInfo.firstName || !takerInfo.lastName) {
      toast.error(t('error.nameRequired'));
      return;
    }

    if (!adapter) {
      toast.error(t('error.sessionExpired'));
      return;
    }

    setIsSubmittingInfo(true);
    try {
      // Complete the session with taker info
      const result = await adapter.completeSession(sessionId, takerInfo);

      // Set final result for display
      if (result.inlineResult) {
        setFinalResult({
          id: result.inlineResult.id,
          sessionId: result.inlineResult.sessionId,
          overallPercentage: result.inlineResult.overallPercentage,
          totalCorrect: result.inlineResult.totalCorrect,
          totalQuestions: result.inlineResult.totalQuestions,
          totalTimeSeconds: result.inlineResult.totalTimeSeconds,
          passed: result.inlineResult.passed,
          competencyBreakdown: result.inlineResult.competencyBreakdown,
        });
      }

      setShowTakerInfoDialog(false);
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message);
    } finally {
      setIsSubmittingInfo(false);
    }
  }, [sessionId, takerInfo, adapter, t]);

  /**
   * Handle abandon from ImmersivePlayer.
   */
  const handleAbandon = useCallback(() => {
    anonymousTestApi.clearCredentials();
    router.replace(`/take/${token}`);
  }, [router, token]);

  /**
   * Handle errors from ImmersivePlayer.
   */
  const handleError = useCallback((apiError: ClientApiError) => {
    if (apiError.status === 401 || apiError.status === 410) {
      anonymousTestApi.clearCredentials();
      router.replace(`/take/${token}`);
    } else {
      setError(apiError.message);
      setStatus('error');
    }
  }, [router, token]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-1/4 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-destructive/50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">{t('error.genericTitle')}</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => router.replace(`/take/${token}`)} variant="outline">
              {t('action.tryAgain')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Completed state - show inline results
  if (finalResult) {
    const passed = finalResult.passed;
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/30">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className={cn(
              "mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4",
              passed ? "bg-green-100 dark:bg-green-900/30" : "bg-orange-100 dark:bg-orange-900/30"
            )}>
              {passed ? (
                <Trophy className="h-10 w-10 text-green-600 dark:text-green-400" />
              ) : (
                <AlertTriangle className="h-10 w-10 text-orange-600 dark:text-orange-400" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {passed ? t('result.passedTitle') : t('result.failedTitle')}
            </CardTitle>
            <CardDescription>
              {t('result.thankYou')}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Score */}
            <div className="text-center">
              <p className="text-5xl font-bold text-primary">
                {finalResult.overallPercentage.toFixed(0)}%
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {finalResult.totalCorrect} / {finalResult.totalQuestions} {t('result.correct')}
              </p>
            </div>

            {/* Time taken */}
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {Math.floor(finalResult.totalTimeSeconds / 60)}:{(finalResult.totalTimeSeconds % 60).toString().padStart(2, '0')} {t('result.timeTaken')}
              </span>
            </div>

            {/* Competency breakdown */}
            {finalResult.competencyBreakdown && finalResult.competencyBreakdown.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-sm">{t('result.breakdown')}</h3>
                {finalResult.competencyBreakdown.map((comp) => (
                  <div key={comp.competencyId} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{comp.competencyName}</span>
                      <span className="font-medium">{comp.percentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={comp.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          <CardFooter>
            <Button
              onClick={() => {
                anonymousTestApi.clearCredentials();
                window.close();
              }}
              className="w-full"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {t('action.closeWindow')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Main test-taking interface - use ImmersivePlayer
  if (status === 'ready' && session && currentQuestion && adapter) {
    return (
      <>
        <TestSessionProvider adapter={adapter}>
          <ImmersivePlayer
            session={session}
            initialQuestion={currentQuestion}
            testDriveMode={false} // HR-only feature
            onComplete={handleReadyToComplete}
            onAbandon={handleAbandon}
            onError={handleError}
          />
        </TestSessionProvider>

        {/* Taker Info Dialog */}
        <Dialog open={showTakerInfoDialog} onOpenChange={setShowTakerInfoDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Send className="h-8 w-8 text-primary" />
              </div>
              <DialogTitle>{t('complete.title')}</DialogTitle>
              <DialogDescription>{t('complete.description')}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('complete.firstName')} *</Label>
                  <Input
                    id="firstName"
                    value={takerInfo.firstName}
                    onChange={(e) => setTakerInfo({ ...takerInfo, firstName: e.target.value })}
                    placeholder={t('complete.firstNamePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('complete.lastName')} *</Label>
                  <Input
                    id="lastName"
                    value={takerInfo.lastName}
                    onChange={(e) => setTakerInfo({ ...takerInfo, lastName: e.target.value })}
                    placeholder={t('complete.lastNamePlaceholder')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('complete.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={takerInfo.email || ''}
                  onChange={(e) => setTakerInfo({ ...takerInfo, email: e.target.value })}
                  placeholder={t('complete.emailPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t('complete.notes')}</Label>
                <Textarea
                  id="notes"
                  value={takerInfo.notes || ''}
                  onChange={(e) => setTakerInfo({ ...takerInfo, notes: e.target.value })}
                  placeholder={t('complete.notesPlaceholder')}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={handleSubmitTakerInfo}
                className="w-full"
                disabled={isSubmittingInfo || !takerInfo.firstName || !takerInfo.lastName}
              >
                {isSubmittingInfo ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('complete.submitting')}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {t('complete.submit')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return null;
}
