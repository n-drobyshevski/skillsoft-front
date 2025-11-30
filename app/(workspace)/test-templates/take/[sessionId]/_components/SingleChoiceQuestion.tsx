'use client';

import React from 'react';
import { SessionQuestion } from '@/types/domain';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface SingleChoiceQuestionProps {
  question: SessionQuestion;
  selectedOption: string | null;
  onSelectionChange: (optionId: string | null) => void;
}

export default function SingleChoiceQuestion({
  question,
  selectedOption,
  onSelectionChange,
}: SingleChoiceQuestionProps) {
  const options = question.answerOptions || [];

  return (
    <div className="space-y-2 sm:space-y-3">
      {options.map((option, index) => {
        const optionId = option.id || `option-${index}`;
        const isSelected = selectedOption === optionId;
        
        return (
          <button
            key={optionId}
            type="button"
            onClick={() => onSelectionChange(isSelected ? null : optionId)}
            className={cn(
              // Base styles with mobile-first 44px min touch target
              "w-full flex items-start gap-3 p-3 sm:p-4 rounded-lg border text-left transition-all",
              "min-h-11", // 44px minimum touch target
              // Touch-friendly interactions
              "touch-manipulation active:scale-[0.98]",
              // Hover/focus states
              "hover:border-primary/50 hover:bg-primary/5",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              // Selected state
              isSelected && "border-primary bg-primary/10"
            )}
          >
            {/* Radio indicator - larger on mobile */}
            <div className={cn(
              "shrink-0 w-5 h-5 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
              "transition-colors",
              isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
            )}>
              {isSelected && (
                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
              )}
            </div>
            
            {/* Option content */}
            <div className="flex-1 min-w-0">
              {option.label && (
                <span className="font-medium text-sm text-muted-foreground mr-2">
                  {option.label}.
                </span>
              )}
              <span className={cn(
                "text-sm sm:text-base",
                isSelected && "font-medium"
              )}>
                {option.text}
              </span>
            </div>
            
            {/* Selected indicator */}
            {isSelected && (
              <CheckCircle2 className="shrink-0 h-5 w-5 text-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
