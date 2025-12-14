'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { QuestionState } from '../ImmersivePlayer';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface QuestionProgressIndicatorProps {
  questionStates: QuestionState[];
  currentIndex: number;
  onNavigate?: (index: number) => void;
  allowNavigation?: boolean;
}

/**
 * QuestionProgressIndicator - Visual dots showing question states
 *
 * States:
 * - answered: Emerald (bg-emerald-500) - question was answered
 * - skipped: Amber (bg-amber-500) - question was skipped
 * - current: Blue with ring - currently active question
 * - pending: Neutral (bg-neutral-700) - not yet visited
 *
 * Features:
 * - Compact horizontal dot display
 * - Tooltips showing question number and status
 * - Optional click-to-navigate (when back navigation is allowed)
 * - Responsive sizing (smaller dots on mobile)
 */
export function QuestionProgressIndicator({
  questionStates,
  currentIndex,
  onNavigate,
  allowNavigation = false,
}: QuestionProgressIndicatorProps) {
  // Get status label for tooltip
  const getStatusLabel = (state: QuestionState, index: number): string => {
    const questionNum = index + 1;
    switch (state) {
      case 'answered':
        return `Вопрос ${questionNum}: Отвечен`;
      case 'skipped':
        return `Вопрос ${questionNum}: Пропущен`;
      case 'current':
        return `Вопрос ${questionNum}: Текущий`;
      case 'pending':
        return `Вопрос ${questionNum}: Ожидает`;
      default:
        return `Вопрос ${questionNum}`;
    }
  };

  // Get dot styling based on state
  const getDotClasses = (state: QuestionState, index: number): string => {
    const isNavigable = allowNavigation && state !== 'pending' && index !== currentIndex;

    const baseClasses = cn(
      "w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-200",
      isNavigable && "cursor-pointer hover:scale-125"
    );

    switch (state) {
      case 'answered':
        return cn(baseClasses, "bg-emerald-500");
      case 'skipped':
        return cn(baseClasses, "bg-amber-500");
      case 'current':
        return cn(baseClasses, "bg-blue-500 ring-2 ring-blue-500/50 ring-offset-1 ring-offset-neutral-950");
      case 'pending':
      default:
        return cn(baseClasses, "bg-neutral-700");
    }
  };

  const handleClick = (index: number) => {
    const state = questionStates.at(index);
    if (allowNavigation && onNavigate && index !== currentIndex && state !== 'pending') {
      onNavigate(index);
    }
  };

  // For very long tests, show summary instead of individual dots
  if (questionStates.length > 30) {
    const answered = questionStates.filter(s => s === 'answered').length;
    const skipped = questionStates.filter(s => s === 'skipped').length;
    const pending = questionStates.filter(s => s === 'pending').length;

    return (
      <div className="flex items-center justify-center gap-4 py-2 px-4 text-xs text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {answered}
        </span>
        {skipped > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {skipped}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-neutral-700" />
          {pending}
        </span>
        <span className="text-neutral-600">|</span>
        <span className="text-neutral-400">
          {currentIndex + 1} / {questionStates.length}
        </span>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className="flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-4 flex-wrap max-w-full"
        role="navigation"
        aria-label="Question progress"
      >
        {questionStates.map((state, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => handleClick(index)}
                disabled={!allowNavigation || state === 'pending' || index === currentIndex}
                className={getDotClasses(state, index)}
                aria-label={getStatusLabel(state, index)}
                aria-current={index === currentIndex ? 'step' : undefined}
              />
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="bg-neutral-800 border-neutral-700 text-xs"
            >
              {getStatusLabel(state, index)}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
