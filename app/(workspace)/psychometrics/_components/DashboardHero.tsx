'use client';

import { useMemo } from 'react';
import { PsychometricHealthReport } from '@/types/psychometrics';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Clock, Activity, FileText, Percent, AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFormattedDates } from '@/hooks/useFormattedDates';
import { useTranslations } from 'next-intl';
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

// Get status key based on score (for translation lookup)
function getStatusKey(score: number): 'excellent' | 'good' | 'needsAttention' | 'critical' {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'needsAttention';
  return 'critical';
}

// Circular progress component - responsive sizing
function CircularProgress({
  value,
  size = 120,
  mobileSize = 100,
  strokeWidth = 8,
  mobileStrokeWidth = 6,
  className,
  isMobile = false,
  ariaLabel,
  healthLabel,
}: {
  value: number;
  size?: number;
  mobileSize?: number;
  strokeWidth?: number;
  mobileStrokeWidth?: number;
  className?: string;
  isMobile?: boolean;
  ariaLabel: string;
  healthLabel: string;
}) {
  const actualSize = isMobile ? mobileSize : size;
  const actualStroke = isMobile ? mobileStrokeWidth : strokeWidth;
  const radius = (actualSize - actualStroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value, 0), 100);
  const offset = circumference - (progress / 100) * circumference;
  const colors = getScoreColor(value);

  return (
    <div
      className={cn('relative inline-flex items-center justify-center shrink-0', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <svg width={actualSize} height={actualSize} className="-rotate-90" aria-hidden="true">
        {/* Background circle */}
        <circle
          cx={actualSize / 2}
          cy={actualSize / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={actualStroke}
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          cx={actualSize / 2}
          cy={actualSize / 2}
          r={radius}
          fill="none"
          strokeWidth={actualStroke}
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
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
        <span className={cn(isMobile ? 'text-2xl' : 'text-3xl', 'font-bold', colors.text)}>{value}</span>
        <span className={cn(isMobile ? 'text-xs' : 'text-xs', 'text-muted-foreground flex items-center gap-0.5')}>
          {healthLabel}
          {!isMobile && <HealthScoreHelp />}
        </span>
      </div>
    </div>
  );
}

// Compact horizontal health score for mobile - slimmer single-row design
function CompactHealthScore({
  score,
  statusLabel,
  trendValue,
  ariaLabel,
}: {
  score: number;
  statusLabel: string;
  trendValue: number;
  ariaLabel: string;
}) {
  const colors = getScoreColor(score);
  const TrendIcon = trendValue >= 0 ? TrendingUp : TrendingDown;

  return (
    <div className="flex items-center gap-2.5">
      {/* Score + Status */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Activity className={cn('h-3.5 w-3.5 shrink-0', colors.text)} />
        <div className="flex items-baseline gap-1.5">
          <span className={cn('text-lg font-bold tabular-nums', colors.text)}>{score}</span>
          <span className={cn(
            'text-xs font-medium px-1.5 py-0.5 rounded',
            colors.text,
            score >= 80 ? 'bg-emerald-100 dark:bg-emerald-900/30' :
            score >= 60 ? 'bg-amber-100 dark:bg-amber-900/30' :
            score >= 40 ? 'bg-orange-100 dark:bg-orange-900/30' :
            'bg-red-100 dark:bg-red-900/30'
          )}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Progress bar - slim */}
      <div
        className="flex-1 max-w-[80px]"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
      >
        <div className="h-1 w-full rounded-full bg-muted/50 overflow-hidden" aria-hidden="true">
          <div
            className={cn('h-full rounded-full transition-all', colors.bg)}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Trend - micro */}
      <div className="flex items-center gap-0.5 text-xs shrink-0">
        <TrendIcon className={cn('h-3 w-3', trendValue >= 0 ? 'text-emerald-600' : 'text-red-600')} />
        <span className={trendValue >= 0 ? 'text-emerald-600' : 'text-red-600'}>
          {trendValue >= 0 ? '+' : ''}{trendValue.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

// Mobile stat pill component - ultra-compact for 4-column grid
function MobileStatPill({
  icon: Icon,
  label,
  value,
  valueColor,
  ariaLabel,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  valueColor?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      className="flex flex-col items-center p-1.5 rounded-md bg-muted/40 min-w-0"
      role="group"
      aria-label={ariaLabel ?? `${label}: ${value}`}
    >
      <div className="flex items-center gap-1">
        <Icon className="h-3 w-3 text-muted-foreground shrink-0" aria-hidden="true" />
        <span className={cn('text-sm font-bold tabular-nums leading-none', valueColor)}>{value}</span>
      </div>
      <span className="text-xs text-muted-foreground uppercase tracking-wide truncate w-full text-center mt-0.5" aria-hidden="true">
        {label}
      </span>
    </div>
  );
}

export function DashboardHero({ report, className }: DashboardHeroProps) {
  const isMobile = useIsMobile();
  const t = useTranslations('psychometrics');
  const { formatRelativeTime } = useFormattedDates();
  const healthScore = useMemo(() => calculateHealthScore(report), [report]);
  const colors = getScoreColor(healthScore);
  const statusKey = getStatusKey(healthScore);
  const statusLabel = t(`healthStatus.${statusKey}`);

  // Format last audit time
  const lastAuditDisplay = report.lastAuditRun
    ? formatRelativeTime(report.lastAuditRun)
    : null;

  // Trend indicator (mock - in real app this would come from historical data)
  const trendValue = 2.5; // Positive means improvement
  const TrendIcon = trendValue >= 0 ? TrendingUp : TrendingDown;
  const trendColor = trendValue >= 0 ? 'text-emerald-600' : 'text-red-600';

  // Calculate active rate
  const activeRate = report.totalItems > 0
    ? Math.round((report.activeItems / report.totalItems) * 100)
    : 0;

  // Mobile Layout - Ultra-compact design, no redundant legend
  if (isMobile) {
    return (
      <section
        className={cn(
          'relative overflow-hidden rounded-lg border bg-gradient-to-br from-card to-muted/20',
          'p-2.5',
          className
        )}
        aria-labelledby="psychometric-health-heading"
        aria-describedby="psychometric-health-status"
      >
        {/* Screen reader heading */}
        <h2 id="psychometric-health-heading" className="sr-only">{t('hero.ariaPsychometricHealth')}</h2>
        <p id="psychometric-health-status" className="sr-only">
          {t('hero.ariaScoreStatus', { score: healthScore, status: statusLabel })}
        </p>

        {/* Background decoration - smaller on mobile */}
        <div
          className={cn(
            'absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10 blur-xl',
            colors.bg
          )}
          aria-hidden="true"
        />

        <div className="relative space-y-2">
          {/* Compact Health Score - replaces circular gauge */}
          <CompactHealthScore
            score={healthScore}
            statusLabel={statusLabel}
            trendValue={trendValue}
            ariaLabel={t('hero.ariaHealth', { score: healthScore })}
          />

          {/* Stats: Compact 4-column grid */}
          <div className="grid grid-cols-4 gap-1.5" role="group" aria-label={t('hero.ariaStats')}>
            <MobileStatPill
              icon={Clock}
              label={t('hero.audit')}
              value={lastAuditDisplay ? lastAuditDisplay.split(' ')[0] : '—'}
              ariaLabel={lastAuditDisplay ? t('hero.ariaLastAudit', { time: lastAuditDisplay }) : t('hero.ariaLastAuditNever')}
            />
            <MobileStatPill
              icon={FileText}
              label={t('hero.items')}
              value={report.totalItems}
              ariaLabel={t('hero.ariaTotalItems', { count: report.totalItems })}
            />
            <MobileStatPill
              icon={Percent}
              label={t('hero.active')}
              value={`${activeRate}%`}
              valueColor="text-emerald-600"
              ariaLabel={t('hero.ariaActiveItems', { rate: activeRate })}
            />
            <MobileStatPill
              icon={AlertTriangle}
              label={t('hero.issues')}
              value={report.flaggedItems}
              valueColor={report.flaggedItems > 0 ? 'text-orange-600' : undefined}
              ariaLabel={t('hero.ariaIssues', { count: report.flaggedItems })}
            />
          </div>
        </div>
      </section>
    );
  }

  // Desktop Layout (unchanged)
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
          <CircularProgress
            value={healthScore}
            size={100}
            strokeWidth={6}
            ariaLabel={t('hero.ariaHealthScore', { value: healthScore })}
            healthLabel={t('hero.health')}
          />

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Activity className={cn('h-5 w-5', colors.text)} />
              <h2 className="text-lg font-semibold">{t('hero.psychometricHealth')}</h2>
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
              <span className="text-muted-foreground">{t('hero.vsLast7Days')}</span>
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
              <p className="text-xs text-muted-foreground">{t('hero.audit')}</p>
              <p className="font-medium text-sm">
                {lastAuditDisplay || t('hero.never')}
              </p>
            </div>
          </div>

          {/* Total Items */}
          <div className="text-center md:text-left">
            <p className="text-xs text-muted-foreground flex items-center justify-center md:justify-start gap-0.5">
              {t('hero.totalItems')}
              <HeroTotalItemsHelp />
            </p>
            <p className="text-xl font-bold">{report.totalItems}</p>
          </div>

          {/* Active Rate */}
          <div className="text-center md:text-left">
            <p className="text-xs text-muted-foreground flex items-center justify-center md:justify-start gap-0.5">
              {t('hero.activeRate')}
              <HeroActiveRateHelp />
            </p>
            <p className="text-xl font-bold text-emerald-600">{activeRate}%</p>
          </div>

          {/* Issues */}
          <div className="text-center md:text-left">
            <p className="text-xs text-muted-foreground flex items-center justify-center md:justify-start gap-0.5">
              {t('hero.issues')}
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
            {t('hero.scoreBreakdown')}
            <HealthScoreBreakdownHelp />
          </span>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded bg-emerald-500" />
            <span className="flex items-center gap-0.5">
              {t('hero.activeItems40')}
              <ActiveItemsWeightHelp />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded bg-blue-500" />
            <span className="flex items-center gap-0.5">
              {t('hero.reliableCompetencies30')}
              <ReliableCompetenciesWeightHelp />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded bg-amber-500" />
            <span className="flex items-center gap-0.5">
              {t('hero.nonFlaggedItems30')}
              <NonFlaggedItemsWeightHelp />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
