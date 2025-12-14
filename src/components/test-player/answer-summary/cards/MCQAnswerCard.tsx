'use client';

import React from 'react';
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
  const isSkipped = answer?.isSkipped;
  const hasAnswer = answer?.selectedOptionIds?.length || answer?.textResponse;

  if (isSkipped || !hasAnswer) {
    return (
      <span className="text-xs text-amber-400">Пропущено</span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
      <span className="text-xs text-neutral-300 truncate max-w-[150px]">
        {answerDisplayText}
      </span>
    </div>
  );
}

/**
 * MCQAnswerExpanded - Shows selected option(s) in expanded view
 */
export function MCQAnswerExpanded({ answer, answerDisplayText }: MCQAnswerExpandedProps) {
  const isSkipped = answer?.isSkipped;
  const hasAnswer = answer?.selectedOptionIds?.length || answer?.textResponse;

  if (isSkipped || !hasAnswer) {
    return (
      <div className="text-center py-4">
        <span className="text-sm text-amber-400">Вопрос был пропущен</span>
      </div>
    );
  }

  // Handle text response (open text questions)
  if (answer?.textResponse) {
    return (
      <div className="py-2">
        <p className="text-xs text-neutral-500 mb-2">Ваш ответ:</p>
        <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
          <p className="text-sm text-neutral-300 whitespace-pre-wrap">
            {answer.textResponse}
          </p>
        </div>
      </div>
    );
  }

  // Handle selected options
  return (
    <div className="py-2">
      <p className="text-xs text-neutral-500 mb-2">Выбранный ответ:</p>
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg",
          "bg-emerald-500/10 border border-emerald-500/30"
        )}
      >
        <div className="w-5 h-5 rounded-full border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center shrink-0">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
        <span className="text-sm text-white">
          {answerDisplayText}
        </span>
      </div>
    </div>
  );
}
