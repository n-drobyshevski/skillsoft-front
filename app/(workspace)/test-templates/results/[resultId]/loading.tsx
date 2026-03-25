import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Loading skeleton for the test results page.
 * Matches Direction B "Command Center" layout for Team Fit scenario:
 * hero strip → tab nav → insights bar → metric cards →
 * saturation (radar + contribution) → comparison (personality + heatmap) →
 * competencies → onboarding.
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

      {/* Insights Bar Skeleton */}
      <div className="px-4 sm:px-6 py-2 flex gap-3">
        <Skeleton className="h-7 w-40 rounded-full" />
        <Skeleton className="h-7 w-48 rounded-full" />
        <Skeleton className="h-7 w-36 rounded-full hidden sm:block" />
      </div>

      {/* Dashboard Content */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">

        {/* Section: Overview — Metric Cards */}
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

        {/* Section: Saturation — Radar (left) + Contribution (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Team Saturation Radar */}
          <Card className="rounded-xl">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-36" />
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {/* Radar chart placeholder */}
              <Skeleton className="w-[280px] h-[280px] rounded-full" />
              {/* Quick stats row */}
              <div className="grid grid-cols-3 gap-2 w-full pt-3 border-t">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="text-center p-2.5">
                    <Skeleton className="h-3 w-16 mx-auto mb-1" />
                    <Skeleton className="h-5 w-8 mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Your Contribution */}
          <Card className="rounded-xl">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-36" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-3 w-28" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full rounded-xl" />
              ))}
              <div className="border-t border-border my-3" />
              <Skeleton className="h-3 w-24" />
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={`g-${i}`} className="h-11 w-full rounded-xl" />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Section: Comparison — Personality Fit (5 circles) */}
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-1 sm:gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="text-center p-1.5 sm:p-4 bg-muted/30 rounded-lg border">
                  <Skeleton className="h-3 w-8 mx-auto mb-2" />
                  <Skeleton className="w-10 h-10 sm:w-16 sm:h-16 rounded-full mx-auto mb-2" />
                  <Skeleton className="h-3 w-12 mx-auto hidden sm:block" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section: Comparison — Indicator Heatmap */}
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section: Competencies */}
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-28" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border/50">
                  <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-10 shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section: Onboarding */}
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-44" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
