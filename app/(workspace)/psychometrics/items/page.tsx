import { Metadata } from 'next';
import { Suspense } from 'react';
import { psychometricsApi, competenciesApi } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/common/PageHeader';
import { ItemValidityStatus } from '@/types/psychometrics';
import { ItemsTableClient } from './_components/ItemsTableClient';

export const metadata: Metadata = {
  title: 'Элементы оценки - Психометрика - SkillSoft',
  description: 'Психометрическая статистика по элементам оценки.',
};

interface PageProps {
  searchParams: Promise<{
    status?: string;
    competencyId?: string;
    page?: string;
    size?: string;
  }>;
}

async function getItemsData(searchParams: Awaited<PageProps['searchParams']>) {
  try {
    const status = searchParams.status as ItemValidityStatus | undefined;
    const competencyId = searchParams.competencyId;
    const page = searchParams.page ? parseInt(searchParams.page, 10) : 0;
    const size = searchParams.size ? parseInt(searchParams.size, 10) : 20;

    const [itemsResult, competencies] = await Promise.all([
      psychometricsApi.getItems({ status, competencyId, page, size }),
      competenciesApi.getAllCompetencies(),
    ]);

    return {
      items: itemsResult,
      competencies: competencies || [],
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Не удалось загрузить данные.';
    return {
      items: { content: [], totalElements: 0, totalPages: 0, size: 20, number: 0, first: true, last: true },
      competencies: [],
      error: message,
    };
  }
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24" />
        ))}
      </div>
      <div className="rounded-lg border">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function ItemsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const { items, competencies, error } = await getItemsData(resolvedParams);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:gap-8 md:p-6">
      <PageHeader
        title="Элементы оценки"
        description="Психометрическая статистика по вопросам: индексы сложности и различения"
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

      {/* Items Table with Filters */}
      <Suspense fallback={<TableSkeleton />}>
        <ItemsTableClient
          initialItems={items}
          competencies={competencies}
          currentStatus={resolvedParams.status as ItemValidityStatus | undefined}
          currentCompetencyId={resolvedParams.competencyId}
          currentPage={resolvedParams.page ? parseInt(resolvedParams.page, 10) : 0}
        />
      </Suspense>
    </div>
  );
}
