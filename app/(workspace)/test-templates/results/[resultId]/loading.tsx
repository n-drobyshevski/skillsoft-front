import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Loading skeleton for the test results strategy page.
 * Matches the ResultsSkeleton layout: hero card with score circle,
 * stats grid, charts, and competency accordion.
 */
export default function TestTemplateResultLoading() {
  return (
    <div className="min-h-screen bg-muted/30 py-8 animate-fade-in-up">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Hero Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
              <div className="flex flex-col items-center gap-3">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center gap-6">
                <Skeleton className="w-36 h-36 rounded-full" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <Skeleton className="h-[360px] rounded-lg" />
          <Skeleton className="h-[360px] rounded-lg" />
        </div>

        {/* Accordion Skeleton */}
        <Card className="mt-4">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full mb-2" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
