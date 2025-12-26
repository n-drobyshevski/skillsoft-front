'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { ItemStatistics, CompetencyReliability } from '@/types/psychometrics';

// Chart loading skeletons
function ChartSkeleton({ height = 400 }: { height?: number }) {
  return <Skeleton className={`w-full rounded-lg`} style={{ height }} />;
}

function GaugesSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DistributionChartsSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[160px] w-full rounded-lg" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[160px] w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Lazy-loaded ItemQualityScatter
 * Deferred loading of the scatter plot chart to reduce initial bundle size
 */
export const ItemQualityScatterLazy = dynamic(
  () => import('./ItemQualityScatter').then((mod) => mod.ItemQualityScatter),
  {
    loading: () => <ChartSkeleton height={450} />,
    ssr: false, // Recharts requires client-side rendering
  }
);

/**
 * Lazy-loaded MetricDistributionCharts
 * Deferred loading of difficulty/discrimination distribution histograms
 */
export const MetricDistributionChartsLazy = dynamic(
  () => import('./MetricDistributionChart').then((mod) => mod.MetricDistributionCharts),
  {
    loading: () => <DistributionChartsSkeleton />,
    ssr: false,
  }
);

/**
 * Lazy-loaded DifficultyDistributionChart
 */
export const DifficultyDistributionChartLazy = dynamic(
  () => import('./MetricDistributionChart').then((mod) => mod.DifficultyDistributionChart),
  {
    loading: () => <ChartSkeleton height={200} />,
    ssr: false,
  }
);

/**
 * Lazy-loaded DiscriminationDistributionChart
 */
export const DiscriminationDistributionChartLazy = dynamic(
  () => import('./MetricDistributionChart').then((mod) => mod.DiscriminationDistributionChart),
  {
    loading: () => <ChartSkeleton height={200} />,
    ssr: false,
  }
);

/**
 * Lazy-loaded ReliabilityGauge
 */
export const ReliabilityGaugeLazy = dynamic(
  () => import('./ReliabilityGauge').then((mod) => mod.ReliabilityGauge),
  {
    loading: () => <Skeleton className="h-[100px] w-full rounded-lg" />,
    ssr: false,
  }
);

/**
 * Lazy-loaded RadialReliabilityChart
 */
export const RadialReliabilityChartLazy = dynamic(
  () => import('./RadialReliabilityChart').then((mod) => mod.RadialReliabilityChart),
  {
    loading: () => <Skeleton className="h-[200px] w-full rounded-lg" />,
    ssr: false,
  }
);

// Re-export the types for consumers
export type {
  ItemStatistics as ItemQualityScatterItem,
  CompetencyReliability as GaugeCompetency,
};
