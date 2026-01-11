'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { anonymousTestApi, type AnonymousSessionResponse, type ApiError } from '@/services/anonymousApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Loader2,
  RefreshCw,
  Shield,
} from 'lucide-react';

type PageStatus = 'loading' | 'ready' | 'error';

interface ErrorState {
  title: string;
  message: string;
  code?: string;
  canRetry: boolean;
}

/**
 * Anonymous Test Landing Page
 *
 * This page is accessed via share link (e.g., /take/abc123).
 * It validates the share link token, displays template information,
 * and allows the user to start the test.
 */
export default function AnonymousTestLandingPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const t = useTranslations('anonymousTest');

  const [status, setStatus] = useState<PageStatus>('loading');
  const [session, setSession] = useState<AnonymousSessionResponse | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  /**
   * Create a new session when the page loads.
   * This validates the share link and creates a session.
   */
  const initSession = useCallback(async () => {
    if (!token) {
      setError({
        title: t('error.invalidLink'),
        message: t('error.noToken'),
        canRetry: false,
      });
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      // Check if we already have a session for this token
      const stored = anonymousTestApi.getCredentials();
      if (stored.sessionId && stored.accessToken) {
        // Try to resume existing session
        try {
          const existingSession = await anonymousTestApi.getSession(
            stored.sessionId,
            stored.accessToken
          );
          setSession(existingSession);
          setStatus('ready');
          return;
        } catch {
          // Session expired or invalid, clear and create new
          anonymousTestApi.clearCredentials();
        }
      }

      // Create new session
      const newSession = await anonymousTestApi.createSession(token);
      setSession(newSession);
      setStatus('ready');
    } catch (err) {
      const apiError = err as ApiError;
      setError(mapError(apiError, t));
      setStatus('error');
    }
  }, [token, t]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  /**
   * Start the test and navigate to the test-taking page.
   */
  const handleStartTest = useCallback(() => {
    if (!session) return;

    setIsStarting(true);
    // Navigate to the test-taking page
    router.push(`/take/${token}/session/${session.sessionId}`);
  }, [router, token, session]);

  /**
   * Retry loading the session.
   */
  const handleRetry = useCallback(() => {
    anonymousTestApi.clearCredentials();
    initSession();
  }, [initSession]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/30">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-1/2" />
              <Skeleton className="h-12 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (status === 'error' && error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/30">
        <Card className="w-full max-w-lg border-destructive/50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">{error.title}</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
          {error.canRetry && (
            <CardFooter className="justify-center">
              <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('action.tryAgain')}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    );
  }

  // Ready state - show template info and start button
  if (status === 'ready' && session) {
    const { template } = session;

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/30">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{template.name}</CardTitle>
            {template.description && (
              <CardDescription className="mt-2">{template.description}</CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Test Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('info.questions')}</p>
                  <p className="font-semibold">{template.questionCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('info.timeLimit')}</p>
                  <p className="font-semibold">
                    {template.timeLimitMinutes
                      ? t('info.minutes', { count: template.timeLimitMinutes })
                      : t('info.noTimeLimit')}
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {template.allowSkip ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span>{t('feature.skipQuestions')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {template.allowBackNavigation ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span>{t('feature.backNavigation')}</span>
              </div>
            </div>

            {/* Privacy Notice */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>{t('privacy.title')}</AlertTitle>
              <AlertDescription>{t('privacy.description')}</AlertDescription>
            </Alert>
          </CardContent>

          <CardFooter>
            <Button
              onClick={handleStartTest}
              className="w-full"
              size="lg"
              disabled={isStarting}
            >
              {isStarting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('action.starting')}
                </>
              ) : (
                <>
                  {t('action.startTest')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return null;
}

/**
 * Map API error to user-friendly error state.
 */
function mapError(error: ApiError, t: (key: string) => string): ErrorState {
  const code = error.code || 'UNKNOWN';

  switch (code) {
    case 'LINK_NOT_FOUND':
      return {
        title: t('error.linkNotFound'),
        message: t('error.linkNotFoundDesc'),
        code,
        canRetry: false,
      };
    case 'LINK_EXPIRED':
      return {
        title: t('error.linkExpired'),
        message: t('error.linkExpiredDesc'),
        code,
        canRetry: false,
      };
    case 'LINK_REVOKED':
      return {
        title: t('error.linkRevoked'),
        message: t('error.linkRevokedDesc'),
        code,
        canRetry: false,
      };
    case 'LINK_MAX_USES_REACHED':
      return {
        title: t('error.linkMaxUses'),
        message: t('error.linkMaxUsesDesc'),
        code,
        canRetry: false,
      };
    case 'TEMPLATE_NOT_READY':
      return {
        title: t('error.testNotReady'),
        message: t('error.testNotReadyDesc'),
        code,
        canRetry: false,
      };
    case 'RATE_LIMIT_EXCEEDED':
      return {
        title: t('error.rateLimited'),
        message: t('error.rateLimitedDesc'),
        code,
        canRetry: true,
      };
    default:
      return {
        title: t('error.genericTitle'),
        message: t('error.genericDesc'),
        code,
        canRetry: true,
      };
  }
}
