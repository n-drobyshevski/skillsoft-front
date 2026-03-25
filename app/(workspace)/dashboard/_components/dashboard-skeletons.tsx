import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getGridSpanClass, GRID_SPANS } from '@/components/dashboard';

/**
 * StatsRowSkeleton - Loading skeleton for the compact stats row.
 * Matches the layout of CompactStatsRow (4 cards on desktop, 2x2 on mobile).
 */
export function StatsRowSkeleton() {
  return (
    <div className="w-full">
      {/* Desktop: 4 in a row */}
      <div className="hidden md:grid md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-3 rounded-lg border bg-card h-[64px] min-h-[64px] animate-pulse"
          >
            <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      {/* Mobile: 2x2 grid */}
      <div className="grid grid-cols-2 gap-2.5 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-start gap-1.5 p-3 rounded-xl border bg-card w-full min-h-[76px] animate-pulse"
          >
            <div className="flex items-center gap-2 w-full">
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              <Skeleton className="h-6 flex-1 max-w-[60px]" />
            </div>
            <Skeleton className="h-3.5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * MainColumnSkeleton - Loading skeleton for the main content column.
 * Matches the layout of DashboardMainColumn (chart, progress, standards).
 */
export function MainColumnSkeleton() {
  return (
    <div className={getGridSpanClass(GRID_SPANS.xlarge)}>
      <div className="space-y-6">
        {/* Psychometric Health Widget Skeleton */}
        <Card className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-20 h-3" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-full h-3" />
                <Skeleton className="w-3/4 h-3" />
                <Skeleton className="w-1/2 h-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart Skeleton */}
        <Card className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="w-40 h-4" />
                  <Skeleton className="w-20 h-3" />
                </div>
              </div>
              <Skeleton className="w-16 h-7 rounded" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[260px] flex items-end gap-3 px-4">
              {[65, 85, 45, 70, 55, 90, 40].map((height, i) => (
                <Skeleton
                  key={i}
                  className="flex-1 rounded-t"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress & Standards Row Skeleton */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <Skeleton className="w-32 h-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="w-28 h-3" />
                  <Skeleton className="w-8 h-3" />
                </div>
                <Skeleton className="w-full h-1.5 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="w-24 h-3" />
                  <Skeleton className="w-8 h-3" />
                </div>
                <Skeleton className="w-full h-1.5 rounded-full" />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="w-28 h-4" />
                  <Skeleton className="w-20 h-3" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="w-24 h-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * SideColumnSkeleton - Loading skeleton for the sidebar column.
 * Matches the layout of DashboardSideColumn (actions, activity, stats, CTA).
 */
export function SideColumnSkeleton() {
  return (
    <div className={getGridSpanClass(GRID_SPANS.sidebar)}>
      <div className="space-y-6">
        {/* Quick Actions Skeleton */}
        <Card className="animate-pulse">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <Skeleton className="w-24 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-full h-9 rounded" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Skeleton */}
        <Card className="animate-pulse">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <Skeleton className="w-28 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="w-3/4 h-4" />
                    <Skeleton className="w-1/2 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Skeleton */}
        <Card className="animate-pulse border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
              <div className="space-y-3 flex-1">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-full h-3" />
                <Skeleton className="w-28 h-8 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * UserSectionSkeleton - Loading skeleton for the user dashboard sections.
 */
export function UserSectionSkeleton() {
  return (
    <div className="space-y-6 w-full">
      <Card className="animate-pulse border-blue-500/10">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="w-40 h-4" />
              <Skeleton className="w-24 h-3" />
              <Skeleton className="w-full h-1.5 rounded-full" />
            </div>
            <Skeleton className="w-20 h-8 rounded" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-3 rounded-lg border bg-card animate-pulse"
          >
            <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Skeleton className="w-28 h-3" />
        <div className="grid sm:grid-cols-2 gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-16 h-3" />
                  </div>
                  <Skeleton className="w-12 h-4 rounded-full" />
                </div>
                <Skeleton className="w-16 h-7" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
