import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function NewTeamLoading() {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header Skeleton */}
      <div className="py-4">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-4">
        {/* Form Skeleton */}
        <div className="lg:col-span-2 order-2 lg:order-1 space-y-6">
          {/* Basic Info Section */}
          <Card>
            <CardHeader className="bg-muted/40 border-b">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-56" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Members Section */}
          <Card>
            <CardHeader className="bg-muted/40 border-b">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div>
                  <Skeleton className="h-5 w-28 mb-1" />
                  <Skeleton className="h-4 w-52" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          {/* Settings Section */}
          <Card>
            <CardHeader className="bg-muted/40 border-b">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div>
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-4 w-44" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <Skeleton className="h-16 w-full rounded-lg" />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Preview Skeleton */}
        <div className="order-1 lg:order-2">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-px w-full" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-14 rounded-lg" />
                <Skeleton className="h-14 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
