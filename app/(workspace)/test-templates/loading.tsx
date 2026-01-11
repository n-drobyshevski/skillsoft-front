import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import TestTemplatesGridSkeleton from './_components/TestTemplatesGridSkeleton';

/**
 * Loading skeleton for test templates page
 * Matches the actual page structure:
 * - Header with title, description, and action buttons
 * - TestTemplatesGridSkeleton for filters and card grid
 */
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-2 sm:p-4 md:p-6">
      {/* Header Skeleton - matches TemplatesPageHeader */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Title and Description */}
        <div className="space-y-1.5">
          <Skeleton className="h-7 sm:h-8 w-40 sm:w-48" />
          <Skeleton className="h-4 w-56 sm:w-72" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          {/* History Button */}
          <Skeleton className="h-9 w-full sm:w-28 rounded-md" />
          {/* Create Button (show on tablet+) */}
          <Skeleton className="hidden sm:block h-9 w-32 rounded-md" />
        </div>
      </div>

      {/* Grid Skeleton - uses responsive TestTemplatesGridSkeleton */}
      <TestTemplatesGridSkeleton />
    </div>
  );
}
