'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function StartPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('template.start.errors');
  const tErrors = useTranslations('template.errors');

  useEffect(() => {
    // Log error to monitoring service
    console.error('Start page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-destructive bg-card backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t('failedToLoad')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {t('failedToLoadDescription')}
          </p>

          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
              {tErrors('errorId')}: {error.digest}
            </p>
          )}

          <div className="flex gap-3">
            <Button onClick={reset} variant="default">
              {tErrors('tryAgain')}
            </Button>
            <Button onClick={() => window.history.back()} variant="outline">
              {tErrors('goBack')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
