'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
} from 'lucide-react';
import type { TopCompetency } from '@/types/profile';
import { cn } from '@/lib/utils';
import { ProfileEmptyState } from './ProfileEmptyState';

interface TopCompetenciesCardProps {
  competencies: TopCompetency[];
  totalAssessments: number;
}

/**
 * Top Competencies Card - Client Component
 *
 * Mobile-first redesign with visual hierarchy:
 * - Compact medal-style rank indicators
 * - Score progress bars optimized for mobile
 * - Responsive typography and spacing
 */
export function TopCompetenciesCard({
  competencies,
  totalAssessments,
}: TopCompetenciesCardProps) {
  const t = useTranslations('profile.competencies');

  // Empty state
  if (competencies.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg flex items-center gap-1.5 sm:gap-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <span className="truncate">{t('title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <ProfileEmptyState
            variant="no-competencies"
            showCta
            ctaHref="/test-templates"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg flex items-center gap-1.5 sm:gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <span className="truncate">{t('title')}</span>
            </CardTitle>
            <CardDescription className="mt-0.5 sm:mt-1 text-xs sm:text-sm ml-8 sm:ml-11">
              {t('basedOn', { count: totalAssessments })}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="shrink-0 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 min-h-[44px] min-w-[44px] justify-center transition-all duration-200 hover:bg-muted active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 group"
          >
            <Link href="/my-tests" aria-label={t('viewAll')}>
              <span className="hidden sm:inline mr-0.5">{t('viewAll')}</span>
              <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="space-y-2 sm:space-y-3" role="list" aria-label={t('title')}>
          {competencies.map((competency, index) => (
            <CompetencyRow key={competency.competencyId} competency={competency} rank={index + 1} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// COMPETENCY ROW COMPONENT
// ============================================

export function CompetencyRow({ competency, rank }: { competency: TopCompetency; rank: number }) {
  const t = useTranslations('profile.competencies');

  return (
    <div
      tabIndex={0}
      role="listitem"
      aria-label={`${t('rank')} ${rank}: ${competency.competencyName}, ${competency.averageScore}%`}
      className={cn(
        'flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-muted/30 group',
        'transition-colors duration-200 cursor-default',
        'hover:bg-muted/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
      )}
    >
      {/* Rank Badge */}
      <RankBadge rank={rank} />

      {/* Competency Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="font-medium text-xs sm:text-sm truncate">{competency.competencyName}</span>
          <TrendIndicator trend={competency.trend} />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
          <Badge variant="outline" className="text-xs-safe py-0 h-4 sm:h-5 px-1 sm:px-1.5">
            {competency.category}
          </Badge>
          <span className="text-xs-safe text-muted-foreground">
            {t('assessments', { count: competency.assessmentCount })}
          </span>
        </div>
      </div>

      {/* Score */}
      <div className="flex flex-col items-end gap-0.5 sm:gap-1 shrink-0">
        <span
          className={cn(
            'text-base sm:text-lg font-bold tabular-nums transition-colors duration-200',
            getScoreColor(competency.averageScore)
          )}
        >
          {competency.averageScore}%
        </span>
        {/* Mini progress bar */}
        <div
          className="h-1 sm:h-1.5 w-12 sm:w-16 bg-muted rounded-full overflow-hidden transition-all duration-300 group-hover:w-14 group-hover:sm:w-20"
          role="progressbar"
          aria-label={`${competency.competencyName}: ${competency.averageScore}%`}
          aria-valuenow={competency.averageScore}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              getProgressBarColor(competency.averageScore)
            )}
            style={{ width: `${competency.averageScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// RANK BADGE COMPONENT
// ============================================

export function RankBadge({ rank }: { rank: number }) {
  return (
    <div
      className={cn(
        'h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center shrink-0',
        'text-xs sm:text-sm font-bold',
        rank <= 3
          ? 'bg-primary/10 text-primary'
          : 'bg-muted text-muted-foreground'
      )}
    >
      {rank}
    </div>
  );
}

// ============================================
// TREND INDICATOR COMPONENT
// ============================================

export function TrendIndicator({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  const t = useTranslations('profile.competencies');

  const config = {
    up: {
      icon: TrendingUp,
      className: 'text-emerald-500',
      labelKey: 'trend.up' as const,
    },
    down: {
      icon: TrendingDown,
      className: 'text-red-500',
      labelKey: 'trend.down' as const,
    },
    stable: {
      icon: Minus,
      className: 'text-muted-foreground',
      labelKey: 'trend.stable' as const,
    },
  };

  // eslint-disable-next-line security/detect-object-injection
  const { icon: Icon, className, labelKey } = config[trend];

  return (
    <>
      <span className="sr-only">{t(labelKey)}</span>
      <Icon className={cn('h-3 w-3 sm:h-4 sm:w-4 shrink-0', className)} aria-hidden="true" />
    </>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-blue-600 dark:text-blue-400';
  return 'text-amber-600 dark:text-amber-400';
}

export function getProgressBarColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-blue-500';
  return 'bg-amber-500';
}

// ============================================
// SKELETON COMPONENT
// ============================================

export function TopCompetenciesCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg" />
              <Skeleton className="h-5 sm:h-6 w-28 sm:w-32" />
            </div>
            <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
          </div>
          <Skeleton className="h-7 sm:h-8 w-12 sm:w-14 rounded" />
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-2 sm:space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-muted/30">
              <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
              <div className="flex-1 space-y-1.5 sm:space-y-2">
                <Skeleton className="h-3 sm:h-4 w-3/4" />
                <Skeleton className="h-2.5 sm:h-3 w-1/2" />
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <Skeleton className="h-5 sm:h-6 w-10 sm:w-12" />
                <Skeleton className="h-1 sm:h-1.5 w-12 sm:w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
