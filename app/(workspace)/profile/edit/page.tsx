import { Suspense } from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Pencil } from 'lucide-react';
import { MainContentAnchor } from '@/components/accessibility/SkipLinks';
import { ProfileEditContent } from './_components/ProfileEditContent';
import { ProfileEditSkeleton } from './_components/ProfileEditSkeleton';
import {
  getAssessmentSummary,
  getCompetencyPassport,
  preloadProfileData,
} from '@/services/profile-api';
import type { ProfileUserInfo } from '@/types/profile';

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

// SEO Metadata - Dynamic for i18n
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('profile.edit');
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
    robots: {
      index: false,
      follow: false,
    },
  };
}

/**
 * Profile Edit Page (Server Component)
 *
 * Features:
 * - Server-side auth check with Clerk
 * - Parallel data fetching with Suspense boundaries
 * - Client form component for interactions
 * - Read-only summary cards for Results/Passport tabs
 *
 * Mobile-first responsive design with:
 * - Tab navigation for Account/Results/Passport
 * - Sticky action footer on mobile
 * - Accordion sections for preferences
 */
export default async function ProfileEditPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get translations for server component
  const t = await getTranslations('profile.edit');

  // Preload profile data immediately (starts parallel fetch)
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

  // Fetch profile data for Results/Passport tabs
  const [summary, passport] = await Promise.all([
    getAssessmentSummary(user.id),
    getCompetencyPassport(user.id),
  ]);

  return (
    <main id="main-content" className="min-h-screen bg-background">
      <MainContentAnchor />
      <div className="container max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Page Header - Compact on mobile */}
        <header className="mb-4 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-primary/10 shrink-0">
              <Pencil className="size-5 sm:size-6 text-primary" />
            </div>
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight truncate">
              {t('title')}
            </h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-base ml-9 sm:ml-[52px]">
            {t('subtitle')}
          </p>
        </header>

        {/* Main Content with Tabs */}
        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <Suspense fallback={<ProfileEditSkeleton />}>
            <ProfileEditContent
              userInfo={userInfo}
              summary={summary}
              passport={passport}
            />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
