'use client';

import React from 'react';
import { cva } from 'class-variance-authority';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UnifiedStatsCardTrend {
  value: number | string;
  label: string;
  isPositive?: boolean;
}

export interface UnifiedStatsCardProps {
  /** Card title / metric label */
  title: string;
  /** Primary metric value */
  value: string | number;
  /** Secondary description text below value */
  description?: string;
  /** Leading icon (React node, not limited to Lucide) */
  icon?: React.ReactNode;
  /** Trend indicator shown as a badge */
  trend?: UnifiedStatsCardTrend;
  /** Visual density */
  size?: 'compact' | 'default' | 'large';
  /** Stacking direction */
  layout?: 'horizontal' | 'vertical';
  /** Semantic color variant */
  variant?: 'default' | 'success' | 'warning' | 'info' | 'destructive';
  /** Link destination (makes the card clickable) */
  href?: string;
  /** Click handler (makes the card clickable) */
  onClick?: () => void;
  /** Loading skeleton state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Optional children rendered below description */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// CVA Variants
// ---------------------------------------------------------------------------

/**
 * Card wrapper styles driven by size and variant.
 */
const cardVariants = cva(
  'relative transition-all duration-200 group h-full',
  {
    variants: {
      size: {
        compact: 'h-auto',
        default: 'h-auto',
        large: 'h-auto min-h-[120px]',
      },
      variant: {
        default: '',
        success:
          'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20',
        warning:
          'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20',
        info: 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20',
        destructive:
          'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

/**
 * Header padding per size.
 */
const headerVariants = cva(
  'flex flex-row items-center justify-between space-y-0',
  {
    variants: {
      size: {
        compact: 'p-3 pb-2',
        default: 'p-4 pb-2 md:p-6 md:pb-3',
        large: 'p-6 pb-3',
      },
    },
    defaultVariants: { size: 'default' },
  }
);

/**
 * Content padding per size.
 */
const contentVariants = cva('', {
  variants: {
    size: {
      compact: 'p-3 pt-0',
      default: 'p-4 pt-0 md:p-6 md:pt-0',
      large: 'p-6 pt-0',
    },
  },
  defaultVariants: { size: 'default' },
});

/**
 * Title typography per size.
 */
const titleVariants = cva('font-medium line-clamp-2', {
  variants: {
    size: {
      compact: 'text-xs',
      default: 'text-sm',
      large: 'text-base',
    },
  },
  defaultVariants: { size: 'default' },
});

/**
 * Value typography per size.
 */
const valueVariants = cva('font-bold tracking-tight tabular-nums', {
  variants: {
    size: {
      compact: 'text-lg',
      default: 'text-xl md:text-2xl',
      large: 'text-2xl md:text-3xl',
    },
  },
  defaultVariants: { size: 'default' },
});

/**
 * Icon container per size.
 */
const iconContainerVariants = cva(
  'rounded-xl flex items-center justify-center shrink-0',
  {
    variants: {
      size: {
        compact: 'w-8 h-8',
        default: 'w-10 h-10',
        large: 'w-10 h-10 md:w-12 md:h-12',
      },
    },
    defaultVariants: { size: 'default' },
  }
);

/**
 * Icon background colors per variant.
 */
const iconBgByVariant: Record<NonNullable<UnifiedStatsCardProps['variant']>, string> = {
  default: 'bg-muted',
  success: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  destructive: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

const iconColorByVariant: Record<NonNullable<UnifiedStatsCardProps['variant']>, string> = {
  default: 'text-muted-foreground',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-blue-600 dark:text-blue-400',
  destructive: 'text-red-600 dark:text-red-400',
};

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function StatsCardSkeleton({
  size = 'default',
  layout = 'vertical',
  className,
}: Pick<UnifiedStatsCardProps, 'size' | 'layout' | 'className'>) {
  if (layout === 'horizontal') {
    return (
      <Card className={cn('animate-pulse', className)}>
        <div className={cn('flex items-center gap-3', size === 'compact' ? 'p-3' : 'p-4 md:p-6')}>
          <Skeleton className={cn('rounded-xl shrink-0', size === 'compact' ? 'w-8 h-8' : 'w-10 h-10')} />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('animate-pulse', className)}>
      <CardHeader className={cn('flex flex-row items-center justify-between space-y-0', headerVariants({ size }))}>
        <Skeleton className="h-4 w-24" />
        <Skeleton className={cn('rounded-xl', size === 'compact' ? 'h-8 w-8' : 'h-10 w-10')} />
      </CardHeader>
      <CardContent className={contentVariants({ size })}>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * UnifiedStatsCard -- a single, consolidated stats card component that replaces
 * the eight historical variants:
 *   StatsCard, stats-card (ui), MobileStatsCard, FlexibleStatsCards,
 *   ResponsiveStatsCards, EntityStatsCards, CompactStatsWidget, StatsWidget
 *
 * Uses `cva` for deterministic size/variant styling and supports both
 * horizontal and vertical layouts via a single `layout` prop.
 *
 * @example Vertical (default) -- dashboard metric card
 * ```tsx
 * <UnifiedStatsCard
 *   title="Competencies"
 *   value={42}
 *   icon={<Target className="h-5 w-5" />}
 *   variant="success"
 *   trend={{ value: "+12%", label: "from last month", isPositive: true }}
 * />
 * ```
 *
 * @example Horizontal compact -- inline stat row
 * ```tsx
 * <UnifiedStatsCard
 *   title="Active Templates"
 *   value={7}
 *   icon={<Activity className="h-4 w-4" />}
 *   size="compact"
 *   layout="horizontal"
 *   href="/test-templates"
 * />
 * ```
 */
export function UnifiedStatsCard({
  title,
  value,
  description,
  icon,
  trend,
  size = 'default',
  layout = 'vertical',
  variant = 'default',
  href,
  onClick,
  loading = false,
  className,
  children,
}: UnifiedStatsCardProps) {
  // ---- Loading state ----
  if (loading) {
    return <StatsCardSkeleton size={size} layout={layout} className={className} />;
  }

  const isInteractive = !!onClick || !!href;

  // ---- Horizontal layout ----
  if (layout === 'horizontal') {
    const horizontalContent = (
      <Card
        className={cn(
          cardVariants({ size, variant }),
          isInteractive && 'cursor-pointer hover:shadow-md active:scale-[0.99]',
          className
        )}
        onClick={onClick}
      >
        <div
          className={cn(
            'flex items-center gap-3',
            size === 'compact' ? 'p-3' : 'p-4 md:p-6'
          )}
        >
          {/* Icon */}
          {icon && (
            <div
              className={cn(
                iconContainerVariants({ size }),
                iconBgByVariant[variant]
              )}
            >
              <span className={iconColorByVariant[variant]}>{icon}</span>
            </div>
          )}

          {/* Value */}
          <span className={valueVariants({ size })}>{value}</span>

          {/* Title */}
          <span className={cn(titleVariants({ size }), 'text-muted-foreground truncate')}>
            {title}
            <span className="sr-only">, value is {value}</span>
          </span>

          {/* Trend (inline for horizontal) */}
          {trend && (
            <TrendBadge trend={trend} className="ml-auto shrink-0" />
          )}

          {/* Arrow on hover */}
          {isInteractive && !trend && (
            <ArrowUpRight
              className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0"
              aria-hidden="true"
            />
          )}
        </div>
      </Card>
    );

    if (href) {
      return <Link href={href}>{horizontalContent}</Link>;
    }
    return horizontalContent;
  }

  // ---- Vertical layout (default) ----
  const verticalContent = (
    <Card
      className={cn(
        cardVariants({ size, variant }),
        isInteractive && 'cursor-pointer hover:shadow-md active:scale-[0.99]',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className={headerVariants({ size })}>
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className={cn(
                iconContainerVariants({ size }),
                iconBgByVariant[variant]
              )}
            >
              <span className={iconColorByVariant[variant]}>{icon}</span>
            </div>
          )}
          <CardTitle className={titleVariants({ size })}>
            {title}
            <span className="sr-only">, value is {value}</span>
          </CardTitle>
        </div>
        {isInteractive && (
          <ArrowUpRight
            className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            aria-hidden="true"
          />
        )}
      </CardHeader>

      <CardContent className={contentVariants({ size })}>
        {/* Value */}
        <div className={valueVariants({ size })}>{value}</div>

        {/* Trend Badge */}
        {trend && (
          <div className="mt-2">
            <TrendBadge trend={trend} />
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {description}
          </p>
        )}

        {/* Custom children */}
        {children && <div className="mt-2">{children}</div>}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{verticalContent}</Link>;
  }
  return verticalContent;
}

// ---------------------------------------------------------------------------
// Trend Badge sub-component
// ---------------------------------------------------------------------------

function TrendBadge({
  trend,
  className,
}: {
  trend: UnifiedStatsCardTrend;
  className?: string;
}) {
  const isPositive = trend.isPositive ?? true;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge
        variant="outline"
        className={cn(
          'text-xs font-medium',
          isPositive
            ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950'
            : 'text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-800 dark:bg-red-950'
        )}
      >
        {isPositive ? (
          <TrendingUp className="mr-1 h-2.5 w-2.5" />
        ) : (
          <TrendingDown className="mr-1 h-2.5 w-2.5" />
        )}
        {trend.value}
      </Badge>
      {trend.label && (
        <span className="text-xs text-muted-foreground">{trend.label}</span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// UnifiedStatsGrid
// ---------------------------------------------------------------------------

export interface UnifiedStatsGridProps {
  /** Stats card children */
  children: React.ReactNode;
  /** Number of columns (responsive: always 1 on mobile, then specified count) */
  columns?: 2 | 3 | 4;
  /** Additional CSS classes */
  className?: string;
}

const gridColumnsMap: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

/**
 * UnifiedStatsGrid -- responsive grid wrapper for `UnifiedStatsCard` elements.
 *
 * Mobile always collapses to 1 column; `columns` sets the desktop max.
 *
 * @example
 * ```tsx
 * <UnifiedStatsGrid columns={4}>
 *   <UnifiedStatsCard title="A" value={1} />
 *   <UnifiedStatsCard title="B" value={2} />
 *   <UnifiedStatsCard title="C" value={3} />
 *   <UnifiedStatsCard title="D" value={4} />
 * </UnifiedStatsGrid>
 * ```
 */
export function UnifiedStatsGrid({
  children,
  columns = 4,
  className,
}: UnifiedStatsGridProps) {
  return (
    <div className={cn('grid gap-3 md:gap-4', gridColumnsMap[columns], className)}>
      {children}
    </div>
  );
}

export default UnifiedStatsCard;
