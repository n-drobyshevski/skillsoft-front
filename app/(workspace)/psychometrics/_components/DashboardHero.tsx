'use client';

import { useMemo } from 'react';
import { PsychometricHealthReport } from '@/types/psychometrics';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  HealthScoreHelp,
  HealthScoreBreakdownHelp,
  ActiveItemsWeightHelp,
  ReliableCompetenciesWeightHelp,
  NonFlaggedItemsWeightHelp,
  HeroTotalItemsHelp,
  HeroActiveRateHelp,
  HeroIssuesHelp,
} from './PsychometricHelpTooltip';

interface DashboardHeroProps {
  report: PsychometricHealthReport;
  className?: string;
}

// Calculate health score based on report metrics
function calculateHealthScore(report: PsychometricHealthReport): number {
  const { totalItems, activeItems, flaggedItems, reliableCompetencies, acceptableCompetencies, unreliableCompetencies, insufficientDataCompetencies } = report;

  if (totalItems === 0) return 0;

  const totalCompetencies = reliableCompetencies + acceptableCompetencies + unreliableCompetencies + insufficientDataCompetencies;

  // Active items ratio (weight: 40%)
  const activeRatio = activeItems / totalItems;

  // Reliable competencies ratio (weight: 30%)
  const reliableRatio = totalCompetencies > 0
    ? (reliableCompetencies + acceptableCompetencies) / totalCompetencies
    : 0;

  // Non-flagged ratio (weight: 30%)
  const nonFlaggedRatio = 1 - (flaggedItems / totalItems);

  const score = (activeRatio * 0.4 + reliableRatio * 0.3 + nonFlaggedRatio * 0.3) * 100;

  return Math.round(Math.min(Math.max(score, 0), 100));
}

// Get color based on health score
function getScoreColor(score: number): {
  gradient: string;
  text: string;
  ring: string;
  bg: string;
} {
  if (score >= 80) {
    return {
      gradient: 'from-emerald-500 to-emerald-600',
      text: 'text-emerald-600 dark:text-emerald-400',
      ring: 'stroke-emerald-500',
      bg: 'bg-emerald-500',
    };
  }
  if (score >= 60) {
    return {
      gradient: 'from-amber-500 to-amber-600',
      text: 'text-amber-600 dark:text-amber-400',
      ring: 'stroke-amber-500',
      bg: 'bg-amber-500',
    };
  }
  if (score >= 40) {
    return {
      gradient: 'from-orange-500 to-orange-600',
      text: 'text-orange-600 dark:text-orange-400',
      ring: 'stroke-orange-500',
      bg: 'bg-orange-500',
    };
  }
  return {
    gradient: 'from-red-500 to-red-600',
    text: 'text-red-600 dark:text-red-400',
    ring: 'stroke-red-500',
    bg: 'bg-red-500',
  };
}

// Get status label based on score
function getStatusLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Attention';
  return 'Critical';
}

// Circular progress component
function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  className,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value, 0), 100);
  const offset = circumference - (progress / 100) * circumference;
  const colors = getScoreColor(value);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={colors.ring}
          style={{
            transition: 'stroke-dashoffset 0.5s ease-out',
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-3xl font-bold', colors.text)}>{value}</span>
        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
          Health Score
          <HealthScoreHelp />
        </span>
      </div>
    </div>
  );
}

export function DashboardHero({ report, className }: DashboardHeroProps) {
  const healthScore = useMemo(() => calculateHealthScore(report), [report]);
  const colors = getScoreColor(healthScore);
  const statusLabel = getStatusLabel(healthScore);

  // Format last audit time
  const lastAuditDisplay = useMemo(() => {
    if (!report.lastAuditRun) return null;
    try {
      const date = new Date(report.lastAuditRun);
      return formatDistanceToNow(date, { addSuffix: true, locale: ru });
    } catch {
      return null;
    }
  }, [report.lastAuditRun]);

  // Trend indicator (mock - in real app this would come from historical data)
  const trendValue = 2.5; // Positive means improvement
  const TrendIcon = trendValue >= 0 ? TrendingUp : TrendingDown;
  const trendColor = trendValue >= 0 ? 'text-emerald-600' : 'text-red-600';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border bg-gradient-to-br from-card to-muted/30',
        'p-6 md:p-8',
        className
      )}
    >
      {/* Background decoration */}
      <div
        className={cn(
          'absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-10 blur-3xl',
          colors.bg
        )}
      />

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Left side - Score and status */}
        <div className="flex items-center gap-6">
          <CircularProgress value={healthScore} size={100} strokeWidth={6} />

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Activity className={cn('h-5 w-5', colors.text)} />
              <h2 className="text-lg font-semibold">Psychometric Health</h2>
            </div>
            <p className={cn('text-2xl font-bold', colors.text)}>
              {statusLabel}
            </p>

            {/* Trend indicator */}
            <div className="flex items-center gap-1.5 text-sm">
              <TrendIcon className={cn('h-4 w-4', trendColor)} />
              <span className={trendColor}>
                {trendValue >= 0 ? '+' : ''}{trendValue.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">vs last 7 days</span>
            </div>
          </div>
        </div>

        {/* Right side - Quick stats */}
        <div className="flex flex-wrap gap-4 md:gap-6">
          {/* Last Audit */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/50">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Audit</p>
              <p className="font-medium text-sm">
                {lastAuditDisplay || 'Never'}
              </p>
            </div>
          </div>

          {/* Total Items */}
          <div className="text-center md:text-left">
            <p className="text-xs text-muted-foreground flex items-center justify-center md:justify-start gap-0.5">
              Total Items
              <HeroTotalItemsHelp />
            </p>
            <p className="text-xl font-bold">{report.totalItems}</p>
          </div>

          {/* Active Rate */}
          <div className="text-center md:text-left">
            <p className="text-xs text-muted-foreground flex items-center justify-center md:justify-start gap-0.5">
              Active Rate
              <HeroActiveRateHelp />
            </p>
            <p className="text-xl font-bold text-emerald-600">
              {report.totalItems > 0
                ? Math.round((report.activeItems / report.totalItems) * 100)
                : 0}%
            </p>
          </div>

          {/* Issues */}
          <div className="text-center md:text-left">
            <p className="text-xs text-muted-foreground flex items-center justify-center md:justify-start gap-0.5">
              Issues
              <HeroIssuesHelp />
            </p>
            <p className={cn(
              'text-xl font-bold',
              report.flaggedItems > 0 ? 'text-orange-600' : 'text-emerald-600'
            )}>
              {report.flaggedItems}
            </p>
          </div>
        </div>
      </div>

      {/* Score breakdown bar */}
      <div className="mt-6 pt-4 border-t border-border/50">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="text-muted-foreground flex items-center gap-0.5">
            Score Breakdown:
            <HealthScoreBreakdownHelp />
          </span>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded bg-emerald-500" />
            <span className="flex items-center gap-0.5">
              Active Items (40%)
              <ActiveItemsWeightHelp />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded bg-blue-500" />
            <span className="flex items-center gap-0.5">
              Reliable Competencies (30%)
              <ReliableCompetenciesWeightHelp />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded bg-amber-500" />
            <span className="flex items-center gap-0.5">
              Non-Flagged Items (30%)
              <NonFlaggedItemsWeightHelp />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
