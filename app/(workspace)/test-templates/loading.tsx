import React from "react";
import PageHeader from "@/components/common/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Loading skeleton for test templates page
 * Provides instant visual feedback during route loading
 */
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      <PageHeader
        title="Шаблоны тестов"
        description="Выберите шаблон для оценки ваших компетенций"
      />
      
      {/* Action buttons skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-36" />
      </div>
      
      {/* Grid of template cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="card-modern">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-2/3 mt-1" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-5 w-16 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-9 w-full mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
