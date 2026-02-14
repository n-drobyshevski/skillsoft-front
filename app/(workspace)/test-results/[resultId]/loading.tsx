import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Loading skeleton for test result detail page.
 * Matches the TestResultView layout: hero section with score circle,
 * stats cards, competency breakdown, and Big Five radar chart.
 */
export default function TestResultLoading() {
  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl animate-fade-in-up">
      {/* Hero Section Skeleton */}
      <div className="rounded-xl border-2 border-muted p-6 sm:p-12">
        <div className="flex flex-col items-center space-y-4">
          {/* Score Circle */}
          <Skeleton className="h-28 w-28 rounded-full" />
          {/* Pass/Fail Badge */}
          <Skeleton className="h-7 w-24 rounded-full" />
          {/* Template Name */}
          <Skeleton className="h-6 w-56" />
          {/* Date */}
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Competency Breakdown + Big Five Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competency Scores */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Big Five Radar Chart */}
        <Card>
          <CardContent className="p-6 flex flex-col items-center space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-[250px] w-[250px] rounded-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
