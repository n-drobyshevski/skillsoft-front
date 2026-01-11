import { Suspense } from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { User } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { MainContentAnchor } from '@/components/accessibility/SkipLinks';
import { ProfileHeroCard } from './_components/ProfileHeroCard';
import { QuickStatsGrid, QuickStatsGridSkeleton } from './_components/QuickStatsGrid';
import { PersonalityPassportCard, PersonalityPassportCardSkeleton } from './_components/PersonalityPassportCard';
import { TopCompetenciesCard, TopCompetenciesCardSkeleton } from './_components/TopCompetenciesCard';
import { RecentResultsSection, RecentResultsSectionSkeleton } from './_components/RecentResultsSection';
import { SharedTestsSection, SharedTestsSectionSkeleton } from './_components/SharedTestsSection';
import { MobileProfileActionBar } from './_components/MobileProfileActionBar';
import {
  getAssessmentSummary,
  getCompetencyPassport,
  getSharedTemplates,
  preloadProfileData,
} from '@/services/profile-api';
import type { ProfileUserInfo } from '@/types/profile';
import type { Metadata } from 'next';
import { UserRole } from '@/types/user';

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

// Dynamic metadata with i18n
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('profile.page');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

/**
 * Profile Page (Server Component)
 *
 * Mobile-first redesigned with compact 3-column grid layout:
 * - ProfileHeroCard: Enhanced user info with gradient accent
 * - QuickStatsGrid: 4-column stats with gradient backgrounds (full width)
 * - 3-Column Grid (lg:grid-cols-3):
 *   - Main Column (lg:col-span-2): RecentResultsSection + SharedTestsSection
 *   - Sidebar (1 col): TopCompetenciesCard + PersonalityPassportCard
 *
 * Mobile order (order utilities for optimal UX):
 * 1. Hero Card - User identity
 * 2. Quick Stats - Key metrics at a glance
 * 3. Top Competencies - Actionable insights (sidebar, but first on mobile via order-1)
 * 4. Big Five Profile - Personality overview (sidebar)
 * 5. Recent Results - Test history (main column, order-2 on mobile)
 * 6. Shared Tests - Collaborative tests (main column)
 *
 * Performance optimizations:
 * - Preload data fetching before Suspense boundaries
 * - Unified data fetcher eliminates waterfall
 * - Staggered animations for visual polish
 *
 * Accessibility (WCAG 2.1 AA):
 * - All sections have proper ARIA labels
 * - Touch targets minimum 44px
 * - Full keyboard navigation support
 * - Screen reader friendly
 */
export default async function ProfilePage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get translations for this page
  const t = await getTranslations('profile.page');

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

  // Extract user role from Clerk metadata (defaults to USER)
  const userRole = (user.publicMetadata?.role as UserRole) || UserRole.USER;

  // Check if primary email is verified
  const isEmailVerified = user.emailAddresses[0]?.verification?.status === 'verified';

  return (
    <main id="main-content" className="min-h-screen bg-muted/30">
      <MainContentAnchor />
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8 pb-24 md:pb-8">
        {/* Page Header - Mobile optimized (consistent spacing) */}
        <header className="mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10">
              <User className="size-5 sm:size-6 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
              {t('title')}
            </h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
            {t('description')}
          </p>
        </header>

        {/* Main Content - 3-Column Grid Layout (matching test-template/[id]/overview) */}
        <div className="space-y-6">
          {/* Hero Card - Full Width */}
          <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <ProfileHeroCard
              userInfo={userInfo}
              role={userRole}
              isVerified={isEmailVerified}
            />
          </div>

          {/* Quick Stats Grid - Full Width (2x2 mobile, 4x1 desktop) */}
          <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-75 fill-mode-both">
            <Suspense fallback={<QuickStatsGridSkeleton />}>
              <QuickStatsGridLoader userId={user.id} />
            </Suspense>
          </div>

          {/* 3-Column Grid: Main (2 cols) + Sidebar (1 col) */}
          {/* Mobile order: Sidebar first (competencies, passport) via order-1, then main via order-2 */}
          {/* items-start ensures columns don't stretch unnecessarily, preventing content overflow */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 lg:items-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-100 fill-mode-both">
            {/* Main Column - Recent Results + Shared Tests (2 cols on desktop) */}
            <div className="lg:col-span-2 order-2 lg:order-1 space-y-6">
              <Suspense fallback={<RecentResultsSectionSkeleton />}>
                <RecentResultsLoader userId={user.id} />
              </Suspense>

              {/* Shared Tests - In main column for compact layout */}
              <Suspense fallback={<SharedTestsSectionSkeleton />}>
                <SharedTestsLoader />
              </Suspense>
            </div>

            {/* Sidebar - Competencies + Personality (1 col on desktop) */}
            {/* Shows first on mobile via order-1 for actionable insights */}
            <div className="order-1 lg:order-2 space-y-6">
              <Suspense fallback={<TopCompetenciesCardSkeleton />}>
                <TopCompetenciesLoader userId={user.id} />
              </Suspense>

              <Suspense fallback={<PersonalityPassportCardSkeleton />}>
                <PersonalityPassportLoader userId={user.id} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Action Bar - Fixed bottom navigation */}
      <MobileProfileActionBar />
    </main>
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

/**
 * Server component that fetches and displays shared tests
 * Streams after static shell via Suspense
 */
async function SharedTestsLoader() {
  const { items, total } = await getSharedTemplates();
  return <SharedTestsSection items={items} total={total} />;
}
