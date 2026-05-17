import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors the Document-mode layout of CompetencyForm so the loading state
 * doesn't cause layout shift (CLS) when the form hydrates.
 */
export function CompetencyFormSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {/* Basic Information */}
      <Card className="gap-0 py-0 rounded-lg shadow-none">
        <CardContent>
          <section className="py-6 space-y-5">
            <div className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-64" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-11 w-full sm:h-10" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-24 w-full" />
            </div>
          </section>
        </CardContent>
      </Card>

      {/* Classification */}
      <Card className="gap-0 py-0 rounded-lg shadow-none">
        <CardContent>
          <section className="py-6 space-y-5">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-11 w-full sm:h-10" />
            </div>
          </section>
        </CardContent>
      </Card>

      {/* Standard Mapping (three-slot picker) */}
      <Card className="gap-0 py-0 rounded-lg shadow-none">
        <CardContent>
          <section className="py-6 space-y-3">
            <div className="space-y-2 mb-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-56" />
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-border p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-9 w-20 shrink-0 rounded-md" />
                </div>
              </div>
            ))}
          </section>
        </CardContent>
      </Card>

      {/* Status */}
      <Card className="gap-0 py-0 rounded-lg shadow-none">
        <CardContent>
          <section className="py-6 space-y-5">
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-52" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-11 w-full sm:h-10" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-11 w-full sm:h-10" />
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
