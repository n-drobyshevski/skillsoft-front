'use client';

import React from 'react';
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
  const completionPercentage = (answeredCount / totalQuestions) * 100;
  const allAnswered = answeredCount >= totalQuestions;
  const hasSkipped = skippedCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-neutral-900 border-neutral-800 max-w-md">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className={cn(
              "p-3 rounded-full",
              allAnswered && !hasSkipped ? "bg-emerald-500/20" : "bg-amber-500/20"
            )}>
              {allAnswered && !hasSkipped ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              ) : hasSkipped ? (
                <SkipForward className="w-8 h-8 text-amber-400" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-amber-400" />
              )}
            </div>
          </div>

          <AlertDialogTitle className="text-center text-xl">
            {allAnswered && !hasSkipped
              ? 'Готовы к отправке?'
              : hasSkipped
                ? 'Есть пропущенные вопросы'
                : 'Отправить неполный тест?'
            }
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center space-y-4" asChild>
            <div>
              <p>
                {allAnswered && !hasSkipped
                  ? 'Вы ответили на все вопросы. Отправить оценку сейчас?'
                  : hasSkipped
                    ? `Вы пропустили ${skippedCount} ${skippedCount === 1 ? 'вопрос' : skippedCount < 5 ? 'вопроса' : 'вопросов'}. Они будут засчитаны как неотвеченные.`
                    : `Вы ответили на ${answeredCount} из ${totalQuestions} вопросов.`
                }
              </p>

              {/* Skipped questions warning */}
              {hasSkipped && (
                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-sm text-amber-400 flex items-center justify-center gap-2">
                    <SkipForward className="w-4 h-4" />
                    {skippedCount} {skippedCount === 1 ? 'пропущенный вопрос' : skippedCount < 5 ? 'пропущенных вопроса' : 'пропущенных вопросов'}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Вы можете вернуться и ответить на них
                  </p>
                </div>
              )}

              {/* Progress indicator */}
              <div className="pt-2 space-y-2">
                <Progress
                  value={completionPercentage}
                  className="h-2 bg-neutral-800"
                />
                <p className="text-sm text-neutral-500">
                  {answeredCount} / {totalQuestions} вопросов отвечено
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel
            className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700"
            disabled={isSubmitting}
          >
            {hasSkipped ? 'Вернуться к вопросам' : 'Просмотреть ответы'}
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
                Отправка...
              </>
            ) : (
              'Отправить оценку'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}