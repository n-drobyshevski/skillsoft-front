import { User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { UnifiedHeroBentoSkeleton } from './_components/UnifiedHeroBento';
import { SkillsPersonalityCardSkeleton } from './_components/SkillsPersonalityCard';
import { RecentResultsSectionSkeleton } from './_components/RecentResultsSection';

/**
 * Profile Page Loading State
 *
 * Displays skeleton UI matching the bento grid layout
 * while the page data is being fetched.
 */
export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
        {/* Page Header Skeleton */}
        <header className="mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10">
              <User className="size-5 sm:size-6 text-primary" />
            </div>
            <Skeleton className="h-7 sm:h-8 md:h-9 w-32 sm:w-40" />
          </div>
          <Skeleton className="h-4 sm:h-5 w-56 sm:w-72" />
        </header>

        {/* Bento Grid Skeleton — 3 sections */}
        <div className="space-y-4 sm:space-y-6">
          <UnifiedHeroBentoSkeleton />
          <SkillsPersonalityCardSkeleton />
          <RecentResultsSectionSkeleton />
        </div>
      </div>
    </div>
  );
}
