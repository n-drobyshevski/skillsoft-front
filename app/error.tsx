'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

/**
 * Global Error Boundary
 * 
 * Catches unhandled errors in all routes that don't have their own error.tsx.
 * Provides a user-friendly error page with retry and navigation options.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  useEffect(() => {
    // Log the error to an error reporting service
    // In production, this would be sent to a service like Sentry
    // eslint-disable-next-line no-console
    console.error('Global error caught:', error);

    if (typeof window !== 'undefined') {
      // Client-side error logging event
      window.dispatchEvent(new CustomEvent('app-error', { detail: error }));
    }
  }, [error]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6 items-center justify-center min-h-[400px]">
      <Card className="max-w-md w-full border-destructive">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-destructive">{t('somethingWentWrong')}</CardTitle>
          <CardDescription>
            {t('unexpectedError')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error.digest && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono">
              {t('errorId')}: {error.digest}
            </div>
          )}

          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded overflow-auto max-h-32">
              <p className="font-medium mb-1">{t('devInfo')}:</p>
              <pre className="whitespace-pre-wrap">{error.message}</pre>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('tryAgain')}
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                {t('backToHome')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
