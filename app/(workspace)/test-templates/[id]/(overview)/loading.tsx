import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function OverviewLoading() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Blueprint Spec Sheet */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-3 w-16 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Competency Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <div className="border-b p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            <div className="divide-y">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-2 w-24 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <div className="border-b p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-8 w-20 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}