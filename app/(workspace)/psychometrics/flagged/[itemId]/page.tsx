import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getPsychometricsItemDetailCached,
  getPsychometricsFlaggedItemsCached,
} from '@/services/api.cache.psychometrics';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ValidityStatusBadge,
  DiscriminationGauge,
  DifficultyGauge,
  MetricComparisonRow,
  MetricComparisonList,
  SuggestedActionsCard,
  SimilarItemsCard,
} from '../../_components';
import { FlaggedItemDetailClient } from './_components/FlaggedItemDetailClient';
import {
  AlertTriangle,
  AlertOctagon,
  Target,
  TrendingUp,
  Users,
  Clock,
  FileText,
  ChevronRight,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import {
  ItemStatisticsDetail,
  DiscriminationFlag,
  DifficultyFlag,
  ItemValidityStatus,
  FlaggedItemSummary,
} from '@/types/psychometrics';

export const metadata: Metadata = {
  title: 'Детали проблемного элемента - Психометрика - SkillSoft',
  description: 'Детальный анализ проблемного элемента оценки с рекомендациями по исправлению.',
};

interface PageProps {
  params: Promise<{ itemId: string }>;
}

async function getItemDetail(questionId: string) {
  const item = await getPsychometricsItemDetailCached(questionId);
  return {
    item,
    error: item === null ? 'Не удалось загрузить данные.' : null,
  };
}

async function getSimilarFlaggedItems() {
  const items = await getPsychometricsFlaggedItemsCached();
  return { items: items ?? [], error: null };
}

// Severity level type
type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

// Get flag reason and severity
function getFlagDetails(item: ItemStatisticsDetail): {
  severity: SeverityLevel;
  reasons: string[];
  color: string;
  bgClass: string;
  borderClass: string;
  icon: typeof AlertTriangle;
} {
  const reasons: string[] = [];

  // Severity priority: 0 = low, 1 = medium, 2 = high, 3 = critical
  let severityLevel = 0;

  // Check discrimination
  if (item.discriminationFlag === DiscriminationFlag.NEGATIVE) {
    reasons.push('Негативный индекс различения (rpb < 0) - элемент работает в обратном направлении');
    severityLevel = 3; // critical
  } else if (item.discriminationFlag === DiscriminationFlag.CRITICAL) {
    reasons.push('Критически низкий индекс различения (rpb < 0.1) - элемент не различает респондентов');
    severityLevel = Math.max(severityLevel, 2); // high
  } else if (item.discriminationFlag === DiscriminationFlag.WARNING) {
    reasons.push('Слабый индекс различения (0.1 <= rpb < 0.25) - маргинальное различение');
    severityLevel = Math.max(severityLevel, 1); // medium
  }

  // Check difficulty
  if (item.difficultyFlag === DifficultyFlag.TOO_HARD) {
    reasons.push('Слишком высокая сложность (p < 0.2) - менее 20% правильных ответов');
    severityLevel = Math.max(severityLevel, 2); // high
  } else if (item.difficultyFlag === DifficultyFlag.TOO_EASY) {
    reasons.push('Слишком низкая сложность (p > 0.9) - более 90% правильных ответов');
    severityLevel = Math.max(severityLevel, 2); // high
  }

  // Check response count
  if (item.responseCount < 30) {
    reasons.push('Недостаточно ответов для надежной статистики (< 30)');
    severityLevel = Math.max(severityLevel, 1); // medium
  }

  // Default if no specific issues found
  if (reasons.length === 0) {
    reasons.push('Элемент помечен для ручной проверки');
    severityLevel = Math.max(severityLevel, 1); // medium
  }

  // Convert severity level to string
  const severityMap: SeverityLevel[] = ['low', 'medium', 'high', 'critical'];
  const severity = severityMap[severityLevel];

  const severityConfig = {
    critical: {
      color: 'text-red-600 dark:text-red-400',
      bgClass: 'bg-red-50 dark:bg-red-950/30',
      borderClass: 'border-red-500',
      icon: AlertOctagon,
    },
    high: {
      color: 'text-orange-600 dark:text-orange-400',
      bgClass: 'bg-orange-50 dark:bg-orange-950/30',
      borderClass: 'border-orange-500',
      icon: AlertTriangle,
    },
    medium: {
      color: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-950/30',
      borderClass: 'border-amber-500',
      icon: AlertTriangle,
    },
    low: {
      color: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-50 dark:bg-blue-950/30',
      borderClass: 'border-blue-500',
      icon: AlertTriangle,
    },
  };

  return {
    severity,
    reasons,
    ...severityConfig[severity],
  };
}

// Generate suggested actions based on item metrics
function generateSuggestedActions(item: ItemStatisticsDetail) {
  const actions: Array<{
    title: string;
    description?: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];

  // Based on discrimination
  if (item.discriminationFlag === DiscriminationFlag.NEGATIVE) {
    actions.push({
      title: 'Рассмотрите удаление элемента',
      description: 'Негативный rpb означает, что элемент работает против измеряемого конструкта. Рекомендуется отключить.',
      priority: 'high',
    });
    actions.push({
      title: 'Проверьте ключ ответа',
      description: 'Возможно, правильный ответ указан неверно или шкала оценки инвертирована.',
      priority: 'high',
    });
  } else if (item.discriminationFlag === DiscriminationFlag.CRITICAL) {
    actions.push({
      title: 'Переформулируйте вопрос',
      description: 'Текущая формулировка не позволяет различать респондентов по уровню компетенции.',
      priority: 'high',
    });
    actions.push({
      title: 'Пересмотрите варианты ответов',
      description: 'Проверьте, что дистракторы достаточно правдоподобны и различимы.',
      priority: 'medium',
    });
  } else if (item.discriminationFlag === DiscriminationFlag.WARNING) {
    actions.push({
      title: 'Наблюдайте за показателями',
      description: 'Соберите больше данных и повторно оцените через 50+ дополнительных ответов.',
      priority: 'medium',
    });
  }

  // Based on difficulty
  if (item.difficultyFlag === DifficultyFlag.TOO_HARD) {
    actions.push({
      title: 'Упростите формулировку',
      description: 'Вопрос может быть слишком сложным или неоднозначным для целевой аудитории.',
      priority: 'medium',
    });
    actions.push({
      title: 'Добавьте подсказки в варианты',
      description: 'Рассмотрите возможность добавления контекста или уточнения в варианты ответов.',
      priority: 'low',
    });
  } else if (item.difficultyFlag === DifficultyFlag.TOO_EASY) {
    actions.push({
      title: 'Усложните вопрос',
      description: 'Добавьте нюансы или измените дистракторы, чтобы они были более привлекательны.',
      priority: 'medium',
    });
  }

  // Based on response count
  if (item.responseCount < 50) {
    actions.push({
      title: 'Соберите больше данных',
      description: `Текущее количество ответов (${item.responseCount}) недостаточно для надежных выводов. Нужно минимум 50.`,
      priority: 'low',
    });
  }

  // Use existing recommendations from backend
  if (item.recommendations?.length > 0) {
    item.recommendations.forEach((rec) => {
      // Avoid duplicates
      if (!actions.some((a) => a.title === rec || a.description === rec)) {
        actions.push({
          title: rec,
          priority: 'medium',
        });
      }
    });
  }

  return actions;
}

export default async function FlaggedItemDetailPage({ params }: PageProps) {
  const { itemId } = await params;
  const [{ item, error }, { items: flaggedItems }] = await Promise.all([
    getItemDetail(itemId),
    getSimilarFlaggedItems(),
  ]);

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

  const flagDetails = getFlagDetails(item!);
  const suggestedActions = generateSuggestedActions(item!);
  const FlagIcon = flagDetails.icon;

  // Convert flagged items to SimilarItem format
  const similarItems = flaggedItems.map((fi: FlaggedItemSummary) => ({
    questionId: fi.questionId,
    questionText: fi.questionText || '',
    competencyName: fi.competencyName || undefined,
    validityStatus: fi.validityStatus,
    discriminationFlag: fi.discriminationFlag || undefined,
    discriminationIndex: fi.discriminationIndex,
  }));

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:gap-8 md:p-6">
      {/* Back navigation */}
      <Link
        href="/psychometrics/flagged"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Вернуться к списку
      </Link>

      <PageHeader
        title="Проблемный элемент"
        description={item!.competencyName}
      >
        <div className="flex items-center gap-2">
          <ValidityStatusBadge status={item!.validityStatus} size="lg" />
        </div>
      </PageHeader>

      {/* Alert Banner */}
      <Card className={`border-l-4 ${flagDetails.borderClass} ${flagDetails.bgClass}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg bg-background/50 ${flagDetails.color}`}>
              <FlagIcon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className={`font-semibold ${flagDetails.color}`}>
                  {flagDetails.severity === 'critical' && 'Критическая проблема'}
                  {flagDetails.severity === 'high' && 'Серьезная проблема'}
                  {flagDetails.severity === 'medium' && 'Требует внимания'}
                  {flagDetails.severity === 'low' && 'Незначительная проблема'}
                </h3>
                <Badge
                  variant="outline"
                  className={flagDetails.color}
                >
                  {flagDetails.severity === 'critical' && 'Критично'}
                  {flagDetails.severity === 'high' && 'Высокий'}
                  {flagDetails.severity === 'medium' && 'Средний'}
                  {flagDetails.severity === 'low' && 'Низкий'}
                </Badge>
              </div>
              <ul className="space-y-1">
                {flagDetails.reasons.map((reason, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Текст вопроса
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4">{item!.questionText}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <span className="text-muted-foreground">
              Компетенция:{' '}
              <Link
                href={`/psychometrics/competencies/${item!.competencyName}`}
                className="font-medium text-primary hover:underline"
              >
                {item!.competencyName}
              </Link>
            </span>
            <span className="text-muted-foreground">
              Индикатор:{' '}
              <span className="font-medium text-foreground">{item!.indicatorTitle}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Gauges Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Индекс сложности
            </CardTitle>
            <CardDescription>
              Доля правильных ответов (идеально: 0.2 - 0.9)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <DifficultyGauge value={item!.difficultyIndex} size="lg" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Индекс различения
            </CardTitle>
            <CardDescription>
              Корреляция с общим баллом (идеально: &gt;= 0.25)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <DiscriminationGauge value={item!.discriminationIndex} size="lg" />
          </CardContent>
        </Card>
      </div>

      {/* Metrics Comparison */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Сравнение с пороговыми значениями</CardTitle>
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

      {/* Additional Stats Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ответов</p>
                <p className="text-2xl font-bold mt-1">{item!.responseCount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item!.responseCount < 50 ? 'Недостаточно' : 'Достаточно'}
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
                <p className="text-lg font-bold mt-1">
                  {item!.lastCalculatedAt
                    ? new Date(item!.lastCalculatedAt).toLocaleDateString('ru-RU')
                    : '-'}
                </p>
                {item!.lastCalculatedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(item!.lastCalculatedAt).toLocaleTimeString('ru-RU')}
                  </p>
                )}
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        {item!.previousDiscriminationIndex != null && (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Предыдущий rpb</p>
                    <p className="text-2xl font-bold mt-1">
                      {item!.previousDiscriminationIndex.toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Изменение rpb</p>
                    {item!.discriminationIndex != null && (
                      <p
                        className={`text-2xl font-bold mt-1 ${
                          item!.discriminationIndex > item!.previousDiscriminationIndex
                            ? 'text-emerald-600'
                            : item!.discriminationIndex < item!.previousDiscriminationIndex
                              ? 'text-red-600'
                              : ''
                        }`}
                      >
                        {item!.discriminationIndex > item!.previousDiscriminationIndex ? '+' : ''}
                        {(item!.discriminationIndex - item!.previousDiscriminationIndex).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Two-column layout for actions and similar items */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Suggested Actions */}
        <SuggestedActionsCard
          title="Рекомендуемые действия"
          actions={suggestedActions}
          maxVisible={6}
        />

        {/* Similar Flagged Items */}
        <SimilarItemsCard
          title="Похожие проблемные элементы"
          description="Элементы с аналогичными проблемами"
          items={similarItems}
          currentItemId={item!.questionId}
          maxItems={5}
          basePath="/psychometrics/flagged"
        />
      </div>

      {/* Client-side interactive components */}
      <FlaggedItemDetailClient item={item!} />

      {/* Link to full item details */}
      <div className="flex justify-center">
        <Link href={`/psychometrics/items/${item!.questionId}`}>
          <Button variant="outline" className="gap-2">
            Полная статистика элемента
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
