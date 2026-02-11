import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Loading skeleton for Flagged Item Detail page
 *
 * Mobile-first design with responsive adjustments.
 * Matches the exact layout to prevent CLS (Cumulative Layout Shift).
 */
export default function FlaggedItemDetailLoading() {
  return (
    <div className="flex flex-1 flex-col min-h-screen">
      {/* Mobile Header Skeleton */}
      <header className="sticky top-0 z-40 bg-background border-b md:hidden">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="px-3 pb-2">
          <Skeleton className="h-4 w-36" />
        </div>
      </header>

      {/* Desktop Header Skeleton */}
      <div className="hidden md:flex flex-col gap-4 p-4 pt-6 md:p-6">
        {/* Back link */}
        <Skeleton className="h-5 w-32" />
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-36" />
          </div>
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-3 pb-24 md:p-6 md:pt-0 space-y-4 md:space-y-6">
        {/* Alert Banner Skeleton */}
        <Card className="border-l-4 border-l-muted">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Card Skeleton */}
        <Card>
          <CardHeader className="pb-2 px-3 pt-3 md:px-6 md:pt-6 md:pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-5 w-28" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3 md:px-6 md:pb-6">
            <div className="space-y-2 mb-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>

        {/* Metrics Row Skeleton - Mobile: 3 columns, Desktop: side by side cards */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border bg-card p-2 space-y-1">
              <div className="flex items-baseline justify-between">
                <Skeleton className="h-3 w-4" />
                <Skeleton className="h-5 w-10" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>

        {/* Desktop Gauges Skeleton */}
        <div className="hidden md:grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-4 w-48 mt-1" />
              </CardHeader>
              <CardContent className="flex justify-center py-4">
                <Skeleton className="h-32 w-48 rounded-t-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Accordion Sections Skeleton - Mobile */}
        <div className="space-y-2 md:hidden">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>

        {/* Desktop Additional Content Skeleton */}
        <div className="hidden md:block">
          {/* Metrics Comparison Skeleton */}
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-52" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Stats Grid Skeleton */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Two-column layout skeleton */}
          <div className="grid gap-6 lg:grid-cols-2 mt-6">
            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-44" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Skeleton className="h-2 w-2 rounded-full mt-1.5" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-48" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Full stats link skeleton */}
        <div className="pt-2 flex justify-center">
          <Skeleton className="h-11 w-full md:w-64" />
        </div>
      </main>

      {/* Mobile Action Bar Skeleton */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-background border-t p-3 md:hidden">
        <div className="flex gap-2 max-w-lg mx-auto">
          <Skeleton className="flex-1 h-11" />
          <Skeleton className="h-11 w-11" />
        </div>
      </div>
    </div>
  );
}
