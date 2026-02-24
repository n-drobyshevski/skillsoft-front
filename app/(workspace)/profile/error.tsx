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
import { AlertCircle, RefreshCw, Home, WifiOff } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string; status?: number };
  reset: () => void;
}

/**
 * Error boundary for Profile page
 * Handles network errors, auth errors, and general failures with retry capability
 */
export default function ProfileError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error for monitoring
    // eslint-disable-next-line no-console
    console.error('Profile page error:', error);
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
        iconClassName: 'text-amber-500 dark:text-amber-400',
        bgClassName: 'bg-amber-100 dark:bg-amber-900/30',
        title: 'Доступ ограничен',
        description: 'Войдите в систему, чтобы просмотреть свой профиль.',
        showRetry: false,
        showSignIn: true,
      };
    }

    if (isNetworkError) {
      return {
        icon: WifiOff,
        iconClassName: 'text-blue-500 dark:text-blue-400',
        bgClassName: 'bg-blue-100 dark:bg-blue-900/30',
        title: 'Ошибка соединения',
        description:
          'Не удалось загрузить данные профиля. Проверьте подключение к интернету.',
        showRetry: true,
        showSignIn: false,
      };
    }

    return {
      icon: AlertCircle,
      iconClassName: 'text-red-500 dark:text-red-400',
      bgClassName: 'bg-red-100 dark:bg-red-900/30',
      title: 'Не удалось загрузить профиль',
      description:
        'Произошла ошибка при загрузке вашего профиля. Попробуйте обновить страницу.',
      showRetry: true,
      showSignIn: false,
    };
  };

  const content = getErrorContent();
  const Icon = content.icon;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">

        {/* Error Card */}
        <div className="flex items-center justify-center py-8">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div
                className={`mx-auto mb-4 h-14 w-14 rounded-full ${content.bgClassName} flex items-center justify-center`}
              >
                <Icon className={`h-7 w-7 ${content.iconClassName}`} aria-hidden="true" />
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
                <Button onClick={reset} className="w-full min-h-[44px] touch-manipulation active:scale-[0.98]">
                  <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                  Попробовать снова
                </Button>
              )}

              {content.showSignIn && (
                <Button asChild className="w-full min-h-[44px] touch-manipulation active:scale-[0.98]">
                  <Link href="/sign-in">Войти в систему</Link>
                </Button>
              )}

              <Button variant="outline" asChild className="w-full min-h-[44px] touch-manipulation active:scale-[0.98]">
                <Link href="/dashboard">
                  <Home className="w-4 h-4 mr-2" aria-hidden="true" />
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
