import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Loading skeleton for the New Behavioral Indicator page.
 * Matches the page layout: header, tabs, then a two-column
 * grid with form fields and a preview sidebar.
 */
export default function NewIndicatorLoading() {
  return (
    <div className="container mx-auto p-4">
      {/* Page Header */}
      <div className="py-4">
        <Skeleton className="h-8 w-64" />
      </div>

      {/* Tabs skeleton */}
      <div className="mt-4">
        <div className="flex items-center gap-1 border-b pb-1">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-40 rounded-md" />
        </div>
      </div>

      {/* Two-column form layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        {/* Main form - 2/3 */}
        <div className="lg:col-span-2">
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

        {/* Sidebar preview - 1/3 */}
        <div className="hidden lg:block">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-20" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-px w-full" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
