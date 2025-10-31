import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Controls Skeleton */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-9 w-full max-w-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-[100px]" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="overflow-hidden rounded-lg border">
        <div className="w-full">
          {/* Header */}
          <div className="flex border-b bg-muted/30">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-1 p-3">
                <Skeleton className="h-5 w-3/4" />
              </div>
            ))}
          </div>
          {/* Body */}
          <div>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex border-b p-3">
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}