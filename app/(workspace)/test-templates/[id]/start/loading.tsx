import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function StartPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl space-y-6">
        <Card className="bg-card/95 backdrop-blur-sm border shadow-xl overflow-hidden">
          {/* Gradient accent bar */}
          <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600" />

          <CardHeader className="space-y-4 pb-2">
            {/* Badges skeleton */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>

            {/* Title skeleton */}
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-10 w-2/3" />

            {/* Description skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-full max-w-2xl" />
              <Skeleton className="h-6 w-5/6 max-w-2xl" />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Metadata Grid skeleton */}
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-muted/50 rounded-xl p-4 text-center space-y-2 border">
                  <Skeleton className="mx-auto w-10 h-10 rounded-lg" />
                  <Skeleton className="h-8 w-16 mx-auto" />
                  <Skeleton className="h-3 w-20 mx-auto" />
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Motivational section skeleton */}
            <div className="bg-muted/50 rounded-xl p-5 space-y-4 border">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <Skeleton className="h-6 w-64" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            </div>

            {/* Button skeleton */}
            <Skeleton className="w-full h-14 rounded-lg" />
          </CardContent>
        </Card>

        {/* Footer note skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-2/3 mx-auto" />
        </div>
      </div>
    </div>
  );
}
