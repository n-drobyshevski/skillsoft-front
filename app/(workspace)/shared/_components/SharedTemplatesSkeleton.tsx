import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * SharedTemplatesSkeleton - Loading skeleton for shared templates grid
 *
 * Displays a responsive grid of card skeletons that match the SharedTemplateCard layout.
 */
export function SharedTemplatesSkeleton() {
  return (
    <div className="space-y-4">
      {/* Results count skeleton */}
      <Skeleton className="h-4 w-32" />

      {/* Grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="relative overflow-hidden">
            {/* Permission indicator strip */}
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
              {/* Stats */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>

              {/* Shared by */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>

              {/* Actions */}
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
