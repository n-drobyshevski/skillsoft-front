import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Loading skeleton for competency detail page.
 * Matches the real layout: EntityDetailHeader (back button, title, badges,
 * action buttons), then a two-column grid with description card, tabbed
 * indicators/questions panel (left) and details + standards + weight chart (right).
 */
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-5 max-w-6xl animate-fade-in-up">
      {/* EntityDetailHeader skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Left: back button + title + badges */}
        <div className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-md shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
          </div>
        </div>
        {/* Right: action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description card */}
          <Card className="border-none shadow-sm bg-muted/30">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-5 w-24" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>

          {/* Tabbed card (indicators / questions) */}
          <Card className="overflow-hidden">
            {/* Tab list */}
            <div className="border-b p-1">
              <div className="grid grid-cols-2 gap-1">
                <Skeleton className="h-9 w-full rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </div>
            {/* Tab content: indicator list */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-5 w-6 rounded-full" />
                </div>
                <Skeleton className="h-8 w-28 rounded-md" />
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="bg-background/50 border-border/50">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3 p-4">
                      <Skeleton className="w-2 h-8 rounded-full" />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-5 w-28 rounded-full" />
                        </div>
                        <Skeleton className="h-3 w-64" />
                      </div>
                      <Skeleton className="h-6 w-12 rounded-md" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar - 1/3 */}
        <div className="space-y-6">
          {/* Details card */}
          <Card className="border-none shadow-sm bg-muted/30">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Standards Mapping card */}
          <Card className="border-none shadow-sm bg-muted/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-5 w-36" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-3 rounded-lg border space-y-2">
                  <div className="flex items-start gap-2.5">
                    <Skeleton className="h-7 w-7 rounded" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weight Distribution card */}
          <Card className="border-none shadow-sm bg-muted/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-5 w-36" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2.5">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <Skeleton className="w-2.5 h-2.5 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
              <div className="pt-3 mt-4 border-t border-border/60">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
