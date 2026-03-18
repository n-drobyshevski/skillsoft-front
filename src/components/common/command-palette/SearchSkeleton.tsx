import { Skeleton } from '@/components/ui/skeleton';

export function SearchSkeleton() {
  return (
    <div className="p-2 space-y-2" aria-hidden="true">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2 px-2 py-1.5">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 flex-1" style={{ maxWidth: `${60 + i * 10}%` }} />
        </div>
      ))}
    </div>
  );
}
