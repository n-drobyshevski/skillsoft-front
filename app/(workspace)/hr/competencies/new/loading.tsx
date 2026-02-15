import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Loading skeleton for the New Competency page.
 * Matches the page layout: header, then a two-column grid
 * with the competency form and a preview sidebar.
 */
export default function NewCompetencyLoading() {
  return (
    <div className="container mx-auto p-4">
      {/* Page Header */}
      <div className="py-4">
        <Skeleton className="h-8 w-48" />
      </div>

      {/* Two-column form layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        {/* Main form - 2/3 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-36 mb-1" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              {/* Category / Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              {/* Description */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-24 w-full" />
              </div>
              {/* Standard Codes section */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-12 rounded-full" />
                <Skeleton className="h-4 w-16" />
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
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-px w-full" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
