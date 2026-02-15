import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Loading skeleton for the active test session page.
 * Matches the immersive test player layout with progress bar,
 * question card, answer options, and navigation buttons.
 */
export default function TestSessionLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar with progress */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-20" />
          </div>
          {/* Progress bar */}
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            {/* Question number badge */}
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            {/* Question text */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Answer options */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-lg border border-border/50"
              >
                <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom navigation */}
      <div className="border-t bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-24 rounded-md" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-20 rounded-md" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
