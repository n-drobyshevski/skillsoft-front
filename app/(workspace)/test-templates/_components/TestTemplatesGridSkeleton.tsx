import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TestTemplatesGridSkeleton() {
  return (
    <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <TestTemplateCardSkeleton key={i} />
      ))}
    </div>
  );
}

function TestTemplateCardSkeleton() {
  return (
    <Card className="flex flex-col h-full animate-pulse border-border/50">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <Skeleton className="h-6 w-3/4 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full mt-2 rounded-md" />
        <Skeleton className="h-4 w-2/3 mt-1.5 rounded-md" />
        <Skeleton className="h-6 w-32 mt-3 rounded-full" />
      </CardHeader>

      <CardContent className="flex-1 pb-3 sm:pb-4">
        <div className="space-y-2.5">
          {/* Info skeleton items matching new card structure */}
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-4 w-12 rounded-md" />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 sm:pt-4 border-t border-border/50">
        <Skeleton className="h-11 w-full rounded-md" />
      </CardFooter>
    </Card>
  );
}
