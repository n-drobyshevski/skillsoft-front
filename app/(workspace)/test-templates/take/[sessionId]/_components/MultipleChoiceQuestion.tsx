'use client';

import React, { useState, useId, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { SessionQuestion } from '@/types/domain';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

type AnswerOption = {
  id?: string;
  text?: string;
  label?: string;
  value?: number;
  score?: number;
};

interface MultipleChoiceQuestionProps {
  question: SessionQuestion;
  selectedOptions: string[];
  onSelectionChange: (optionIds: string[]) => void;
}

/**
 * MultipleChoiceQuestion - Accessible multi-select checkbox group
 *
 * WCAG AA Compliance:
 * - Uses native <input type="checkbox"> for proper screen reader support
 * - fieldset/legend structure for semantic grouping
 * - aria-live region announces selection count changes
 * - Each checkbox has proper label association
 * - Focus indicators meet 3:1 contrast ratio
 */
export default function MultipleChoiceQuestion({
  question,
  selectedOptions,
  onSelectionChange,
}: MultipleChoiceQuestionProps) {
  const t = useTranslations('assessment');
  const options: AnswerOption[] = question.answerOptions || [];
  const groupId = useId();
  const [announcement, setAnnouncement] = useState<string>('');

  const toggleOption = useCallback((optionId: string, optionText: string, wasChecked: boolean) => {
    let newSelection: string[];
    if (wasChecked) {
      newSelection = selectedOptions.filter(id => id !== optionId);
      setAnnouncement(t('optionDeselected', { option: optionText }));
    } else {
      newSelection = [...selectedOptions, optionId];
      setAnnouncement(t('optionSelected', { option: optionText }));
    }
    onSelectionChange(newSelection);
  }, [selectedOptions, onSelectionChange, t]);

  return (
    <fieldset
      className="space-y-2 sm:space-y-3"
      role="group"
      aria-labelledby={`${groupId}-instruction`}
    >
      {/* Screen reader only legend - question text is visually shown elsewhere */}
      <legend className="sr-only">{question.questionText}</legend>

      {/* Instruction text */}
      <p
        id={`${groupId}-instruction`}
        className="text-sm text-muted-foreground mb-3 sm:mb-4"
      >
        {t('multipleChoiceInstruction')}
      </p>

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
        const isSelected = selectedOptions.includes(optionId);
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
            {/* Native checkbox input - visually hidden but accessible */}
            <input
              type="checkbox"
              id={inputId}
              name={`${groupId}-options`}
              value={optionId}
              checked={isSelected}
              onChange={() => toggleOption(optionId, optionText, isSelected)}
              className="sr-only peer"
              aria-describedby={option.label ? `${inputId}-label` : undefined}
            />

            {/* Visual checkbox indicator */}
            <div
              className={cn(
                "shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5",
                "transition-colors",
                isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
              )}
              aria-hidden="true"
            >
              {isSelected && (
                <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
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
          </label>
        );
      })}

      {/* Selection count - both visual and announced */}
      {selectedOptions.length > 0 && (
        <p
          className="text-xs text-muted-foreground mt-2"
          aria-live="polite"
        >
          {t('selectedCount', { count: selectedOptions.length })}
        </p>
      )}
    </fieldset>
  );
}
