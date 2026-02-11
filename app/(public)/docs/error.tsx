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
import { AlertTriangle, RefreshCw, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for Documentation section
 *
 * Catches unhandled errors in docs routes and provides
 * a user-friendly error page with retry and navigation options.
 */
export default function DocsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error for monitoring
    // eslint-disable-next-line no-console
    console.error('Documentation page error:', error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center py-12">
      <Card className="max-w-md w-full border-destructive/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <CardTitle className="text-destructive">
            Ошибка загрузки документации
          </CardTitle>
          <CardDescription className="text-base">
            Произошла ошибка при загрузке этой страницы. Попробуйте обновить
            страницу или вернуться на главную.
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
          <Button onClick={reset} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Попробовать снова
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/docs">
              <BookOpen className="w-4 h-4 mr-2" />
              К документации
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
