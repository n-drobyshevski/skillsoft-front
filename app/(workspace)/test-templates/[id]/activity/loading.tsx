import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Loading skeleton for the template activity page.
 * Matches the layout: page header, 3-column grid with stats sidebar
 * and activity table with filter pills.
 */
export default function TemplateActivityLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Stats Card (sidebar) */}
        <Card className="order-first lg:order-last">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
            <Skeleton className="h-[120px] w-full rounded-lg mt-2" />
          </CardContent>
        </Card>

        {/* Activity Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
            {/* Filter Pills */}
            <div className="flex gap-2 mt-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-28" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
