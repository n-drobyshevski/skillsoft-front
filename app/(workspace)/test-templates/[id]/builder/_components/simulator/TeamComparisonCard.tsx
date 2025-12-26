'use client';

import React from 'react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { STRATEGY_CONFIG } from './strategy-context';

// ============================================
// TYPES
// ============================================

interface CompetencyComparison {
  name: string;
  individual: number;
  teamAvg: number;
}

interface TeamComparisonCardProps {
  teamId?: string;
  teamName?: string;
  comparisons: CompetencyComparison[];
  overallGap: number;
  isLoading?: boolean;
  className?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getGapDirection(gap: number): 'above' | 'below' | 'at' {
  if (gap > 5) return 'above';
  if (gap < -5) return 'below';
  return 'at';
}

function getTrendIcon(gap: number) {
  const direction = getGapDirection(gap);
  if (direction === 'above') {
    return <TrendingUp className="h-3 w-3 text-emerald-500" aria-hidden="true" />;
  }
  if (direction === 'below') {
    return <TrendingDown className="h-3 w-3 text-amber-500" aria-hidden="true" />;
  }
  return <Minus className="h-3 w-3 text-blue-500" aria-hidden="true" />;
}

// ============================================
// LOADING SKELETON
// ============================================

function TeamComparisonSkeleton() {
  return (
    <div className="p-3 rounded-xl border bg-muted/30 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-10 rounded-lg" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MISSING CONFIG WARNING
// ============================================

function MissingTeamWarning() {
  return (
    <div
      className="p-4 rounded-xl border border-purple-200 bg-purple-50 dark:bg-purple-950/30 dark:border-purple-800/50"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className="h-5 w-5 text-purple-500 mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Team Not Configured
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400">
            Select a team in the template settings to enable team comparison and gap
            analysis.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function TeamComparisonCard({
  teamId,
  teamName,
  comparisons,
  overallGap,
  isLoading,
  className,
}: TeamComparisonCardProps) {
  const config = STRATEGY_CONFIG.DYNAMIC_GAP_ANALYSIS;

  // Show loading skeleton
  if (isLoading) {
    return <TeamComparisonSkeleton />;
  }

  // Show warning if no team ID
  if (!teamId) {
    return <MissingTeamWarning />;
  }

  const sortedComparisons = [...comparisons].sort(
    (a, b) => b.individual - b.teamAvg - (a.individual - a.teamAvg)
  );
  const topComparisons = sortedComparisons.slice(0, 5);
  const overallDirection = getGapDirection(overallGap);

  return (
    <div
      className={cn('p-3 rounded-xl border space-y-3', config.border, config.bg, className)}
      role="region"
      aria-label="Team Comparison Analysis"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className={cn('h-4 w-4', config.iconText)} aria-hidden="true" />
          <span className="text-sm font-medium">Team Comparison</span>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'text-[10px] tabular-nums',
            overallDirection === 'above' &&
              'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
            overallDirection === 'below' &&
              'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
            overallDirection === 'at' &&
              'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800'
          )}
        >
          {overallGap > 0 ? '+' : ''}
          {overallGap}% overall
        </Badge>
      </div>

      {/* Team Info */}
      <div className={cn('flex items-center gap-2 p-2 rounded-lg border', config.iconBg, config.border)}>
        <Users className={cn('h-4 w-4 shrink-0', config.iconText)} aria-hidden="true" />
        <span className="text-sm truncate">{teamName || `Team ${teamId}`}</span>
      </div>

      {/* Comparison Bars */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <BarChart3 className="h-3 w-3" aria-hidden="true" />
          <span>Individual vs Team Average</span>
        </div>

        {topComparisons.map((comp) => {
          const gap = comp.individual - comp.teamAvg;
          const direction = getGapDirection(gap);

          return (
            <div key={comp.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="truncate max-w-[60%]">{comp.name}</span>
                <div className="flex items-center gap-1 shrink-0">
                  {getTrendIcon(gap)}
                  <span
                    className={cn(
                      'font-medium tabular-nums',
                      direction === 'above' && 'text-emerald-600 dark:text-emerald-400',
                      direction === 'below' && 'text-amber-600 dark:text-amber-400',
                      direction === 'at' && 'text-blue-600 dark:text-blue-400'
                    )}
                  >
                    {gap > 0 ? '+' : ''}
                    {gap}%
                  </span>
                </div>
              </div>

              {/* Dual progress bar */}
              <div
                className="relative h-3 bg-muted rounded-full overflow-hidden"
                role="img"
                aria-label={`${comp.name}: Individual ${comp.individual}%, Team average ${comp.teamAvg}%`}
              >
                {/* Team benchmark (background) */}
                <div
                  className="absolute inset-y-0 left-0 bg-blue-200 dark:bg-blue-800/50 rounded-full"
                  style={{ width: `${Math.min(comp.teamAvg, 100)}%` }}
                />
                {/* Individual score (foreground, smaller height) */}
                <div
                  className={cn(
                    'absolute left-0 rounded-full transition-all',
                    direction === 'above' && 'bg-emerald-500',
                    direction === 'below' && 'bg-amber-500',
                    direction === 'at' && 'bg-blue-500'
                  )}
                  style={{
                    width: `${Math.min(comp.individual, 100)}%`,
                    height: '60%',
                    top: '20%',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-2 border-t text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <div
            className="h-2 w-4 rounded bg-blue-200 dark:bg-blue-800/50"
            aria-hidden="true"
          />
          <span>Team Avg</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-4 rounded bg-blue-500" aria-hidden="true" />
          <span>Individual</span>
        </div>
      </div>
    </div>
  );
}

export default TeamComparisonCard;
