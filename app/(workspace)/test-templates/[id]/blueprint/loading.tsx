import { Skeleton } from "@/components/ui/skeleton";

export default function BlueprintLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded" />
          <div>
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      {/* 3-Column Layout Skeleton */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-[250px] border-r p-4 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>

        {/* Center Panel */}
        <div className="flex-1 p-6 space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>

        {/* Right Panel */}
        <div className="w-[300px] border-l p-4 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-32 w-full" />
          <div className="absolute bottom-4 left-4 right-4">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
