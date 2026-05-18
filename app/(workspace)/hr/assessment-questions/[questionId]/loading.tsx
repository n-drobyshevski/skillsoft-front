import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Loading skeleton for assessment question detail page.
 * Matches the real layout: EntityDetailHeader, then a two-column grid with
 * question details, answer options, scoring rubric (left) and context
 * hierarchy + metadata sidebar (right).
 */
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-5 max-w-6xl animate-fade-in-up">
      {/* EntityDetailHeader skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-md shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question Details card */}
          <Card className="border-none shadow-sm bg-muted/30">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-5 w-32" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>

          {/* Answer Options card */}
          <Card className="border-none shadow-sm bg-muted/30">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-6 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-background/50 border border-border/50 rounded-lg">
                  <div className="flex items-start gap-3 p-3">
                    <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                    <Skeleton className="h-5 w-14 rounded-full shrink-0" />
                  </div>
                </div>
              ))}
              {/* Summary */}
              <div className="mt-4 pt-3 border-t border-border/60">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scoring Rubric card */}
          <Card className="border-none shadow-sm bg-muted/30">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-5 w-28" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1/3 */}
        <div className="space-y-6">
          {/* Context card */}
          <Card className="border-none shadow-sm bg-muted/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {/* Competency nav item */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-7 w-7 rounded-md" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
              {/* Indicator nav item */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-7 w-7 rounded-md" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              {/* Current question */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-7 w-7 rounded-md" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
              <div className="pt-3 border-t border-border/60">
                <Skeleton className="h-3 w-56" />
              </div>
            </CardContent>
          </Card>

          {/* Metadata card */}
          <Card className="border-none shadow-sm bg-muted/30">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-5 w-20" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {/* Question Type, Difficulty, Time Limit */}
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
              {/* Context Tags */}
              <div className="py-2 border-t border-border/50">
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="flex flex-wrap gap-1.5">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
