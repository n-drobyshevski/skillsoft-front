import { Suspense } from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { testSessionsApi, testResultsApi } from '@/services/api';
import { MyTestsClientWrapper } from './_components/MyTestsClientWrapper';
import { TestCardSkeleton } from './_components/TestCardSkeleton';
import { ClipboardList } from 'lucide-react';

/**
 * Loading skeleton while data is being fetched
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Tabs skeleton */}
      <div className="flex gap-2 border-b pb-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-9 w-24 bg-muted animate-pulse rounded-md" />
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-4">
        <TestCardSkeleton />
        <TestCardSkeleton />
        <TestCardSkeleton />
      </div>
    </div>
  );
}

/**
 * My Assigned Tests Page (Server Component)
 *
 * Displays all tests assigned to the current user with filtering by status.
 * Mobile-first responsive design with clean, modern UI.
 */
export default async function MyTestsPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {/* Page Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <ClipboardList className="size-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Мои тесты
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Просматривайте назначенные тесты и отслеживайте прогресс
          </p>
        </header>

        {/* Main Content with Suspense */}
        <Suspense fallback={<LoadingSkeleton />}>
          <TestsDataLoader userId={user.id} />
        </Suspense>
      </div>
    </div>
  );
}

/**
 * Server component that fetches test data
 */
async function TestsDataLoader({ userId }: { userId: string }) {
  // Fetch user sessions and results in parallel
  const [sessionsResponse, resultsResponse] = await Promise.all([
    testSessionsApi.getUserSessions(userId, 0, 100),
    testResultsApi.getUserResults(userId, 0, 100),
  ]);

  const sessions = sessionsResponse?.content || [];
  const results = resultsResponse?.content || [];

  // Create a map of session ID to result for quick lookup
  const resultsBySessionId = new Map(
    results.map(r => [r.sessionId, r])
  );

  // Enrich sessions with their results
  const enrichedSessions = sessions.map(session => ({
    ...session,
    result: resultsBySessionId.get(session.id) || null,
  }));

  return <MyTestsClientWrapper sessions={enrichedSessions} />;
}
