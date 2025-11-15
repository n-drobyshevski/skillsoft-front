import React from "react";
// import { LoadingSkeleton } from "@/app/competencies/components/loading-skeleton";
import PageHeader from "../components/PageHeader";
import TableSkeleton from "../components/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	// Add fallback UI that will be shown while the route is loading.
	//   return <LoadingSkeleton />;
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      <PageHeader
        title="Assessment Questions"
        description="Create and manage assessment questions for competency evaluation"
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[110px] w-full" />)}
      </div>
      <TableSkeleton />
    </div>
  );
}
