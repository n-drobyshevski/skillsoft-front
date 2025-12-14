import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * TestTemplatesGridSkeleton - Loading skeleton matching new card layout
 *
 * Structure mirrors TestTemplateCard:
 * - Top-left goal badge chip
 * - Title and description
 * - Inline stats row
 * - Action footer with button and dropdown
 */
export default function TestTemplatesGridSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Filter Skeleton */}
      <FiltersSkeleton />

      {/* Grid Skeleton */}
      <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {Array.from({ length: 6 }).map((_, i) => (
          <TestTemplateCardSkeleton key={i} index={i} />
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
      {/* Desktop Filters */}
      <div className="hidden sm:flex sm:flex-col sm:gap-3">
        {/* Search and Results Row */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-full max-w-md rounded-md" />
          <Skeleton className="h-5 w-32 rounded-md" />
        </div>

        {/* Goal Filter Tabs */}
        <Skeleton className="h-10 w-full max-w-lg rounded-lg" />
      </div>

      {/* Mobile Filters */}
      <div className="sm:hidden flex items-center gap-2">
        <Skeleton className="h-10 flex-1 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>
    </div>
  );
}

/**
 * Individual card skeleton with staggered animation via Tailwind
 */
function TestTemplateCardSkeleton({ index }: { index: number }) {
  // Use Tailwind's animate-pulse with staggered delay
  const delayClass = index < 3 ? '' : index < 6 ? 'animation-delay-150' : 'animation-delay-300';

  return (
    <Card
      className={`flex flex-col h-full border-t-4 border-t-muted relative overflow-hidden animate-pulse ${delayClass}`}
    >
      {/* Goal Badge - Top Left */}
      <div className="absolute top-3 left-3 z-10">
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      <CardHeader className="pt-12 pb-2 sm:pb-3 space-y-2">
        {/* Title */}
        <Skeleton className="h-6 w-4/5 rounded-md" />
        {/* Description */}
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-2/3 rounded-md" />
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-2 sm:pb-3">
        {/* Inline Stats Row */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-4 w-12 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
        </div>
      </CardContent>

      <CardFooter className="pt-3 pb-3 sm:pb-4 border-t border-border/50 flex items-center gap-2">
        {/* Primary Action Button */}
        <Skeleton className="h-11 flex-1 rounded-md" />
        {/* More Actions Button */}
        <Skeleton className="h-11 w-11 rounded-md shrink-0" />
      </CardFooter>
    </Card>
  );
}
