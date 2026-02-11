'use client';

/**
 * ThresholdSummaryBadge - Quick pass/fail indicator for thresholds
 *
 * Shows a compact badge indicating how many threshold checks passed
 * Used in accordion headers for quick scanning
 */

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Check, X, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ThresholdCheck {
  label: string;
  passed: boolean | null; // null = insufficient data
}

interface ThresholdSummaryBadgeProps {
  cronbachAlpha: number | null;
  sampleSize: number | null;
  itemCount: number | null;
  className?: string;
}

/**
 * Evaluate threshold checks
 */
function evaluateThresholds(
  cronbachAlpha: number | null,
  sampleSize: number | null,
  itemCount: number | null,
  labels: { alpha: string; sample: string; items: string }
): ThresholdCheck[] {
  return [
    {
      label: labels.alpha,
      passed: cronbachAlpha === null ? null : cronbachAlpha >= 0.7,
    },
    {
      label: labels.sample,
      passed: sampleSize === null ? null : sampleSize >= 100,
    },
    {
      label: labels.items,
      passed: itemCount === null ? null : itemCount >= 3,
    },
  ];
}

export function ThresholdSummaryBadge({
  cronbachAlpha,
  sampleSize,
  itemCount,
  className,
}: ThresholdSummaryBadgeProps) {
  const t = useTranslations('psychometrics.competencyDetail.thresholdSummaryBadge');

  const labels = {
    alpha: t('labels.alpha'),
    sample: t('labels.sample'),
    items: t('labels.items'),
  };

  const checks = evaluateThresholds(cronbachAlpha, sampleSize, itemCount, labels);
  const passedCount = checks.filter((c) => c.passed === true).length;
  const failedCount = checks.filter((c) => c.passed === false).length;
  const unknownCount = checks.filter((c) => c.passed === null).length;

  // Determine overall status
  const allPassed = passedCount === checks.length;
  const hasFailed = failedCount > 0;
  const hasUnknown = unknownCount > 0;

  // Get badge style
  const badgeStyle = allPassed
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
    : hasFailed
      ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
      : 'bg-muted text-muted-foreground';

  return (
    <Badge variant="outline" className={cn(badgeStyle, className)}>
      <span className="flex items-center gap-1">
        {allPassed ? (
          <>
            <Check className="h-3 w-3" aria-hidden="true" />
            {t('allOk')}
          </>
        ) : hasFailed ? (
          <>
            <X className="h-3 w-3" aria-hidden="true" />
            {passedCount}/{checks.length}
          </>
        ) : hasUnknown ? (
          <>
            <Minus className="h-3 w-3" aria-hidden="true" />
            {t('noData')}
          </>
        ) : (
          `${passedCount}/${checks.length}`
        )}
      </span>
    </Badge>
  );
}

/**
 * Inline threshold indicators for compact display
 */
export function ThresholdIndicators({
  cronbachAlpha,
  sampleSize,
  itemCount,
  className,
}: ThresholdSummaryBadgeProps) {
  const t = useTranslations('psychometrics.competencyDetail.thresholdSummaryBadge');

  const labels = {
    alpha: t('labels.alpha'),
    sample: t('labels.sample'),
    items: t('labels.items'),
  };

  const checks = evaluateThresholds(cronbachAlpha, sampleSize, itemCount, labels);

  const getStatusText = (passed: boolean | null): string => {
    if (passed === true) return t('statusMeets');
    if (passed === false) return t('statusNotMeets');
    return t('noData');
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {checks.map((check, index) => {
        const Icon = check.passed === true ? Check : check.passed === false ? X : Minus;
        const colorClass =
          check.passed === true
            ? 'text-emerald-500'
            : check.passed === false
              ? 'text-red-500'
              : 'text-muted-foreground';

        return (
          <div
            key={index}
            className={cn(
              'flex items-center justify-center w-5 h-5 rounded-full',
              check.passed === true
                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                : check.passed === false
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-muted'
            )}
            title={`${check.label}: ${getStatusText(check.passed)}`}
          >
            <Icon className={cn('h-3 w-3', colorClass)} aria-hidden="true" />
          </div>
        );
      })}
    </div>
  );
}

export default ThresholdSummaryBadge;
