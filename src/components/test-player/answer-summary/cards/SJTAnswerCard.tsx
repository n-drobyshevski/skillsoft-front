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
      <span className="text-xs text-amber-400">{t('answerCard.skippedPreview')}</span>
    );
  }

  // Extract option letter from display text (e.g., "A: Some text...")
  const optionLetter = answerDisplayText.charAt(0);

  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-blue-500/20 text-blue-400 text-sm font-bold">
        {optionLetter}
      </div>
      <span className="text-xs text-neutral-400 truncate max-w-[120px]">
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
        <span className="text-sm text-amber-400">{t('answerCard.questionWasSkipped')}</span>
      </div>
    );
  }

  // Extract option letter and text
  const optionLetter = answerDisplayText.charAt(0);
  const optionText = answerDisplayText.substring(3); // Remove "A: " prefix

  return (
    <div className="py-2 space-y-3">
      {/* Truncated scenario context */}
      {scenario && (
        <div className="flex items-start gap-2 p-2.5 rounded-md bg-blue-950/20 border border-blue-800/30">
          <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-blue-300/70 leading-relaxed line-clamp-2">
            {scenario}
          </p>
        </div>
      )}

      <p className="text-xs text-neutral-500">{t('answerCard.selectedAnswer')}</p>
      <div
        className={cn(
          "flex items-start gap-3 p-3 rounded-lg",
          "border border-blue-500/50 bg-blue-500/10"
        )}
      >
        <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-blue-500 text-white text-sm font-bold">
          {optionLetter}
        </span>
        <span className="text-sm text-white leading-relaxed">
          {optionText}
        </span>
      </div>
    </div>
  );
}
