'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubmissionError } from '@/store/review-store';
import { cn } from '@/lib/utils';

interface SubmissionProgressProps {
  isSubmitting: boolean;
  error: SubmissionError | null;
  attempts: number;
  onRetry: () => void;
  onCancel: () => void;
}

/**
 * SubmissionProgress - Full-screen overlay for submission status
 *
 * Shows:
 * - Loading spinner during submission
 * - Error state with retry option
 * - Attempt counter for retries
 */
export function SubmissionProgress({
  isSubmitting,
  error,
  attempts,
  onRetry,
  onCancel,
}: SubmissionProgressProps) {
  const t = useTranslations('assessment');

  if (!isSubmitting && !error) return null;

  return (
    <div
      className="fixed inset-0 bg-neutral-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in-0 duration-200 motion-reduce:animate-none"
    >
      <div
        className="max-w-sm w-full animate-in fade-in-0 zoom-in-95 duration-200 delay-100 motion-reduce:animate-none"
      >
        {isSubmitting ? (
          // Loading state
          <div className="text-center">
            <div className="mb-6">
              <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {t('submission.submittingResults')}
            </h3>
            <p className="text-sm text-neutral-400">
              {t('submission.pleaseWait')}
            </p>
            {attempts > 1 && (
              <p className="text-xs text-neutral-500 mt-3">
                {t('submission.attemptOf', { current: attempts, max: 3 })}
              </p>
            )}
          </div>
        ) : error ? (
          // Error state
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {t('submission.submissionError')}
            </h3>
            <p className="text-sm text-neutral-400 mb-6">
              {error.message}
            </p>

            <div className="flex flex-col gap-3">
              {error.isRetryable && attempts < 3 && (
                <Button
                  onClick={onRetry}
                  className="w-full bg-emerald-600 hover:bg-emerald-500"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('submission.retryButton')}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onCancel}
                className="w-full border-neutral-700 hover:bg-neutral-800"
              >
                <X className="w-4 h-4 mr-2" />
                {t('submission.backToReview')}
              </Button>
            </div>

            {attempts >= 3 && (
              <p className="text-xs text-neutral-500 mt-4">
                {t('submission.maxAttemptsExceeded')}
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
