import { Suspense } from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { MainContentAnchor } from '@/components/accessibility/SkipLinks';
import { Card, CardContent } from '@/components/ui/card';
import { IdentitySection, IdentitySectionSkeleton } from './_components/IdentitySection';
import { PropertiesSection, PropertiesSectionSkeleton } from './_components/PropertiesSection';
import { SkillsSection, SkillsSectionSkeleton } from './_components/SkillsSection';
import { PersonalitySection, PersonalitySectionSkeleton } from './_components/PersonalitySection';
import { ResultsSection, ResultsSectionSkeleton } from './_components/ResultsSection';
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
 * Profile Page (Server Component) — Linear/Notion-style redesign
 *
 * Flat, document-like layout with 5 sections separated by dividers:
 * 1. IdentitySection: Avatar + name + email + badges + actions (sync)
 * 2. PropertiesSection: Property-row grid of stats + progress bar
 * 3. SkillsSection: Top competencies list
 * 4. PersonalitySection: Big Five horizontal bars
 * 5. ResultsSection: Filterable test results table
 *
 * Performance:
 * - Preloaded parallel data fetch via preloadProfileData
 * - 4 independent Suspense boundaries for streaming
 * - Identity section renders synchronously from Clerk data
 *
 * Accessibility (WCAG 2.1 AA):
 * - All sections have proper ARIA region labels
 * - Touch targets minimum 44px
 * - Full keyboard navigation
 * - Screen reader friendly
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

  // Extract user role from Clerk metadata (defaults to USER)
  const userRole = (user.publicMetadata?.role as UserRole) || UserRole.USER;

  // Check if primary email is verified
  const isEmailVerified = user.emailAddresses[0]?.verification?.status === 'verified';

  return (
    <main id="main-content" className="min-h-screen bg-background">
      <MainContentAnchor />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-3">
          {/* Section 1: Identity (sync — no Suspense needed) */}
          <Card className="gap-0 py-0 rounded-lg shadow-none">
            <CardContent>
              <IdentitySection
                userInfo={userInfo}
                role={userRole}
                isVerified={isEmailVerified}
              />
            </CardContent>
          </Card>

          {/* Section 2: Properties/Stats */}
          <Card className="gap-0 py-0 rounded-lg shadow-none">
            <CardContent>
              <Suspense fallback={<PropertiesSectionSkeleton />}>
                <PropertiesLoader userId={user.id} userInfo={userInfo} />
              </Suspense>
            </CardContent>
          </Card>

          {/* Section 3: Top Skills */}
          <Card className="gap-0 py-0 rounded-lg shadow-none">
            <CardContent>
              <Suspense fallback={<SkillsSectionSkeleton />}>
                <SkillsLoader userId={user.id} />
              </Suspense>
            </CardContent>
          </Card>

          {/* Section 4: Personality */}
          <Card className="gap-0 py-0 rounded-lg shadow-none">
            <CardContent>
              <Suspense fallback={<PersonalitySectionSkeleton />}>
                <PersonalityLoader userId={user.id} />
              </Suspense>
            </CardContent>
          </Card>

          {/* Section 5: Recent Results */}
          <Card className="gap-0 py-0 rounded-lg shadow-none">
            <CardContent>
              <Suspense fallback={<ResultsSectionSkeleton />}>
                <ResultsLoader userId={user.id} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

// ============================================
// ASYNC DATA LOADERS
// ============================================

/**
 * Fetches assessment summary and renders the properties grid
 */
async function PropertiesLoader({
  userId,
  userInfo,
}: {
  userId: string;
  userInfo: ProfileUserInfo;
}) {
  const summary = await getAssessmentSummary(userId);
  return <PropertiesSection userInfo={userInfo} summary={summary} />;
}

/**
 * Fetches competency passport and renders the skills list
 */
async function SkillsLoader({ userId }: { userId: string }) {
  const passport = await getCompetencyPassport(userId);
  return (
    <SkillsSection
      competencies={passport.topCompetencies}
      totalAssessments={passport.totalAssessmentsUsed}
    />
  );
}

/**
 * Fetches competency passport and renders the personality bars
 */
async function PersonalityLoader({ userId }: { userId: string }) {
  const passport = await getCompetencyPassport(userId);
  return (
    <PersonalitySection
      bigFiveProfile={passport.bigFiveProfile}
      confidence={passport.confidence}
      totalAssessments={passport.totalAssessmentsUsed}
    />
  );
}

/**
 * Fetches assessment summary and renders recent results
 */
async function ResultsLoader({ userId }: { userId: string }) {
  const summary = await getAssessmentSummary(userId);
  return <ResultsSection results={summary.recentResults} />;
}
