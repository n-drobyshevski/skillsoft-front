'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedProgress } from '@/components/ui/animated-progress';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import {
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { AssessmentSummary } from '@/types/profile';

// Lazy load sparkline to avoid loading recharts on initial bundle
const ScoreSparkline = dynamic(
  () => import('./ScoreSparkline').then(mod => ({ default: mod.ScoreSparkline })),
  { ssr: false }
);

interface QuickStatsGridProps {
  summary: AssessmentSummary;
}

/**
 * Quick Stats Grid - Client Component
 *
 * Mobile-first redesign with visual hierarchy matching test-results:
 * - Responsive 2x2 on mobile, 4x1 on desktop
 * - Gradient backgrounds for key metrics
 * - Color-coded performance indicators
 * - Compact mobile layout with larger touch targets
 */
export function QuickStatsGrid({ summary }: QuickStatsGridProps) {
  const scoreVariant = getScoreVariant(summary.averageScore);
  const passRateVariant = getScoreVariant(summary.passRate);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Tests Completed - Primary metric with gradient */}
      <StatCard
        icon={ClipboardCheck}
        label="Пройдено тестов"
        numericValue={summary.totalCompleted}
        variant="primary"
        animationDelay={0}
        footer={
          <div className="mt-2 sm:mt-3 space-y-1">
            <div className="flex justify-between text-[10px] sm:text-xs">
              <span className="text-muted-foreground">Профиль</span>
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

      {/* Average Score with Trend and Sparkline */}
      <StatCard
        icon={TrendingUp}
        label="Средний балл"
        numericValue={summary.averageScore}
        suffix="%"
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
        footer={
          summary.recentScores.length >= 2 && (
            <div className="mt-2 sm:mt-3 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-xs text-muted-foreground">Динамика</span>
                <ScoreSparkline scores={summary.recentScores} height={16} width={60} />
              </div>
            </div>
          )
        }
      />

      {/* Pass Rate */}
      <StatCard
        icon={Target}
        label="Успешность"
        numericValue={summary.passRate}
        suffix="%"
        variant={passRateVariant}
        animationDelay={100}
        interpretiveLabel={getPassRateLabel(summary.passRate)}
        description={summary.totalCompleted > 0
          ? `${Math.round(summary.totalCompleted * summary.passRate / 100)} из ${summary.totalCompleted}`
          : undefined
        }
      />

      {/* Last Assessment */}
      <StatCard
        icon={Calendar}
        label="Последний тест"
        value={
          summary.lastAssessmentDate
            ? format(new Date(summary.lastAssessmentDate), 'd MMM', { locale: ru })
            : '—'
        }
        variant="default"
        animationDelay={150}
        description={
          summary.lastAssessmentDate
            ? format(new Date(summary.lastAssessmentDate), 'yyyy', { locale: ru })
            : 'Ещё нет тестов'
        }
      />
    </div>
  );
}

// ============================================
// STAT CARD VARIANT HELPERS
// ============================================

type VariantType = 'default' | 'primary' | 'success' | 'warning';

function getVariantStyle(variant: VariantType): string {
  switch (variant) {
    case 'primary':
      return 'text-primary';
    case 'success':
      return 'text-emerald-600 dark:text-emerald-400';
    case 'warning':
      return 'text-amber-600 dark:text-amber-400';
    default:
      return 'text-foreground';
  }
}

function getIconBgStyle(variant: VariantType): string {
  switch (variant) {
    case 'primary':
      return 'bg-primary/10';
    case 'success':
      return 'bg-emerald-100 dark:bg-emerald-900/30';
    case 'warning':
      return 'bg-amber-100 dark:bg-amber-900/30';
    default:
      return 'bg-muted';
  }
}

function getCardBgStyle(variant: VariantType): string {
  switch (variant) {
    case 'primary':
      return 'bg-linear-to-br from-primary/8 to-primary/3 border-primary/20';
    case 'success':
      return 'bg-linear-to-br from-emerald-500/8 to-emerald-500/3 border-emerald-500/20';
    case 'warning':
      return 'bg-linear-to-br from-amber-500/8 to-amber-500/3 border-amber-500/20';
    default:
      return '';
  }
}

// ============================================
// STAT CARD COMPONENT
// ============================================

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value?: string;
  numericValue?: number;
  suffix?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  interpretiveLabel?: string;
  description?: string;
  animationDelay?: number;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  footer?: React.ReactNode;
}

function StatCard({
  icon: Icon,
  label,
  value,
  numericValue,
  suffix = '',
  variant = 'default',
  interpretiveLabel,
  description,
  animationDelay = 0,
  trend,
  footer,
}: StatCardProps) {
  const variantStyle = getVariantStyle(variant);
  const iconBgStyle = getIconBgStyle(variant);
  const cardBgStyle = getCardBgStyle(variant);

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300',
      'hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20',
      cardBgStyle
    )}>
      <CardContent className="p-3 sm:p-4">
        {/* Mobile: Compact vertical layout */}
        <div className="flex flex-col gap-2 sm:gap-3">
          {/* Header row: Icon + Trend */}
          <div className="flex items-center justify-between gap-2">
            <div className={cn('p-1.5 sm:p-2 rounded-lg', iconBgStyle)}>
              <Icon className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', variantStyle)} />
            </div>

            {/* Trend indicator */}
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-0.5 text-[10px] sm:text-xs font-medium rounded-full px-1.5 sm:px-2 py-0.5',
                  trend.isPositive
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                ) : (
                  <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                )}
                <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
              </div>
            )}
          </div>

          {/* Value + Label */}
          <div>
            <div className={cn('text-xl sm:text-2xl font-bold tabular-nums', variantStyle)}>
              {numericValue !== undefined ? (
                <AnimatedCounter
                  value={numericValue}
                  suffix={suffix}
                  delay={animationDelay}
                  duration={800}
                />
              ) : (
                value
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-0.5 sm:mt-1">
              <span className="text-[10px] sm:text-xs text-muted-foreground">{label}</span>
              {interpretiveLabel && (
                <span
                  className={cn(
                    'text-[9px] sm:text-xs font-medium px-1 sm:px-1.5 py-0.5 rounded',
                    variant === 'success'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : variant === 'warning'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {interpretiveLabel}
                </span>
              )}
            </div>

            {description && (
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{description}</p>
            )}

            {trend && (
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 hidden sm:block">{trend.label}</p>
            )}
          </div>
        </div>

        {footer}
      </CardContent>
    </Card>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getScoreVariant(score: number): 'success' | 'warning' | 'default' {
  if (score >= 70) return 'success';
  if (score >= 50) return 'default';
  return 'warning';
}

function getScoreLabel(score: number): string {
  if (score >= 85) return 'Отлично';
  if (score >= 70) return 'Хорошо';
  if (score >= 50) return 'Средне';
  return 'Низкий';
}

function getPassRateLabel(rate: number): string {
  if (rate >= 90) return 'Высокая';
  if (rate >= 70) return 'Хорошая';
  if (rate >= 50) return 'Средняя';
  return 'Низкая';
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
            <div className="flex items-center justify-between gap-2">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-muted animate-pulse" />
            </div>
            <div className="mt-2 sm:mt-3 space-y-1.5">
              <div className="h-6 sm:h-7 w-12 sm:w-16 bg-muted animate-pulse rounded" />
              <div className="h-3 sm:h-4 w-16 sm:w-24 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
