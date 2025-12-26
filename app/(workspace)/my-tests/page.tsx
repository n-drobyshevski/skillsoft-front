import { Suspense } from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getMyTestsDataCached } from '@/services/api.cache.my-tests';
import { MyTestsContent } from './_components/MyTestsContent';
import { ContentSkeleton } from './_components/ContentSkeleton';
import { ClipboardList } from 'lucide-react';

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

// Page metadata
export const metadata = {
  title: 'Мои тесты | SkillSoft',
  description: 'Просматривайте назначенные тесты и отслеживайте прогресс',
};

// Valid tab values for URL state
type TabValue = 'all' | 'pending' | 'in_progress' | 'completed';
const VALID_TABS: TabValue[] = ['all', 'pending', 'in_progress', 'completed'];

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

/**
 * My Assigned Tests Page (Server Component)
 *
 * Displays all tests assigned to the current user with filtering by status.
 * Mobile-first responsive design with clean, modern UI.
 * Uses URL-based tab state for better UX (bookmarkable, shareable).
 */
export default async function MyTestsPage({ searchParams }: PageProps) {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Await searchParams (Next.js 15+ requirement)
  const params = await searchParams;
  const tabParam = params.tab;
  const initialTab: TabValue = VALID_TABS.includes(tabParam as TabValue)
    ? (tabParam as TabValue)
    : 'all';

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
        <Suspense fallback={<ContentSkeleton />}>
          <TestsDataLoader userId={user.id} initialTab={initialTab} />
        </Suspense>
      </div>
    </div>
  );
}

/**
 * Server component that fetches test data
 * Uses cached API functions for optimal performance with 30s session / 60s result revalidation.
 * Cache keys are user-specific for data isolation.
 */
async function TestsDataLoader({
  userId,
  initialTab,
}: {
  userId: string;
  initialTab: TabValue;
}) {
  // Fetch user sessions and results in parallel using cached functions
  const { sessions, resultsBySessionId } = await getMyTestsDataCached(userId);

  // Enrich sessions with their results
  const enrichedSessions = sessions.map(session => ({
    ...session,
    result: resultsBySessionId.get(session.id) || null,
  }));

  return <MyTestsContent sessions={enrichedSessions} initialTab={initialTab} />;
}
