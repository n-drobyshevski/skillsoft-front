'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { WidgetVariant, TrendIndicator } from '@/types/dashboard';

/**
 * Props for individual stats widget
 */
export interface StatsWidgetProps {
  /** Stat title */
  title: string;
  /** Primary value to display */
  value: number | string;
  /** Icon to display */
  icon: React.ElementType;
  /** Description text below value */
  description?: string;
  /** Trend indicator */
  trend?: TrendIndicator;
  /** Color variant */
  variant?: WidgetVariant;
  /** Link destination */
  href?: string;
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Variant style mappings
 */
const variantStyles: Record<WidgetVariant, string> = {
  default: '',
  success:
    'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20',
  warning:
    'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20',
  info: 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20',
  destructive:
    'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20',
};

const iconStyles: Record<WidgetVariant, string> = {
  default: 'bg-muted text-muted-foreground',
  success:
    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning:
    'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  destructive:
    'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

/**
 * StatsWidget - Single metric display with optional trend indicator.
 *
 * Features:
 * - Semantic color variants
 * - Trend indicators with color coding
 * - Click-through navigation
 * - Loading skeleton state
 * - Accessible with screen reader support
 *
 * @example
 * ```tsx
 * <StatsWidget
 *   title="Competencies"
 *   value={42}
 *   icon={Target}
 *   variant="success"
 *   href="/competencies"
 *   trend={{ value: "+12%", label: "from last month", isPositive: true }}
 * />
 * ```
 */
export function StatsWidget({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = 'default',
  href,
  loading = false,
  className,
}: StatsWidgetProps) {
  if (loading) {
    return (
      <Card className={cn('h-full', className)}>
        <CardHeader className="flex flex-row items-center gap-3 p-4 pb-2">
          <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  const content = (
    <Card
      className={cn(
        'h-full transition-all duration-200 motion-reduce:transition-none group',
        variantStyles[variant],
        href && 'cursor-pointer hover:shadow-md hover:border-primary/30 hover:-translate-y-px active:scale-[0.99]',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-3 p-4 pb-2">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0',
              iconStyles[variant]
            )}
          >
            <Icon className="w-4 h-4" aria-hidden="true" />
          </div>
          <CardTitle className="text-base font-semibold leading-none line-clamp-2">
            {title}
            <span className="sr-only">, value is {value}</span>
          </CardTitle>
        </div>
        {href && (
          <ArrowUpRight
            className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            aria-hidden="true"
          />
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-xl md:text-2xl font-bold tracking-tight tabular-nums">
          {value}
        </div>

        {trend && (
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="outline"
              className={cn(
                'text-xs font-medium',
                trend.isPositive
                  ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950'
                  : 'text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-800 dark:bg-red-950'
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="mr-1 h-2.5 w-2.5" />
              ) : (
                <TrendingDown className="mr-1 h-2.5 w-2.5" />
              )}
              {trend.value}
            </Badge>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}

        {description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

/**
 * Props for stats cards row container
 */
export interface StatsCardsRowProps {
  /** Stats data */
  stats: {
    totalCompetencies: number;
    totalIndicators: number;
    totalQuestions: number;
    activeTemplates: number;
    averageIndicatorsPerCompetency?: number;
  };
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * StatsCardsRow - Row of 4 stats cards for dashboard overview.
 */
export function StatsCardsRow({
  stats,
  loading = false,
  className,
}: StatsCardsRowProps) {
  // Import icons dynamically to avoid circular dependencies
  const Target = require('lucide-react').Target;
  const Layers = require('lucide-react').Layers;
  const ClipboardList = require('lucide-react').ClipboardList;
  const Activity = require('lucide-react').Activity;

  if (loading) {
    return (
      <div className={cn('grid gap-4 grid-cols-2 lg:grid-cols-4', className)}>
        {[1, 2, 3, 4].map((i) => (
          <StatsWidget
            key={i}
            title=""
            value=""
            icon={Target}
            loading={true}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4 grid-cols-2 lg:grid-cols-4', className)}>
      <StatsWidget
        title="Competencies"
        value={stats.totalCompetencies}
        icon={Target}
        href="/hr/competencies"
      />
      <StatsWidget
        title="Behavioral Indicators"
        value={stats.totalIndicators}
        icon={Layers}
        href="/hr/behavioral-indicators"
        description={
          stats.averageIndicatorsPerCompetency
            ? `~${stats.averageIndicatorsPerCompetency.toFixed(1)} per competency`
            : undefined
        }
      />
      <StatsWidget
        title="Assessment Questions"
        value={stats.totalQuestions}
        icon={ClipboardList}
        href="/hr/assessment-questions"
      />
      <StatsWidget
        title="Active Templates"
        value={stats.activeTemplates}
        icon={Activity}
        variant="success"
        href="/test-templates"
      />
    </div>
  );
}
