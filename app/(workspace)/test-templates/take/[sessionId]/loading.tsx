import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading skeleton for the test-taking session page.
 * Matches the immersive player layout: sticky header with progress,
 * centered question card with answer options, and sticky footer navigation.
 */
export default function TestTakeLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col animate-fade-in-up">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-6 w-48" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-2 w-32" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      </header>

      {/* Content Skeleton */}
      <main className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full p-6">
        <div className="space-y-8">
          {/* Question Text */}
          <Skeleton className="h-12 w-full max-w-2xl mx-auto" />
          <Skeleton className="h-8 w-3/4 mx-auto" />

          {/* Answer Options */}
          <div className="space-y-3 max-w-2xl mx-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="sticky bottom-0 p-4 border-t bg-background">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-12 w-36 rounded-xl" />
        </div>
      </footer>
    </div>
  );
}
