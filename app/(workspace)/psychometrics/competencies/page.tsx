import { Metadata } from 'next';
import { psychometricsApi } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/common/PageHeader';
import { ReliabilityStatus } from '@/types/psychometrics';
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

async function getCompetenciesData(searchParams: Awaited<PageProps['searchParams']>) {
  try {
    const status = searchParams.status as ReliabilityStatus | undefined;
    const page = searchParams.page ? parseInt(searchParams.page, 10) : 0;
    const size = searchParams.size ? parseInt(searchParams.size, 10) : 20;

    const competencies = await psychometricsApi.getCompetencies({ status, page, size });

    return {
      competencies,
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Не удалось загрузить данные.';
    return {
      competencies: { content: [], totalElements: 0, totalPages: 0, size: 20, number: 0, first: true, last: true },
      error: message,
    };
  }
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

      {/* Error Display */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4">
            <div className="text-destructive font-medium mb-1">Ошибка загрузки данных</div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
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
