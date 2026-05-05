import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getTranslations } from 'next-intl/server';

export default async function SkillMapperLoading() {
  const t = await getTranslations('skillMapper');

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] animate-fade-in-up">
      {/* Header Skeleton */}
      <div className="border-b bg-background px-3 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Search className="h-5 w-5 sm:h-6 sm:w-6" />
              {t('title')}
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              {t('description')}
            </p>
          </div>

          {/* Stats Badges Skeleton */}
          <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
            <Skeleton className="h-7 w-full sm:w-24 rounded-full" />
            <Skeleton className="h-7 w-full sm:w-20 rounded-full" />
            <Skeleton className="h-7 w-full sm:w-20 rounded-full" />
            <Skeleton className="h-7 w-full sm:w-24 rounded-full" />
            <Skeleton className="h-7 w-full col-span-2 sm:w-28 rounded-full" />
          </div>
        </div>
      </div>

      {/* Main Content - Split view skeleton */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Search */}
        <div className="w-full md:w-1/2 lg:w-2/5 md:border-r flex flex-col">
          {/* Search Header */}
          <div className="p-3 sm:p-4 border-b space-y-3">
            {/* Search Input */}
            <Skeleton className="h-11 w-full rounded-md" />

            {/* Filters Button */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-11 w-24 rounded-md" />
            </div>

            {/* Stats line */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Results List Skeleton */}
          <div className="flex-1 overflow-hidden p-3 sm:p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-full p-3 rounded-lg border bg-card space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Skeleton className="h-5 w-12 rounded-full" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Details placeholder (desktop only) */}
        <div className="hidden md:flex md:w-1/2 lg:w-3/5 flex-col bg-muted/30 items-center justify-center text-center p-6">
          <Skeleton className="h-12 w-12 rounded-full mb-4" />
          <Skeleton className="h-5 w-36 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="border-t bg-muted/30 px-3 py-2 sm:px-6 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs text-muted-foreground">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
    </div>
  );
}
