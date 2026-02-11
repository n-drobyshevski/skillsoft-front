import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading skeleton for the Big Five page.
 * Matches the layout structure for a seamless loading experience.
 */
export default function BigFiveLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:gap-8 md:p-6">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {/* Hero Banner Skeleton */}
      <div className="rounded-lg border p-4 bg-muted/30">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="hidden sm:block text-right space-y-1">
            <Skeleton className="h-3 w-12 ml-auto" />
            <Skeleton className="h-8 w-14 ml-auto" />
          </div>
        </div>
      </div>

      {/* Summary Stats Card Skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-5 w-36" />
          </div>
        </CardHeader>
        <CardContent>
          {/* 2x2 grid on mobile, 4 columns on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center p-3 rounded-lg bg-muted/50">
                <Skeleton className="h-4 w-4 mx-auto mb-2" />
                <Skeleton className="h-7 w-8 mx-auto mb-1" />
                <Skeleton className="h-3 w-14 mx-auto" />
              </div>
            ))}
          </div>

          {/* Average/Range row */}
          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 sm:gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center space-y-1">
                <Skeleton className="h-3 w-16 mx-auto" />
                <Skeleton className="h-6 w-10 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart Skeleton */}
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="pt-4">
          <Skeleton className="h-[220px] w-full rounded-lg" />
          {/* Legend */}
          <div className="flex justify-center gap-4 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Skeleton className="h-1 w-4 rounded" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Carousel Skeleton (visible on small screens) */}
      <div className="sm:hidden">
        <div className="flex gap-4 overflow-hidden pb-4 -mx-4 px-4">
          {[1, 2].map((i) => (
            <Card key={i} className="shrink-0 w-[280px]">
              <CardContent className="p-4 pt-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-10 w-16 mb-4" />
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-14 rounded-md" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Pagination dots skeleton */}
        <div className="flex justify-center gap-2 mt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="w-2.5 h-2.5 rounded-full" />
          ))}
        </div>
      </div>

      {/* Desktop Grid Skeleton (visible on larger screens) */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 pt-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-10 w-16 mb-4" />
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-14 rounded-md" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Accordion Skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-10 rounded" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
