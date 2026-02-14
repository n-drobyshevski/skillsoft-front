import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Loading skeleton for the test history page.
 * Matches the layout: page header, tabs, stats grid, and result cards list.
 */
export default function TestHistoryLoading() {
  return (
    <div className="flex flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6 max-w-5xl mx-auto w-full animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 bg-muted/50 p-1 rounded-lg w-full md:w-auto">
        <Skeleton className="h-10 w-32 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Result Cards List */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-40 mb-2" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-8 w-8" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
