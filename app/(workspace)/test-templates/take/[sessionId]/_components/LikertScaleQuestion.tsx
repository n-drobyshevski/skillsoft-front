'use client';

import React from 'react';
import { SessionQuestion } from '@/app/interfaces/domain-interfaces';
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
      {/* Visual scale */}
      <div className="flex items-center justify-between gap-2">
        {options.map((option, index) => {
          const optionValue = option.value ?? (index + 1);
          const isSelected = value === optionValue;
          
          return (
            <button
              key={optionValue}
              type="button"
              onClick={() => onChange(isSelected ? null : optionValue)}
              className={cn(
                "flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                "hover:border-primary/50 hover:bg-primary/5",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isSelected && "border-primary bg-primary/10"
              )}
            >
              {/* Circle indicator */}
              <div className={cn(
                "w-10 h-10 rounded-full border-2 flex items-center justify-center",
                "text-lg font-semibold transition-colors",
                isSelected 
                  ? "border-primary bg-primary text-primary-foreground" 
                  : "border-muted-foreground/40"
              )}>
                {option.label || optionValue}
              </div>
              
              {/* Label */}
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

      {/* Mobile labels */}
      <div className="flex justify-between text-xs text-muted-foreground sm:hidden">
        <span>{options[0]?.text}</span>
        <span>{options[options.length - 1]?.text}</span>
      </div>

      {/* Selected value display */}
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
