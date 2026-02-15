import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

/**
 * File-based loading skeleton for My Tests page
 * Automatically shown by Next.js while page.tsx is fetching data
 * Replaces inline LoadingSkeleton and dynamic import loading
 */
export default function MyTestsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {/* Page Header - Static content renders immediately */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <ClipboardList className="size-6 text-primary" />
            </div>
            <Skeleton className="h-8 w-40" />
          </div>
          <Skeleton className="h-4 w-64" />
        </header>

        {/* Summary Stats Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
            >
              <Skeleton className="size-10 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs skeleton */}
        <div className="flex gap-2 p-1 bg-muted/50 rounded-lg mb-6 w-fit">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-9 w-28 rounded-md" />
          ))}
        </div>

        {/* Template groups skeleton */}
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <Skeleton className="h-5 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {/* Test card skeleton */}
                <div className="p-3 rounded-lg border space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="h-8 w-28 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-40" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-1.5 flex-1 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
