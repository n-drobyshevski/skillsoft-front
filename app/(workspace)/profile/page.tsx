import { Suspense } from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { User } from 'lucide-react';
import { ProfileHeroCard } from './_components/ProfileHeroCard';
import { QuickStatsGrid, QuickStatsGridSkeleton } from './_components/QuickStatsGrid';
import { PersonalityPassportCard, PersonalityPassportCardSkeleton } from './_components/PersonalityPassportCard';
import { TopCompetenciesCard, TopCompetenciesCardSkeleton } from './_components/TopCompetenciesCard';
import { RecentResultsSection, RecentResultsSectionSkeleton } from './_components/RecentResultsSection';
import {
  getAssessmentSummary,
  getCompetencyPassport,
  preloadProfileData,
} from '@/services/profile-api';
import type { ProfileUserInfo } from '@/types/profile';

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

// Page metadata
export const metadata = {
  title: 'Мой профиль | SkillSoft',
  description: 'Просматривайте результаты оценок и паспорт компетенций',
};

/**
 * Profile Page (Server Component)
 *
 * Mobile-first redesigned with modern bento grid layout matching test-results page:
 * - ProfileHeroCard: Enhanced user info with gradient accent and MetricPill-style info
 * - QuickStatsGrid: 4-column stats with gradient backgrounds
 * - PersonalityPassportCard + TopCompetenciesCard: Side-by-side bento
 * - RecentResultsSection: Latest test results with pass/fail indicators
 *
 * Performance optimizations:
 * - Preload data fetching before Suspense boundaries
 * - Unified data fetcher eliminates waterfall
 * - Staggered animations for visual polish
 */
export default async function ProfilePage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Preload all profile data immediately (starts parallel fetch)
  preloadProfileData(user.id);

  // Extract user info from Clerk
  const userInfo: ProfileUserInfo = {
    clerkId: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    avatarUrl: user.imageUrl,
    organizationName: (user.publicMetadata?.organization as string) || null,
    createdAt: new Date(user.createdAt),
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container max-w-6xl mx-auto px-2 sm:px-4 py-3 sm:py-6 md:py-8">
        {/* Page Header - Mobile optimized */}
        <header className="mb-4 sm:mb-6 px-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10">
              <User className="size-5 sm:size-6 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
              Мой профиль
            </h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
            Просматривайте результаты оценок и паспорт компетенций
          </p>
        </header>

        {/* Main Content - Bento Grid Layout */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {/* Hero Card - Full Width */}
          <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <ProfileHeroCard userInfo={userInfo} />
          </div>

          {/* Quick Stats Grid - 2x2 mobile, 4x1 desktop */}
          <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-75 fill-mode-both">
            <Suspense fallback={<QuickStatsGridSkeleton />}>
              <QuickStatsGridLoader userId={user.id} />
            </Suspense>
          </div>

          {/* Bento Grid: Personality Passport + Top Competencies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-100 fill-mode-both">
            <Suspense fallback={<PersonalityPassportCardSkeleton />}>
              <PersonalityPassportLoader userId={user.id} />
            </Suspense>

            <Suspense fallback={<TopCompetenciesCardSkeleton />}>
              <TopCompetenciesLoader userId={user.id} />
            </Suspense>
          </div>

          {/* Recent Results - Full Width */}
          <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-150 fill-mode-both">
            <Suspense fallback={<RecentResultsSectionSkeleton />}>
              <RecentResultsLoader userId={user.id} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ASYNC DATA LOADERS
// ============================================

/**
 * Server component that fetches and displays quick stats
 */
async function QuickStatsGridLoader({ userId }: { userId: string }) {
  const summary = await getAssessmentSummary(userId);
  return <QuickStatsGrid summary={summary} />;
}

/**
 * Server component that fetches and displays personality passport
 */
async function PersonalityPassportLoader({ userId }: { userId: string }) {
  const passport = await getCompetencyPassport(userId);
  return (
    <PersonalityPassportCard
      profile={passport.bigFiveProfile}
      confidence={passport.confidence}
      totalAssessments={passport.totalAssessmentsUsed}
    />
  );
}

/**
 * Server component that fetches and displays top competencies
 */
async function TopCompetenciesLoader({ userId }: { userId: string }) {
  const passport = await getCompetencyPassport(userId);
  return (
    <TopCompetenciesCard
      competencies={passport.topCompetencies}
      totalAssessments={passport.totalAssessmentsUsed}
    />
  );
}

/**
 * Server component that fetches and displays recent results
 */
async function RecentResultsLoader({ userId }: { userId: string }) {
  const summary = await getAssessmentSummary(userId);
  return <RecentResultsSection results={summary.recentResults} />;
}
