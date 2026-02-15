'use client';

import { useTranslations, useFormatter } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedProgress } from '@/components/ui/animated-progress';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { CircularProgressRing } from './CircularProgressRing';
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
import { LazyScoreSparkline as ScoreSparkline } from '@/lib/lazy-charts';

interface QuickStatsGridProps {
  summary: AssessmentSummary;
}

// ============================================
// SCORE VARIANT SYSTEM
// ============================================

type ScoreVariant = 'excellent' | 'good' | 'average' | 'low';

function getScoreVariant(value: number): ScoreVariant {
  if (value >= 85) return 'excellent';
  if (value >= 70) return 'good';
  if (value >= 50) return 'average';
  return 'low';
}

/**
 * Ring color configuration for each score variant
 * Colors chosen for semantic meaning and accessibility
 */
const RING_COLORS: Record<ScoreVariant, {
  ring: string;
  track: string;
  text: string;
  glow: string;
  badge: string;
  cardBg: string;
}> = {
  excellent: {
    ring: 'text-emerald-500 dark:text-emerald-400',
    track: 'text-emerald-100 dark:text-emerald-950/50',
    text: 'text-emerald-700 dark:text-emerald-400',
    glow: 'rgba(16, 185, 129, 0.4)',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cardBg: 'bg-linear-to-br from-emerald-500/8 to-emerald-500/3 border-emerald-500/20',
  },
  good: {
    ring: 'text-primary',
    track: 'text-primary/20 dark:text-primary/10',
    text: 'text-primary dark:text-primary',
    glow: 'hsl(var(--primary) / 0.4)',
    badge: 'bg-primary/10 text-primary',
    cardBg: 'bg-linear-to-br from-primary/8 to-primary/3 border-primary/20',
  },
  average: {
    ring: 'text-amber-500 dark:text-amber-400',
    track: 'text-amber-100 dark:text-amber-950/50',
    text: 'text-amber-700 dark:text-amber-400',
    glow: 'rgba(245, 158, 11, 0.4)',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    cardBg: 'bg-linear-to-br from-amber-500/8 to-amber-500/3 border-amber-500/20',
  },
  low: {
    ring: 'text-red-500 dark:text-red-400',
    track: 'text-red-100 dark:text-red-950/50',
    text: 'text-red-700 dark:text-red-400',
    glow: 'rgba(239, 68, 68, 0.4)',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    cardBg: 'bg-linear-to-br from-red-500/8 to-red-500/3 border-red-500/20',
  },
};

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * Quick Stats Grid - Enhanced with Circular Progress Rings
 *
 * Mobile-first redesign with:
 * - Circular progress rings for percentage-based stats (Avg Score, Pass Rate)
 * - Animated entrance with staggered delays
 * - Trend indicators with subtle animations
 * - Glassmorphism card backgrounds
 * - Full ARIA accessibility
 * - i18n support (English/Russian)
 */
export function QuickStatsGrid({ summary }: QuickStatsGridProps) {
  const t = useTranslations('profile.stats');
  const format = useFormatter();

  const scoreVariant = getScoreVariant(summary.averageScore);
  const passRateVariant = getScoreVariant(summary.passRate);

  const getScoreLabel = (score: number): string => {
    if (score >= 85) return t('scoreLabels.excellent');
    if (score >= 70) return t('scoreLabels.good');
    if (score >= 50) return t('scoreLabels.average');
    return t('scoreLabels.low');
  };

  const getPassRateLabel = (rate: number): string => {
    if (rate >= 90) return t('passRateLabels.high');
    if (rate >= 70) return t('passRateLabels.good');
    if (rate >= 50) return t('passRateLabels.average');
    return t('passRateLabels.low');
  };

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      role="region"
      aria-label={t('regionLabel')}
    >
      {/* Tests Completed - Primary metric with gradient */}
      <StatCardNumeric
        icon={ClipboardCheck}
        label={t('testsCompleted')}
        value={summary.totalCompleted}
        variant="primary"
        animationDelay={0}
        footer={
          <div className="mt-2 sm:mt-3 space-y-1">
            <div className="flex justify-between text-xs-safe">
              <span className="text-muted-foreground">{t('profile')}</span>
              <span className="font-medium">
                <AnimatedCounter value={summary.profileCompleteness} suffix="%" delay={200} />
              </span>
            </div>
            <AnimatedProgress
              value={summary.profileCompleteness}
              className="h-1 sm:h-1.5"
              animationDelay={300}
              animationDuration={800}
            />
          </div>
        }
      />

      {/* Average Score with Circular Progress Ring */}
      <StatCardWithRing
        icon={TrendingUp}
        label={t('averageScore')}
        value={summary.averageScore}
        variant={scoreVariant}
        animationDelay={50}
        interpretiveLabel={getScoreLabel(summary.averageScore)}
        trend={
          summary.improvement
            ? {
                value: summary.improvement.scoreChange,
                label: summary.improvement.comparisonLabel,
                isPositive: summary.improvement.isImproving,
              }
            : undefined
        }
        ariaLabel={t('accessibility.avgScoreLabel')}
        footer={
          summary.recentScores.length >= 2 && (
            <div className="mt-2 sm:mt-3 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs-safe text-muted-foreground">{t('trend')}</span>
                <ScoreSparkline scores={summary.recentScores} height={16} width={60} />
              </div>
            </div>
          )
        }
      />

      {/* Pass Rate with Circular Progress Ring */}
      <StatCardWithRing
        icon={Target}
        label={t('passRate')}
        value={summary.passRate}
        variant={passRateVariant}
        animationDelay={100}
        interpretiveLabel={getPassRateLabel(summary.passRate)}
        description={
          summary.totalCompleted > 0
            ? `${Math.round(summary.totalCompleted * summary.passRate / 100)} / ${summary.totalCompleted}`
            : undefined
        }
        ariaLabel={t('accessibility.passRateLabel')}
      />

      {/* Last Assessment */}
      <StatCardDate
        icon={Calendar}
        label={t('lastTest')}
        date={summary.lastAssessmentDate}
        animationDelay={150}
        noDateText={t('noDate')}
        noTestsText={t('noTestsYet')}
        formatter={format}
      />
    </div>
  );
}

// ============================================
// STAT CARD WITH CIRCULAR PROGRESS RING
// ============================================

interface StatCardWithRingProps {
  icon: React.ElementType;
  label: string;
  value: number;
  variant: ScoreVariant;
  animationDelay?: number;
  interpretiveLabel?: string;
  description?: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  ariaLabel?: string;
  footer?: React.ReactNode;
}

function StatCardWithRing({
  icon: Icon,
  label,
  value,
  variant,
  animationDelay = 0,
  interpretiveLabel,
  description,
  trend,
  ariaLabel,
  footer,
}: StatCardWithRingProps) {
  // Use explicit variant lookup to avoid object injection issues
  const colors = variant === 'excellent' ? RING_COLORS.excellent
    : variant === 'good' ? RING_COLORS.good
    : variant === 'average' ? RING_COLORS.average
    : RING_COLORS.low;

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300 cursor-default',
        'hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20',
        'active:scale-[0.99] active:shadow-md',
        'focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2',
        colors.cardBg
      )}
    >
      <CardContent className="p-3 sm:p-4 group">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Circular Progress Ring */}
          <div className="shrink-0">
            {/* Mobile size */}
            <CircularProgressRing
              value={value}
              size={48}
              strokeWidth={4}
              progressClassName={colors.ring}
              trackClassName={colors.track}
              animationDelay={animationDelay + 200}
              showGlow={true}
              glowColor={colors.glow}
              aria-label={ariaLabel}
              className="sm:hidden"
            >
              <span className={cn('text-sm font-bold tabular-nums', colors.text)}>
                <AnimatedCounter value={value} delay={animationDelay} duration={800} />
              </span>
            </CircularProgressRing>
            {/* Desktop size */}
            <CircularProgressRing
              value={value}
              size={56}
              strokeWidth={5}
              progressClassName={colors.ring}
              trackClassName={colors.track}
              animationDelay={animationDelay + 200}
              showGlow={true}
              glowColor={colors.glow}
              aria-label={ariaLabel}
              className="hidden sm:flex"
            >
              <span className={cn('text-base font-bold tabular-nums', colors.text)}>
                <AnimatedCounter value={value} suffix="%" delay={animationDelay} duration={800} />
              </span>
            </CircularProgressRing>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header with icon + trend */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className={cn(
                'p-1 rounded-md transition-all duration-300 group-hover:scale-110',
                variant === 'excellent' ? 'bg-emerald-100/50 dark:bg-emerald-900/20' :
                variant === 'good' ? 'bg-primary/10' :
                variant === 'average' ? 'bg-amber-100/50 dark:bg-amber-900/20' :
                'bg-red-100/50 dark:bg-red-900/20'
              )}>
                <Icon className={cn('h-3 w-3 sm:h-3.5 sm:w-3.5', colors.text)} />
              </div>

              {/* Trend indicator */}
              {trend && <TrendBadge {...trend} />}
            </div>

            {/* Label and interpretive badge */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
              <span className="text-xs-safe text-muted-foreground">{label}</span>
              {interpretiveLabel && (
                <span className={cn('text-xs-safe font-medium px-1 sm:px-1.5 py-0.5 rounded', colors.badge)}>
                  {interpretiveLabel}
                </span>
              )}
            </div>

            {description && (
              <p className="text-xs-safe text-muted-foreground mt-0.5">{description}</p>
            )}

            {trend && (
              <p className="text-xs-safe text-muted-foreground mt-0.5 hidden sm:block">
                {trend.label}
              </p>
            )}
          </div>
        </div>

        {footer}
      </CardContent>
    </Card>
  );
}

// ============================================
// TREND BADGE COMPONENT
// ============================================

interface TrendBadgeProps {
  value: number;
  label: string;
  isPositive: boolean;
}

function TrendBadge({ value, isPositive }: TrendBadgeProps) {
  const isNeutral = value === 0;

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 text-xs-safe font-medium rounded-full px-1.5 sm:px-2 py-0.5',
        'transition-all duration-200 hover:scale-105',
        isNeutral
          ? 'bg-muted text-muted-foreground'
          : isPositive
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
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
        <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
      ) : isPositive ? (
        <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
      ) : (
        <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
      )}
      <span>{isPositive ? '+' : ''}{value}%</span>
    </div>
  );
}

// ============================================
// STAT CARD NUMERIC (for Tests Completed)
// ============================================

interface StatCardNumericProps {
  icon: React.ElementType;
  label: string;
  value: number;
  variant?: 'primary' | 'default';
  animationDelay?: number;
  footer?: React.ReactNode;
}

function StatCardNumeric({
  icon: Icon,
  label,
  value,
  variant = 'default',
  animationDelay = 0,
  footer,
}: StatCardNumericProps) {
  const isPrimary = variant === 'primary';

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300 cursor-default',
        'hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20',
        'active:scale-[0.99] active:shadow-md',
        'focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2',
        isPrimary && 'bg-linear-to-br from-primary/8 to-primary/3 border-primary/20'
      )}
    >
      <CardContent className="p-3 sm:p-4 group">
        <div className="flex flex-col gap-2 sm:gap-3">
          {/* Icon */}
          <div className={cn(
            'p-1.5 sm:p-2 rounded-lg transition-all duration-300 group-hover:scale-110 w-fit',
            isPrimary ? 'bg-primary/10' : 'bg-muted'
          )}>
            <Icon className={cn(
              'h-3.5 w-3.5 sm:h-4 sm:w-4',
              isPrimary ? 'text-primary' : 'text-muted-foreground'
            )} />
          </div>

          {/* Value + Label */}
          <div>
            <div className={cn(
              'text-xl sm:text-2xl font-bold tabular-nums',
              isPrimary ? 'text-primary' : 'text-foreground'
            )}>
              <AnimatedCounter value={value} delay={animationDelay} duration={800} />
            </div>
            <span className="text-xs-safe text-muted-foreground">{label}</span>
          </div>
        </div>

        {footer}
      </CardContent>
    </Card>
  );
}

// ============================================
// STAT CARD DATE (for Last Test)
// ============================================

interface StatCardDateProps {
  icon: React.ElementType;
  label: string;
  date: string | null;
  animationDelay?: number;
  noDateText: string;
  noTestsText: string;
  formatter: ReturnType<typeof useFormatter>;
}

function StatCardDate({
  icon: Icon,
  label,
  date,
  noDateText,
  noTestsText,
  formatter,
}: StatCardDateProps) {
  const formattedDate = date
    ? formatter.dateTime(new Date(date), { day: 'numeric', month: 'short' })
    : noDateText;

  const yearText = date
    ? formatter.dateTime(new Date(date), { year: 'numeric' })
    : noTestsText;

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300 cursor-default',
        'hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20',
        'active:scale-[0.99] active:shadow-md',
        'focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2'
      )}
    >
      <CardContent className="p-3 sm:p-4 group">
        <div className="flex flex-col gap-2 sm:gap-3">
          {/* Icon */}
          <div className="p-1.5 sm:p-2 rounded-lg bg-muted transition-all duration-300 group-hover:scale-110 w-fit">
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </div>

          {/* Value + Label */}
          <div>
            <div className="text-xl sm:text-2xl font-bold tabular-nums text-foreground">
              {formattedDate}
            </div>
            <span className="text-xs-safe text-muted-foreground">{label}</span>
            <p className="text-xs-safe text-muted-foreground mt-0.5">{yearText}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// SKELETON COMPONENT
// ============================================

export function QuickStatsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-3 sm:p-4">
            {i === 2 || i === 3 ? (
              // Ring skeleton for percentage cards
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ) : (
              // Standard skeleton for count/date cards
              <>
                <div className="flex items-center justify-between gap-2">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-muted animate-pulse" />
                </div>
                <div className="mt-2 sm:mt-3 space-y-1.5">
                  <div className="h-6 sm:h-7 w-12 sm:w-16 bg-muted animate-pulse rounded" />
                  <div className="h-3 sm:h-4 w-16 sm:w-24 bg-muted animate-pulse rounded" />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
