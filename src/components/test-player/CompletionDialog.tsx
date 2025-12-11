'use client';

import React from 'react';
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
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
  isSubmitting: boolean;
}

/**
 * CompletionDialog - Confirmation before submitting assessment
 */
export function CompletionDialog({
  open,
  onOpenChange,
  onComplete,
  answeredCount,
  totalQuestions,
  isSubmitting,
}: CompletionDialogProps) {
  const completionPercentage = (answeredCount / totalQuestions) * 100;
  const allAnswered = answeredCount >= totalQuestions;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-slate-900 border-slate-800 max-w-md">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className={cn(
              "p-3 rounded-full",
              allAnswered ? "bg-emerald-500/20" : "bg-amber-500/20"
            )}>
              {allAnswered ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-amber-400" />
              )}
            </div>
          </div>
          
          <AlertDialogTitle className="text-center text-xl">
            {allAnswered ? 'Ready to Submit?' : 'Submit Incomplete?'}
          </AlertDialogTitle>
          
          <AlertDialogDescription className="text-center space-y-4">
            <p>
              {allAnswered 
                ? "You've answered all questions. Submit your assessment now?"
                : `You've answered ${answeredCount} of ${totalQuestions} questions.`
              }
            </p>

            {/* Progress indicator */}
            <div className="pt-2 space-y-2">
              <Progress 
                value={completionPercentage} 
                className="h-2 bg-slate-800"
              />
              <p className="text-sm text-slate-500">
                {answeredCount} / {totalQuestions} questions completed
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            className="bg-slate-800 border-slate-700 hover:bg-slate-700"
            disabled={isSubmitting}
          >
            Review Answers
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onComplete}
            disabled={isSubmitting}
            className={cn(
              "font-semibold",
              allAnswered
                ? "bg-emerald-600 hover:bg-emerald-500"
                : "bg-amber-600 hover:bg-amber-500"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Assessment'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}