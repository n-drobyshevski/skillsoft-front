'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from './utils';

/**
 * Lazy Chart Loading Utilities
 *
 * Provides dynamically imported versions of heavy chart components
 * to reduce initial bundle size and improve page load performance.
 *
 * Usage:
 * ```tsx
 * import { LazyBarChart } from '@/lib/lazy-charts';
 *
 * function MyComponent() {
 *   return (
 *     <LazyBarChart data={data} ... />
 *   );
 * }
 * ```
 */

// Chart loading placeholder
function ChartSkeleton({ height = 300, className }: { height?: number; className?: string }) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <Skeleton className="h-full w-full rounded-lg" />
    </div>
  );
}

// Compact chart loading placeholder for smaller charts
function CompactChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <Skeleton className="h-24 w-24 rounded-full" />
    </div>
  );
}

// Dynamically import Recharts components with loading states
// These will only be loaded when actually used on the page

export const LazyBarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const LazyLineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const LazyAreaChart = dynamic(
  () => import('recharts').then((mod) => mod.AreaChart),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const LazyPieChart = dynamic(
  () => import('recharts').then((mod) => mod.PieChart),
  {
    loading: () => <CompactChartSkeleton />,
    ssr: false,
  }
);

export const LazyScatterChart = dynamic(
  () => import('recharts').then((mod) => mod.ScatterChart),
  {
    loading: () => <ChartSkeleton height={400} />,
    ssr: false,
  }
);

export const LazyRadarChart = dynamic(
  () => import('recharts').then((mod) => mod.RadarChart),
  {
    loading: () => <CompactChartSkeleton />,
    ssr: false,
  }
);

export const LazyRadialBarChart = dynamic(
  () => import('recharts').then((mod) => mod.RadialBarChart),
  {
    loading: () => <CompactChartSkeleton />,
    ssr: false,
  }
);

export const LazyResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  {
    ssr: false,
  }
);

/**
 * Preload chart library for routes that will need it
 * Call this in useEffect on parent pages to start loading early
 */
export function preloadCharts() {
  if (typeof window !== 'undefined') {
    import('recharts');
  }
}

/**
 * Chart loading wrapper component
 * Handles loading state and error boundaries for chart components
 */
interface ChartLoadingWrapperProps {
  children: React.ReactNode;
  height?: number;
  className?: string;
  isLoading?: boolean;
}

export function ChartLoadingWrapper({
  children,
  height = 300,
  className,
  isLoading,
}: ChartLoadingWrapperProps) {
  if (isLoading) {
    return <ChartSkeleton height={height} className={className} />;
  }

  return <div className={className}>{children}</div>;
}
