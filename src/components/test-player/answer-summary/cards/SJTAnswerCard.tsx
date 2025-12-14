'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { TestAnswer } from '@/types/domain';

interface SJTAnswerPreviewProps {
  answer: TestAnswer | null;
  answerDisplayText: string;
}

interface SJTAnswerExpandedProps {
  answer: TestAnswer | null;
  answerDisplayText: string;
}

/**
 * SJTAnswerPreview - Shows selected option letter (A, B, C, D) in collapsed view
 */
export function SJTAnswerPreview({ answer, answerDisplayText }: SJTAnswerPreviewProps) {
  const isSkipped = answer?.isSkipped;
  const hasAnswer = answer?.selectedOptionIds?.length;

  if (isSkipped || !hasAnswer) {
    return (
      <span className="text-xs text-amber-400">Пропущено</span>
    );
  }

  // Extract option letter from display text (e.g., "A: Some text...")
  const optionLetter = answerDisplayText.charAt(0);

  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-emerald-500/20 text-emerald-400 text-sm font-bold">
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
 */
export function SJTAnswerExpanded({ answer, answerDisplayText }: SJTAnswerExpandedProps) {
  const isSkipped = answer?.isSkipped;
  const hasAnswer = answer?.selectedOptionIds?.length;

  if (isSkipped || !hasAnswer) {
    return (
      <div className="text-center py-4">
        <span className="text-sm text-amber-400">Вопрос был пропущен</span>
      </div>
    );
  }

  // Extract option letter and text
  const optionLetter = answerDisplayText.charAt(0);
  const optionText = answerDisplayText.substring(3); // Remove "A: " prefix

  return (
    <div className="py-2">
      <p className="text-xs text-neutral-500 mb-2">Выбранный ответ:</p>
      <div
        className={cn(
          "flex items-start gap-3 p-3 rounded-lg",
          "border border-emerald-500/50 bg-emerald-500/10"
        )}
      >
        <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-emerald-500 text-white text-sm font-bold">
          {optionLetter}
        </span>
        <span className="text-sm text-white leading-relaxed">
          {optionText}
        </span>
      </div>
    </div>
  );
}
