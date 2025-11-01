
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}
