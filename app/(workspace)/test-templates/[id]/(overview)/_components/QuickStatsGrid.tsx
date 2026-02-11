'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Users,
  TrendingUp,
  CheckCircle2,
  Timer,
  Target,
  XCircle,
  Clock,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import type { TemplateActivityStats } from '@/types/activity';

interface QuickStatsGridProps {
  stats: TemplateActivityStats | null;
  passingScore?: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return '<1m';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
}

function getScoreColor(score: number, threshold: number = 70): string {
  if (score >= threshold) return 'text-green-600 dark:text-green-400';
  if (score >= threshold * 0.7) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function getProgressColor(value: number, threshold: number = 70): string {
  if (value >= threshold) return 'bg-green-500';
  if (value >= threshold * 0.7) return 'bg-amber-500';
  return 'bg-red-500';
}

// ============================================
// STAT COMPONENTS
// ============================================

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  valueColor?: string;
  isEmpty?: boolean;
  progress?: number;
  progressColor?: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  valueColor,
  isEmpty,
  progress,
  progressColor,
}: StatCardProps) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-background">
          <Icon
            className={cn(
              'h-3.5 w-3.5',
              isEmpty ? 'text-muted-foreground' : 'text-primary'
            )}
          />
        </div>
        <span className="text-xs text-muted-foreground truncate">{label}</span>
      </div>
      <div className="space-y-1">
        <p
          className={cn(
            'text-lg font-semibold tabular-nums leading-none',
            isEmpty ? 'text-muted-foreground' : valueColor || 'text-foreground'
          )}
        >
          {value}
        </p>
        {subValue && (
          <p className="text-xs text-muted-foreground">{subValue}</p>
        )}
        {progress !== undefined && !isEmpty && (
          <div className="pt-1">
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', progressColor)}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface SessionBreakdownProps {
  total: number;
  completed: number;
  abandoned: number;
  timedOut: number;
  isEmpty: boolean;
}

function SessionBreakdown({
  total,
  completed,
  abandoned,
  timedOut,
  isEmpty,
}: SessionBreakdownProps) {
  const t = useTranslations('template.hub.stats');
  const completedPct = total > 0 ? (completed / total) * 100 : 0;
  const abandonedPct = total > 0 ? (abandoned / total) * 100 : 0;
  const timedOutPct = total > 0 ? (timedOut / total) * 100 : 0;

  return (
    <div className="col-span-2 p-3 rounded-lg bg-muted/50 border border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-md bg-background">
          <Users
            className={cn(
              'h-3.5 w-3.5',
              isEmpty ? 'text-muted-foreground' : 'text-primary'
            )}
          />
        </div>
        <span className="text-xs text-muted-foreground">{t('sessionBreakdown')}</span>
        <span
          className={cn(
            'ml-auto text-lg font-semibold tabular-nums',
            isEmpty ? 'text-muted-foreground' : 'text-foreground'
          )}
        >
          {isEmpty ? '--' : total}
        </span>
      </div>

      {/* Stacked progress bar */}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
        {!isEmpty && total > 0 && (
          <>
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${completedPct}%` }}
            />
            <div
              className="h-full bg-amber-500 transition-all"
              style={{ width: `${abandonedPct}%` }}
            />
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${timedOutPct}%` }}
            />
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">{t('completed')}</span>
          <span className={cn('font-medium tabular-nums', isEmpty && 'text-muted-foreground')}>
            {isEmpty ? '--' : completed}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-muted-foreground">{t('abandoned')}</span>
          <span className={cn('font-medium tabular-nums', isEmpty && 'text-muted-foreground')}>
            {isEmpty ? '--' : abandoned}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <span className="text-muted-foreground">{t('timedOut')}</span>
          <span className={cn('font-medium tabular-nums', isEmpty && 'text-muted-foreground')}>
            {isEmpty ? '--' : timedOut}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * Empty state component when no test sessions exist
 */
function EmptyState({ passingScore }: { passingScore: number }) {
  const t = useTranslations('template.hub.stats');

  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <div className="mb-3 rounded-full bg-muted p-3">
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="font-medium text-foreground text-sm">{t('noData.title')}</p>
      <p className="mt-1 text-xs text-muted-foreground max-w-[200px]">
        {t('noData.description')}
      </p>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Target className="h-3.5 w-3.5" />
        <span>{t('noData.passingScore')}: {passingScore}%</span>
      </div>
    </div>
  );
}

/**
 * QuickStatsGrid - Performance metrics display
 *
 * Shows key performance indicators for a test template:
 * - Session breakdown (completed/abandoned/timed out)
 * - Pass rate with progress bar
 * - Average score with progress bar
 * - Average duration
 * - Last activity timestamp
 *
 * Mobile-first responsive design with 2-column grid.
 */
export function QuickStatsGrid({ stats, passingScore = 70 }: QuickStatsGridProps) {
  const isEmpty = !stats || stats.totalSessions === 0;
  const t = useTranslations('template.hub.stats');

  // Memoize computed values to prevent recalculation on every render
  // Note: React Compiler in Next.js 16 may auto-optimize, but explicit memo documents intent
  const computedStats = useMemo(() => {
    if (!stats || stats.totalSessions === 0) {
      return null;
    }

    const passRateRounded = Math.round(stats.passRate);
    const avgScoreRounded = Math.round(stats.averageScore);
    const passedCount = stats.completedCount > 0
      ? Math.round((stats.passRate / 100) * stats.completedCount)
      : 0;

    return {
      // Pass rate values
      passRateValue: `${passRateRounded}%`,
      passedCount,
      passRateColor: getScoreColor(stats.passRate, passingScore),
      passRateProgressColor: getProgressColor(stats.passRate, passingScore),

      // Average score values
      avgScoreValue: `${avgScoreRounded}%`,
      avgScoreColor: getScoreColor(stats.averageScore, passingScore),
      avgScoreProgressColor: getProgressColor(stats.averageScore, passingScore),

      // Duration and activity
      durationValue: formatDuration(stats.averageTimeSeconds),
      lastActivityValue: stats.lastActivity
        ? getRelativeTime(stats.lastActivity)
        : null,
    };
  }, [stats, passingScore]);

  // Show helpful empty state when no data
  if (isEmpty || !computedStats) {
    return <EmptyState passingScore={passingScore} />;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Session Breakdown - Full width */}
      <SessionBreakdown
        total={stats.totalSessions}
        completed={stats.completedCount}
        abandoned={stats.abandonedCount}
        timedOut={stats.timedOutCount}
        isEmpty={false}
      />

      {/* Pass Rate */}
      <StatCard
        icon={TrendingUp}
        label={t('passRate')}
        value={computedStats.passRateValue}
        subValue={`${computedStats.passedCount} ${t('passed')}`}
        valueColor={computedStats.passRateColor}
        progress={stats.passRate}
        progressColor={computedStats.passRateProgressColor}
        isEmpty={false}
      />

      {/* Average Score */}
      <StatCard
        icon={Target}
        label={t('avgScore')}
        value={computedStats.avgScoreValue}
        subValue={`${t('target')}: ${passingScore}%`}
        valueColor={computedStats.avgScoreColor}
        progress={stats.averageScore}
        progressColor={computedStats.avgScoreProgressColor}
        isEmpty={false}
      />

      {/* Average Duration */}
      <StatCard
        icon={Timer}
        label={t('avgDuration')}
        value={computedStats.durationValue}
        isEmpty={false}
      />

      {/* Last Activity */}
      <StatCard
        icon={Calendar}
        label={t('lastActivity')}
        value={computedStats.lastActivityValue ?? t('never')}
        isEmpty={!stats.lastActivity}
      />
    </div>
  );
}

/**
 * Loading skeleton for QuickStatsGrid
 */
export function QuickStatsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Session Breakdown skeleton */}
      <div className="col-span-2 p-3 rounded-lg bg-muted/50 border border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-7 w-7 rounded-md bg-muted animate-pulse" />
          <div className="h-3 w-24 bg-muted animate-pulse rounded" />
          <div className="ml-auto h-5 w-8 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-2 w-full bg-muted animate-pulse rounded-full" />
        <div className="flex gap-4 mt-2">
          <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          <div className="h-3 w-20 bg-muted animate-pulse rounded" />
        </div>
      </div>

      {/* Other stat skeletons */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50 border border-border/50"
        >
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-muted animate-pulse" />
            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-1">
            <div className="h-5 w-12 bg-muted animate-pulse rounded" />
            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
