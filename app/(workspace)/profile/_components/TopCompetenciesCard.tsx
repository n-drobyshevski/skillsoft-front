'use client';

import Link from 'next/link';
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
  Trophy,
  Medal,
  Award,
} from 'lucide-react';
import type { TopCompetency } from '@/types/profile';
import { cn } from '@/lib/utils';

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
  // Empty state
  if (competencies.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg flex items-center gap-1.5 sm:gap-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <span className="truncate">Топ компетенции</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="text-center py-6 sm:py-8">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-3 sm:mb-4">
              <Trophy className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground/30" />
            </div>
            <h3 className="text-sm sm:text-base font-medium mb-1.5 sm:mb-2">Пока нет данных</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 px-4">
              Пройдите несколько тестов, чтобы увидеть ваши сильные стороны
            </p>
            <Button asChild size="sm" className="text-xs sm:text-sm">
              <Link href="/test-templates">
                Начать тестирование
                <ChevronRight className="ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            </Button>
          </div>
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
              <span className="truncate">Топ компетенции</span>
            </CardTitle>
            <CardDescription className="mt-0.5 sm:mt-1 text-[10px] sm:text-sm ml-8 sm:ml-11">
              На основе {totalAssessments} оценок
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="shrink-0 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 min-h-[44px] min-w-[44px] justify-center"
          >
            <Link href="/my-tests">
              <span className="hidden sm:inline mr-0.5">Все</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-3 sm:px-6">
        <div className="space-y-2 sm:space-y-3">
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

function CompetencyRow({ competency, rank }: { competency: TopCompetency; rank: number }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
      {/* Rank Badge */}
      <RankBadge rank={rank} />

      {/* Competency Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="font-medium text-xs sm:text-sm truncate">{competency.competencyName}</span>
          <TrendIndicator trend={competency.trend} />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
          <Badge variant="outline" className="text-[9px] sm:text-xs py-0 h-4 sm:h-5 px-1 sm:px-1.5">
            {competency.category}
          </Badge>
          <span className="text-[9px] sm:text-xs text-muted-foreground">
            {competency.assessmentCount} оценок
          </span>
        </div>
      </div>

      {/* Score */}
      <div className="flex flex-col items-end gap-0.5 sm:gap-1 shrink-0">
        <span
          className={cn(
            'text-base sm:text-lg font-bold tabular-nums',
            getScoreColor(competency.averageScore)
          )}
        >
          {competency.averageScore}%
        </span>
        {/* Mini progress bar */}
        <div className="h-1 sm:h-1.5 w-12 sm:w-16 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
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

function RankBadge({ rank }: { rank: number }) {
  // Medal icons for top 3
  const MedalIcon = rank === 1 ? Trophy : rank === 2 ? Medal : rank === 3 ? Award : null;

  const rankStyles: Record<number, string> = {
    1: 'bg-linear-to-br from-amber-100 to-amber-200 text-amber-700 dark:from-amber-900/50 dark:to-amber-800/50 dark:text-amber-300 ring-2 ring-amber-300/50',
    2: 'bg-linear-to-br from-slate-100 to-slate-200 text-slate-700 dark:from-slate-800 dark:to-slate-700 dark:text-slate-200 ring-2 ring-slate-300/50',
    3: 'bg-linear-to-br from-orange-100 to-orange-200 text-orange-700 dark:from-orange-900/50 dark:to-orange-800/50 dark:text-orange-300 ring-2 ring-orange-300/50',
  };

  // eslint-disable-next-line security/detect-object-injection
  const style = rankStyles[rank] || 'bg-muted text-muted-foreground';

  return (
    <div
      className={cn(
        'h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center shrink-0',
        'text-xs sm:text-sm font-bold shadow-sm',
        style
      )}
    >
      {MedalIcon ? (
        <MedalIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      ) : (
        rank
      )}
    </div>
  );
}

// ============================================
// TREND INDICATOR COMPONENT
// ============================================

function TrendIndicator({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  const config = {
    up: {
      icon: TrendingUp,
      className: 'text-emerald-500',
      label: 'Рост',
    },
    down: {
      icon: TrendingDown,
      className: 'text-red-500',
      label: 'Снижение',
    },
    stable: {
      icon: Minus,
      className: 'text-muted-foreground',
      label: 'Стабильно',
    },
  };

  // eslint-disable-next-line security/detect-object-injection
  const { icon: Icon, className, label } = config[trend];

  return (
    <>
      <span className="sr-only">Тренд: {label}</span>
      <Icon className={cn('h-3 w-3 sm:h-4 sm:w-4 shrink-0', className)} aria-hidden="true" />
    </>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-blue-600 dark:text-blue-400';
  return 'text-amber-600 dark:text-amber-400';
}

function getProgressBarColor(score: number): string {
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
