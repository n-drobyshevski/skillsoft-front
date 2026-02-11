'use client';

import React, { useState, useId, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { SessionQuestion } from '@/types/domain';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface SingleChoiceQuestionProps {
  question: SessionQuestion;
  selectedOption: string | null;
  onSelectionChange: (optionId: string | null) => void;
}

/**
 * SingleChoiceQuestion - Accessible single-select radio group
 *
 * WCAG AA Compliance:
 * - Uses native <input type="radio"> for proper screen reader support
 * - fieldset/legend structure for semantic grouping
 * - aria-live region announces selection changes
 * - Keyboard navigation (arrow keys) works natively with radio groups
 * - Focus indicators meet 3:1 contrast ratio
 */
export default function SingleChoiceQuestion({
  question,
  selectedOption,
  onSelectionChange,
}: SingleChoiceQuestionProps) {
  const t = useTranslations('assessment');
  const options = question.answerOptions || [];
  const groupId = useId();
  const [announcement, setAnnouncement] = useState<string>('');

  const handleChange = useCallback((optionId: string, optionText: string) => {
    onSelectionChange(optionId);
    // Announce selection to screen readers
    setAnnouncement(t('optionSelected', { option: optionText }));
  }, [onSelectionChange, t]);

  return (
    <fieldset className="space-y-2 sm:space-y-3">
      {/* Screen reader only legend - question text is visually shown elsewhere */}
      <legend className="sr-only">{question.questionText}</legend>

      {/* Live region for selection announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {options.map((option, index) => {
        const optionId = option.id || `option-${index}`;
        const inputId = `${groupId}-option-${optionId}`;
        const isSelected = selectedOption === optionId;
        const optionText = option.text || '';

        return (
          <label
            key={optionId}
            htmlFor={inputId}
            className={cn(
              // Base styles with mobile-first 44px min touch target
              "w-full flex items-start gap-3 p-3 sm:p-4 rounded-lg border text-left transition-all cursor-pointer",
              "min-h-11", // 44px minimum touch target
              // Touch-friendly interactions
              "touch-manipulation active:scale-[0.98]",
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
              value={optionId}
              checked={isSelected}
              onChange={() => handleChange(optionId, optionText)}
              className="sr-only peer"
              aria-describedby={option.label ? `${inputId}-label` : undefined}
            />

            {/* Visual radio indicator - larger on mobile */}
            <div
              className={cn(
                "shrink-0 w-5 h-5 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                "transition-colors",
                isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
              )}
              aria-hidden="true"
            >
              {isSelected && (
                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
              )}
            </div>

            {/* Option content */}
            <div className="flex-1 min-w-0">
              {option.label && (
                <span
                  id={`${inputId}-label`}
                  className="font-medium text-sm text-muted-foreground mr-2"
                >
                  {option.label}.
                </span>
              )}
              <span className={cn(
                "text-sm sm:text-base",
                isSelected && "font-medium"
              )}>
                {optionText}
              </span>
            </div>

            {/* Selected indicator */}
            {isSelected && (
              <CheckCircle2
                className="shrink-0 h-5 w-5 text-primary"
                aria-hidden="true"
              />
            )}
          </label>
        );
      })}
    </fieldset>
  );
}
