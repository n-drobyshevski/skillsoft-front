import { Skeleton } from '@/components/ui/skeleton';

// Phase 3.4: Responsive loading skeleton for desktop and mobile

function DesktopSkeleton() {
  return (
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
  );
}

function MobileSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Canvas Content Area */}
      <div className="flex-1 p-3 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>

        {/* Competency Cards */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              {/* Mobile weight control */}
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-2 flex-1 rounded-full" />
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="shrink-0 border-t bg-background pb-[env(safe-area-inset-bottom)]">
        {/* Swipe dots */}
        <div className="flex items-center justify-center gap-1.5 py-2 border-b border-border/20">
          <Skeleton className="h-1.5 w-1.5 rounded-full" />
          <Skeleton className="h-1.5 w-4 rounded-full" />
          <Skeleton className="h-1.5 w-1.5 rounded-full" />
        </div>

        {/* Action bar placeholder */}
        <div className="flex items-center justify-center gap-3 px-4 py-2 border-b border-border/20">
          <Skeleton className="h-11 w-20 rounded-full" />
          <Skeleton className="h-11 w-20 rounded-full" />
        </div>

        {/* Nav tabs */}
        <div className="grid grid-cols-3 h-16 items-center px-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="h-8 w-12 rounded-full" />
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BuilderLoading() {
  return (
    <div className="flex h-full flex-col bg-muted/30" style={{ height: "100dvh" }}>
      {/* Header Skeleton - Desktop only */}
      <div className="hidden lg:flex items-center justify-between border-b bg-background px-6 py-4">
        <div className="flex items-center gap-6">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <div className="flex items-center gap-3">
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

      {/* Desktop Content */}
      <div className="hidden lg:flex flex-1 p-3">
        <DesktopSkeleton />
      </div>

      {/* Mobile Content */}
      <div className="flex lg:hidden flex-1 min-h-0">
        <MobileSkeleton />
      </div>
    </div>
  );
}
