import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';

/**
 * Loading skeleton for the anonymous test landing page.
 * Matches the centered card layout with test info, features, and start button.
 */
export default function TakeTokenLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/30">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          {/* Icon circle */}
          <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
          {/* Title */}
          <Skeleton className="h-7 w-3/4 mx-auto mb-2" />
          {/* Description */}
          <Skeleton className="h-4 w-2/3 mx-auto" />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Test Info Grid - questions and time limit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-8" />
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
          </div>

          {/* Features list */}
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>

          {/* Privacy notice */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </CardContent>

        <CardFooter>
          {/* Start button */}
          <Skeleton className="h-11 w-full rounded-md" />
        </CardFooter>
      </Card>
    </div>
  );
}
