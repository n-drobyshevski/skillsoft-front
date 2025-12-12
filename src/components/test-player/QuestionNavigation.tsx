'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';
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
  isLastQuestion: boolean;
  isSubmitting: boolean;
  onPrevious: () => void;
  onNext: () => void;
  validationError?: string | null;
}

/**
 * QuestionNavigation - Footer with back/next buttons
 */
export function QuestionNavigation({
  canGoBack,
  canGoForward,
  isLastQuestion,
  isSubmitting,
  onPrevious,
  onNext,
  validationError,
}: QuestionNavigationProps) {
  const nextButtonContent = isSubmitting ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Saving...
    </>
  ) : isLastQuestion ? (
    <>
      <CheckCircle className="w-4 h-4 mr-2" />
      Complete
    </>
  ) : (
    <>
      Next
      <ChevronRight className="w-4 h-4 ml-1" />
    </>
  );

  const showTooltip = !canGoForward && !isSubmitting && validationError;

  return (
    <footer className="sticky bottom-0 bg-neutral-950/95 backdrop-blur-sm border-t border-neutral-800 safe-area-bottom">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onPrevious}
          disabled={!canGoBack || isSubmitting}
          className={cn(
            "text-neutral-400 hover:text-white hover:bg-neutral-800",
            !canGoBack && "opacity-0 pointer-events-none"
          )}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        {/* Keyboard hint - desktop only */}
        <div className="hidden md:flex items-center gap-2 text-xs text-neutral-600">
          <kbd className="px-2 py-1 bg-neutral-800 rounded font-mono">Enter ↵</kbd>
        </div>

        {/* Next/Submit Button with Tooltip */}
        <TooltipProvider>
          <Tooltip open={showTooltip ? undefined : false}>
            <TooltipTrigger asChild>
              <Button
                onClick={onNext}
                disabled={!canGoForward || isSubmitting}
                size="lg"
                className={cn(
                  "min-w-[140px] font-semibold transition-all duration-200",
                  // Disabled state - clearly grayed out
                  (!canGoForward || isSubmitting)
                    ? "bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60 hover:bg-neutral-800"
                    // Enabled state - bright and clear
                    : isLastQuestion
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/25"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:shadow-lg"
                )}
              >
                {nextButtonContent}
              </Button>
            </TooltipTrigger>
            {showTooltip && (
              <TooltipContent side="top" className="bg-amber-500/10 border-amber-500/20 text-amber-400">
                <p>{validationError}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </footer>
  );
}