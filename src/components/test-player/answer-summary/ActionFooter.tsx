'use client';

import { useTranslations } from 'next-intl';
import { ChevronLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ActionFooterProps {
  onGoBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isAllAnswered: boolean;
  hasSkipped: boolean;
  canSubmit: boolean;
}

/**
 * ActionFooter - Sticky footer with Back and Submit buttons
 *
 * Features:
 * - Sticky position at bottom of screen with safe area padding
 * - Full-width submit button on mobile
 * - Different submit button styles based on completion status
 * - Loading state during submission
 */
export function ActionFooter({
  onGoBack,
  onSubmit,
  isSubmitting,
  isAllAnswered,
  hasSkipped,
  canSubmit,
}: ActionFooterProps) {
  const t = useTranslations('assessment');

  const getSubmitLabel = () => {
    if (isSubmitting) return t('submitting');
    if (isAllAnswered && !hasSkipped) return t('submitAssessment');
    if (hasSkipped) return t('submitWithSkipped');
    return t('submitIncompleteShort');
  };

  return (
    <footer className="sticky bottom-0 bg-[var(--zen-surface)] backdrop-blur-sm border-t border-[var(--zen-border)] pb-safe">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {/* Mobile: stacked layout with full-width submit */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          {/* Go Back Button */}
          <Button
            variant="ghost"
            onClick={onGoBack}
            disabled={isSubmitting}
            className="text-[var(--zen-text-secondary)] hover:text-[var(--zen-text)] hover:bg-[var(--zen-ghost-hover)] min-h-[44px]"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">{t('backToTest')}</span>
            <span className="sm:hidden">{t('back')}</span>
          </Button>

          {/* Submit Button -- full-width on mobile */}
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || !canSubmit}
            size="lg"
            className={cn(
              'w-full sm:w-auto sm:min-w-[180px] min-h-[44px] font-semibold transition-all',
              isAllAnswered && !hasSkipped
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-amber-600 hover:bg-amber-500 text-white',
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {getSubmitLabel()}
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {getSubmitLabel()}
              </>
            )}
          </Button>
        </div>
      </div>
    </footer>
  );
}
