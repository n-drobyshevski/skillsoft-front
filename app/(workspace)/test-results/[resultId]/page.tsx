import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { testResultsApi } from '@/services/api';
import TestResultView from './_components/TestResultView';


interface TestResultPageProps {
  params: Promise<{
    resultId: string;
  }>;
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
  const { resultId } = await params;

  // Fetch test result from backend
  const result = await testResultsApi.getResultById(resultId);

  if (!result) {
    notFound();
  }

  return <TestResultView result={result} />;
}

/**
 * Generate metadata for the page with i18n support
 */
export async function generateMetadata({ params }: TestResultPageProps): Promise<Metadata> {
  const { resultId } = await params;
  const t = await getTranslations("metadata.testResults");
  const siteName = "SkillSoft";

  const result = await testResultsApi.getResultById(resultId);

  if (!result) {
    return {
      title: `${t("title")} - ${siteName}`,
    };
  }

  const score = (result.overallPercentage ?? 0).toFixed(0);
  const description = result.passed
    ? t("passedDescription", { score })
    : t("failedDescription", { score });

  return {
    title: `${t("title")} - ${result.templateName} | ${siteName}`,
    description,
    openGraph: {
      title: `${t("title")} - ${result.templateName} | ${siteName}`,
      description,
    },
  };
}
