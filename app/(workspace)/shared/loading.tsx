import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Loading skeleton for the shared templates page.
 * Matches the layout: page header, results count, and responsive card grid.
 */
export default function SharedLoading() {
  return (
    <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-2 sm:p-4 md:p-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      {/* Results Count */}
      <Skeleton className="h-4 w-32" />

      {/* Card Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-muted" />
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
                <Skeleton className="h-5 w-16 shrink-0" />
              </div>
              <Skeleton className="h-5 w-20 mt-2" />
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center gap-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex items-center gap-2 pt-2 border-t">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
