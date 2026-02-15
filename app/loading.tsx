import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading skeleton for the root landing page.
 * Provides a minimal, centered layout with logo, tagline,
 * and CTA button skeleton while the landing page loads.
 */
export default function RootLoading() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      {/* Header bar */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <Skeleton className="h-6 w-48 rounded-full mx-auto" />

          {/* Title */}
          <div className="space-y-3">
            <Skeleton className="h-10 w-3/4 mx-auto" />
            <Skeleton className="h-10 w-1/2 mx-auto" />
          </div>

          {/* Subtitle */}
          <div className="space-y-2 max-w-xl mx-auto">
            <Skeleton className="h-4 w-full mx-auto" />
            <Skeleton className="h-4 w-4/5 mx-auto" />
          </div>

          {/* CTA buttons */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <Skeleton className="h-12 w-40 rounded-md" />
            <Skeleton className="h-12 w-36 rounded-md" />
          </div>
        </div>

        {/* Feature preview / demo area */}
        <div className="mt-16 w-full max-w-4xl mx-auto">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </main>
    </div>
  );
}
