'use client';

import dynamic from 'next/dynamic';
import { TestCardSkeleton } from './TestCardSkeleton';
import { EnrichedTestSession } from './MyTestsContent';

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

// Dynamic import to prevent hydration mismatch with Radix UI Tabs
const MyTestsContent = dynamic(
  () => import('./MyTestsContent').then(mod => ({ default: mod.MyTestsContent })),
  { ssr: false, loading: () => <LoadingSkeleton /> }
);

interface MyTestsClientWrapperProps {
  sessions: EnrichedTestSession[];
}

/**
 * Client-only wrapper to prevent Radix UI Tabs hydration mismatch
 */
export function MyTestsClientWrapper({ sessions }: MyTestsClientWrapperProps) {
  return <MyTestsContent sessions={sessions} />;
}
