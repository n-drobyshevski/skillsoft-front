import { Suspense } from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { User } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { MainContentAnchor } from '@/components/accessibility/SkipLinks';
import { UnifiedHeroBento, UnifiedHeroBentoSkeleton } from './_components/UnifiedHeroBento';
import { SkillsPersonalityCard, SkillsPersonalityCardSkeleton } from './_components/SkillsPersonalityCard';
import { RecentResultsSection, RecentResultsSectionSkeleton } from './_components/RecentResultsSection';
import {
  getAssessmentSummary,
  getCompetencyPassport,
  preloadProfileData,
} from '@/services/profile-api';
import type { ProfileUserInfo } from '@/types/profile';
import type { Metadata } from 'next';
import { UserRole } from '@/types/user';


// Dynamic metadata with i18n
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('profile.page');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

/**
 * Profile Page (Server Component) — Bento Grid Redesign
 *
 * Apple Health-inspired 3-section bento layout:
 * 1. UnifiedHeroBento: Avatar + identity + 3 stat cells + progress bar
 * 2. SkillsPersonalityCard: Tabbed card (Top Skills | Big Five Personality)
 * 3. RecentResultsSection: Filterable test results list
 *
 * Performance:
 * - Preloaded parallel data fetch via getUnifiedProfileData
 * - 3 independent Suspense boundaries for streaming
 * - Staggered entry animations
 *
 * Accessibility (WCAG 2.1 AA):
 * - All sections have proper ARIA labels
 * - Touch targets minimum 44px
 * - Full keyboard navigation
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
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
        {/* Page Header */}
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

        {/* Bento Grid Layout — 3 sections */}
        <div className="space-y-4 sm:space-y-6">
          {/* Section 1: Unified Hero Bento (identity + stats + progress) */}
          <div className="animate-in fade-in-0 duration-300">
            <Suspense fallback={<UnifiedHeroBentoSkeleton />}>
              <UnifiedHeroBentoLoader
                userId={user.id}
                userInfo={userInfo}
                role={userRole}
                isVerified={isEmailVerified}
              />
            </Suspense>
          </div>

          {/* Section 2: Skills & Personality (tabbed card) */}
          <div className="animate-in fade-in-0 duration-300" style={{ animationDelay: '75ms' }}>
            <Suspense fallback={<SkillsPersonalityCardSkeleton />}>
              <SkillsPersonalityLoader userId={user.id} />
            </Suspense>
          </div>

          {/* Section 3: Recent Results */}
          <div className="animate-in fade-in-0 duration-300" style={{ animationDelay: '150ms' }}>
            <Suspense fallback={<RecentResultsSectionSkeleton />}>
              <RecentResultsLoader userId={user.id} />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}

// ============================================
// ASYNC DATA LOADERS
// ============================================

/**
 * Server component that fetches user stats and renders the hero bento
 */
async function UnifiedHeroBentoLoader({
  userId,
  userInfo,
  role,
  isVerified,
}: {
  userId: string;
  userInfo: ProfileUserInfo;
  role: UserRole;
  isVerified: boolean;
}) {
  const summary = await getAssessmentSummary(userId);
  return (
    <UnifiedHeroBento
      userInfo={userInfo}
      role={role}
      isVerified={isVerified}
      summary={summary}
    />
  );
}

/**
 * Server component that fetches competency passport and renders tabbed card
 */
async function SkillsPersonalityLoader({ userId }: { userId: string }) {
  const passport = await getCompetencyPassport(userId);
  return (
    <SkillsPersonalityCard
      competencies={passport.topCompetencies}
      totalAssessments={passport.totalAssessmentsUsed}
      bigFiveProfile={passport.bigFiveProfile}
      confidence={passport.confidence}
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
