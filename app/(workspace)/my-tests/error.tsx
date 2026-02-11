'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home, ClipboardList, WifiOff } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string; status?: number };
  reset: () => void;
}

/**
 * Error boundary for My Tests page
 * Handles network errors, auth errors, and general failures with retry capability
 */
export default function MyTestsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error for monitoring (could integrate with error tracking service)
    console.error('My Tests page error:', error);
  }, [error]);

  const isNetworkError =
    error.message?.toLowerCase().includes('network') ||
    error.message?.toLowerCase().includes('fetch') ||
    error.message?.toLowerCase().includes('failed to fetch');

  const isAuthError =
    (error as { status?: number }).status === 401 ||
    (error as { status?: number }).status === 403;

  const getErrorContent = () => {
    if (isAuthError) {
      return {
        icon: AlertCircle,
        iconClassName: 'text-amber-500',
        bgClassName: 'bg-amber-500/10',
        title: 'Доступ ограничен',
        description: 'Войдите в систему, чтобы просмотреть свои тесты.',
        showRetry: false,
        showSignIn: true,
      };
    }

    if (isNetworkError) {
      return {
        icon: WifiOff,
        iconClassName: 'text-blue-500',
        bgClassName: 'bg-blue-500/10',
        title: 'Ошибка соединения',
        description:
          'Не удалось загрузить данные. Проверьте подключение к интернету.',
        showRetry: true,
        showSignIn: false,
      };
    }

    return {
      icon: AlertCircle,
      iconClassName: 'text-destructive',
      bgClassName: 'bg-destructive/10',
      title: 'Не удалось загрузить тесты',
      description:
        'Произошла ошибка при загрузке ваших тестов. Попробуйте обновить страницу.',
      showRetry: true,
      showSignIn: false,
    };
  };

  const content = getErrorContent();
  const Icon = content.icon;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {/* Page Header - Same as main page for consistency */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <ClipboardList className="size-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Мои тесты
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Просматривайте назначенные тесты и отслеживайте прогресс
          </p>
        </header>

        {/* Error Card */}
        <div className="flex items-center justify-center py-8">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div
                className={`mx-auto mb-4 h-14 w-14 rounded-full ${content.bgClassName} flex items-center justify-center`}
              >
                <Icon className={`h-7 w-7 ${content.iconClassName}`} />
              </div>
              <CardTitle>{content.title}</CardTitle>
              <CardDescription className="text-base">
                {content.description}
              </CardDescription>
            </CardHeader>

            {error.digest && (
              <CardContent>
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono text-center">
                  Код ошибки: {error.digest}
                </div>
              </CardContent>
            )}

            <CardFooter className="flex flex-col gap-2">
              {content.showRetry && (
                <Button onClick={reset} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Попробовать снова
                </Button>
              )}

              {content.showSignIn && (
                <Button asChild className="w-full">
                  <Link href="/sign-in">Войти в систему</Link>
                </Button>
              )}

              <Button variant="outline" asChild className="w-full">
                <Link href="/test-templates">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Каталог тестов
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
      </div>
    </div>
  );
}
