import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Loading skeleton for the test results page.
 * Matches Direction B "Command Center" layout:
 * hero strip → tab nav → metric cards → dashboard panels.
 */
export default function TestTemplateResultLoading() {
  return (
    <div className="w-full max-w-[1600px] mx-auto animate-fade-in-up">
      {/* Hero Strip Skeleton */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 sm:px-6 py-3">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="hidden sm:flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>

      {/* Tab Nav Skeleton */}
      <div className="border-b border-border px-4 sm:px-6">
        <div className="flex gap-6 py-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="rounded-xl">
              <CardContent className="p-4 flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Chart Panel Skeleton */}
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <Skeleton className="h-3 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] rounded-lg" />
          </CardContent>
        </Card>

        {/* Two-Column Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="rounded-xl">
            <CardHeader className="pb-2">
              <Skeleton className="h-3 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardHeader className="pb-2">
              <Skeleton className="h-3 w-36" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[280px] rounded-lg" />
            </CardContent>
          </Card>
        </div>

        {/* Trend Panel Skeleton */}
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <Skeleton className="h-3 w-36" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] rounded-lg" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
