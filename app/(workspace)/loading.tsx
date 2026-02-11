import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Workspace-level loading state
 * 
 * This loading UI is shown while the workspace content loads.
 * The sidebar and header from layout.tsx remain visible and interactive
 * because layouts are not re-rendered during navigation (Next.js 16 feature).
 * 
 * This provides instant feedback when navigating between workspace routes.
 * 
 * Structure matches common page layout:
 * - PageHeader (title + description + optional action buttons)
 * - Stats cards (4 columns on large screens)
 * - Main content area (table or content cards)
 */
export default function WorkspaceLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6 animate-fade-in-up">
      {/* Page Header Skeleton - matches PageHeader component */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="space-y-1 sm:space-y-2">
          <Skeleton className="h-7 w-48 sm:h-8" />
          <Skeleton className="h-4 w-80 sm:h-5" />
        </div>
        {/* Action buttons skeleton */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Stats Cards Skeleton - matches FlexibleStatsCards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="card-modern">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Skeleton - matches TableSkeleton component */}
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <Skeleton className="h-9 w-full max-w-lg" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-[100px]" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border">
          <div className="w-full">
            {/* Header */}
            <div className="flex border-b bg-muted/30">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-1 p-3">
                  <Skeleton className="h-5 w-3/4" />
                </div>
              ))}
            </div>
            {/* Body */}
            <div>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex border-b p-3">
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
