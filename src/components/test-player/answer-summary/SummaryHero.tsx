'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface SummaryHeroProps {
  totalQuestions: number;
  answeredCount: number;
  skippedCount: number;
  flaggedCount?: number;
  templateName?: string;
}

/**
 * SummaryHero - Completion status overview with progress bar
 *
 * Displays:
 * - Template name
 * - Progress bar showing completion percentage
 * - Stat line: answered / skipped / flagged counts
 */
export function SummaryHero({
  totalQuestions,
  answeredCount,
  skippedCount,
  flaggedCount = 0,
  templateName,
}: SummaryHeroProps) {
  const t = useTranslations('assessment');
  const completionPercentage = totalQuestions > 0
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 0;
  const isComplete = answeredCount >= totalQuestions;

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 sm:p-6 mb-6">
      {/* Template name */}
      {templateName && (
        <h2 className="text-neutral-400 text-sm font-medium mb-4 truncate">
          {templateName}
        </h2>
      )}

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold text-white tabular-nums">
            {completionPercentage}%
          </span>
          <span className="text-xs text-neutral-500">
            {t('questionsAnswered', { answered: answeredCount, total: totalQuestions })}
          </span>
        </div>
        <Progress
          value={completionPercentage}
          className={cn(
            'h-2.5 bg-neutral-800',
            '[&>[data-slot=progress-indicator]]:transition-all [&>[data-slot=progress-indicator]]:duration-700',
            isComplete
              ? '[&>[data-slot=progress-indicator]]:bg-emerald-500'
              : skippedCount > 0
                ? '[&>[data-slot=progress-indicator]]:bg-amber-500'
                : '[&>[data-slot=progress-indicator]]:bg-emerald-500',
          )}
        />
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-emerald-400 tabular-nums">
          {answeredCount} {t('answered').toLowerCase()}
        </span>
        {skippedCount > 0 && (
          <span className="text-amber-400 tabular-nums">
            {skippedCount} {t('skipped').toLowerCase()}
          </span>
        )}
        {flaggedCount > 0 && (
          <span className="text-blue-400 tabular-nums">
            {flaggedCount} {t('flagged').toLowerCase()}
          </span>
        )}
      </div>
    </div>
  );
}
