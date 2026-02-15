import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Loading skeleton for the Edit Behavioral Indicator page.
 * Matches the layout: sticky header bar, tabs, then a
 * two-column grid with form and preview panel.
 */
export default function EditIndicatorLoading() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sticky header bar */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Skeleton className="h-8 w-56" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Tabs skeleton */}
        <div className="flex items-center space-x-1 rounded-lg bg-muted p-1 mb-6">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>

        {/* Two-column form layout */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Main form - 3/5 */}
          <div className="xl:col-span-3">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-1" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Title */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
                {/* Description */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-24 w-full" />
                </div>
                {/* Measurement Type / Observability */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                {/* Weight / Active toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-28" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview sidebar - 2/5 */}
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-20" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-px w-full" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
