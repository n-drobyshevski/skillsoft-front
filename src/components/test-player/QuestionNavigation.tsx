'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuestionNavigationProps {
  canGoBack: boolean;
  canGoForward: boolean;
  isLastQuestion: boolean;
  isSubmitting: boolean;
  onPrevious: () => void;
  onNext: () => void;
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
}: QuestionNavigationProps) {
  return (
    <footer className="sticky bottom-0 bg-slate-950/95 backdrop-blur-sm border-t border-slate-800 safe-area-bottom">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onPrevious}
          disabled={!canGoBack || isSubmitting}
          className={cn(
            "text-slate-400 hover:text-white hover:bg-slate-800",
            !canGoBack && "opacity-0 pointer-events-none"
          )}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        {/* Keyboard hint - desktop only */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-600">
          <kbd className="px-2 py-1 bg-slate-800 rounded font-mono">Enter ↵</kbd>
        </div>

        {/* Next/Submit Button */}
        <Button
          onClick={onNext}
          disabled={!canGoForward || isSubmitting}
          size="lg"
          className={cn(
            "min-w-[140px] font-semibold transition-all duration-300",
            isLastQuestion
              ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/25"
              : "bg-slate-700 hover:bg-slate-600",
            !canGoForward && "opacity-50"
          )}
        >
          {isSubmitting ? (
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
          )}
        </Button>
      </div>
    </footer>
  );
}