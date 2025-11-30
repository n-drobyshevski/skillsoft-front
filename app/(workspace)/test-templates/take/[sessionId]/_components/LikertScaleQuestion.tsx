'use client';

import React from 'react';
import { SessionQuestion } from '@/types/domain';
import { cn } from '@/lib/utils';

type AnswerOption = {
  id?: string;
  text?: string;
  label?: string;
  value?: number;
  score?: number;
};

interface LikertScaleQuestionProps {
  question: SessionQuestion;
  value: number | null;
  onChange: (value: number | null) => void;
}

// Default Likert scale options (1-5)
const DEFAULT_LIKERT_OPTIONS: AnswerOption[] = [
  { value: 1, text: 'Совершенно не согласен', label: '1' },
  { value: 2, text: 'Не согласен', label: '2' },
  { value: 3, text: 'Нейтрально', label: '3' },
  { value: 4, text: 'Согласен', label: '4' },
  { value: 5, text: 'Полностью согласен', label: '5' },
];

// Frequency scale options
const FREQUENCY_OPTIONS: AnswerOption[] = [
  { value: 1, text: 'Никогда', label: '1' },
  { value: 2, text: 'Редко', label: '2' },
  { value: 3, text: 'Иногда', label: '3' },
  { value: 4, text: 'Часто', label: '4' },
  { value: 5, text: 'Всегда', label: '5' },
];

export default function LikertScaleQuestion({
  question,
  value,
  onChange,
}: LikertScaleQuestionProps) {
  // Use custom options if provided, otherwise use defaults
  const hasCustomOptions = question.answerOptions && question.answerOptions.length > 0;
  const options: AnswerOption[] = hasCustomOptions 
    ? (question.answerOptions as AnswerOption[])
    : (question.questionType === 'FREQUENCY_SCALE' ? FREQUENCY_OPTIONS : DEFAULT_LIKERT_OPTIONS);

  return (
    <div className="space-y-4">
      {/* Visual scale - mobile optimized with 44px touch targets */}
      <div className="flex items-stretch justify-between gap-1.5 sm:gap-2">
        {options.map((option, index) => {
          const optionValue = option.value ?? (index + 1);
          const isSelected = value === optionValue;
          
          return (
            <button
              key={optionValue}
              type="button"
              onClick={() => onChange(isSelected ? null : optionValue)}
              className={cn(
                // Base styles with mobile-first 44px min touch target
                "flex-1 flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg border transition-all",
                "min-h-14 sm:min-h-auto", // 56px minimum height on mobile
                // Touch-friendly interactions
                "touch-manipulation active:scale-[0.97]",
                // Hover/focus states
                "hover:border-primary/50 hover:bg-primary/5",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                // Selected state
                isSelected && "border-primary bg-primary/10"
              )}
            >
              {/* Circle indicator - optimized for mobile touch */}
              <div className={cn(
                "w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center",
                "text-base sm:text-lg font-semibold transition-colors",
                isSelected 
                  ? "border-primary bg-primary text-primary-foreground" 
                  : "border-muted-foreground/40"
              )}>
                {option.label || optionValue}
              </div>
              
              {/* Label - hidden on mobile, shown on larger screens */}
              <span className={cn(
                "text-xs text-center line-clamp-2 hidden sm:block",
                isSelected ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile labels - show range labels on mobile */}
      <div className="flex justify-between text-xs text-muted-foreground sm:hidden px-1">
        <span className="max-w-[40%] text-left">{options[0]?.text}</span>
        <span className="max-w-[40%] text-right">{options[options.length - 1]?.text}</span>
      </div>

      {/* Selected value display - helpful for mobile users */}
      {value !== null && (
        <p className="text-sm text-center text-muted-foreground">
          Выбрано: <span className="font-medium text-foreground">
            {options.find(o => (o.value ?? 0) === value)?.text || value}
          </span>
        </p>
      )}
    </div>
  );
}
