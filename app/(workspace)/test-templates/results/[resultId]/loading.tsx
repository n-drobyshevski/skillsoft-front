import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Loading skeleton for the test results page.
 * Matches the "Command Center" dashboard layout:
 * HeroStrip → ResultTabs → InsightsBar → MetricCards →
 * Saturation (tabbed radar + contribution) → Indicator Heatmap →
 * Competencies → Onboarding.
 */
export default function TestTemplateResultLoading() {
  return (
    <div className="w-full max-w-[1600px] mx-auto">
      {/* ── Hero Strip ── */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        {/* Mobile */}
        <div className="flex flex-col gap-2.5 p-4 sm:hidden">
          <div className="flex items-center gap-3 min-h-[44px]">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-3 w-64" />
        </div>
        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-4 px-6 h-[72px] lg:px-8">
          <Skeleton className="w-11 h-11 rounded-full shrink-0" />
          <div className="flex flex-col gap-1 shrink-0">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-14" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="w-px h-9 bg-border shrink-0" />
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-72" />
          </div>
          <div className="flex gap-1 shrink-0">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="sticky z-30 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex gap-0 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-1.5 px-3 h-11 border-b-2 border-transparent">
              <Skeleton className="h-4 w-4 rounded shrink-0" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Insights Bar ── */}
      <div className="border-b border-border px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap gap-2.5">
        <Skeleton className="h-7 w-44 rounded-md" />
        <Skeleton className="h-7 w-52 rounded-md" />
        <Skeleton className="h-7 w-40 rounded-md hidden sm:block" />
      </div>

      {/* ── Dashboard Content ── */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">

        {/* Section: Overview — Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3.5">
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-8 w-10" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                </div>
                <div className="space-y-[7px]">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <Skeleton className="h-3 w-[110px] shrink-0" />
                      <Skeleton className="h-1 flex-1 rounded-full" />
                      <Skeleton className="h-3 w-5 shrink-0" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Section: Saturation — Tabbed Radar (left) + Contribution (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Tabbed Radar Card */}
          <Card className="rounded-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                <Skeleton className="h-3 w-32" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tab switcher */}
              <div className="flex gap-1 p-0.5 bg-muted/50 rounded-lg w-fit">
                <Skeleton className="h-7 w-24 rounded-md" />
                <Skeleton className="h-7 w-28 rounded-md" />
              </div>
              {/* Radar header */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              {/* Radar chart */}
              <div className="flex items-center justify-center">
                <Skeleton className="w-[260px] h-[260px] rounded-full" />
              </div>
            </CardContent>
          </Card>

          {/* Your Contribution Card */}
          <Card className="rounded-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                <Skeleton className="h-3 w-36" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Gaps You Fill */}
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <div className="flex flex-wrap gap-1.5">
                  <Skeleton className="h-6 w-40 rounded-full" />
                  <Skeleton className="h-6 w-36 rounded-full" />
                </div>
              </div>
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="text-center p-2 bg-muted/30 rounded-lg">
                    <Skeleton className="h-2.5 w-14 mx-auto mb-1" />
                    <Skeleton className="h-4 w-8 mx-auto" />
                  </div>
                ))}
              </div>
              {/* Divider */}
              <div className="border-t border-border" />
              {/* What You Bring */}
              <Skeleton className="h-3 w-28" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full rounded-xl" />
              ))}
              {/* Growth Areas */}
              <div className="p-3 bg-muted/20 rounded-lg space-y-2">
                <Skeleton className="h-3 w-36" />
                <div className="flex gap-1.5">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-28 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section: Indicator Heatmap */}
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
              <Skeleton className="h-3 w-36" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section: Competencies */}
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
              <Skeleton className="h-3 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border/50">
                  <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-12 shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section: Onboarding */}
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
              <Skeleton className="h-3 w-44" />
            </div>
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
