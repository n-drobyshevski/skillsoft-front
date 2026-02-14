import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Loading skeleton for the psychometrics item detail page.
 * Matches the layout: header with gradient, quick stats,
 * question section, gauges, thresholds, and detail cards.
 */
export default function ItemDetailLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:gap-8 md:p-6 animate-fade-in-up">
      {/* Header with Status Badge */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>

      {/* Quick Stats Row */}
      <div className="flex flex-wrap gap-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-40" />
      </div>

      {/* Question Section */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* Gauges Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex flex-col items-center space-y-3">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Thresholds Accordion */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-3">
          <Skeleton className="h-5 w-44" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
