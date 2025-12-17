import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { psychometricsApi } from '@/services/api';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ValidityStatusBadge,
  DiscriminationGauge,
  DifficultyGauge,
  MetricComparisonRow,
  MetricComparisonList,
} from '../../_components';
import { ItemDetailClient } from './_components/ItemDetailClient';
import {
  FileText,
  Target,
  TrendingUp,
  Users,
  Clock,
  Layers,
  ExternalLink,
} from 'lucide-react';
import {
  DiscriminationFlag,
  DifficultyFlag,
  ItemValidityStatus,
} from '@/types/psychometrics';

export const metadata: Metadata = {
  title: 'Детали элемента - Психометрика - SkillSoft',
  description: 'Детальная психометрическая статистика элемента оценки.',
};

interface PageProps {
  params: Promise<{ questionId: string }>;
}

async function getItemDetail(questionId: string) {
  try {
    const item = await psychometricsApi.getItemDetail(questionId);
    return { item, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Не удалось загрузить данные.';
    return { item: null, error: message };
  }
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

// Get discrimination quality label and color
function getDiscriminationQuality(rpb: number | null): { label: string; color: string; description: string } {
  if (rpb === null) return { label: 'Нет данных', color: 'text-muted-foreground', description: 'Недостаточно данных' };
  if (rpb < 0) return { label: 'Токсичный', color: 'text-red-600 dark:text-red-400', description: 'Элемент работает в обратном направлении' };
  if (rpb < 0.1) return { label: 'Критично', color: 'text-orange-600 dark:text-orange-400', description: 'Элемент не различает респондентов' };
  if (rpb < 0.25) return { label: 'Слабый', color: 'text-amber-600 dark:text-amber-400', description: 'Маргинальное различение' };
  if (rpb < 0.35) return { label: 'Хороший', color: 'text-green-600 dark:text-green-400', description: 'Приемлемое различение' };
  return { label: 'Отличный', color: 'text-emerald-600 dark:text-emerald-400', description: 'Сильное различение' };
}

// Get difficulty quality label and color
function getDifficultyQuality(p: number | null): { label: string; color: string; description: string } {
  if (p === null) return { label: 'Нет данных', color: 'text-muted-foreground', description: 'Недостаточно данных' };
  if (p < 0.2) return { label: 'Слишком сложный', color: 'text-blue-600 dark:text-blue-400', description: 'Менее 20% правильных ответов' };
  if (p > 0.9) return { label: 'Слишком легкий', color: 'text-purple-600 dark:text-purple-400', description: 'Более 90% правильных ответов' };
  return { label: 'Оптимальный', color: 'text-emerald-600 dark:text-emerald-400', description: 'Сложность в допустимом диапазоне' };
}

export default async function ItemDetailPage({ params }: PageProps) {
  const { questionId } = await params;
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

  const discQuality = getDiscriminationQuality(item!.discriminationIndex);
  const diffQuality = getDifficultyQuality(item!.difficultyIndex);
  const statusGradient = getStatusGradient(item!.validityStatus);

  // Check if item has issues
  const hasIssues =
    item!.discriminationFlag !== DiscriminationFlag.NONE ||
    item!.difficultyFlag !== DifficultyFlag.NONE ||
    item!.validityStatus === ItemValidityStatus.FLAGGED_FOR_REVIEW ||
    item!.validityStatus === ItemValidityStatus.RETIRED;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:gap-8 md:p-6">
      {/* Hero Section with Gradient */}
      <div className={`relative -mx-4 -mt-6 px-4 pt-6 pb-6 md:-mx-6 md:px-6 bg-gradient-to-b ${statusGradient}`}>
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
      </div>

      {/* Question Text */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Текст вопроса
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{item!.questionText}</p>

          {/* Hierarchy Links */}
          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Layers className="h-4 w-4" />
              <span>Иерархия:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Link
                href={`/psychometrics/competencies/${item!.competencyName}`}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                {item!.competencyName}
                <ExternalLink className="h-3 w-3" />
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="px-2 py-1 rounded bg-muted text-muted-foreground">
                {item!.indicatorTitle}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gauges Section - Side by Side */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Индекс сложности (p)
            </CardTitle>
            <CardDescription>
              Доля правильных ответов
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-4">
            <DifficultyGauge value={item!.difficultyIndex} size="lg" />
            <div className="mt-4 text-center">
              <Badge
                variant="outline"
                className={diffQuality.color}
              >
                {diffQuality.label}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                {diffQuality.description}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Индекс различения (rpb)
            </CardTitle>
            <CardDescription>
              Корреляция с общим баллом
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-4">
            <DiscriminationGauge value={item!.discriminationIndex} size="lg" />
            <div className="mt-4 text-center">
              <Badge
                variant="outline"
                className={discQuality.color}
              >
                {discQuality.label}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                {discQuality.description}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Comparison with Thresholds */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Сравнение с пороговыми значениями</CardTitle>
          <CardDescription>
            Текущие показатели относительно рекомендуемых диапазонов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MetricComparisonList>
            <MetricComparisonRow
              label="Индекс сложности (p)"
              currentValue={item!.difficultyIndex}
              threshold={{ min: 0.2, max: 0.9 }}
              description="Оптимальный диапазон: 0.2 - 0.9"
            />
            <MetricComparisonRow
              label="Индекс различения (rpb)"
              currentValue={item!.discriminationIndex}
              threshold={{ min: 0.25, max: 1 }}
              description="Хорошее значение: >= 0.25, отличное: >= 0.35"
            />
            <MetricComparisonRow
              label="Количество ответов"
              currentValue={item!.responseCount}
              threshold={{ min: 50, max: 10000 }}
              format="integer"
              description="Минимум 50 ответов для надежной статистики"
              showBar={false}
            />
          </MetricComparisonList>
        </CardContent>
      </Card>

      {/* Additional Metrics Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Индекс сложности (p)</p>
                <p className={`text-2xl font-bold mt-1 ${diffQuality.color}`}>
                  {item!.difficultyIndex != null ? item!.difficultyIndex.toFixed(2) : '-'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{diffQuality.label}</p>
              </div>
              <Target className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Индекс различения (rpb)</p>
                <p className={`text-2xl font-bold mt-1 ${discQuality.color}`}>
                  {item!.discriminationIndex != null ? item!.discriminationIndex.toFixed(2) : '-'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{discQuality.label}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Количество ответов</p>
                <p className="text-2xl font-bold mt-1">{item!.responseCount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item!.responseCount < 50 ? 'Недостаточно для надежной статистики' : 'Достаточно данных'}
                </p>
              </div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Последний расчет</p>
                <p className="text-xl font-bold mt-1">
                  {item!.lastCalculatedAt ? new Date(item!.lastCalculatedAt).toLocaleDateString('ru-RU') : '-'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item!.lastCalculatedAt ? new Date(item!.lastCalculatedAt).toLocaleTimeString('ru-RU') : undefined}
                </p>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning Banner for Flagged Items */}
      {hasIssues && (
        <Card className="border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/50">
                <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-800 dark:text-amber-300">
                  Обнаружены проблемы с психометрикой
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  {item!.discriminationFlag === DiscriminationFlag.NEGATIVE && 'Негативный индекс различения указывает на то, что элемент работает в обратном направлении. '}
                  {item!.discriminationFlag === DiscriminationFlag.CRITICAL && 'Критически низкий индекс различения. '}
                  {item!.discriminationFlag === DiscriminationFlag.WARNING && 'Слабый индекс различения. '}
                  {item!.difficultyFlag === DifficultyFlag.TOO_HARD && 'Вопрос слишком сложный. '}
                  {item!.difficultyFlag === DifficultyFlag.TOO_EASY && 'Вопрос слишком легкий. '}
                  Рекомендуется пересмотреть формулировку или варианты ответов.
                </p>
                {item!.validityStatus === ItemValidityStatus.FLAGGED_FOR_REVIEW && (
                  <Link
                    href={`/psychometrics/flagged/${item!.questionId}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 dark:text-amber-300 hover:underline mt-2"
                  >
                    Перейти к детальному анализу проблемы
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client-side interactive components */}
      <ItemDetailClient item={item!} />
    </div>
  );
}
