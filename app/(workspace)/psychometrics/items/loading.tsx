import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading skeleton for the psychometrics items table page.
 * Matches the layout: page header, filter bar, and table rows.
 */
export default function PsychometricsItemsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:gap-8 md:p-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24" />
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
