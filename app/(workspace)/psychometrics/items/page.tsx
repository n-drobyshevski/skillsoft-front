import { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/common/PageHeader';
import { ItemValidityStatus, Page } from '@/types/psychometrics';
import { ItemsTableClient } from './_components/ItemsTableClient';
import {
  getPsychometricsItemsCached,
} from '@/services/api.cache.psychometrics';
import { getCompetenciesCached } from '@/services/api.cache';
import { getAuthHeaders } from '@/services/roleApi';
import type { ItemStatistics } from '@/types/psychometrics';
import type { Competency } from '@/types/domain';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('psychometrics.itemsTable');
  return {
    title: `${t('title')} - SkillSoft`,
    description: t('description'),
  };
}

interface PageProps {
  searchParams: Promise<{
    status?: string;
    competencyId?: string;
    search?: string;
    page?: string;
    size?: string;
  }>;
}

// Empty page fallback for graceful degradation
const EMPTY_PAGE: Page<ItemStatistics> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 20,
  number: 0,
  first: true,
  last: true,
};

async function getItemsData(searchParams: Awaited<PageProps['searchParams']>) {
  const status = searchParams.status as ItemValidityStatus | undefined;
  const competencyId = searchParams.competencyId;
  const search = searchParams.search;
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 0;
  const size = searchParams.size ? parseInt(searchParams.size, 10) : 20;

  // Fetch items and competencies in parallel using cached functions
  const authHeaders = await getAuthHeaders();
  const [itemsResult, competencies] = await Promise.all([
    getPsychometricsItemsCached(authHeaders, { status, competencyId, search, page, size }),
    getCompetenciesCached(),
  ]);

  return {
    items: itemsResult ?? EMPTY_PAGE,
    competencies: competencies ?? [],
    error: itemsResult === null ? 'Failed to load items data' : null,
  };
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
  const t = await getTranslations('psychometrics');
  const tTable = await getTranslations('psychometrics.itemsTable');
  const { items, competencies, error } = await getItemsData(resolvedParams);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:gap-8 md:p-6">
      <PageHeader
        title={tTable('title')}
        description={tTable('description')}
      />

      {/* Error Display */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4">
            <div className="text-destructive font-medium mb-1">{t('dataLoadingError')}</div>
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
          currentSearch={resolvedParams.search}
        />
      </Suspense>
    </div>
  );
}
