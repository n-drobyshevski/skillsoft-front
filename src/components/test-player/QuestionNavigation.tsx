'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, CheckCircle, Loader2, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface QuestionNavigationProps {
  canGoBack: boolean;
  canGoForward: boolean;
  canSkip: boolean;
  isLastQuestion: boolean;
  isSubmitting: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
  validationError?: string | null;
  /** Whether auto-save is in progress during back navigation */
  isSavingBack?: boolean;
  /** Optional reason why back navigation is disabled (shown in tooltip) */
  backDisabledReason?: string | null;
  /** Whether there are unsaved changes on current question */
  hasUnsavedChanges?: boolean;
}

/**
 * QuestionNavigation - Footer with back/next/skip buttons
 *
 * Features:
 * - Back button (when allowBackNavigation is enabled)
 * - Skip button (when allowSkip is enabled and not on last question)
 * - Next/Complete button
 * - Validation error tooltips
 * - Keyboard hints
 */
export function QuestionNavigation({
  canGoBack,
  canGoForward,
  canSkip,
  isLastQuestion,
  isSubmitting,
  onPrevious,
  onNext,
  onSkip,
  validationError,
  isSavingBack = false,
  backDisabledReason,
  hasUnsavedChanges = false,
}: QuestionNavigationProps) {
  const t = useTranslations('assessment');

  // Determine back button state
  const isBackDisabled = !canGoBack || isSubmitting || isSavingBack;
  const showBackTooltip = !canGoBack && backDisabledReason && !isSubmitting;

  const nextButtonContent = isSubmitting ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      {t('saving')}
    </>
  ) : isLastQuestion ? (
    <>
      <CheckCircle className="w-4 h-4 mr-2" />
      {t('complete')}
    </>
  ) : (
    <>
      {t('nextQuestion')}
      <ChevronRight className="w-4 h-4 ml-1" />
    </>
  );

  const showTooltip = !canGoForward && !isSubmitting && validationError;

  return (
    <footer className="sticky bottom-0 bg-[var(--zen-surface)] backdrop-blur-sm border-t border-[var(--zen-border)] pb-safe" role="navigation" aria-label="Question navigation">
      {/* Screen reader announcement for validation errors */}
      {validationError && (
        <div className="sr-only" role="alert" aria-live="assertive">
          {validationError}
        </div>
      )}
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
        {/* Back Button with loading state and optional tooltip */}
        <TooltipProvider>
          <Tooltip open={showBackTooltip ? undefined : false}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={onPrevious}
                disabled={isBackDisabled}
                className={cn(
                  "text-[var(--zen-text-secondary)] hover:text-[var(--zen-text)] hover:bg-[var(--zen-ghost-hover)] transition-all duration-200",
                  !canGoBack && "opacity-0 pointer-events-none",
                  isSavingBack && "opacity-70"
                )}
                aria-label={isSavingBack ? "Saving answer before going back" : "Go to previous question"}
                aria-describedby={showBackTooltip ? "back-disabled-tooltip" : undefined}
              >
                {isSavingBack ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" aria-hidden="true" />
                ) : (
                  <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
                )}
                {isSavingBack ? t('saving') : t('back')}
                {/* Unsaved changes indicator */}
                {hasUnsavedChanges && !isSavingBack && canGoBack && (
                  <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" aria-label="Unsaved changes" />
                )}
              </Button>
            </TooltipTrigger>
            {showBackTooltip && (
              <TooltipContent id="back-disabled-tooltip" side="right" className="bg-[var(--zen-track)] border-[var(--zen-muted)] text-[var(--zen-text-secondary)]">
                <p>{backDisabledReason}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {/* Center section with keyboard hints and skip button */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Keyboard hint - desktop only */}
          <div className="hidden md:flex items-center gap-2 text-xs text-[var(--zen-text-muted)]">
            <kbd className="px-2 py-1 bg-[var(--zen-track)] rounded font-mono">Enter ↵</kbd>
            {canSkip && !isLastQuestion && (
              <kbd className="px-2 py-1 bg-[var(--zen-track)] rounded font-mono">S</kbd>
            )}
          </div>

          {/* Skip Button - shown when skip is allowed and not on last question */}
          {canSkip && !isLastQuestion && (
            <Button
              variant="ghost"
              onClick={onSkip}
              disabled={isSubmitting}
              className="text-[var(--zen-text-secondary)] hover:text-[var(--zen-text-secondary)] hover:bg-[var(--zen-ghost-hover)]"
              aria-label="Skip this question"
            >
              <SkipForward className="w-4 h-4 sm:mr-1" aria-hidden="true" />
              {/* Hide label on very small screens, show only icon */}
              <span className="hidden sm:inline">{t('skipQuestion')}</span>
            </Button>
          )}
        </div>

        {/* Next/Submit Button with Tooltip */}
        <TooltipProvider>
          <Tooltip open={showTooltip ? undefined : false}>
            <TooltipTrigger asChild>
              <Button
                onClick={onNext}
                disabled={!canGoForward || isSubmitting}
                size="lg"
                aria-label={isSubmitting ? "Saving answer" : isLastQuestion ? "Complete assessment" : "Go to next question"}
                aria-describedby={showTooltip ? "validation-error-tooltip" : undefined}
                className={cn(
                  "min-w-[140px] font-semibold transition-all duration-200",
                  // Disabled state - clearly grayed out
                  (!canGoForward || isSubmitting)
                    ? "bg-[var(--zen-track)] text-[var(--zen-text-muted)] cursor-not-allowed opacity-60 hover:bg-[var(--zen-track)]"
                    // Enabled state - bright and clear
                    : isLastQuestion
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-[var(--zen-text)] shadow-lg shadow-emerald-500/25"
                      : "bg-emerald-600 hover:bg-emerald-500 text-[var(--zen-text)] shadow-md hover:shadow-lg"
                )}
              >
                {nextButtonContent}
              </Button>
            </TooltipTrigger>
            {showTooltip && (
              <TooltipContent id="validation-error-tooltip" side="top" className="bg-amber-500/10 border-amber-500/20 text-[var(--zen-warning)]">
                <p>{validationError}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </footer>
  );
}