import React from "react";
import PageHeader from "@/components/common/PageHeader";
import TableSkeleton from "@/components/data-display/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

/**
 * Loading skeleton for behavioral indicators page
 * Provides instant visual feedback during route loading
 */
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6 animate-fade-in-up">
      <PageHeader
        title="Behavioral Indicators"
        description="Define and manage behavioral indicators for competency assessment"
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </Card>
        ))}
      </div>
      <TableSkeleton />
    </div>
  );
}
