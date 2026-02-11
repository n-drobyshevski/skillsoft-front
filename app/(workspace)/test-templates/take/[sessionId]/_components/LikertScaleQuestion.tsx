'use client';

import React, { useState, useId, useCallback } from 'react';
import { useTranslations } from 'next-intl';
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

// Hook to get translated default options
function useDefaultLikertOptions() {
  const t = useTranslations('likert');

  return [
    { value: 1, text: t('stronglyDisagree'), label: '1' },
    { value: 2, text: t('disagree'), label: '2' },
    { value: 3, text: t('neutral'), label: '3' },
    { value: 4, text: t('agree'), label: '4' },
    { value: 5, text: t('stronglyAgree'), label: '5' },
  ];
}

// Hook to get translated frequency options
function useFrequencyOptions() {
  const t = useTranslations('frequency');

  return [
    { value: 1, text: t('never'), label: '1' },
    { value: 2, text: t('rarely'), label: '2' },
    { value: 3, text: t('sometimes'), label: '3' },
    { value: 4, text: t('often'), label: '4' },
    { value: 5, text: t('always'), label: '5' },
  ];
}

/**
 * LikertScaleQuestion - Accessible Likert/frequency scale component
 *
 * WCAG AA Compliance:
 * - Uses native <input type="radio"> for proper screen reader support
 * - fieldset/legend structure for semantic grouping
 * - aria-label on each option includes both number and text label
 * - aria-live region announces selection changes
 * - Keyboard navigation (arrow keys) works natively with radio groups
 * - aria-keyshortcuts documents number key shortcuts
 */
export default function LikertScaleQuestion({
  question,
  value,
  onChange,
}: LikertScaleQuestionProps) {
  const t = useTranslations('assessment');
  const defaultLikertOptions = useDefaultLikertOptions();
  const frequencyOptions = useFrequencyOptions();
  const groupId = useId();
  const [announcement, setAnnouncement] = useState<string>('');

  // Use custom options if provided, otherwise use defaults
  const hasCustomOptions = question.answerOptions && question.answerOptions.length > 0;
  const options: AnswerOption[] = hasCustomOptions
    ? (question.answerOptions as AnswerOption[])
    : (question.questionType === 'FREQUENCY_SCALE' ? frequencyOptions : defaultLikertOptions);

  const handleChange = useCallback((optionValue: number, optionText: string) => {
    onChange(optionValue);
    // Announce selection to screen readers
    setAnnouncement(t('scaleValueSelected', { value: optionValue, label: optionText }));
  }, [onChange, t]);

  return (
    <fieldset className="space-y-4">
      {/* Screen reader only legend - question text is visually shown elsewhere */}
      <legend className="sr-only">
        {question.questionText}. {t('likertScaleInstruction', { min: 1, max: options.length })}
      </legend>

      {/* Live region for selection announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Visual scale - mobile optimized with 44px touch targets */}
      <div
        className="flex items-stretch justify-between gap-1.5 sm:gap-2"
        role="radiogroup"
        aria-label={t('likertScaleLabel', { min: options[0]?.text ?? '', max: options[options.length - 1]?.text ?? '' })}
      >
        {options.map((option, index) => {
          const optionValue = option.value ?? (index + 1);
          const inputId = `${groupId}-scale-${optionValue}`;
          const isSelected = value === optionValue;
          const optionText = option.text || String(optionValue);

          return (
            <label
              key={optionValue}
              htmlFor={inputId}
              className={cn(
                // Base styles with mobile-first 44px min touch target
                "flex-1 flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg border transition-all cursor-pointer",
                "min-h-14 sm:min-h-auto", // 56px minimum height on mobile
                // Touch-friendly interactions
                "touch-manipulation active:scale-[0.97]",
                // Hover/focus-within states
                "hover:border-primary/50 hover:bg-primary/5",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2",
                // Selected state
                isSelected && "border-primary bg-primary/10"
              )}
            >
              {/* Native radio input - visually hidden but accessible */}
              <input
                type="radio"
                id={inputId}
                name={groupId}
                value={optionValue}
                checked={isSelected}
                onChange={() => handleChange(optionValue, optionText)}
                className="sr-only peer"
                aria-label={`${optionValue} - ${optionText}`}
                aria-keyshortcuts={`${optionValue}`}
              />

              {/* Circle indicator - optimized for mobile touch */}
              <div
                className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center",
                  "text-base sm:text-lg font-semibold transition-colors",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/40"
                )}
                aria-hidden="true"
              >
                {option.label || optionValue}
              </div>

              {/* Label - hidden on mobile, shown on larger screens */}
              <span
                className={cn(
                  "text-xs text-center line-clamp-2 hidden sm:block",
                  isSelected ? "text-primary font-medium" : "text-muted-foreground"
                )}
                aria-hidden="true"
              >
                {optionText}
              </span>
            </label>
          );
        })}
      </div>

      {/* Mobile labels - show range labels on mobile */}
      <div
        className="flex justify-between text-xs text-muted-foreground sm:hidden px-1"
        aria-hidden="true"
      >
        <span className="max-w-[40%] text-left">{options[0]?.text}</span>
        <span className="max-w-[40%] text-right">{options[options.length - 1]?.text}</span>
      </div>

      {/* Selected value display - helpful for mobile users */}
      {value !== null && (
        <p className="text-sm text-center text-muted-foreground" aria-live="polite">
          {t('selected')}: <span className="font-medium text-foreground">
            {options.find(o => (o.value ?? 0) === value)?.text || value}
          </span>
        </p>
      )}
    </fieldset>
  );
}
