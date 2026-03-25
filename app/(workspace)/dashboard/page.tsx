import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { Metadata } from 'next';
import ErrorCard from '@/components/feedback/ErrorCard';
import { currentUser } from '@clerk/nextjs/server';
import { getAuthHeaders } from '@/services/roleApi';
import {
  getDashboardStatsCached,
  getMainColumnDataCached,
  getSideColumnDataCached,
} from '@/services/api.cache.dashboard';
import { DashboardGrid, CompactStatsRow } from '@/components/dashboard';
import { LENS_COOKIE_NAME } from '@/store/lens-store';

import DashboardHeader from './_components/dashboard-header';
import DashboardMainColumn from './_components/dashboard-main-column';
import DashboardSideColumn from './_components/dashboard-side-column';
import { UserActionSection, UserInsightsSection } from './_components/dashboard-user-sections';
import {
  StatsRowSkeleton,
  MainColumnSkeleton,
  SideColumnSkeleton,
  UserSectionSkeleton,
} from './_components/dashboard-skeletons';

export const metadata: Metadata = {
  title: 'Dashboard - SkillSoft',
  description: 'Your SkillSoft dashboard - manage competencies, track progress, and develop skills.',
};

/**
 * Resolve current user info from Clerk.
 * This is a lightweight call (auth check only, no data fetching).
 */
async function getCurrentUserInfo() {
  try {
    const user = await currentUser();
    if (!user) return null;

    const role = (user.publicMetadata?.role as 'ADMIN' | 'EDITOR' | 'USER') || 'USER';

    return {
      id: user.id,
      firstName: user.firstName || undefined,
      role,
    };
  } catch {
    return null;
  }
}

async function isUserLensActive(role: 'ADMIN' | 'EDITOR' | 'USER'): Promise<boolean> {
  if (role === 'USER') return true;
  try {
    const cookieStore = await cookies();
    const lensCookie = cookieStore.get(LENS_COOKIE_NAME)?.value;
    return lensCookie === 'user';
  } catch {
    return false;
  }
}

// ============================================================================
// Async Server Component Wrappers (Suspense Boundaries)
// ============================================================================

/**
 * DashboardStatsSection - Async server component that fetches stats independently.
 * Wrapped in Suspense at the page level with StatsRowSkeleton fallback.
 *
 * Auth headers are resolved here (outside 'use cache' scope) and passed
 * into the cached function to avoid calling headers() inside cache.
 */
async function DashboardStatsSection() {
  const authHeaders = await getAuthHeaders();
  const stats = await getDashboardStatsCached(authHeaders);

  if (!stats) {
    return <ErrorCard error="Failed to load statistics" />;
  }

  return <CompactStatsRow stats={stats} />;
}

/**
 * DashboardMainSection - Async server component that fetches main column data.
 * Wrapped in Suspense at the page level with MainColumnSkeleton fallback.
 *
 * Fetches: competencies, templates, questions, psychometrics (editor/admin).
 *
 * Auth headers are resolved here (outside 'use cache' scope) and passed
 * into the cached function to avoid calling headers() inside cache.
 */
async function DashboardMainSection({
  userInfo,
}: {
  userInfo: { id: string; firstName?: string; role: 'ADMIN' | 'EDITOR' | 'USER' } | null;
}) {
  const authHeaders = await getAuthHeaders();
  const data = await getMainColumnDataCached(userInfo?.role, authHeaders);

  if (!data) {
    return (
      <div className="col-span-2 md:col-span-4 lg:col-span-8">
        <ErrorCard error="Failed to load dashboard content" />
      </div>
    );
  }

  return (
    <DashboardMainColumn
      stats={data.stats}
      testTemplates={data.templates}
      psychometrics={data.psychometrics}
      currentUser={userInfo ? { firstName: userInfo.firstName, role: userInfo.role } : undefined}
    />
  );
}

/**
 * DashboardSideSection - Async server component that fetches sidebar data.
 * Wrapped in Suspense at the page level with SideColumnSkeleton fallback.
 *
 * Fetches: userStats (admin-only).
 *
 * Auth headers are resolved here (outside 'use cache' scope) and passed
 * into the cached function to avoid calling headers() inside cache.
 */
async function DashboardSideSection({
  userInfo,
}: {
  userInfo: { id: string; firstName?: string; role: 'ADMIN' | 'EDITOR' | 'USER' } | null;
}) {
  const authHeaders = await getAuthHeaders();
  const data = await getSideColumnDataCached(userInfo?.role, authHeaders);

  return (
    <DashboardSideColumn
      userStats={data.userStats}
      currentUser={userInfo ? { firstName: userInfo.firstName, role: userInfo.role } : undefined}
    />
  );
}

// ============================================================================
// Page Component (Streaming Shell)
// ============================================================================

/**
 * DashboardPage - Progressive streaming dashboard.
 *
 * Architecture:
 * 1. Awaits only getCurrentUserInfo() (lightweight Clerk auth check)
 * 2. Renders header immediately with user greeting
 * 3. Wraps data-dependent sections in independent Suspense boundaries
 *    so each section streams in as its data arrives
 *
 * Streaming order (by data weight):
 * - Header: immediate (no data dependency beyond user info)
 * - Stats Row: fast (3 lightweight API calls)
 * - Main Column: medium (stats + templates + psychometrics)
 * - Side Column: fast for non-admin, medium for admin (user stats)
 */
export default async function DashboardPage() {
  const userInfo = await getCurrentUserInfo();
  const showUserDashboard = userInfo
    ? await isUserLensActive(userInfo.role)
    : false;

  return (
    <div className="flex flex-1 flex-col gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
      <DashboardHeader
        currentUser={userInfo ? { firstName: userInfo.firstName, role: userInfo.role } : undefined}
        isUserLensServer={showUserDashboard}
      />

      {showUserDashboard && userInfo ? (
        <>
          <Suspense fallback={<UserSectionSkeleton />}>
            <UserActionSection userInfo={userInfo} />
          </Suspense>

          <Suspense fallback={<UserSectionSkeleton />}>
            <UserInsightsSection userInfo={userInfo} />
          </Suspense>
        </>
      ) : (
        <>
          <Suspense fallback={<StatsRowSkeleton />}>
            <DashboardStatsSection />
          </Suspense>

          <DashboardGrid>
            <Suspense fallback={<MainColumnSkeleton />}>
              <DashboardMainSection userInfo={userInfo} />
            </Suspense>

            <Suspense fallback={<SideColumnSkeleton />}>
              <DashboardSideSection userInfo={userInfo} />
            </Suspense>
          </DashboardGrid>
        </>
      )}
    </div>
  );
}
