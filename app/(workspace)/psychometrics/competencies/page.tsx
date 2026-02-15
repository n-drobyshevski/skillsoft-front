import { Suspense } from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/common/PageHeader';
import { InlineError } from '@/components/feedback';
import { ReliabilityStatus, CompetencyReliability, Page } from '@/types/psychometrics';
import { ErrorCategory, ErrorAction } from '@/types/errors';
import { CompetenciesTableClient } from './_components/CompetenciesTableClient';
import { getPsychometricsCompetenciesCached } from '@/services/api.cache.psychometrics';
import { getAuthHeaders } from '@/services/roleApi';
import Loading from './loading';

export const metadata: Metadata = {
  title: 'Competency Reliability - Psychometrics - SkillSoft',
  description: "Cronbach's Alpha reliability analysis for competencies.",
};

interface PageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
    size?: string;
  }>;
}

// Empty page fallback for graceful degradation
const EMPTY_PAGE: Page<CompetencyReliability> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 20,
  number: 0,
  first: true,
  last: true,
};

async function getCompetenciesData(searchParams: Awaited<PageProps['searchParams']>) {
  const status = searchParams.status as ReliabilityStatus | undefined;
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 0;
  const size = searchParams.size ? parseInt(searchParams.size, 10) : 20;

  const authHeaders = await getAuthHeaders();
  const data = await getPsychometricsCompetenciesCached(authHeaders, { status, page, size });

  return {
    competencies: data ?? EMPTY_PAGE,
    error: data === null ? 'Failed to load competency reliability data' : null,
  };
}

/**
 * Async data-fetching component for competencies content.
 * Wrapped in Suspense to enable PPR static shell.
 */
async function CompetenciesData({ searchParams }: { searchParams: Awaited<PageProps['searchParams']> }) {
  const { competencies, error } = await getCompetenciesData(searchParams);

  return (
    <>
      {/* Error Display with rich metadata and retry capability */}
      {error && (
        <InlineError
          error={{
            message: error,
            status: 500,
            category: ErrorCategory.SERVER,
            isRetryable: true,
            suggestedAction: ErrorAction.RETRY,
          }}
          variant="card"
          title="Competency Loading Error"
        />
      )}

      {/* Competencies Table with Filters */}
      <CompetenciesTableClient
        initialData={competencies}
        currentStatus={searchParams.status as ReliabilityStatus | undefined}
        currentPage={searchParams.page ? parseInt(searchParams.page, 10) : 0}
      />
    </>
  );
}

export default async function CompetenciesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const t = await getTranslations('psychometrics');

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:gap-8 md:p-6">
      <PageHeader
        title={t('competenciesTable.title')}
        description={t('competenciesTable.description')}
      />

      <Suspense fallback={<Loading />}>
        <CompetenciesData searchParams={resolvedParams} />
      </Suspense>
    </div>
  );
}
