/**
 * Settings Page Skeleton
 *
 * Loading placeholder shown during hydration.
 * Matches the layout of the settings page for smooth UX.
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Appearance Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Section */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-48" />
            <div className="grid grid-cols-3 gap-3 pt-2">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>

          {/* Language Section */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-10 w-48" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
