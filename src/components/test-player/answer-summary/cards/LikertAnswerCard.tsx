'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { TestAnswer } from '@/types/domain';

interface LikertAnswerPreviewProps {
  answer: TestAnswer | null;
}

interface LikertAnswerExpandedProps {
  answer: TestAnswer | null;
}

// Hook to get translated Likert scale labels
function useLikertLabels() {
  const t = useTranslations('likert');

  return [
    t('stronglyDisagree'),
    t('disagree'),
    t('neutral'),
    t('agree'),
    t('stronglyAgree'),
  ];
}

/**
 * LikertAnswerPreview - Compact dot visualization for collapsed card
 */
export function LikertAnswerPreview({ answer }: LikertAnswerPreviewProps) {
  const t = useTranslations('assessment');
  const selectedValue = answer?.likertValue;
  const isSkipped = answer?.isSkipped;

  if (isSkipped || selectedValue === undefined) {
    return (
      <span className="text-xs text-[var(--zen-warning)]">{t('skipped')}</span>
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
              : "bg-[var(--zen-muted)]"
          )}
        />
      ))}
      <span className="ml-1.5 text-xs text-[var(--zen-text-secondary)] tabular-nums">
        {selectedValue}/5
      </span>
    </div>
  );
}

/**
 * LikertAnswerExpanded - Full scale visualization for expanded card
 */
export function LikertAnswerExpanded({ answer }: LikertAnswerExpandedProps) {
  const t = useTranslations('assessment');
  const likertLabels = useLikertLabels();
  const selectedValue = answer?.likertValue;
  const isSkipped = answer?.isSkipped;

  if (isSkipped || selectedValue === undefined) {
    return (
      <div className="text-center py-4">
        <span className="text-sm text-[var(--zen-warning)]">{t('questionWasSkipped')}</span>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="flex justify-between items-end gap-2">
        {[1, 2, 3, 4, 5].map((value) => {
          const isSelected = selectedValue === value;
          const label = likertLabels[value - 1];

          return (
            <div
              key={value}
              className={cn(
                "flex flex-col items-center gap-2 flex-1",
                isSelected ? "text-[var(--zen-success)]" : "text-[var(--zen-text-muted)]"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-bold text-lg",
                  isSelected
                    ? "bg-emerald-500/20 border-2 border-emerald-500 text-[var(--zen-success)]"
                    : "bg-[var(--zen-track)] border border-[var(--zen-muted)] text-[var(--zen-text-muted)]"
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
        <span className="text-sm text-[var(--zen-success)]">
          {likertLabels[selectedValue - 1]}
        </span>
      </div>
    </div>
  );
}
