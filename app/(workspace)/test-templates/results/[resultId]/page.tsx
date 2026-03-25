import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getAuthHeaders } from '@/services/roleApi';
import { getResult, getTemplate, getTrendData } from './_data/cached-queries';
import { ResultViewWrapper } from './_components/ResultViewFactory';

interface PageProps {
  params: Promise<{
    resultId: string;
  }>;
}

/**
 * Test Results Page - Entry point for viewing test results.
 *
 * Performance optimizations (Next.js 16):
 * - React.cache on getResult for render-pass dedup
 * - 'use cache' + cacheLife('entityData') on getTemplate (semi-static)
 * - 'use cache' + cacheLife('realtime') on getTrendData (server-prefetched)
 * - Parallel fetch: template + trend resolve concurrently via Promise.all
 * - Auth headers resolved once outside cache boundary, passed as cache key
 * - Trend data prefetched server-side, eliminating client useEffect waterfall
 * - loading.tsx provides the streaming skeleton
 */
export default async function TestResultsPage({ params }: PageProps) {
  const { resultId } = await params;

  return (
    <Suspense>
      <ResultsContent resultId={resultId} />
    </Suspense>
  );
}

/**
 * Server component that fetches result and template data in parallel,
 * then delegates rendering to the appropriate view component via factory.
 *
 * Auth headers are resolved here (outside 'use cache' boundary) and
 * passed into cached functions where they become part of the cache key.
 */
async function ResultsContent({ resultId }: { resultId: string }) {
  // Resolve auth headers once — runtime API, must be outside 'use cache'
  const authHeaders = await getAuthHeaders();

  // Step 1: Fetch result (deduped via React.cache, uses no-store)
  const result = await getResult(resultId);
  if (!result) notFound();

  // Step 2: Fetch template + trend data in parallel
  // Both use 'use cache' with authHeaders passed as argument (cache key)
  const [template, trendData] = await Promise.all([
    getTemplate(result.templateId, authHeaders),
    result.clerkUserId && result.templateId
      ? getTrendData(result.clerkUserId, result.templateId, authHeaders)
      : null,
  ]);

  if (!template) notFound();

  return (
    <ResultViewWrapper
      result={result}
      template={template}
      trendData={trendData}
    />
  );
}
