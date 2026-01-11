'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  anonymousTestApi,
  type AnonymousSessionResponse,
  type AnonymousCurrentQuestion,
  type AnonymousTakerInfo,
  type AnonymousTestResult,
  type ApiError,
} from '@/services/anonymousApi';
import { useUIStore } from '@/store/ui-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  ChevronLeft,
  ChevronRight,
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

type PageStatus = 'loading' | 'ready' | 'completing' | 'completed' | 'error';

/**
 * Anonymous Test Session Page
 *
 * The main test-taking interface for anonymous users.
 * Uses session access tokens for authentication.
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
  const [session, setSession] = useState<AnonymousSessionResponse | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<AnonymousCurrentQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [result, setResult] = useState<AnonymousTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Completion form state
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [takerInfo, setTakerInfo] = useState<AnonymousTakerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    notes: '',
  });

  // Confirm submit dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Enter immersive mode on mount
  useEffect(() => {
    enterImmersiveMode();
    return () => {
      exitImmersiveMode();
      if (timerRef.current) clearInterval(timerRef.current);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, [enterImmersiveMode, exitImmersiveMode]);

  /**
   * Load the session and current question.
   */
  const loadSession = useCallback(async () => {
    try {
      const credentials = anonymousTestApi.getCredentials();
      if (!credentials.accessToken || credentials.sessionId !== sessionId) {
        // Redirect to landing page if no valid session
        router.replace(`/take/${token}`);
        return;
      }

      const [sessionData, questionData] = await Promise.all([
        anonymousTestApi.getSession(sessionId, credentials.accessToken),
        anonymousTestApi.getCurrentQuestion(sessionId, credentials.accessToken),
      ]);

      setSession(sessionData);
      setCurrentQuestion(questionData);
      setTimeRemaining(questionData.timeRemainingSeconds);

      // Restore previous answer if exists
      const prevAnswer = questionData.previousAnswer;
      if (prevAnswer && prevAnswer.selectedOptionIds && prevAnswer.selectedOptionIds.length > 0) {
        setSelectedOption(prevAnswer.selectedOptionIds[0]);
      } else {
        setSelectedOption(null);
      }

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
   * Start the timer if time limit is set.
   */
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Sync time with server every 30 seconds
    syncIntervalRef.current = setInterval(() => {
      const credentials = anonymousTestApi.getCredentials();
      if (credentials.accessToken && timeRemaining !== null) {
        anonymousTestApi.updateTimeRemaining(
          sessionId,
          timeRemaining,
          credentials.accessToken
        ).catch(() => {
          // Ignore sync errors
        });
      }
    }, 30000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, [timeRemaining, sessionId]);

  /**
   * Handle time running out.
   */
  const handleTimeUp = useCallback(() => {
    toast.error(t('error.timeUp'));
    // The server will handle time-out calculation when we try to complete
    setShowCompletionForm(true);
  }, [t]);

  /**
   * Submit answer and move to next question.
   */
  const handleSubmitAnswer = useCallback(async () => {
    if (!currentQuestion || !selectedOption) return;

    setIsSubmitting(true);
    try {
      const credentials = anonymousTestApi.getCredentials();
      if (!credentials.accessToken) throw new Error('No session token');

      // Extract option index from ID (e.g., "option-0" -> 0)
      const optionIndex = parseInt(selectedOption.replace('option-', ''), 10);

      await anonymousTestApi.submitAnswer(
        sessionId,
        currentQuestion.question.id,
        optionIndex,
        credentials.accessToken
      );

      // Check if this was the last question
      if (currentQuestion.currentIndex >= currentQuestion.totalQuestions - 1) {
        setShowConfirmDialog(true);
      } else {
        // Navigate to next question
        await anonymousTestApi.navigateToQuestion(
          sessionId,
          currentQuestion.currentIndex + 1,
          credentials.accessToken
        );
        // Reload question
        await loadSession();
      }
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentQuestion, selectedOption, sessionId, loadSession]);

  /**
   * Navigate to previous question.
   */
  const handlePrevious = useCallback(async () => {
    if (!currentQuestion || currentQuestion.currentIndex <= 0) return;
    if (!currentQuestion.allowBackNavigation) return;

    setIsSubmitting(true);
    try {
      const credentials = anonymousTestApi.getCredentials();
      if (!credentials.accessToken) throw new Error('No session token');

      await anonymousTestApi.navigateToQuestion(
        sessionId,
        currentQuestion.currentIndex - 1,
        credentials.accessToken
      );
      await loadSession();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentQuestion, sessionId, loadSession]);

  /**
   * Skip current question.
   */
  const handleSkip = useCallback(async () => {
    if (!currentQuestion) return;
    if (!currentQuestion.allowSkip) return;

    setIsSubmitting(true);
    try {
      const credentials = anonymousTestApi.getCredentials();
      if (!credentials.accessToken) throw new Error('No session token');

      if (currentQuestion.currentIndex >= currentQuestion.totalQuestions - 1) {
        setShowConfirmDialog(true);
      } else {
        await anonymousTestApi.navigateToQuestion(
          sessionId,
          currentQuestion.currentIndex + 1,
          credentials.accessToken
        );
        await loadSession();
      }
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentQuestion, sessionId, loadSession]);

  /**
   * Complete the test with taker information.
   */
  const handleComplete = useCallback(async () => {
    if (!takerInfo.firstName || !takerInfo.lastName) {
      toast.error(t('error.nameRequired'));
      return;
    }

    setStatus('completing');
    try {
      const credentials = anonymousTestApi.getCredentials();
      if (!credentials.accessToken) throw new Error('No session token');

      const resultData = await anonymousTestApi.completeSession(
        sessionId,
        takerInfo,
        credentials.accessToken
      );

      setResult(resultData);
      setStatus('completed');
      setShowCompletionForm(false);
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message);
      setStatus('ready');
    }
  }, [sessionId, takerInfo, t]);

  /**
   * Format time remaining as MM:SS.
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  // Completed state - show results
  if (status === 'completed' && result) {
    const passed = result.passed;
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
                {result.overallPercentage.toFixed(0)}%
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {result.totalCorrect} / {result.totalQuestions} {t('result.correct')}
              </p>
            </div>

            {/* Time taken */}
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {Math.floor(result.totalTimeSeconds / 60)}:{(result.totalTimeSeconds % 60).toString().padStart(2, '0')} {t('result.timeTaken')}
              </span>
            </div>

            {/* Competency breakdown */}
            {result.competencyBreakdown && result.competencyBreakdown.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-sm">{t('result.breakdown')}</h3>
                {result.competencyBreakdown.map((comp) => (
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

  // Completion form
  if (showCompletionForm) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/30">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Send className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>{t('complete.title')}</CardTitle>
            <CardDescription>{t('complete.description')}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
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
                value={takerInfo.email}
                onChange={(e) => setTakerInfo({ ...takerInfo, email: e.target.value })}
                placeholder={t('complete.emailPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('complete.notes')}</Label>
              <Textarea
                id="notes"
                value={takerInfo.notes}
                onChange={(e) => setTakerInfo({ ...takerInfo, notes: e.target.value })}
                placeholder={t('complete.notesPlaceholder')}
                rows={3}
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button
              onClick={handleComplete}
              className="w-full"
              disabled={status === 'completing' || !takerInfo.firstName || !takerInfo.lastName}
            >
              {status === 'completing' ? (
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
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Main test-taking interface
  if (status === 'ready' && session && currentQuestion) {
    const { question } = currentQuestion;
    const progress = ((currentQuestion.currentIndex + 1) / currentQuestion.totalQuestions) * 100;

    return (
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header with progress and timer */}
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex-1">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {t('progress.question')} {currentQuestion.currentIndex + 1} / {currentQuestion.totalQuestions}
              </p>
            </div>
            {timeRemaining !== null && (
              <div className={cn(
                "flex items-center gap-2 ml-4 px-3 py-1 rounded-full",
                timeRemaining < 60 ? "bg-destructive/10 text-destructive" : "bg-muted"
              )}>
                <Clock className="h-4 w-4" />
                <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Question content */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg leading-relaxed">
                  {question.questionText}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <RadioGroup
                  value={selectedOption || ''}
                  onValueChange={setSelectedOption}
                  className="space-y-3"
                >
                  {question.answerOptions.map((option) => (
                    <label
                      key={option.id}
                      className={cn(
                        "flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors",
                        selectedOption === option.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <RadioGroupItem value={option.id} className="mt-0.5" />
                      <span className="text-sm leading-relaxed">{option.text}</span>
                    </label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer with navigation */}
        <div className="sticky bottom-0 z-10 bg-background border-t px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={
                isSubmitting ||
                currentQuestion.currentIndex <= 0 ||
                !currentQuestion.allowBackNavigation
              }
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              {t('action.previous')}
            </Button>

            <div className="flex gap-2">
              {currentQuestion.allowSkip && (
                <Button variant="ghost" onClick={handleSkip} disabled={isSubmitting}>
                  {t('action.skip')}
                </Button>
              )}

              <Button
                onClick={handleSubmitAnswer}
                disabled={isSubmitting || !selectedOption}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : currentQuestion.currentIndex >= currentQuestion.totalQuestions - 1 ? (
                  <>
                    {t('action.finish')}
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    {t('action.next')}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Confirm completion dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('confirm.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('confirm.description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('confirm.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                setShowConfirmDialog(false);
                setShowCompletionForm(true);
              }}>
                {t('confirm.proceed')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return null;
}
