import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Full page skeleton for profile page loading state
 * Includes aria-busy and screen reader announcements for accessibility
 */
export function ProfileSkeleton() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="Loading profile..."
      role="status"
    >
      {/* Screen reader announcement */}
      <span className="sr-only">Loading profile information, please wait...</span>

      {/* Profile Header Skeleton */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-full shrink-0" />
            <div className="flex-1 space-y-3 w-full text-center sm:text-left">
              <Skeleton className="h-7 w-48 mx-auto sm:mx-0" />
              <Skeleton className="h-5 w-24 mx-auto sm:mx-0" />
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center sm:justify-start">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Summary Skeleton */}
      <SectionSkeleton title="История оценок" />

      {/* Competency Passport Skeleton */}
      <SectionSkeleton title="Паспорт компетенций" />
    </div>
  );
}

/**
 * Section skeleton component with accessibility support
 */
export function SectionSkeleton({ title }: { title: string }) {
  return (
    <Card aria-busy="true" aria-label={`Loading ${title}...`}>
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-40" aria-hidden="true" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-muted/50 rounded-lg p-3 sm:p-4 text-center">
              <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-2" aria-hidden="true" />
              <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 mx-auto mb-2" aria-hidden="true" />
              <Skeleton className="h-3 w-16 sm:w-20 mx-auto" aria-hidden="true" />
            </div>
          ))}
        </div>

        {/* Content rows */}
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" aria-hidden="true" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Quick stats grid skeleton for dashboard loading states
 */
export function QuickStatsGridSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading statistics..."
      role="status"
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      <span className="sr-only">Loading statistics, please wait...</span>
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} aria-hidden="true">
          <CardContent className="p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
