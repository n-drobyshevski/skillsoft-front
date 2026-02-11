'use client';

import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * TestTemplatesGridSkeleton - Responsive loading skeleton
 *
 * Mobile: Compact horizontal list items (~64px height)
 * Desktop: Vertical cards with full structure
 */
export default function TestTemplatesGridSkeleton() {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      {/* Filter Skeleton */}
      <FiltersSkeleton />

      {/* Grid Skeleton */}
      <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          isMobile ? (
            <MobileCardSkeleton key={i} index={i} />
          ) : (
            <DesktopCardSkeleton key={i} index={i} />
          )
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for the filters section
 */
function FiltersSkeleton() {
  return (
    <div className="space-y-3">
      {/* Search Row */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="hidden sm:block h-4 w-16 rounded" />
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <Skeleton className="h-8 w-20 rounded-full shrink-0" />
        <Skeleton className="h-8 w-24 rounded-full shrink-0" />
        <Skeleton className="h-8 w-28 rounded-full shrink-0" />
        <Skeleton className="h-8 w-28 rounded-full shrink-0" />
      </div>
    </div>
  );
}

/**
 * Mobile: Compact horizontal list item skeleton (~64px)
 */
function MobileCardSkeleton({ index }: { index: number }) {
  const delayClass = index < 4 ? '' : 'animation-delay-150';

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 w-full bg-card rounded-md border border-l-[3px] border-l-muted animate-pulse ${delayClass}`}
    >
      {/* Goal Icon */}
      <Skeleton className="shrink-0 size-9 rounded-lg" />

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Title */}
        <Skeleton className="h-4 w-3/4 rounded" />
        {/* Stats */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-10 rounded" />
          <Skeleton className="h-3 w-8 rounded" />
          <Skeleton className="h-3 w-6 rounded" />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Skeleton className="size-8 rounded" />
        <Skeleton className="size-4 rounded" />
      </div>
    </div>
  );
}

/**
 * Desktop: Full vertical card skeleton
 */
function DesktopCardSkeleton({ index }: { index: number }) {
  const delayClass = index < 4 ? '' : index < 8 ? 'animation-delay-150' : 'animation-delay-300';

  return (
    <Card
      className={`flex flex-col h-full overflow-hidden border-l-[3px] border-l-muted animate-pulse ${delayClass}`}
    >
      <CardHeader className="p-4 pb-3">
        {/* Badge Row */}
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        {/* Title */}
        <Skeleton className="h-5 w-4/5 rounded" />

        {/* Description */}
        <div className="space-y-1 mt-1">
          <Skeleton className="h-3.5 w-full rounded" />
          <Skeleton className="h-3.5 w-2/3 rounded" />
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-1">
        {/* Stats Row */}
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-14 rounded" />
          <Skeleton className="h-5 w-12 rounded" />
          <Skeleton className="h-5 w-20 rounded" />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-2 mt-auto flex flex-col gap-2">
        {/* CTA Button */}
        <Skeleton className="h-9 w-full rounded-md" />
      </CardFooter>
    </Card>
  );
}
