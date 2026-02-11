import { User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QuickStatsGridSkeleton } from './_components/QuickStatsGrid';
import { PersonalityPassportCardSkeleton } from './_components/PersonalityPassportCard';
import { TopCompetenciesCardSkeleton } from './_components/TopCompetenciesCard';
import { RecentResultsSectionSkeleton } from './_components/RecentResultsSection';

/**
 * Profile Page Loading State
 *
 * Displays skeleton UI matching the new bento grid layout
 * while the page data is being fetched.
 */
export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Page Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <User className="size-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Мой профиль
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Просматривайте результаты оценок и паспорт компетенций
          </p>
        </header>

        {/* Main Content - Skeleton Layout */}
        <div className="space-y-6">
          {/* Hero Card Skeleton */}
          <ProfileHeroCardSkeleton />

          {/* Quick Stats Grid Skeleton */}
          <QuickStatsGridSkeleton />

          {/* Bento Grid: Personality Passport + Top Competencies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PersonalityPassportCardSkeleton />
            <TopCompetenciesCardSkeleton />
          </div>

          {/* Recent Results Skeleton */}
          <RecentResultsSectionSkeleton />
        </div>
      </div>
    </div>
  );
}

/**
 * Profile Hero Card Skeleton
 */
function ProfileHeroCardSkeleton() {
  return (
    <Card className="relative overflow-hidden">
      {/* Gradient accent bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />

      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Skeleton */}
          <Skeleton className="h-24 w-24 sm:h-28 sm:w-28 rounded-full shrink-0" />

          {/* User Details Skeleton */}
          <div className="flex-1 text-center sm:text-left space-y-4 w-full">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
              <Skeleton className="h-6 w-32 mx-auto sm:mx-0" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-32" />
            </div>

            <div className="flex gap-3 justify-center sm:justify-start pt-2">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
