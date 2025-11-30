
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuestionsListSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="text-center mb-4 sm:mb-6">
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto mt-2" />
      </div>
      <div className="space-y-3 sm:space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-card shadow-sm border border-border">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex flex-col space-y-3 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="border-t border-border pt-3 sm:pt-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="space-y-1">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
