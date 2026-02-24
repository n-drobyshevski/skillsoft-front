'use client';

import { useTranslations, useFormatter } from 'next-intl';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProfileUserInfo, AssessmentSummary } from '@/types/profile';

export interface PropertiesSectionProps {
  userInfo: ProfileUserInfo;
  summary: AssessmentSummary;
}

/**
 * PropertiesSection — Linear/Notion-style property grid for the profile page.
 *
 * Replaces the gradient stat cells and animated counters from UnifiedHeroBento/
 * QuickStatsGrid with a flat, property-row layout that reads left-to-right like
 * a Notion database page.
 *
 * Layout:
 *   - No Card wrapper — sits directly in the page column.
 *   - <dl> grid: 1 column on mobile, 2 columns on sm+.
 *   - Profile completeness <Progress> bar below the grid.
 */
export function PropertiesSection({ userInfo, summary }: PropertiesSectionProps) {
  const t = useTranslations('profile');
  const tHero = useTranslations('profile.hero');
  const tStats = useTranslations('profile.stats');
  const tAccessibility = useTranslations('profile.accessibility');
  const format = useFormatter();

  return (
    <section className="py-6" role="region" aria-label={tAccessibility('statsSection')}>
      <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
        {t('sections.overview')}
      </h2>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
        {/* Organization */}
        <div className="flex items-baseline justify-between sm:justify-start gap-2">
          <dt className="text-sm text-muted-foreground shrink-0 sm:w-36">
            {tHero('organization')}
          </dt>
          <dd className="text-sm font-medium text-right sm:text-left">
            {userInfo.organizationName || '—'}
          </dd>
        </div>

        {/* Member since */}
        <div className="flex items-baseline justify-between sm:justify-start gap-2">
          <dt className="text-sm text-muted-foreground shrink-0 sm:w-36">
            {tHero('memberSince')}
          </dt>
          <dd className="text-sm font-medium tabular-nums text-right sm:text-left">
            {format.relativeTime(userInfo.createdAt)}
          </dd>
        </div>

        {/* Tests completed */}
        <div className="flex items-baseline justify-between sm:justify-start gap-2">
          <dt className="text-sm text-muted-foreground shrink-0 sm:w-36">
            {tStats('testsCompleted')}
          </dt>
          <dd className="text-sm font-medium tabular-nums text-right sm:text-left">
            {summary.totalCompleted}
          </dd>
        </div>

        {/* Average score */}
        <div className="flex items-baseline justify-between sm:justify-start gap-2">
          <dt className="text-sm text-muted-foreground shrink-0 sm:w-36">
            {tStats('averageScore')}
          </dt>
          <dd className="text-sm font-medium tabular-nums text-right sm:text-left">
            {summary.averageScore}%
          </dd>
        </div>

        {/* Pass rate */}
        <div className="flex items-baseline justify-between sm:justify-start gap-2">
          <dt className="text-sm text-muted-foreground shrink-0 sm:w-36">
            {tStats('passRate')}
          </dt>
          <dd className="text-sm font-medium tabular-nums text-right sm:text-left">
            {summary.passRate}%
          </dd>
        </div>
      </dl>

      {/* Profile completeness */}
      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">{tStats('profile')}</span>
          <span className="font-medium tabular-nums">{summary.profileCompleteness}%</span>
        </div>
        <Progress value={summary.profileCompleteness} className="h-1.5" />
      </div>
    </section>
  );
}

// ============================================
// SKELETON
// ============================================

/**
 * PropertiesSectionSkeleton — placeholder shown while profile data loads.
 *
 * Mirrors the exact DOM structure of PropertiesSection so layout shift is
 * minimised when the real content hydrates.
 */
export function PropertiesSectionSkeleton() {
  return (
    <section className="py-6" aria-hidden="true">
      {/* Section heading */}
      <Skeleton className="h-3 w-24 mb-4" />

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-baseline justify-between sm:justify-start gap-2">
            <Skeleton className="h-4 w-24 shrink-0" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </dl>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between mb-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
    </section>
  );
}
