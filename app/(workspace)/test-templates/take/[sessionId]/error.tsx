'use client';

import { useEffect } from 'react';
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
        title: 'Тест не найден',
        description: 'Сессия тестирования не найдена. Возможно, она была удалена или завершена.',
      };
    }

    if (isInvalidStateError) {
      return {
        title: 'Недействительная сессия',
        description: 'Эта сессия тестирования уже завершена или отменена.',
      };
    }

    if (isSessionError) {
      return {
        title: 'Ошибка сессии тестирования',
        description: 'Произошла ошибка при загрузке теста. Попробуйте вернуться к списку тестов и начать заново.',
      };
    }

    return {
      title: 'Произошла ошибка',
      description: 'Не удалось загрузить тест. Пожалуйста, попробуйте ещё раз.',
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
              Error ID: {error.digest}
            </div>
          )}

          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded overflow-auto max-h-32">
              <p className="font-medium mb-1">Dev Info:</p>
              <pre className="whitespace-pre-wrap">{error.message}</pre>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          {showRetryButton && (
            <Button onClick={reset} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Попробовать снова
            </Button>
          )}

          <Button variant="outline" asChild className="w-full">
            <Link href="/test-templates">
              <FileText className="w-4 h-4 mr-2" />
              К списку тестов
            </Link>
          </Button>

          <Button variant="ghost" asChild className="w-full">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              На главную
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
