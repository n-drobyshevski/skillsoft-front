'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Loader2, AlertTriangle, SkipForward } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface CompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  answeredCount: number;
  totalQuestions: number;
  skippedCount?: number;
  isSubmitting: boolean;
}

/**
 * CompletionDialog - Confirmation before submitting assessment
 *
 * Features:
 * - Shows completion status (all answered vs incomplete)
 * - Displays skipped questions warning if any
 * - Progress indicator with percentage
 * - Submit and Review buttons
 */
export function CompletionDialog({
  open,
  onOpenChange,
  onComplete,
  answeredCount,
  totalQuestions,
  skippedCount = 0,
  isSubmitting,
}: CompletionDialogProps) {
  const t = useTranslations('assessment');
  const completionPercentage = (answeredCount / totalQuestions) * 100;
  const allAnswered = answeredCount >= totalQuestions;
  const hasSkipped = skippedCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[var(--zen-surface)] border-[var(--zen-border)] text-[var(--zen-text)] backdrop-blur-xl max-w-md">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className={cn(
              "p-3 rounded-full",
              allAnswered && !hasSkipped ? "bg-emerald-500/20" : "bg-amber-500/20"
            )}>
              {allAnswered && !hasSkipped ? (
                <CheckCircle2 className="w-8 h-8 text-[var(--zen-success)]" />
              ) : hasSkipped ? (
                <SkipForward className="w-8 h-8 text-[var(--zen-warning)]" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-[var(--zen-warning)]" />
              )}
            </div>
          </div>

          <AlertDialogTitle className="text-center text-xl text-[var(--zen-text)]">
            {allAnswered && !hasSkipped
              ? t('readyToSubmit')
              : hasSkipped
                ? t('hasSkippedQuestions')
                : t('submitIncomplete')
            }
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center space-y-4 text-[var(--zen-text-secondary)]" asChild>
            <div>
              <p>
                {allAnswered && !hasSkipped
                  ? t('allQuestionsAnswered')
                  : hasSkipped
                    ? t('skippedQuestionsWarning', { count: skippedCount })
                    : t('answeredOfTotal', { answered: answeredCount, total: totalQuestions })
                }
              </p>

              {/* Skipped questions warning */}
              {hasSkipped && (
                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-sm text-[var(--zen-warning)] flex items-center justify-center gap-2">
                    <SkipForward className="w-4 h-4" />
                    {t('skippedQuestionsCount', { count: skippedCount })}
                  </p>
                  <p className="text-xs text-[var(--zen-text-muted)] mt-1">
                    {t('canGoBackToAnswer')}
                  </p>
                </div>
              )}

              {/* Progress indicator */}
              <div className="pt-2 space-y-2">
                <Progress
                  value={completionPercentage}
                  className="h-2 bg-[var(--zen-track)]"
                />
                <p className="text-sm text-[var(--zen-text-muted)]">
                  {t('questionsAnswered', { answered: answeredCount, total: totalQuestions })}
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel
            className="bg-[var(--zen-track)] border-[var(--zen-muted)] text-[var(--zen-text)] hover:bg-[var(--zen-muted)] hover:text-[var(--zen-text)]"
            disabled={isSubmitting}
          >
            {hasSkipped ? t('returnToQuestions') : t('reviewAnswers')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onComplete}
            disabled={isSubmitting}
            className={cn(
              "font-semibold",
              allAnswered && !hasSkipped
                ? "bg-emerald-600 hover:bg-emerald-500"
                : "bg-amber-600 hover:bg-amber-500"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('submitting')}
              </>
            ) : (
              t('submitAssessment')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}