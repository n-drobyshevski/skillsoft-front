import { Skeleton } from "@/components/ui/skeleton";

/**
 * Documentation Loading Skeleton
 *
 * Shows a skeleton UI while documentation pages are loading.
 * Mimics the three-column layout structure.
 */
export default function DocsLoading() {
  return (
    <div className="docs-content">
      {/* Breadcrumb Skeleton */}
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-9 w-64 mb-3" />
        <Skeleton className="h-5 w-full max-w-xl mb-2" />
        <Skeleton className="h-5 w-3/4 max-w-md" />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-8">
        {/* Section 1 */}
        <div>
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* Callout Skeleton */}
        <div className="rounded-lg border p-4">
          <div className="flex gap-3">
            <Skeleton className="h-5 w-5 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div>
          <Skeleton className="h-6 w-56 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3 mt-1" />
            </div>
          ))}
        </div>

        {/* Section 3 */}
        <div>
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>

      {/* Footer Navigation Skeleton */}
      <div className="mt-12 flex items-center justify-between gap-4 border-t pt-6">
        <div className="flex-1">
          <div className="rounded-lg border p-4 inline-flex flex-col gap-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <div className="flex-1 flex justify-end">
          <div className="rounded-lg border p-4 inline-flex flex-col gap-1 items-end">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </div>

      {/* TOC Skeleton (hidden on smaller screens) */}
      <aside className="hidden lg:block absolute right-8 top-6 w-56">
        <Skeleton className="h-4 w-32 mb-3" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 ml-3" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </aside>
    </div>
  );
}
