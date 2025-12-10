import { notFound } from 'next/navigation';
import { testResultsApi } from '@/services/api';
import TestResultView from './_components/TestResultView';

interface TestResultPageProps {
  params: {
    resultId: string;
  };
}

/**
 * Test Result Detail Page (Server Component)
 * 
 * Displays comprehensive test results including:
 * - Overall score and pass/fail status
 * - Competency scores breakdown
 * - Big Five personality profile derived from competencies
 * 
 * Uses Server Component for initial data fetch with proper caching.
 */
export default async function TestResultPage({ params }: TestResultPageProps) {
  const { resultId } = params;

  // Fetch test result from backend
  const result = await testResultsApi.getResultById(resultId);

  if (!result) {
    notFound();
  }

  return <TestResultView result={result} />;
}

/**
 * Generate metadata for the page
 */
export async function generateMetadata({ params }: TestResultPageProps) {
  const { resultId } = params;
  const result = await testResultsApi.getResultById(resultId);

  if (!result) {
    return {
      title: 'Test Result Not Found',
    };
  }

  return {
    title: `Test Result - ${result.templateName}`,
    description: `Test result for ${result.templateName}: ${result.overallPercentage.toFixed(1)}% - ${result.passed ? 'Passed' : 'Failed'}`,
  };
}
