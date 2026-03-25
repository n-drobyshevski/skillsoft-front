import ErrorCard from '@/components/feedback/ErrorCard';
import { getAuthHeaders } from '@/services/roleApi';
import { getUserDashboardData } from '@/services/api.cache.user-dashboard';
import { testTemplatesApi } from '@/services/api';
import type { TestTemplateSummary } from '@/types/domain';
import {
  UserActionBanner,
  UserStatsRow,
  RecentResultsGrid,
  TopCompetenciesWidget,
  BigFiveCompactWidget,
  UserOnboardingCard,
  TestTemplatesWidget,
} from '@/components/dashboard';

interface UserSectionProps {
  userInfo: {
    id: string;
    firstName?: string;
    role: 'ADMIN' | 'EDITOR' | 'USER';
  };
}

/**
 * UserActionSection - Async server component for pending/in-progress sessions.
 * Wrapped in Suspense at page level.
 */
export async function UserActionSection({ userInfo }: UserSectionProps) {
  try {
    const data = await getUserDashboardData(userInfo.id);
    if (data.pendingSessions.length === 0) return null;
    return <UserActionBanner sessions={data.pendingSessions} />;
  } catch {
    return null;
  }
}

/**
 * UserInsightsSection - Async server component for stats, results, insights, and templates.
 * Single Suspense boundary for the main content area.
 */
export async function UserInsightsSection({ userInfo }: UserSectionProps) {
  try {
    const authHeaders = await getAuthHeaders();
    const [userData, templatesResult] = await Promise.all([
      getUserDashboardData(userInfo.id),
      testTemplatesApi.getActiveTemplates(authHeaders).catch(() => [] as TestTemplateSummary[]),
    ]);

    const { completedResults, personalStats, topCompetencies, bigFiveSnapshot, pendingSessions } = userData;
    const hasCompletedTests = completedResults.length > 0;
    const hasPendingSessions = pendingSessions.length > 0;
    const isNewUser = !hasCompletedTests && !hasPendingSessions;

    const activeTemplates = Array.isArray(templatesResult)
      ? (templatesResult as TestTemplateSummary[]).filter(t => t.isActive)
      : [];

    return (
      <div className="space-y-6">
        {isNewUser && (
          <UserOnboardingCard firstName={userInfo.firstName} />
        )}

        {personalStats && (
          <UserStatsRow stats={personalStats} />
        )}

        {hasCompletedTests && (
          <RecentResultsGrid results={completedResults} />
        )}

        {(topCompetencies.length > 0 || bigFiveSnapshot) && (
          <div className={`grid gap-4 ${
            topCompetencies.length > 0 && bigFiveSnapshot
              ? 'sm:grid-cols-2'
              : ''
          }`}>
            {topCompetencies.length > 0 && (
              <TopCompetenciesWidget competencies={topCompetencies} />
            )}
            {bigFiveSnapshot && (
              <BigFiveCompactWidget snapshot={bigFiveSnapshot} />
            )}
          </div>
        )}

        {activeTemplates.length > 0 && (
          <TestTemplatesWidget templates={activeTemplates} maxItems={6} />
        )}
      </div>
    );
  } catch {
    return <ErrorCard error="Failed to load dashboard content" />;
  }
}
