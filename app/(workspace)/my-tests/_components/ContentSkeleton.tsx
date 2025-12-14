import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Content skeleton for Suspense fallback
 * Shows loading state for tabs and template groups while data is fetching
 */
export function ContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Stats Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
          >
            <Skeleton className="size-10 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-6 w-8" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2 p-1 bg-muted/50 rounded-lg w-fit">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-9 w-28 rounded-md" />
        ))}
      </div>

      {/* Template groups skeleton */}
      <div className="grid gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <Skeleton className="h-5 w-48" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {/* Test card skeleton */}
              <div className="p-3 rounded-lg border space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-8 w-28 rounded-md" />
                </div>
                <Skeleton className="h-4 w-40" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-1.5 flex-1 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
