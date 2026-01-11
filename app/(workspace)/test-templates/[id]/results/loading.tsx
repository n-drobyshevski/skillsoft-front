import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Loading skeleton for Results page
 * Mobile-first: 2-col stats grid, stacked filters
 * Desktop: 4-col stats grid, inline filters
 */
export default function ResultsLoading() {
  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[100vw] overflow-hidden">
      {/* Stats Header - Mobile: 2 cols, Desktop: 4 cols */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-1">
                <Skeleton className="h-4 w-4 shrink-0" />
                <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
              </div>
              <Skeleton className="h-6 sm:h-8 w-10 sm:w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sessions Card */}
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <Skeleton className="h-5 sm:h-6 w-32" />
              <Skeleton className="h-3 sm:h-4 w-56" />
            </div>
            <Skeleton className="h-9 w-full sm:w-24" />
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {/* Filters - Mobile: stacked, Desktop: row */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-0 sm:mb-6 border-b sm:border-0 bg-muted/5 sm:bg-transparent">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-full sm:w-[180px]" />
          </div>

          {/* Table (desktop) / List (mobile) */}
          <div className="hidden sm:block">
            {/* Desktop Table Header */}
            <div className="border-b p-4 hidden sm:block">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20 ml-auto" />
              </div>
            </div>
            {/* Desktop Table Rows */}
            <div className="divide-y">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-24 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile List */}
          <div className="sm:hidden divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-16 rounded-full shrink-0" />
                    </div>
                    <Skeleton className="h-3 w-40" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination - Mobile: simplified, Desktop: full */}
      <div className="flex items-center justify-between">
        <Skeleton className="hidden sm:block h-4 w-32" />
        <div className="flex items-center gap-1 sm:gap-2 mx-auto sm:mx-0">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="hidden sm:block h-8 w-8 rounded" />
          <Skeleton className="hidden sm:block h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  );
}