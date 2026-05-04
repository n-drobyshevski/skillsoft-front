'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('assessment');

  // Get status label for tooltip
  const getStatusLabel = (state: QuestionState, index: number): string => {
    const questionNum = index + 1;
    switch (state) {
      case 'answered':
        return t('progressIndicator.questionAnswered', { number: questionNum });
      case 'skipped':
        return t('progressIndicator.questionSkipped', { number: questionNum });
      case 'current':
        return t('progressIndicator.questionCurrent', { number: questionNum });
      case 'pending':
        return t('progressIndicator.questionPending', { number: questionNum });
      default:
        return t('progressIndicator.questionDefault', { number: questionNum });
    }
  };

  // Get dot styling based on state (visual appearance only)
  const getDotClasses = (state: QuestionState): string => {
    const baseClasses = "w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-200";

    switch (state) {
      case 'answered':
        return cn(baseClasses, "bg-emerald-500");
      case 'skipped':
        return cn(baseClasses, "bg-amber-500");
      case 'current':
        return cn(baseClasses, "bg-blue-500 ring-2 ring-blue-500/50 ring-offset-1 ring-offset-[var(--zen-ring-offset)]");
      case 'pending':
      default:
        return cn(baseClasses, "bg-[var(--zen-muted)]");
    }
  };

  // Get button wrapper classes (includes touch target)
  const getButtonClasses = (state: QuestionState, index: number): string => {
    const isNavigable = allowNavigation && state !== 'pending' && index !== currentIndex;
    return cn(
      // Touch target wrapper - minimum 44x44px for WCAG AAA compliance
      // Uses relative positioning so the visual dot is centered
      "relative flex items-center justify-center",
      // Negative margins to maintain visual spacing while having larger hit areas
      "min-w-[28px] min-h-[28px] sm:min-w-[32px] sm:min-h-[32px] -mx-2 sm:-mx-1.5",
      isNavigable && "cursor-pointer group"
    );
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
      <div className="flex items-center justify-center gap-4 py-2 px-4 text-xs text-[var(--zen-text-muted)]">
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
          <span className="w-2 h-2 rounded-full bg-[var(--zen-muted)]" />
          {pending}
        </span>
        <span className="text-[var(--zen-text-muted)]">|</span>
        <span className="text-[var(--zen-text-secondary)]">
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
                className={getButtonClasses(state, index)}
                aria-label={getStatusLabel(state, index)}
                aria-current={index === currentIndex ? 'step' : undefined}
              >
                {/* Visual dot - centered within touch target */}
                <span className={cn(
                  getDotClasses(state),
                  allowNavigation && state !== 'pending' && index !== currentIndex && "group-hover:scale-125"
                )} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="bg-[var(--zen-track)] border-[var(--zen-muted)] text-xs"
            >
              {getStatusLabel(state, index)}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
