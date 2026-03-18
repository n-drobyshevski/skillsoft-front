'use client';

import React, { useId } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MockQuestion } from './shared-types';

interface MockQuestionCardProps {
  question: MockQuestion;
  /** Show green border + CheckCircle2 on the correct option, plus its explanation. */
  highlightCorrect?: boolean;
  /** Currently selected option ID. */
  selectedOption?: string | null;
  onSelect?: (optionId: string) => void;
  /** Slot for floating content rendered over the card (e.g. overlay badges). */
  overlay?: React.ReactNode;
  className?: string;
  /** Reduced padding for embedding in dashboard widgets. */
  compact?: boolean;
}

/**
 * Single option row — matches real ImmersivePlayer MCQ option styling:
 * border-2, rounded-lg, min-h-[56px], w-7 h-7 radio indicator,
 * shadow-lg on selected, text-sm sm:text-base leading-relaxed.
 */
function OptionRow({
  option,
  name,
  isSelected,
  isCorrect,
  showCorrect,
  onSelect,
  compact,
}: {
  option: MockQuestion['answerOptions'][number];
  name: string;
  isSelected: boolean;
  isCorrect: boolean;
  showCorrect: boolean;
  onSelect?: (id: string) => void;
  compact?: boolean;
}) {
  const highlight = showCorrect && isCorrect;

  return (
    <li>
      <label
        className={cn(
          'flex items-start gap-4 cursor-pointer rounded-lg border-2 transition-all duration-200 touch-manipulation',
          compact ? 'min-h-[44px] p-3' : 'min-h-[56px] p-4',
          'hover:border-neutral-600 hover:bg-neutral-800/50',
          'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-emerald-500/50',
          highlight
            ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
            : isSelected
              ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
              : 'border-neutral-700 bg-neutral-800/30',
        )}
      >
        {/* Visually hidden native radio for accessibility */}
        <input
          type="radio"
          name={name}
          value={option.id}
          checked={isSelected}
          onChange={() => onSelect?.(option.id)}
          className="sr-only"
        />

        {/* Custom radio indicator — matches real player w-7 h-7 */}
        <span
          aria-hidden="true"
          className={cn(
            'mt-0.5 flex shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200',
            compact ? 'h-5 w-5' : 'h-7 w-7',
            isSelected || highlight
              ? 'border-emerald-500 bg-emerald-500 text-white scale-110'
              : 'border-neutral-500 bg-transparent',
          )}
        >
          {(isSelected || highlight) && (
            <span className={cn('rounded-full bg-white', compact ? 'h-1.5 w-1.5' : 'h-2 w-2')} />
          )}
        </span>

        <span className="flex flex-1 flex-col gap-1">
          <span className={cn(
            'leading-relaxed text-neutral-200',
            compact ? 'text-sm' : 'text-sm sm:text-base',
          )}>
            {option.text}
          </span>

          {/* Explanation shown only when highlightCorrect is active on the correct option */}
          {highlight && option.explanation && (
            <span className="text-xs leading-relaxed text-emerald-300/90 mt-1">
              {option.explanation}
            </span>
          )}
        </span>

        {highlight && (
          <CheckCircle2
            className={cn('shrink-0 text-emerald-400', compact ? 'mt-0.5 h-4 w-4' : 'mt-1 h-5 w-5')}
            aria-hidden="true"
          />
        )}
      </label>
    </li>
  );
}

export function MockQuestionCard({
  question,
  highlightCorrect = false,
  selectedOption = null,
  onSelect,
  overlay,
  className,
  compact = false,
}: MockQuestionCardProps) {
  // Stable ID for the fieldset/legend association
  const legendId = useId();
  const radioGroupName = `mock-q-${question.id}`;

  return (
    <div className={cn('relative', className)}>
      {/* Matches real QuestionCard: bg-neutral-900/50 border-neutral-800 shadow-2xl rounded-xl */}
      <div
        className={cn(
          'rounded-xl border border-neutral-800 bg-neutral-900/50 shadow-2xl text-neutral-100',
          compact ? 'p-4 sm:p-5' : 'p-6 sm:p-8',
        )}
      >
        <fieldset aria-labelledby={legendId} className={compact ? 'space-y-3' : 'space-y-4'}>
          <legend
            id={legendId}
            className={cn(
              'font-medium leading-relaxed text-white',
              compact ? 'text-sm sm:text-base' : 'text-base sm:text-xl',
            )}
          >
            {question.questionText}
          </legend>

          <ul
            className={cn('list-none p-0 m-0', compact ? 'space-y-2' : 'space-y-3')}
            role="radiogroup"
            aria-labelledby={legendId}
          >
            {question.answerOptions.map((option) => (
              <OptionRow
                key={option.id}
                option={option}
                name={radioGroupName}
                isSelected={selectedOption === option.id}
                isCorrect={option.correct}
                showCorrect={highlightCorrect}
                onSelect={onSelect}
                compact={compact}
              />
            ))}
          </ul>
        </fieldset>
      </div>

      {/* Overlay slot — absolutely positioned over the card */}
      {overlay != null && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {overlay}
        </div>
      )}
    </div>
  );
}
