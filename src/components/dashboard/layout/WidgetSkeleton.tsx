'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Skeleton height variants
 */
type SkeletonHeight = 'sm' | 'md' | 'lg';

/**
 * Skeleton variant determines the internal structure
 */
type SkeletonVariant = 'card' | 'chart' | 'list' | 'stats';

interface WidgetSkeletonProps {
  /** Height variant */
  height?: SkeletonHeight;
  /** Content variant */
  variant?: SkeletonVariant;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show header icon skeleton */
  showIcon?: boolean;
}

const heightMap: Record<SkeletonHeight, string> = {
  sm: 'h-[120px]',
  md: 'h-[200px]',
  lg: 'h-[300px]',
};

/**
 * WidgetSkeleton - Loading skeleton for dashboard widgets.
 *
 * Provides consistent loading states with different variants:
 * - card: Simple card with value and description
 * - chart: Chart placeholder area
 * - list: Multiple row placeholders
 * - stats: Compact stats display
 *
 * @example
 * ```tsx
 * <Suspense fallback={<WidgetSkeleton variant="chart" height="lg" />}>
 *   <ChartWidget />
 * </Suspense>
 * ```
 */
export function WidgetSkeleton({
  height = 'md',
  variant = 'card',
  className,
  showIcon = true,
}: WidgetSkeletonProps) {
  return (
    <Card className={cn('animate-pulse', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showIcon && <Skeleton className="w-9 h-9 rounded-lg" />}
            <div className="space-y-1">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-16 h-3" />
            </div>
          </div>
          <Skeleton className="w-6 h-6 rounded" />
        </div>
      </CardHeader>
      <CardContent>
        {variant === 'chart' && (
          <Skeleton className={cn('w-full rounded-lg', heightMap[height])} />
        )}

        {variant === 'list' && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="w-3/4 h-4" />
                  <Skeleton className="w-1/2 h-3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {variant === 'card' && (
          <div className="space-y-3">
            <Skeleton className="w-20 h-8" />
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-full h-3" />
          </div>
        )}

        {variant === 'stats' && (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/30">
                <Skeleton className="w-12 h-6 mb-1" />
                <Skeleton className="w-16 h-3" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * StatsCardSkeleton - Loading skeleton for individual stats cards.
 */
export function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('animate-pulse', className)}>
      <CardHeader className="flex flex-row items-center gap-3 p-4 pb-2">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  );
}

/**
 * StatsRowSkeleton - Loading skeleton for stats cards row.
 */
export function StatsRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}
