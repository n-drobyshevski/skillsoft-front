'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TestAnswer } from '@/types/domain';

interface SJTAnswerPreviewProps {
  answer: TestAnswer | null;
  answerDisplayText: string;
}

interface SJTAnswerExpandedProps {
  answer: TestAnswer | null;
  answerDisplayText: string;
  scenario?: string;
}

/**
 * SJTAnswerPreview - Shows selected option letter (A, B, C, D) in collapsed view
 * Uses blue accent to visually distinguish SJT from MCQ
 */
export function SJTAnswerPreview({ answer, answerDisplayText }: SJTAnswerPreviewProps) {
  const t = useTranslations('assessment');
  const isSkipped = answer?.isSkipped;
  const hasAnswer = answer?.selectedOptionIds?.length;

  if (isSkipped || !hasAnswer) {
    return (
      <span className="text-xs text-[var(--zen-warning)]">{t('answerCard.skippedPreview')}</span>
    );
  }

  // Validate format: first char should be A-Z letter followed by ":"
  const isOptionFormat = /^[A-Z]:/.test(answerDisplayText.substring(0, 2));

  if (!isOptionFormat) {
    // Fallback: generic display when no option data available
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--zen-text-secondary)] truncate max-w-[120px]">
          {answerDisplayText}
        </span>
      </div>
    );
  }

  // Extract option letter from display text (e.g., "A: Some text...")
  const optionLetter = answerDisplayText.charAt(0);

  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-blue-500/20 text-[var(--zen-info)] text-sm font-bold">
        {optionLetter}
      </div>
      <span className="text-xs text-[var(--zen-text-secondary)] truncate max-w-[120px]">
        {answerDisplayText.substring(3)} {/* Remove "A: " prefix */}
      </span>
    </div>
  );
}

/**
 * SJTAnswerExpanded - Shows selected option with context in expanded view
 * Uses blue accent and optionally displays truncated scenario text
 */
export function SJTAnswerExpanded({ answer, answerDisplayText, scenario }: SJTAnswerExpandedProps) {
  const t = useTranslations('assessment');
  const isSkipped = answer?.isSkipped;
  const hasAnswer = answer?.selectedOptionIds?.length;

  if (isSkipped || !hasAnswer) {
    return (
      <div className="text-center py-4">
        <span className="text-sm text-[var(--zen-warning)]">{t('answerCard.questionWasSkipped')}</span>
      </div>
    );
  }

  // Validate format: first char should be A-Z letter followed by ":"
  const isOptionFormat = /^[A-Z]:/.test(answerDisplayText.substring(0, 2));

  // Extract option letter and text (with fallback for non-standard format)
  const optionLetter = isOptionFormat ? answerDisplayText.charAt(0) : '?';
  const optionText = isOptionFormat ? answerDisplayText.substring(3) : answerDisplayText;

  return (
    <div className="py-2 space-y-3">
      {/* Truncated scenario context */}
      {scenario && (
        <div className="flex items-start gap-2 p-2.5 rounded-md bg-[var(--zen-info-subtle)] border border-[var(--zen-info-border)]">
          <BookOpen className="w-3.5 h-3.5 text-[var(--zen-info)] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-[var(--zen-text-secondary)] leading-relaxed line-clamp-2">
            {scenario}
          </p>
        </div>
      )}

      <p className="text-xs text-[var(--zen-text-muted)]">{t('answerCard.selectedAnswer')}</p>
      <div
        className={cn(
          "flex items-start gap-3 p-3 rounded-lg",
          "border border-blue-500/50 bg-blue-500/10"
        )}
      >
        <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-blue-500 text-white text-sm font-bold">
          {optionLetter}
        </span>
        <span className="text-sm text-[var(--zen-text)] leading-relaxed">
          {optionText}
        </span>
      </div>
    </div>
  );
}
