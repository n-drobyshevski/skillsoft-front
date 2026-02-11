import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Loading skeleton for Competency Reliability Detail page
 *
 * Mobile-first design matching the proposed layout:
 * - Compact header with status badge
 * - Centered alpha display
 * - Horizontal stat pills
 * - Accordion sections (collapsed placeholders on mobile)
 *
 * Designed to prevent CLS (Cumulative Layout Shift).
 */
export default function CompetencyDetailLoading() {
  return (
    <div className="flex flex-1 flex-col min-h-screen">
      {/* Hero Section Skeleton - Mobile First */}
      <div className="relative px-4 py-6 sm:px-6 bg-gradient-to-b from-muted/50 to-transparent">
        {/* Header: Title + Status Badge */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-7 w-48 sm:h-8 sm:w-64" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-36" />
        </div>

        {/* Alpha Display - Centered on mobile */}
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-8">
          {/* Radial Gauge Skeleton */}
          <div className="flex justify-center">
            <div className="relative flex items-center justify-center">
              {/* Circular skeleton for gauge */}
              <Skeleton className="h-36 w-36 rounded-full sm:h-44 sm:w-44" />
              {/* Center value placeholder */}
              <div className="absolute flex flex-col items-center gap-1">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-10" />
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="w-full grid grid-cols-2 gap-3 sm:flex-1 lg:grid-cols-3">
            {/* Respondents */}
            <div className="text-center p-3 sm:p-4 rounded-lg bg-background/50">
              <Skeleton className="h-7 w-16 mx-auto" />
              <Skeleton className="h-3 w-20 mx-auto mt-1" />
            </div>
            {/* Items */}
            <div className="text-center p-3 sm:p-4 rounded-lg bg-background/50">
              <Skeleton className="h-7 w-12 mx-auto" />
              <Skeleton className="h-3 w-16 mx-auto mt-1" />
            </div>
            {/* Quality Badge - spans 2 cols on mobile */}
            <div className="text-center p-3 sm:p-4 rounded-lg bg-background/50 col-span-2 lg:col-span-1">
              <Skeleton className="h-6 w-24 mx-auto rounded-full" />
              <Skeleton className="h-3 w-32 mx-auto mt-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Mobile: Accordion Sections Skeleton */}
        <div className="space-y-2 lg:hidden">
          {/* Alpha Gauge Section */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </CardContent>
          </Card>

          {/* Interpretation Section */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-5 w-28" />
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          {/* Threshold Comparison Section */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-5 w-36" />
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          {/* Items Analysis Section */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Desktop: Two-column Grid */}
        <div className="hidden lg:grid lg:gap-6 lg:grid-cols-2">
          {/* Alpha Gauge Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-5 w-36" />
              </div>
              <Skeleton className="h-4 w-56 mt-1" />
            </CardHeader>
            <CardContent className="flex flex-col items-center py-4">
              <Skeleton className="h-32 w-48 rounded-t-full" />
            </CardContent>
          </Card>

          {/* Interpretation Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-5 w-28" />
              </div>
              <Skeleton className="h-4 w-44 mt-1" />
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Interpretation Scale */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
                <div className="flex justify-between">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-3 w-8" />
                  ))}
                </div>
              </div>
              {/* Explanation Box */}
              <div className="p-4 rounded-lg bg-muted/50">
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5 mt-1" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metrics Comparison Card - Full Width */}
        <Card className="hidden lg:block">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-4 w-72 mt-1" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 flex-1 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Warning Card Skeleton - Conditional but show placeholder */}
        <Card className="border-l-4 border-l-amber-500/30">
          <CardHeader className="pb-2 px-4 pt-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-5 w-52" />
              <Skeleton className="h-5 w-8 rounded-full ml-auto" />
            </div>
            <Skeleton className="h-4 w-64 mt-1" />
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-background/80 border border-muted"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-32 mt-1" />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Alpha If Deleted Section Skeleton */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-5 w-44" />
            </div>
            <Skeleton className="h-4 w-64 mt-1" />
          </CardHeader>
          <CardContent className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
              >
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
            {/* Info box */}
            <div className="mt-4 p-3 rounded-lg bg-muted/50">
              <Skeleton className="h-4 w-32 mb-2" />
              <div className="space-y-1 ml-6">
                <Skeleton className="h-3 w-64" />
                <Skeleton className="h-3 w-56" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Summary Card Skeleton */}
        <Card className="border-l-4 border-l-emerald-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
