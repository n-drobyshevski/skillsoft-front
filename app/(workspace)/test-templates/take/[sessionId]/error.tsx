'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home, RefreshCw, FileText } from 'lucide-react';
import Link from 'next/link';

/**
 * Error Boundary for Test Taking Page
 *
 * Catches unhandled errors during test taking and provides user-friendly recovery options.
 * Handles specific test session errors differently from generic errors.
 */
export default function TestTakeError({
  error,
  reset,
}: {
  error: Error & { digest?: string; status?: number };
  reset: () => void;
}) {
  const t = useTranslations('template.take.errors');
  const tErrors = useTranslations('template.errors');

  useEffect(() => {
    // Log the error for debugging
    // eslint-disable-next-line no-console
    console.error('Test taking page error:', error);
  }, [error]);

  // Determine error type and appropriate message
  const isSessionError = error.message?.toLowerCase().includes('session') ||
                         error.message?.toLowerCase().includes('сессия');
  const isNotFoundError = error.status === 404;
  const isInvalidStateError = error.status === 400;

  const getErrorMessage = () => {
    if (isNotFoundError) {
      return {
        title: t('notFound'),
        description: t('notFoundDescription'),
      };
    }

    if (isInvalidStateError) {
      return {
        title: t('invalidSession'),
        description: t('invalidSessionDescription'),
      };
    }

    if (isSessionError) {
      return {
        title: tErrors('sessionError'),
        description: tErrors('sessionErrorDescription'),
      };
    }

    return {
      title: tErrors('errorOccurred'),
      description: tErrors('failedToLoad'),
    };
  };

  const { title, description } = getErrorMessage();
  const showRetryButton = !isNotFoundError && !isInvalidStateError;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-destructive">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-destructive">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error.digest && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono">
              {tErrors('errorId')}: {error.digest}
            </div>
          )}

          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded overflow-auto max-h-32">
              <p className="font-medium mb-1">{tErrors('devInfo')}:</p>
              <pre className="whitespace-pre-wrap">{error.message}</pre>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          {showRetryButton && (
            <Button onClick={reset} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              {tErrors('tryAgain')}
            </Button>
          )}

          <Button variant="outline" asChild className="w-full">
            <Link href="/test-templates">
              <FileText className="w-4 h-4 mr-2" />
              {tErrors('toTemplateList')}
            </Link>
          </Button>

          <Button variant="ghost" asChild className="w-full">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              {tErrors('toHome')}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
