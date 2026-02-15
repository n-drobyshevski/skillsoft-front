'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useFormatter } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ClipboardCheck,
  ChevronRight,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type { RecentTestResult } from '@/types/profile';
import { AssessmentGoal } from '@/types/domain';
import { cn } from '@/lib/utils';
import { GoalFilterTabs, type GoalFilter } from './GoalFilterTabs';
import { ProfileEmptyState } from './ProfileEmptyState';

interface RecentResultsSectionProps {
  results: RecentTestResult[];
}

/**
 * Recent Results Section - Client Component
 *
 * Mobile-first redesign with visual hierarchy:
 * - Compact score circles optimized for mobile
 * - Responsive result cards
 * - Goal-based filtering
 */
export function RecentResultsSection({ results }: RecentResultsSectionProps) {
  const t = useTranslations('profile.results');
  const tAccessibility = useTranslations('profile.accessibility');
  const [goalFilter, setGoalFilter] = useState<GoalFilter>('all');

  // Goal labels from translations
  const goalLabels: Record<AssessmentGoal, string> = {
    [AssessmentGoal.OVERVIEW]: t('filterOverview'),
    [AssessmentGoal.JOB_FIT]: t('filterJobFit'),
    [AssessmentGoal.TEAM_FIT]: t('filterTeamFit'),
  };

  // Calculate counts for each filter
  const filterCounts: Record<GoalFilter, number> = {
    all: results.length,
    [AssessmentGoal.OVERVIEW]: 0,
    [AssessmentGoal.JOB_FIT]: 0,
    [AssessmentGoal.TEAM_FIT]: 0,
  };

  results.forEach((result) => {
    if (result.goal in filterCounts) {
      filterCounts[result.goal as AssessmentGoal]++;
    }
  });

  // Filter results based on selected goal
  const filteredResults = goalFilter === 'all'
    ? results
    : results.filter((result) => result.goal === goalFilter);

  // Empty state (no results at all)
  if (results.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
              <ClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <ProfileEmptyState
            variant="no-tests"
            showCta
            ctaHref="/test-templates"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
        <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2 shrink-0">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
              <ClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            {t('title')}
          </CardTitle>
          {/* Filter container */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="min-w-0 flex-1 sm:flex-initial overflow-hidden">
              <GoalFilterTabs
                value={goalFilter}
                onChange={setGoalFilter}
                counts={filterCounts}
                allLabel={t('filterAll')}
                goalLabels={goalLabels}
              />
            </div>
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex shrink-0 text-xs h-7 px-2">
              <Link href="/my-tests">
                {t('filterAll')}
                <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Aria-live region for filter results announcement */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {filteredResults.length === 0
            ? tAccessibility('noResultsForFilter', { filter: goalFilter === 'all' ? t('filterAll') : goalLabels[goalFilter as AssessmentGoal] })
            : tAccessibility('showingResults', { count: filteredResults.length })}
        </div>

        {filteredResults.length === 0 ? (
          <ProfileEmptyState
            variant="no-results"
            showCta={false}
            className="py-4 sm:py-6"
          />
        ) : (
          <div className="space-y-2">
            {filteredResults.map((result) => (
              <ResultRow key={result.resultId} result={result} goalLabels={goalLabels} />
            ))}
          </div>
        )}

        {/* Mobile "All results" button */}
        <div className="mt-3 sm:hidden">
          <Button variant="outline" size="sm" asChild className="w-full text-xs min-h-[44px] touch-manipulation">
            <Link href="/my-tests">
              {t('viewAll')}
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// RESULT ROW COMPONENT
// ============================================

function ResultRow({
  result,
  goalLabels
}: {
  result: RecentTestResult;
  goalLabels: Record<AssessmentGoal, string>;
}) {
  const t = useTranslations('profile.results');
  const format = useFormatter();

  // Build accessible label for the result row
  const statusLabel = result.passed ? t('passed') : t('failed');
  const ariaLabel = `${result.templateName} - ${statusLabel}, ${t('score')}: ${result.overallPercentage.toFixed(0)}%`;

  return (
    <Link
      href={`/test-templates/results/${result.resultId}`}
      aria-label={ariaLabel}
      className={cn(
        'flex items-center gap-2 sm:gap-3 w-full p-2 sm:p-3 rounded-xl border border-border transition-colors group touch-manipulation overflow-hidden',
        'min-h-[44px]',
        'hover:bg-muted/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
      )}
    >
      {/* Score Circle - Compact on mobile */}
      <div
        className={cn(
          'h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center text-sm sm:text-base font-bold shrink-0',
          result.passed
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
        )}
      >
        {result.overallPercentage.toFixed(0)}%
      </div>

      {/* Test Info - Takes remaining space */}
      <div className="min-w-0 flex-1">
        <div className="font-medium truncate text-xs sm:text-sm">
          {result.templateName}
        </div>
        <div className="text-xs-safe text-muted-foreground">
          {format.relativeTime(new Date(result.completedAt))}
        </div>
      </div>

      {/* Pass/Fail Icon */}
      {result.passed ? (
        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 shrink-0" />
      )}

      {/* Goal Badge - Hidden on mobile */}
      <Badge variant="outline" className="text-xs-safe hidden sm:inline-flex py-0 h-5 shrink-0">
        {goalLabels[result.goal] || result.goal}
      </Badge>

      <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
    </Link>
  );
}

// ============================================
// SKELETON COMPONENT
// ============================================

export function RecentResultsSectionSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg" />
            <Skeleton className="h-5 sm:h-6 w-36 sm:w-40" />
          </div>
          <Skeleton className="h-7 sm:h-8 w-20 sm:w-28 rounded" />
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-2 sm:p-3 rounded-xl border">
              <div className="flex items-center gap-2 sm:gap-3">
                <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 sm:h-4 w-28 sm:w-40" />
                  <Skeleton className="h-2.5 sm:h-3 w-16 sm:w-24" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded-full" />
                <Skeleton className="h-4 sm:h-5 w-12 sm:w-16 hidden sm:block" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
