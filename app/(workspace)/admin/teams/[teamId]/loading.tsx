import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TeamDetailLoading() {
  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Hero Section Skeleton */}
      <div className="relative">
        {/* Gradient Background */}
        <div className="absolute inset-0 h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-violet-500/10 dark:from-primary/10 dark:via-primary/5 dark:to-violet-500/5" />

        <div className="relative px-4 pt-6 pb-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1600px] w-full">
            <Card className="shadow-sm bg-card/95 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Avatar Skeleton */}
                  <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-full mx-auto sm:mx-0" />

                  {/* Info Skeleton */}
                  <div className="flex-1 min-w-0 text-center sm:text-left space-y-3">
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-72 mx-auto sm:mx-0" />
                    <div className="flex items-center justify-center sm:justify-start gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>

                  {/* Actions Skeleton */}
                  <div className="flex sm:flex-col gap-2 justify-center">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px] w-full space-y-6">
          {/* Mobile Stats Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
                <div className="mt-3 space-y-1">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop Layout Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar Skeleton (Desktop) */}
            <div className="hidden lg:block lg:col-span-3 space-y-4">
              <Card>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content Skeleton */}
            <div className="lg:col-span-9 space-y-6">
              {/* 4-column Tabs Skeleton */}
              <div className="w-full grid grid-cols-4 h-11 gap-1 p-1 rounded-lg bg-muted/50">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-full rounded-md" />
                ))}
              </div>

              {/* Overview Content Skeleton */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="p-3 pb-2">
                      <Skeleton className="h-4 w-20" />
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <Skeleton className="h-7 w-12" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <Card className="md:col-span-7">
                  <CardHeader>
                    <Skeleton className="h-5 w-32" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="w-2 h-2 rounded-full" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-10" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card className="md:col-span-5">
                  <CardHeader>
                    <Skeleton className="h-5 w-36" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-48 w-full rounded-lg" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
