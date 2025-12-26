import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { UiLink } from '@/components/ui/ui-link';
import { getPsychometricsCompetencyDetailCached } from '@/services/api.cache.psychometrics';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import type { ItemLoweringAlpha } from '@/types/psychometrics';

// Import extracted components and utilities
import {
  CompetencyHeroMobile,
  CompetencyDetailAccordion,
  InsufficientDataGuidance,
  derivePageState,
} from './_components';

export const metadata: Metadata = {
  title: 'Надежность компетенции - Психометрика - SkillSoft',
  description: 'Детальный анализ надежности компетенции.',
};

interface PageProps {
  params: Promise<{ competencyId: string }>;
}

async function getCompetencyDetail(competencyId: string) {
  const detail = await getPsychometricsCompetencyDetailCached(competencyId);
  return {
    detail,
    error: detail === null ? 'Не удалось загрузить данные.' : null,
  };
}

export default async function CompetencyDetailPage({ params }: PageProps) {
  const { competencyId } = await params;
  const { detail, error } = await getCompetencyDetail(competencyId);

  // Use state machine for type-safe rendering
  const pageState = derivePageState(detail, error);

  // Handle error state
  if (pageState.status === 'error') {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:gap-8 md:p-6">
        <PageHeader title="Ошибка загрузки" />
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4">
            <div className="text-destructive font-medium mb-1">Ошибка</div>
            <p className="text-sm text-muted-foreground">{pageState.message}</p>
            {pageState.isRetryable && (
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link href={`/psychometrics/competencies/${competencyId}`}>
                  Попробовать снова
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle not found state
  if (pageState.status === 'not_found') {
    notFound();
  }

  // Populated state - render full page
  const data = pageState.data;

  return (
    <div className="flex flex-1 flex-col min-h-screen">
      {/* Hero Section - Mobile First */}
      <CompetencyHeroMobile data={data} />

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Data Quality Guidance - Show when data is insufficient */}
        <InsufficientDataGuidance
          sampleSize={data.sampleSize}
          itemCount={data.itemCount}
          cronbachAlpha={data.cronbachAlpha}
        />

        {/* Warning Banner for Items Lowering Alpha */}
        {data.itemsLoweringAlpha && data.itemsLoweringAlpha.length > 0 && (
          <ItemsLoweringAlphaCard items={data.itemsLoweringAlpha} />
        )}

        {/* Progressive Disclosure Accordion (Mobile) / Full Layout (Desktop) */}
        <CompetencyDetailAccordion detail={data} />

        {/* Success Summary Card - Only for reliable competencies */}
        {data.cronbachAlpha !== null && data.cronbachAlpha >= 0.7 && (
          <Card className="border-l-4 border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/50 shrink-0"
                  aria-hidden="true"
                >
                  <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-800 dark:text-emerald-300">
                    Компетенция надежна
                  </h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                    Cronbach's Alpha ({data.cronbachAlpha.toFixed(3)}) превышает пороговое значение 0.7.
                    Шкала показывает хорошую внутреннюю согласованность и может использоваться для оценки.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

/**
 * Items Lowering Alpha Warning Card
 * Shows items that, if removed, would improve reliability
 */
interface ItemsLoweringAlphaCardProps {
  items: ItemLoweringAlpha[];
}

function ItemsLoweringAlphaCard({ items }: ItemsLoweringAlphaCardProps) {
  const displayItems = items.slice(0, 5);
  const hasMore = items.length > 5;

  return (
    <Card
      className="border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/20"
      role="alert"
    >
      <CardHeader className="pb-3 px-4 pt-4">
        <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          Элементы, снижающие надежность
          <Badge
            variant="outline"
            className="ml-auto text-amber-600 border-amber-300 dark:border-amber-700"
          >
            {items.length}
          </Badge>
        </CardTitle>
        <CardDescription className="text-amber-700/70 dark:text-amber-400/70">
          Удаление этих элементов повысит Alpha. Рассмотрите их пересмотр или исключение.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="space-y-2">
          {displayItems.map((item) => (
            <div
              key={item.questionId}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg',
                'min-h-[52px]', // Touch-friendly height
                'bg-background/80 border border-amber-200 dark:border-amber-800'
              )}
            >
              <div className="flex-1 min-w-0 pr-3">
                <UiLink
                  href={`/psychometrics/items/${item.questionId}`}
                  variant="primary"
                  className="line-clamp-2 text-sm"
                >
                  {item.questionText}
                </UiLink>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-muted-foreground">Alpha без элемента</p>
                  <p className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    {item.alphaWithout.toFixed(3)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                >
                  +{item.improvement.toFixed(3)}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-10 w-10 shrink-0"
                >
                  <Link
                    href={`/psychometrics/items/${item.questionId}`}
                    aria-label={`Просмотреть элемент: ${item.questionText}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        {hasMore && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            + еще {items.length - 5} элементов
          </p>
        )}
      </CardContent>
    </Card>
  );
}
