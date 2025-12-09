import { Skeleton } from '@/components/ui/skeleton';

export default function BuilderLoading() {
  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b bg-background px-6 py-4">
        <div className="flex items-center gap-6">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <div className="hidden sm:flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-16 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 p-3">
        <div className="h-full rounded-xl border bg-background shadow-sm flex">
          {/* Library Panel */}
          <div className="w-[250px] border-r p-4 space-y-4">
            <Skeleton className="h-9 w-full rounded-lg" />
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          </div>

          {/* Canvas Panel */}
          <div className="flex-1 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          </div>

          {/* Simulator Panel */}
          <div className="w-[300px] border-l p-4 space-y-4">
            <Skeleton className="h-5 w-24" />
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
