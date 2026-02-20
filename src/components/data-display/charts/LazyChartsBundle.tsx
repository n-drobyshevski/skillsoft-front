'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

/**
 * Shared loading placeholder for the charts bundle.
 * Renders a pulsing rounded rectangle matching the typical chart area.
 */
function ChartBundleSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse h-64 bg-muted rounded-lg', className)} />
  );
}

/**
 * Lazy-loaded charts bundle.
 *
 * Instead of three separate `next/dynamic` calls (one per chart), this single
 * dynamic import pulls all three result-view charts into one webpack chunk.
 * The browser makes a single network request, and recharts (the heaviest
 * transitive dependency) is included exactly once.
 *
 * Usage in result views:
 * ```tsx
 * import LazyChartsBundle from '@/components/data-display/charts/LazyChartsBundle';
 *
 * // In component body:
 * const { BigFiveRadarSimple, CompetencyRadarChart, IndicatorHeatmap } = LazyChartsBundle;
 * ```
 *
 * NOTE: Because `next/dynamic` wraps the *entire module* as a single component,
 * we cannot destructure at the top level the way you would with a normal import.
 * Instead, we expose each chart as its own lazy component below.
 */

/**
 * Lazily loaded BigFiveRadarSimple chart.
 * Shares the same chunk as CompetencyRadarChart and IndicatorHeatmap.
 */
export const LazyBigFiveRadarSimple = dynamic(
  () =>
    import('./ChartsBundle').then((mod) => ({
      default: mod.BigFiveRadarSimple,
    })),
  {
    ssr: false,
    loading: () => <ChartBundleSkeleton />,
  }
);

/**
 * Lazily loaded CompetencyRadarChart.
 * Shares the same chunk as BigFiveRadarSimple and IndicatorHeatmap.
 */
export const LazyCompetencyRadarChart = dynamic(
  () =>
    import('./ChartsBundle').then((mod) => ({
      default: mod.CompetencyRadarChart,
    })),
  {
    ssr: false,
    loading: () => <ChartBundleSkeleton />,
  }
);

/**
 * Lazily loaded IndicatorHeatmap.
 * Shares the same chunk as BigFiveRadarSimple and CompetencyRadarChart.
 */
export const LazyIndicatorHeatmap = dynamic(
  () =>
    import('./ChartsBundle').then((mod) => ({
      default: mod.IndicatorHeatmap,
    })),
  {
    ssr: false,
    loading: () => <ChartBundleSkeleton />,
  }
);
