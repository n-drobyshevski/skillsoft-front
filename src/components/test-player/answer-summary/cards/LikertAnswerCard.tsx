'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { TestAnswer } from '@/types/domain';

interface LikertAnswerPreviewProps {
  answer: TestAnswer | null;
}

interface LikertAnswerExpandedProps {
  answer: TestAnswer | null;
}

// Default Likert scale labels (Russian)
const LIKERT_LABELS = [
  'Категорически не согласен',
  'Не согласен',
  'Нейтрально',
  'Согласен',
  'Полностью согласен',
];

/**
 * LikertAnswerPreview - Compact dot visualization for collapsed card
 */
export function LikertAnswerPreview({ answer }: LikertAnswerPreviewProps) {
  const selectedValue = answer?.likertValue;
  const isSkipped = answer?.isSkipped;

  if (isSkipped || selectedValue === undefined) {
    return (
      <span className="text-xs text-amber-400">Пропущено</span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <div
          key={value}
          className={cn(
            "w-2 h-2 rounded-full transition-all",
            selectedValue === value
              ? "bg-emerald-500 scale-125"
              : "bg-neutral-700"
          )}
        />
      ))}
      <span className="ml-1.5 text-xs text-neutral-400 tabular-nums">
        {selectedValue}/5
      </span>
    </div>
  );
}

/**
 * LikertAnswerExpanded - Full scale visualization for expanded card
 */
export function LikertAnswerExpanded({ answer }: LikertAnswerExpandedProps) {
  const selectedValue = answer?.likertValue;
  const isSkipped = answer?.isSkipped;

  if (isSkipped || selectedValue === undefined) {
    return (
      <div className="text-center py-4">
        <span className="text-sm text-amber-400">Вопрос был пропущен</span>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="flex justify-between items-end gap-2">
        {[1, 2, 3, 4, 5].map((value) => {
          const isSelected = selectedValue === value;
          const label = LIKERT_LABELS[value - 1];

          return (
            <div
              key={value}
              className={cn(
                "flex flex-col items-center gap-2 flex-1",
                isSelected ? "text-emerald-400" : "text-neutral-500"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-bold text-lg",
                  isSelected
                    ? "bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400"
                    : "bg-neutral-800 border border-neutral-700 text-neutral-500"
                )}
              >
                {value}
              </div>
              <span className="text-[10px] text-center leading-tight hidden sm:block max-w-[70px]">
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Selected value label - mobile */}
      <div className="sm:hidden mt-3 text-center">
        <span className="text-sm text-emerald-400">
          {LIKERT_LABELS[selectedValue - 1]}
        </span>
      </div>
    </div>
  );
}
