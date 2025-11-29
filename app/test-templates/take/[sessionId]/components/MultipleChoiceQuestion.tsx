'use client';

import React from 'react';
import { SessionQuestion } from '@/app/interfaces/domain-interfaces';
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

export default function MultipleChoiceQuestion({
  question,
  selectedOptions,
  onSelectionChange,
}: MultipleChoiceQuestionProps) {
  const options: AnswerOption[] = question.answerOptions || [];

  const toggleOption = (optionId: string) => {
    if (selectedOptions.includes(optionId)) {
      onSelectionChange(selectedOptions.filter(id => id !== optionId));
    } else {
      onSelectionChange([...selectedOptions, optionId]);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-4">
        Выберите один или несколько вариантов ответа
      </p>
      
      {options.map((option, index) => {
        const optionId = option.id || `option-${index}`;
        const isSelected = selectedOptions.includes(optionId);
        
        return (
          <button
            key={optionId}
            type="button"
            onClick={() => toggleOption(optionId)}
            className={cn(
              "w-full flex items-start gap-3 p-4 rounded-lg border text-left transition-all",
              "hover:border-primary/50 hover:bg-primary/5",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              isSelected && "border-primary bg-primary/10"
            )}
          >
            {/* Checkbox indicator */}
            <div className={cn(
              "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5",
              "transition-colors",
              isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
            )}>
              {isSelected && (
                <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
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
                "text-sm",
                isSelected && "font-medium"
              )}>
                {option.text}
              </span>
            </div>
          </button>
        );
      })}
      
      {selectedOptions.length > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          Выбрано: {selectedOptions.length}
        </p>
      )}
    </div>
  );
}
