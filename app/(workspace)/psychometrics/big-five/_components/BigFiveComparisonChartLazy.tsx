'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BigFiveReliability } from '@/types/psychometrics';

/**
 * Loading skeleton for the chart while Recharts loads
 */
function ChartSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-64 mt-1" />
      </CardHeader>
      <CardContent className="pt-4">
        <Skeleton className="h-[280px] w-full rounded-lg" />
        <div className="flex justify-center gap-4 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Skeleton className="h-1 w-4 rounded" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Dynamically imported BigFiveComparisonChart.
 * Reduces initial bundle size by ~200KB by lazy loading Recharts.
 * Only loads when the component is rendered (desktop/tablet view).
 */
const BigFiveComparisonChartDynamic = dynamic(
  () => import('./BigFiveComparisonChart').then(mod => ({ default: mod.BigFiveComparisonChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: true, // Keep SSR for SEO and initial render
  }
);

interface BigFiveComparisonChartLazyProps {
  reliabilityData: BigFiveReliability[];
  className?: string;
}

/**
 * Lazy-loaded wrapper for BigFiveComparisonChart.
 * Use this instead of BigFiveComparisonChart directly to reduce bundle size.
 */
export function BigFiveComparisonChartLazy({ reliabilityData, className }: BigFiveComparisonChartLazyProps) {
  return <BigFiveComparisonChartDynamic reliabilityData={reliabilityData} className={className} />;
}
