import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function SettingsLoading() {
  return (
    <div className="p-4 lg:p-6 max-w-2xl">
      {/* Header Skeleton */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Settings Form Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full" />
          </div>

          {/* Status Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Divider */}
          <div className="border-t pt-6">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>

          {/* Danger Actions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
              <div className="space-y-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-9 w-20" />
            </div>

            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
              <div className="space-y-1">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-56" />
              </div>
              <Skeleton className="h-9 w-16" />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}