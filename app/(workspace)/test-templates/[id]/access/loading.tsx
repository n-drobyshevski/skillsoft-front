import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function AccessLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="space-y-6">
        {/* Visibility Section */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </CardContent>
        </Card>

        {/* People Section */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Invite Form */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
            {/* List */}
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Links Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-9 w-28" />
          </CardHeader>
          <CardContent className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16 ml-auto" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
