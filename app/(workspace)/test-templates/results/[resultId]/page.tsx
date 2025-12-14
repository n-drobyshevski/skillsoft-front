import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { testResultsApi, testTemplatesApi } from '@/services/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ResultViewWrapper } from './_components/ResultViewFactory';

interface PageProps {
  params: Promise<{
    resultId: string;
  }>;
}

/**
 * Test Results Page - Entry point for viewing test results.
 *
 * Uses Strategy pattern via ResultViewFactory to render scenario-appropriate views:
 * - OVERVIEW (Scenario A): Competency Passport with Big Five profile
 * - JOB_FIT (Scenario B): Job assessment with O*NET benchmark comparison
 * - TEAM_FIT (Scenario C): Team compatibility analysis
 */
export default async function TestResultsPage({ params }: PageProps) {
  const { resultId } = await params;

  return (
    <Suspense fallback={<ResultsSkeleton />}>
      <ResultsContent resultId={resultId} />
    </Suspense>
  );
}

/**
 * Server component that fetches result and template data,
 * then delegates rendering to the appropriate view component via factory.
 */
async function ResultsContent({ resultId }: { resultId: string }) {
  // First try to get by result ID, then by session ID
  let result = null;

  try {
    result = await testResultsApi.getResultById(resultId);
  } catch {
    // Continue to try by session ID
  }

  if (!result) {
    try {
      result = await testResultsApi.getResultBySession(resultId);
    } catch {
      // Both attempts failed
    }
  }

  if (!result) {
    notFound();
  }

  // Fetch template details to determine visualization strategy
  const template = await testTemplatesApi.getTemplateById(result.templateId);

  if (!template) {
    notFound();
  }

  // Delegate to factory - it selects the correct view based on template.goal
  return <ResultViewWrapper result={result} template={template} />;
}

/**
 * Loading skeleton for results page
 */
function ResultsSkeleton() {
  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Hero skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
              <div className="flex flex-col items-center gap-3">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center gap-6">
                <Skeleton className="w-36 h-36 rounded-full" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-24 rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <Skeleton className="h-[360px] rounded-lg" />
          <Skeleton className="h-[360px] rounded-lg" />
        </div>

        {/* Accordion skeleton */}
        <Card className="mt-4">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-12 w-full mb-2" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
