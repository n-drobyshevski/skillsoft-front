'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TestAnswer } from '@/types/domain';

interface MCQAnswerPreviewProps {
  answer: TestAnswer | null;
  answerDisplayText: string;
}

interface MCQAnswerExpandedProps {
  answer: TestAnswer | null;
  answerDisplayText: string;
}

/**
 * MCQAnswerPreview - Shows selected option with checkmark in collapsed view
 */
export function MCQAnswerPreview({ answer, answerDisplayText }: MCQAnswerPreviewProps) {
  const t = useTranslations('assessment');
  const isSkipped = answer?.isSkipped;
  const hasAnswer = answer?.selectedOptionIds?.length || answer?.textResponse;

  if (isSkipped || !hasAnswer) {
    return (
      <span className="text-xs text-[var(--zen-warning)]">{t('answerCard.skippedPreview')}</span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <CheckCircle className="w-4 h-4 text-[var(--zen-success)] shrink-0" />
      <span className="text-xs text-[var(--zen-text-secondary)] truncate max-w-[150px]">
        {answerDisplayText}
      </span>
    </div>
  );
}

/**
 * MCQAnswerExpanded - Shows selected option(s) in expanded view
 */
export function MCQAnswerExpanded({ answer, answerDisplayText }: MCQAnswerExpandedProps) {
  const t = useTranslations('assessment');
  const isSkipped = answer?.isSkipped;
  const hasAnswer = answer?.selectedOptionIds?.length || answer?.textResponse;

  if (isSkipped || !hasAnswer) {
    return (
      <div className="text-center py-4">
        <span className="text-sm text-[var(--zen-warning)]">{t('answerCard.questionWasSkipped')}</span>
      </div>
    );
  }

  // Handle text response (open text questions)
  if (answer?.textResponse) {
    return (
      <div className="py-2">
        <p className="text-xs text-[var(--zen-text-muted)] mb-2">{t('answerCard.yourAnswer')}</p>
        <div className="p-3 rounded-lg bg-[var(--zen-ghost-hover)] border border-[var(--zen-muted)]">
          <p className="text-sm text-[var(--zen-text-secondary)] whitespace-pre-wrap">
            {answer.textResponse}
          </p>
        </div>
      </div>
    );
  }

  // Handle selected options
  return (
    <div className="py-2">
      <p className="text-xs text-[var(--zen-text-muted)] mb-2">{t('answerCard.selectedAnswer')}</p>
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg",
          "bg-emerald-500/10 border border-emerald-500/30"
        )}
      >
        <div className="w-5 h-5 rounded-full border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center shrink-0">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
        <span className="text-sm text-[var(--zen-text)]">
          {answerDisplayText}
        </span>
      </div>
    </div>
  );
}
