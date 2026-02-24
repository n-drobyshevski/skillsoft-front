'use client';

import { useTranslations, useFormatter } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedProgress } from '@/components/ui/animated-progress';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import {
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AssessmentSummary } from '@/types/profile';

interface QuickStatsGridProps {
  summary: AssessmentSummary;
}

/**
 * @deprecated Replaced by UnifiedHeroBento (stats merged into hero bento card).
 * Still used by profile/edit. Will be removed once edit page is updated.
 *
 * Quick Stats Grid - Compact single-card layout
 *
 * Modern flat design with:
 * - Single card wrapper with inline stat blocks
 * - CSS dividers between stats
 * - 2x2 grid on mobile, 4-column on desktop
 * - Profile completeness bar at bottom
 * - Full ARIA accessibility
 * - i18n support (English/Russian)
 */
export function QuickStatsGrid({ summary }: QuickStatsGridProps) {
  const t = useTranslations('profile.stats');
  const format = useFormatter();

  const formattedDate = summary.lastAssessmentDate
    ? format.dateTime(new Date(summary.lastAssessmentDate), { day: 'numeric', month: 'short' })
    : t('noDate');

  const yearText = summary.lastAssessmentDate
    ? format.dateTime(new Date(summary.lastAssessmentDate), { year: 'numeric' })
    : t('noTestsYet');

  return (
    <Card role="region" aria-label={t('regionLabel')}>
      <CardContent className="p-3 sm:p-4">
        {/* Stats Grid: 2x2 mobile, 4-col desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {/* Tests Completed */}
          <div className="flex flex-col gap-1 p-2 sm:p-3 border-b lg:border-b-0 lg:border-r border-border">
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            <div className="text-xl sm:text-2xl font-bold tabular-nums">
              <AnimatedCounter value={summary.totalCompleted} duration={800} />
            </div>
            <span className="text-xs text-muted-foreground">{t('testsCompleted')}</span>
          </div>

          {/* Average Score */}
          <div className="flex flex-col gap-1 p-2 sm:p-3 border-b lg:border-b-0 lg:border-r border-border">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              {summary.improvement && (
                <TrendBadge
                  value={summary.improvement.scoreChange}
                  isPositive={summary.improvement.isImproving}
                />
              )}
            </div>
            <div className="text-xl sm:text-2xl font-bold tabular-nums">
              <AnimatedCounter value={summary.averageScore} suffix="%" duration={800} />
            </div>
            <span className="text-xs text-muted-foreground">{t('averageScore')}</span>
          </div>

          {/* Pass Rate */}
          <div className="flex flex-col gap-1 p-2 sm:p-3 lg:border-r border-border">
            <Target className="h-4 w-4 text-muted-foreground" />
            <div className="text-xl sm:text-2xl font-bold tabular-nums">
              <AnimatedCounter value={summary.passRate} suffix="%" duration={800} />
            </div>
            <span className="text-xs text-muted-foreground">{t('passRate')}</span>
            {summary.totalCompleted > 0 && (
              <span className="text-xs text-muted-foreground">
                {Math.round(summary.totalCompleted * summary.passRate / 100)} / {summary.totalCompleted}
              </span>
            )}
          </div>

          {/* Last Assessment */}
          <div className="flex flex-col gap-1 p-2 sm:p-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="text-xl sm:text-2xl font-bold tabular-nums">
              {formattedDate}
            </div>
            <span className="text-xs text-muted-foreground">{t('lastTest')}</span>
            <span className="text-xs text-muted-foreground">{yearText}</span>
          </div>
        </div>

        {/* Profile Completeness Bar */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">{t('profile')}</span>
            <span className="font-medium">
              <AnimatedCounter value={summary.profileCompleteness} suffix="%" delay={200} />
            </span>
          </div>
          <AnimatedProgress
            value={summary.profileCompleteness}
            className="h-1"
            animationDelay={300}
            animationDuration={800}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// TREND BADGE COMPONENT (simplified)
// ============================================

interface TrendBadgeProps {
  value: number;
  isPositive: boolean;
}

function TrendBadge({ value, isPositive }: TrendBadgeProps) {
  const isNeutral = value === 0;

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 text-xs tabular-nums',
        isNeutral
          ? 'text-muted-foreground'
          : isPositive
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-red-600 dark:text-red-400'
      )}
      role="status"
      aria-label={
        isNeutral
          ? 'No change'
          : isPositive
            ? `Improved by ${value} percent`
            : `Declined by ${Math.abs(value)} percent`
      }
    >
      {isNeutral ? (
        <Minus className="h-3 w-3" />
      ) : isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      <span>{isPositive ? '+' : ''}{value}%</span>
    </div>
  );
}

// ============================================
// SKELETON COMPONENT
// ============================================

export function QuickStatsGridSkeleton() {
  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                'flex flex-col gap-2 p-2 sm:p-3',
                i <= 2 && 'border-b lg:border-b-0',
                i < 4 && 'lg:border-r',
                'border-border'
              )}
            >
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              <div className="h-7 w-16 bg-muted animate-pulse rounded" />
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border space-y-1.5">
          <div className="flex justify-between">
            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
            <div className="h-3 w-8 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-1 w-full bg-muted animate-pulse rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
