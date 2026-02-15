import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPsychometricsItemDetailCached } from '@/services/api.cache.psychometrics';
import { getAuthHeaders } from '@/services/roleApi';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { ValidityStatusBadge } from '../../_components';
import {
  ItemDetailLayout,
  DesktopHeroWrapper,
  ItemDetailClient,
  // Phase 2 Components
  QuestionSection,
  IssuesBanner,
  ThresholdsAccordion,
  // Phase 3 Components
  ResponsiveGauges,
} from './_components';
import { Users, Clock } from 'lucide-react';
import { ItemValidityStatus } from '@/types/psychometrics';
import Loading from './loading';

export const metadata: Metadata = {
  title: 'Детали элемента - Психометрика - SkillSoft',
  description: 'Детальная психометрическая статистика элемента оценки.',
};

interface PageProps {
  params: Promise<{ questionId: string }>;
}

async function getItemDetail(questionId: string) {
  const authHeaders = await getAuthHeaders();
  const item = await getPsychometricsItemDetailCached(questionId, authHeaders);
  return {
    item,
    error: item === null ? 'Не удалось загрузить данные.' : null,
  };
}

// Get status-based hero gradient
function getStatusGradient(status: ItemValidityStatus): string {
  switch (status) {
    case ItemValidityStatus.ACTIVE:
      return 'from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/20 dark:via-emerald-500/10';
    case ItemValidityStatus.PROBATION:
      return 'from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/20 dark:via-amber-500/10';
    case ItemValidityStatus.FLAGGED_FOR_REVIEW:
      return 'from-orange-500/10 via-orange-500/5 to-transparent dark:from-orange-500/20 dark:via-orange-500/10';
    case ItemValidityStatus.RETIRED:
      return 'from-red-500/10 via-red-500/5 to-transparent dark:from-red-500/20 dark:via-red-500/10';
    default:
      return 'from-slate-500/10 via-slate-500/5 to-transparent';
  }
}

/**
 * Async data-fetching component for item detail.
 * Wrapped in Suspense to enable PPR static shell.
 */
async function ItemDetailDataComponent({ questionId }: { questionId: string }) {
  const { item, error } = await getItemDetail(questionId);

  if (!item && !error) {
    notFound();
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:gap-8 md:p-6">
        <PageHeader title="Ошибка загрузки" />
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4">
            <div className="text-destructive font-medium mb-1">Ошибка</div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusGradient = getStatusGradient(item!.validityStatus);

  return (
    <ItemDetailLayout item={item!}>
      {/* Desktop Hero Section with Gradient - Hidden on mobile (MobileItemHeader handles that) */}
      <DesktopHeroWrapper className={`relative -mx-4 -mt-6 px-4 pt-6 pb-6 md:-mx-6 md:px-6 bg-gradient-to-b ${statusGradient}`}>
        <PageHeader
          title="Детали элемента"
          description={item!.competencyName}
        >
          <ValidityStatusBadge status={item!.validityStatus} size="lg" />
        </PageHeader>

        {/* Quick Stats Row */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Ответов:</span>
            <span className="font-semibold">{item!.responseCount}</span>
          </div>
          {item!.lastCalculatedAt && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Обновлено:</span>
              <span className="font-semibold">
                {new Date(item!.lastCalculatedAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          )}
        </div>
      </DesktopHeroWrapper>

      {/* Issues Banner - Moved up for critical visibility on mobile */}
      <IssuesBanner
        questionId={item!.questionId}
        discriminationFlag={item!.discriminationFlag}
        difficultyFlag={item!.difficultyFlag}
        validityStatus={item!.validityStatus}
      />

      {/* Question Text - Collapsible on mobile */}
      <QuestionSection
        questionText={item!.questionText}
        competencyName={item!.competencyName}
        indicatorTitle={item!.indicatorTitle}
      />

      {/* Gauges Section - Linear on mobile, Semi-circular on desktop */}
      <ResponsiveGauges
        difficultyIndex={item!.difficultyIndex}
        discriminationIndex={item!.discriminationIndex}
      />

      {/* Metrics Comparison with Thresholds - Accordion on mobile, Card on desktop */}
      <ThresholdsAccordion
        difficultyIndex={item!.difficultyIndex}
        discriminationIndex={item!.discriminationIndex}
        responseCount={item!.responseCount}
      />

      {/* Client-side interactive components */}
      <ItemDetailClient item={item!} />
    </ItemDetailLayout>
  );
}

export default async function ItemDetailPage({ params }: PageProps) {
  const { questionId } = await params;

  return (
    <Suspense fallback={<Loading />}>
      <ItemDetailDataComponent questionId={questionId} />
    </Suspense>
  );
}
