'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useFormatter } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { GoalFilterTabs, type GoalFilter } from './GoalFilterTabs';
import { ProfileEmptyState } from './ProfileEmptyState';
import { getScoreColor } from './TopCompetenciesCard';
import { cn } from '@/lib/utils';
import type { RecentTestResult } from '@/types/profile';
import { AssessmentGoal } from '@/types/domain';

// ============================================
// PROPS INTERFACE
// ============================================

export interface ResultsSectionProps {
  results: RecentTestResult[];
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * ResultsSection - Linear/Notion-style results section
 *
 * Flat, table-like layout without Card wrapper.
 * Score displayed as plain colored text (no circles).
 * Rows separated by divide-y for a dense, scannable aesthetic.
 */
export function ResultsSection({ results }: ResultsSectionProps) {
  const t = useTranslations('profile');
  const tResults = useTranslations('profile.results');
  const tAccessibility = useTranslations('profile.accessibility');
  const format = useFormatter();

  const [goalFilter, setGoalFilter] = useState<GoalFilter>('all');

  // Goal labels from translations
  const goalLabels: Record<AssessmentGoal, string> = {
    [AssessmentGoal.OVERVIEW]: tResults('filterOverview'),
    [AssessmentGoal.JOB_FIT]: tResults('filterJobFit'),
    [AssessmentGoal.TEAM_FIT]: tResults('filterTeamFit'),
  };

  // Calculate counts per filter
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

  // Derive filtered list
  const filteredResults =
    goalFilter === 'all'
      ? results
      : results.filter((result) => result.goal === goalFilter);

  // Full empty state — no results at all
  if (results.length === 0) {
    return (
      <section className="py-6" role="region" aria-label={tAccessibility('resultsSection')}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground shrink-0">
            {t('sections.results')}
          </h2>
        </div>
        <ProfileEmptyState variant="no-tests" showCta ctaHref="/test-templates" />
      </section>
    );
  }

  return (
    <section className="py-6" role="region" aria-label={tAccessibility('resultsSection')}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground shrink-0">
          {t('sections.results')}
        </h2>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <GoalFilterTabs
              value={goalFilter}
              onChange={setGoalFilter}
              counts={filterCounts}
              allLabel={tResults('filterAll')}
              goalLabels={goalLabels}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden sm:inline-flex text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            <Link href="/my-tests">
              {tResults('filterAll')}
              <ChevronRight className="ml-0.5 h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Aria-live region for filter announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {filteredResults.length === 0
          ? tAccessibility('noResultsForFilter', {
              filter:
                goalFilter === 'all'
                  ? tResults('filterAll')
                  : goalLabels[goalFilter as AssessmentGoal],
            })
          : tAccessibility('showingResults', { count: filteredResults.length })}
      </div>

      {/* Result rows or filtered empty state */}
      {filteredResults.length === 0 ? (
        <ProfileEmptyState variant="no-results" showCta={false} className="py-4" />
      ) : (
        <div className="space-y-2">
          {filteredResults.map((result) => (
            <Link
              key={result.resultId}
              href={`/test-templates/results/${result.resultId}`}
              aria-label={`${result.templateName} - ${result.passed ? tResults('passed') : tResults('failed')}, ${tResults('score')}: ${result.overallPercentage.toFixed(0)}%`}
              className={cn(
                'flex items-center gap-3 py-2.5 px-3 rounded-lg border border-border bg-card min-h-[44px]',
                'transition-colors hover:bg-muted/40 touch-manipulation',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
              )}
            >
              {/* Score as plain colored text */}
              <span
                className={cn(
                  'w-12 text-sm font-bold tabular-nums shrink-0',
                  getScoreColor(result.overallPercentage)
                )}
              >
                {result.overallPercentage.toFixed(0)}%
              </span>

              {/* Template name */}
              <span className="flex-1 min-w-0 text-sm truncate">{result.templateName}</span>

              {/* Pass/fail icon */}
              {result.passed ? (
                <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" aria-hidden="true" />
              ) : (
                <XCircle className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0" aria-hidden="true" />
              )}

              {/* Relative time */}
              <span className="text-xs text-muted-foreground shrink-0">
                {format.relativeTime(new Date(result.completedAt))}
              </span>

              {/* Goal badge — hidden on mobile */}
              <Badge
                variant="outline"
                className="text-xs-safe hidden sm:inline-flex py-0 h-5 shrink-0"
              >
                {goalLabels[result.goal] || result.goal}
              </Badge>

              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}

      {/* Mobile "View All" button */}
      <div className="mt-3 sm:hidden">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="w-full text-xs min-h-[44px] touch-manipulation"
        >
          <Link href="/my-tests">
            {tResults('viewAll')}
            <ChevronRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

// ============================================
// SKELETON COMPONENT
// ============================================

/**
 * ResultsSectionSkeleton - Loading placeholder for ResultsSection
 *
 * Matches the table-like row structure: score + name + icon + time + badge.
 */
export function ResultsSectionSkeleton() {
  return (
    <section className="py-6" aria-hidden="true">
      {/* Heading skeleton */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-28 rounded-lg" />
      </div>

      {/* Three result row skeletons */}
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-2.5 px-3 rounded-lg border border-border bg-card min-h-[44px]"
          >
            {/* Score placeholder */}
            <Skeleton className="w-12 h-4 shrink-0" />

            {/* Name placeholder */}
            <Skeleton className="flex-1 h-4" />

            {/* Pass/fail icon placeholder */}
            <Skeleton className="h-4 w-4 rounded-full shrink-0" />

            {/* Relative time placeholder */}
            <Skeleton className="h-3 w-14 shrink-0" />

            {/* Goal badge placeholder — hidden on mobile */}
            <Skeleton className="h-5 w-16 hidden sm:block shrink-0" />

            {/* Chevron placeholder */}
            <Skeleton className="h-3.5 w-3.5 shrink-0" />
          </div>
        ))}
      </div>
    </section>
  );
}
