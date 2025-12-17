import { Metadata } from 'next';
import { psychometricsApi } from '@/services/api';
import PageHeader from '@/components/common/PageHeader';
import { InlineError } from '@/components/feedback';
import { ReliabilityStatus, CompetencyReliability, Page } from '@/types/psychometrics';
import { serverFetchWithRetry, type ServerFetchError } from '@/lib/server-fetch';
import { CompetenciesTableClient } from './_components/CompetenciesTableClient';

export const metadata: Metadata = {
  title: 'Надежность компетенций - Психометрика - SkillSoft',
  description: 'Анализ надежности измерений компетенций (Cronbach Alpha).',
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

interface PageData {
  competencies: Page<CompetencyReliability>;
  error: ServerFetchError | null;
}

async function getCompetenciesData(searchParams: Awaited<PageProps['searchParams']>): Promise<PageData> {
  const status = searchParams.status as ReliabilityStatus | undefined;
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 0;
  const size = searchParams.size ? parseInt(searchParams.size, 10) : 20;

  const { data, error } = await serverFetchWithRetry(
    () => psychometricsApi.getCompetencies({ status, page, size }),
    {
      maxRetries: 2,
      initialDelayMs: 300,
      fallbackValue: EMPTY_PAGE,
    }
  );

  return {
    competencies: data ?? EMPTY_PAGE,
    error,
  };
}

export default async function CompetenciesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const { competencies, error } = await getCompetenciesData(resolvedParams);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:gap-8 md:p-6">
      <PageHeader
        title="Надежность компетенций"
        description="Cronbach's Alpha и статистика по компетенциям"
      />

      {/* Error Display with rich metadata and retry capability */}
      {error && (
        <InlineError
          error={error}
          variant="card"
          title="Ошибка загрузки компетенций"
        />
      )}

      {/* Competencies Table with Filters */}
      <CompetenciesTableClient
        initialData={competencies}
        currentStatus={resolvedParams.status as ReliabilityStatus | undefined}
        currentPage={resolvedParams.page ? parseInt(resolvedParams.page, 10) : 0}
      />
    </div>
  );
}
