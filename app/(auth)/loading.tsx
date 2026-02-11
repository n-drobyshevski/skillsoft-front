import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for auth pages
 * Creates an implicit Suspense boundary for Next.js 16 cacheComponents
 */
export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header skeleton */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
        </div>

        {/* Form skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Footer skeleton */}
        <div className="text-center">
          <Skeleton className="h-3 w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
}
