import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { psychometricsApi } from '@/services/api';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ReliabilityStatusBadge,
  AlphaGauge,
  MetricComparisonRow,
  MetricComparisonList,
} from '../../_components';
import {
  Shield,
  Users,
  FileText,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
  Info,
  ChevronDown,
} from 'lucide-react';
import {
  ReliabilityStatus,
  ItemLoweringAlpha,
} from '@/types/psychometrics';

export const metadata: Metadata = {
  title: 'Надежность компетенции - Психометрика - SkillSoft',
  description: 'Детальный анализ надежности компетенции.',
};

interface PageProps {
  params: Promise<{ competencyId: string }>;
}

async function getCompetencyDetail(competencyId: string) {
  try {
    const detail = await psychometricsApi.getCompetencyDetail(competencyId);
    return { detail, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Не удалось загрузить данные.';
    return { detail: null, error: message };
  }
}

// Get status-based hero gradient
function getStatusGradient(status: ReliabilityStatus): string {
  switch (status) {
    case ReliabilityStatus.RELIABLE:
      return 'from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/20 dark:via-emerald-500/10';
    case ReliabilityStatus.ACCEPTABLE:
      return 'from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/20 dark:via-amber-500/10';
    case ReliabilityStatus.UNRELIABLE:
      return 'from-red-500/10 via-red-500/5 to-transparent dark:from-red-500/20 dark:via-red-500/10';
    case ReliabilityStatus.INSUFFICIENT_DATA:
    default:
      return 'from-slate-500/10 via-slate-500/5 to-transparent dark:from-slate-500/20 dark:via-slate-500/10';
  }
}

// Alpha quality helpers
function getAlphaQuality(alpha: number | null): { label: string; color: string; description: string } {
  if (alpha === null) return { label: 'Нет данных', color: 'text-muted-foreground', description: 'Недостаточно данных для расчета' };
  if (alpha >= 0.9) return { label: 'Превосходный', color: 'text-emerald-600 dark:text-emerald-400', description: 'Очень высокая внутренняя согласованность' };
  if (alpha >= 0.8) return { label: 'Отличный', color: 'text-emerald-600 dark:text-emerald-400', description: 'Отличная внутренняя согласованность' };
  if (alpha >= 0.7) return { label: 'Хороший', color: 'text-green-600 dark:text-green-400', description: 'Хорошая внутренняя согласованность' };
  if (alpha >= 0.6) return { label: 'Приемлемый', color: 'text-amber-600 dark:text-amber-400', description: 'Приемлемая надежность' };
  if (alpha >= 0.5) return { label: 'Низкий', color: 'text-orange-600 dark:text-orange-400', description: 'Низкая надежность, требуется пересмотр' };
  return { label: 'Неприемлемый', color: 'text-red-600 dark:text-red-400', description: 'Крайне низкая надежность' };
}

// Alpha scale component with visual thresholds
function AlphaInterpretationScale({ alpha }: { alpha: number | null }) {
  const zones = [
    { min: 0, max: 0.5, label: '<0.5', color: 'bg-red-500', desc: 'Неприемлемо' },
    { min: 0.5, max: 0.6, label: '0.5-0.6', color: 'bg-orange-500', desc: 'Низко' },
    { min: 0.6, max: 0.7, label: '0.6-0.7', color: 'bg-amber-500', desc: 'Приемлемо' },
    { min: 0.7, max: 0.8, label: '0.7-0.8', color: 'bg-green-500', desc: 'Хорошо' },
    { min: 0.8, max: 0.9, label: '0.8-0.9', color: 'bg-emerald-500', desc: 'Отлично' },
    { min: 0.9, max: 1.0, label: '>0.9', color: 'bg-emerald-600', desc: 'Превосходно' },
  ];

  const activeZoneIndex = alpha !== null
    ? zones.findIndex((z) => alpha >= z.min && alpha < z.max) || zones.length - 1
    : -1;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Info className="h-4 w-4" />
        <span>Шкала интерпретации Alpha Кронбаха</span>
      </div>
      <div className="flex gap-0.5 h-3 rounded-full overflow-hidden">
        {zones.map((zone, index) => (
          <div
            key={zone.label}
            className={`flex-1 ${zone.color} ${index === activeZoneIndex ? 'ring-2 ring-offset-1 ring-foreground' : 'opacity-40'}`}
            title={`${zone.label}: ${zone.desc}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        {zones.map((zone) => (
          <span key={zone.label} className="text-center">
            {zone.label}
          </span>
        ))}
      </div>
      {alpha !== null && activeZoneIndex >= 0 && (
        <p className="text-sm text-center">
          Текущее значение <span className="font-bold">{alpha.toFixed(3)}</span> соответствует уровню:{' '}
          <span className="font-semibold">{zones[activeZoneIndex].desc}</span>
        </p>
      )}
    </div>
  );
}

// Radial progress component for hero section
function RadialAlphaProgress({ alpha, size = 180 }: { alpha: number | null; size?: number }) {
  const percentage = alpha !== null ? alpha * 100 : 0;
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const quality = getAlphaQuality(alpha);

  // Color based on alpha value
  const getStrokeColor = () => {
    if (alpha === null) return 'stroke-muted';
    if (alpha >= 0.7) return 'stroke-emerald-500';
    if (alpha >= 0.6) return 'stroke-amber-500';
    return 'stroke-red-500';
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          className={getStrokeColor()}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: alpha !== null ? strokeDashoffset : circumference,
            transition: 'stroke-dashoffset 1s ease-in-out',
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-bold ${quality.color}`}>
          {alpha !== null ? alpha.toFixed(3) : '-'}
        </span>
        <span className="text-sm text-muted-foreground">Alpha</span>
      </div>
    </div>
  );
}

export default async function CompetencyDetailPage({ params }: PageProps) {
  const { competencyId } = await params;
  const { detail, error } = await getCompetencyDetail(competencyId);

  if (!detail && !error) {
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

  const alphaQuality = getAlphaQuality(detail!.cronbachAlpha);
  const statusGradient = getStatusGradient(detail!.reliabilityStatus);

  // Sort items by improvement (items that lower alpha most)
  const sortedAlphaIfDeleted = detail!.alphaIfDeleted
    ? Object.entries(detail!.alphaIfDeleted)
        .sort(([, a], [, b]) => b.improvement - a.improvement)
    : [];

  // Items with positive improvement (removing them would increase alpha)
  const itemsToConsiderRemoving = sortedAlphaIfDeleted.filter(([, entry]) => entry.improvement > 0.01);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:gap-8 md:p-6">
      {/* Hero Section with Gradient */}
      <div className={`relative -mx-4 -mt-6 px-4 pt-6 pb-8 md:-mx-6 md:px-6 bg-gradient-to-b ${statusGradient}`}>
        <PageHeader
          title={detail!.competencyName}
          description="Анализ надежности измерений"
        >
          <ReliabilityStatusBadge status={detail!.reliabilityStatus} className="text-sm" />
        </PageHeader>

        {/* Hero Content */}
        <div className="mt-6 flex flex-col md:flex-row items-center gap-6">
          {/* Radial Progress */}
          <RadialAlphaProgress alpha={detail!.cronbachAlpha} />

          {/* Quick Stats */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-background/50">
              <p className="text-2xl font-bold">{detail!.sampleSize ?? '-'}</p>
              <p className="text-sm text-muted-foreground">Респондентов</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-background/50">
              <p className="text-2xl font-bold">{detail!.itemCount ?? '-'}</p>
              <p className="text-sm text-muted-foreground">Элементов</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-background/50 col-span-2 md:col-span-1">
              <Badge variant="outline" className={alphaQuality.color}>
                {alphaQuality.label}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">{alphaQuality.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alpha Gauge (alternative visualization) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Cronbach's Alpha
            </CardTitle>
            <CardDescription>
              Коэффициент внутренней согласованности
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-4">
            <AlphaGauge value={detail!.cronbachAlpha} size="lg" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Интерпретация
            </CardTitle>
            <CardDescription>
              Шкала качества надежности
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlphaInterpretationScale alpha={detail!.cronbachAlpha} />
            <div className="mt-6 p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Что означает этот показатель?</h4>
              <p className="text-sm text-muted-foreground">
                {detail!.cronbachAlpha === null ? (
                  'Недостаточно данных для расчета надежности. Необходимо собрать больше ответов.'
                ) : detail!.cronbachAlpha >= 0.7 ? (
                  'Шкала показывает хорошую внутреннюю согласованность. Элементы измеряют один и тот же конструкт.'
                ) : detail!.cronbachAlpha >= 0.6 ? (
                  'Приемлемая надежность. Рекомендуется пересмотреть элементы с низким вкладом.'
                ) : (
                  'Низкая надежность. Элементы не образуют согласованную шкалу. Требуется серьезная ревизия.'
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Comparison */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Сравнение с пороговыми значениями</CardTitle>
          <CardDescription>
            Текущие показатели относительно стандартных критериев
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MetricComparisonList>
            <MetricComparisonRow
              label="Cronbach's Alpha"
              currentValue={detail!.cronbachAlpha}
              threshold={{ min: 0.7, max: 1 }}
              format="decimal3"
              description="Хорошая надежность: >= 0.7, отличная: >= 0.8"
            />
            <MetricComparisonRow
              label="Размер выборки"
              currentValue={detail!.sampleSize}
              threshold={{ min: 100, max: 10000 }}
              format="integer"
              description="Рекомендуемый минимум: 100 респондентов"
              showBar={false}
            />
            <MetricComparisonRow
              label="Количество элементов"
              currentValue={detail!.itemCount}
              threshold={{ min: 3, max: 30 }}
              format="integer"
              description="Оптимально: 5-15 элементов на шкалу"
              showBar={false}
            />
          </MetricComparisonList>
        </CardContent>
      </Card>

      {/* Quick Stats Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cronbach's Alpha</p>
                <p className={`text-2xl font-bold mt-1 ${alphaQuality.color}`}>
                  {detail!.cronbachAlpha != null ? detail!.cronbachAlpha.toFixed(3) : '-'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{alphaQuality.label}</p>
              </div>
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Респондентов</p>
                <p className="text-2xl font-bold mt-1">{detail!.sampleSize ?? '-'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {detail!.sampleSize && detail!.sampleSize >= 100 ? 'Достаточно' : 'Нужно больше'}
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
                <p className="text-sm text-muted-foreground">Элементов оценки</p>
                <p className="text-2xl font-bold mt-1">{detail!.itemCount ?? '-'}</p>
                <p className="text-xs text-muted-foreground mt-1">Вопросов в шкале</p>
              </div>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        {detail!.lastCalculatedAt && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Последний расчет</p>
                  <p className="text-lg font-bold mt-1">
                    {new Date(detail!.lastCalculatedAt).toLocaleDateString('ru-RU')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(detail!.lastCalculatedAt).toLocaleTimeString('ru-RU')}
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Items Lowering Alpha (Warning Card) */}
      {detail!.itemsLoweringAlpha && detail!.itemsLoweringAlpha.length > 0 && (
        <Card className="border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              Элементы, снижающие надежность
            </CardTitle>
            <CardDescription>
              Удаление этих элементов повысит Alpha. Рассмотрите их пересмотр или исключение.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {detail!.itemsLoweringAlpha.slice(0, 5).map((item: ItemLoweringAlpha) => (
                <div
                  key={item.questionId}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/80 border border-amber-200 dark:border-amber-800"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/psychometrics/items/${item.questionId}`}
                      className="font-medium hover:underline text-sm line-clamp-1"
                    >
                      {item.questionText}
                    </Link>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Alpha без элемента</p>
                      <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {item.alphaWithout.toFixed(3)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                    >
                      +{item.improvement.toFixed(3)}
                    </Badge>
                    <Link href={`/psychometrics/items/${item.questionId}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            {detail!.itemsLoweringAlpha.length > 5 && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                + еще {detail!.itemsLoweringAlpha.length - 5} элементов
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Alpha if Deleted - Full Table */}
      {sortedAlphaIfDeleted.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Alpha если элемент удален
            </CardTitle>
            <CardDescription>
              Показывает влияние каждого элемента на общую надежность шкалы
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sortedAlphaIfDeleted.map(([questionId, entry]) => {
                const isProblematic = entry.improvement > 0.01;
                return (
                  <div
                    key={questionId}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      isProblematic ? 'bg-amber-50 dark:bg-amber-950/20' : 'hover:bg-muted/50'
                    }`}
                  >
                    <Link
                      href={`/psychometrics/items/${questionId}`}
                      className="text-sm hover:underline flex-1 min-w-0 truncate"
                      title={entry.questionText}
                    >
                      {entry.questionText}
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`font-mono text-sm ${
                        entry.alphaIfDeleted > (detail!.cronbachAlpha || 0)
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-muted-foreground'
                      }`}>
                        {entry.alphaIfDeleted.toFixed(3)}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          entry.improvement > 0.01
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : entry.improvement < -0.01
                              ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-muted text-muted-foreground'
                        }
                      >
                        {entry.improvement > 0 ? '+' : ''}
                        {entry.improvement.toFixed(3)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <strong>Как читать:</strong>
              </p>
              <ul className="mt-2 ml-6 space-y-1 list-disc">
                <li><span className="text-emerald-600">Положительное улучшение</span> - удаление элемента повысит Alpha</li>
                <li><span className="text-red-600">Отрицательное улучшение</span> - элемент важен для шкалы</li>
                <li>Близко к нулю - элемент нейтрален</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Card for good reliability */}
      {detail!.cronbachAlpha && detail!.cronbachAlpha >= 0.7 && (
        <Card className="border-l-4 border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-300">
                  Компетенция надежна
                </h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                  Cronbach's Alpha ({detail!.cronbachAlpha.toFixed(3)}) превышает пороговое значение 0.7.
                  Шкала показывает хорошую внутреннюю согласованность и может использоваться для оценки.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
