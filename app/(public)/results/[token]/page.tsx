'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { anonymousTestApi, type PublicAnonymousResult } from '@/services/anonymousApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Clock,
  AlertTriangle,
  Trophy,
  XCircle,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type PageStatus = 'loading' | 'loaded' | 'expired' | 'error';

/**
 * Public Anonymous Result Page
 *
 * Displays test results using an HMAC-signed view token.
 * No authentication required — token validates access.
 * Tokens expire after 7 days by default.
 */
export default function PublicResultPage() {
  const params = useParams();
  const token = params.token as string;
  const t = useTranslations('anonymousTest');

  const [status, setStatus] = useState<PageStatus>('loading');
  const [result, setResult] = useState<PublicAnonymousResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    anonymousTestApi.getPublicResult(token)
      .then((data) => {
        setResult(data);
        setStatus('loaded');
      })
      .catch((err) => {
        if (err && typeof err === 'object' && 'status' in err) {
          if (err.status === 410) {
            setStatus('expired');
            return;
          }
        }
        setErrorMessage(err?.message || 'Failed to load results');
        setStatus('error');
      });
  }, [token]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Expired token
  if (status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>{t('result.failedTitle')}</CardTitle>
            <CardDescription>
              This result link has expired. Result links are valid for 7 days after test completion.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Error state
  if (status === 'error' || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-destructive/50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">{t('error.genericTitle')}</CardTitle>
            <CardDescription>{errorMessage || 'Unable to load results'}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Loaded — show results
  const passed = result.passed;
  const completedDate = result.completedAt
    ? new Date(result.completedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

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
          {result.templateName && (
            <CardDescription className="flex items-center justify-center gap-2 mt-1">
              <FileText className="h-4 w-4" />
              {result.templateName}
            </CardDescription>
          )}
          {result.takerName && (
            <p className="text-sm text-muted-foreground mt-1">
              {result.takerName}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score */}
          <div className="text-center">
            <p className="text-5xl font-bold text-primary">
              {result.overallPercentage?.toFixed(0) ?? 0}%
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {result.questionsAnswered ?? 0} / {result.totalQuestions ?? 0} {t('result.correct')}
            </p>
          </div>

          {/* Time taken */}
          {result.totalTimeSeconds != null && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {Math.floor(result.totalTimeSeconds / 60)}:{(result.totalTimeSeconds % 60).toString().padStart(2, '0')} {t('result.timeTaken')}
              </span>
            </div>
          )}

          {/* Competency breakdown */}
          {result.competencyBreakdown && result.competencyBreakdown.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm">{t('result.breakdown')}</h3>
              {result.competencyBreakdown.map((comp) => (
                <div key={comp.competencyId} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{comp.competencyName}</span>
                    <span className="font-medium">{comp.percentage?.toFixed(0) ?? 0}%</span>
                  </div>
                  <Progress value={comp.percentage ?? 0} className="h-2" />
                </div>
              ))}
            </div>
          )}

          {/* Completion date */}
          {completedDate && (
            <p className="text-xs text-center text-muted-foreground">
              Completed on {completedDate}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
