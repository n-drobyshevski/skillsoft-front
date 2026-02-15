import { redirect } from 'next/navigation';
import { testResultsApi } from '@/services/api';
import { ComparisonView } from './_components/ComparisonView';

interface ComparePageProps {
  searchParams: Promise<{
    templateId?: string;
    resultIds?: string;
    sessionIds?: string;
  }>;
}

/**
 * Candidate Comparison Page (Server Component).
 *
 * Reads templateId and comma-separated resultIds (or sessionIds) from
 * searchParams. When sessionIds are provided, resolves each to a result
 * via the session endpoint before fetching the comparison payload.
 */
export default async function ComparePage({ searchParams }: ComparePageProps) {
  const {
    templateId,
    resultIds: resultIdsParam,
    sessionIds: sessionIdsParam,
  } = await searchParams;

  if (!templateId) {
    redirect('/test-templates');
  }

  let resultIds: string[];

  if (resultIdsParam) {
    resultIds = resultIdsParam
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
  } else if (sessionIdsParam) {
    const sessionIds = sessionIdsParam
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    const results = await Promise.all(
      sessionIds.map((sid) =>
        testResultsApi.getResultBySession(sid).catch(() => null),
      ),
    );

    resultIds = results
      .filter((r): r is NonNullable<typeof r> => r !== null && r.id != null)
      .map((r) => r.id);
  } else {
    redirect('/test-templates');
  }

  if (resultIds.length < 2) {
    redirect('/test-templates');
  }

  try {
    const comparison = await testResultsApi.compareCandidates(
      templateId,
      resultIds,
    );

    return <ComparisonView data={comparison} />;
  } catch {
    redirect('/test-templates');
  }
}
