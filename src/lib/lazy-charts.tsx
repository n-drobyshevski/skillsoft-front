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

// Composite Chart Components (lazy-loaded)
// These are higher-level chart components that internally use recharts.
// Lazy-loading them avoids pulling ~45KB gzipped recharts into the main bundle.

export const LazyBigFiveRadar = dynamic(
  () => import('@/components/charts/BigFiveRadar').then((mod) => ({ default: mod.BigFiveRadar })),
  { loading: () => <CompactChartSkeleton />, ssr: false }
);

export const LazyBigFiveRadarSimple = dynamic(
  () => import('@/components/charts/BigFiveRadar').then((mod) => ({ default: mod.BigFiveRadarSimple })),
  { loading: () => <CompactChartSkeleton />, ssr: false }
);

export const LazyTeamSaturationRadar = dynamic(
  () => import('@/components/results/TeamSaturationRadar'),
  { loading: () => <ChartSkeleton />, ssr: false }
);

export const LazyIndicatorHeatmap = dynamic(
  () => import('@/components/results/IndicatorHeatmap').then((mod) => ({ default: mod.IndicatorHeatmap })),
  { loading: () => <ChartSkeleton height={200} />, ssr: false }
);

export const LazyCompetencyRadarChart = dynamic(
  () => import('@/components/data-display/charts/CompetencyRadarChart'),
  { loading: () => <CompactChartSkeleton />, ssr: false }
);

export const LazyCompetencyByCategoryBarChart = dynamic(
  () => import('@/components/data-display/charts/CompetencyByCategoryBarChart'),
  { loading: () => <ChartSkeleton />, ssr: false }
);

export const LazyGapAnalysisBarChart = dynamic(
  () => import('@/components/data-display/charts/GapAnalysisBarChart'),
  { loading: () => <ChartSkeleton />, ssr: false }
);

export const LazyWeightDistributionPie = dynamic(
  () => import('@/components/data-display/charts/WeightDistributionPie'),
  { loading: () => <CompactChartSkeleton />, ssr: false }
);

export const LazyCompetencyByLevelBarChart = dynamic(
  () => import('@/components/data-display/charts/CompetencyByLevelBarChart'),
  { loading: () => <ChartSkeleton />, ssr: false }
);

export const LazyAverageIndicatorsGauge = dynamic(
  () => import('@/components/data-display/charts/AverageIndicatorsGauge'),
  { loading: () => <CompactChartSkeleton />, ssr: false }
);

// Page-level Chart Components (lazy-loaded from app/ directory)
// These are full-featured chart components used in workspace pages.

export const LazyBigFiveChart = dynamic(
  () => import('../../app/(workspace)/profile/_components/BigFiveChart'),
  { loading: () => <CompactChartSkeleton />, ssr: false }
);

export const LazyScoreSparkline = dynamic(
  () => import('../../app/(workspace)/profile/_components/ScoreSparkline'),
  { ssr: false }
);

export const LazyRadialReliabilityChart = dynamic(
  () => import('../../app/(workspace)/psychometrics/_components/charts/RadialReliabilityChart'),
  { loading: () => <CompactChartSkeleton />, ssr: false }
);

export const LazyMetricDistributionCharts = dynamic(
  () => import('../../app/(workspace)/psychometrics/_components/charts/MetricDistributionChart'),
  { loading: () => <ChartSkeleton height={320} />, ssr: false }
);

export const LazyItemQualityScatter = dynamic(
  () => import('../../app/(workspace)/psychometrics/_components/charts/ItemQualityScatter'),
  { loading: () => <ChartSkeleton height={450} />, ssr: false }
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
