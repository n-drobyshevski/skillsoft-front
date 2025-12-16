import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { psychometricsApi } from '@/services/api';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReliabilityStatusBadge } from '../../_components/ReliabilityStatusBadge';
import { Shield, Users, FileText, TrendingUp, AlertTriangle } from 'lucide-react';

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

// Alpha color helper
function getAlphaColor(alpha: number | null): string {
  if (alpha === null) return 'text-gray-500';
  if (alpha >= 0.7) return 'text-emerald-600';
  if (alpha >= 0.6) return 'text-amber-600';
  return 'text-red-600';
}

function getAlphaBgColor(alpha: number | null): string {
  if (alpha === null) return 'bg-gray-200';
  if (alpha >= 0.7) return 'bg-emerald-500';
  if (alpha >= 0.6) return 'bg-amber-500';
  return 'bg-red-500';
}

function AlphaGauge({ alpha, label }: { alpha: number | null; label?: string }) {
  const percentage = alpha != null ? alpha * 100 : 0;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className={`text-lg font-bold ${getAlphaColor(alpha)}`}>
            {alpha != null ? alpha.toFixed(3) : '-'}
          </span>
        </div>
      )}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all duration-500 ${getAlphaBgColor(alpha)}`}
          style={{ width: `${percentage}%` }}
        />
        {/* Threshold markers */}
        <div className="absolute top-0 left-[60%] h-full w-0.5 bg-amber-600/70" title="0.6 - Acceptable" />
        <div className="absolute top-0 left-[70%] h-full w-0.5 bg-emerald-600/70" title="0.7 - Reliable" />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span className="text-amber-600">0.6</span>
        <span className="text-emerald-600">0.7</span>
        <span>1.0</span>
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
        <PageHeader
          title="Ошибка загрузки"
        />
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4">
            <div className="text-destructive font-medium mb-1">Ошибка</div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sort items by improvement (items that lower alpha most)
  const sortedAlphaIfDeleted = detail!.alphaIfDeleted
    ? Object.entries(detail!.alphaIfDeleted)
        .sort(([, a], [, b]) => b.improvement - a.improvement)
    : [];

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:gap-8 md:p-6">
      <PageHeader
        title={detail!.competencyName}
        description="Анализ надежности измерений"
      >
        <ReliabilityStatusBadge status={detail!.reliabilityStatus} className="text-sm" />
      </PageHeader>

      {/* Main Metrics */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Alpha Gauge */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Cronbach's Alpha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <AlphaGauge alpha={detail!.cronbachAlpha} />

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className={`text-2xl font-bold ${getAlphaColor(detail!.cronbachAlpha)}`}>
                  {detail!.cronbachAlpha != null ? detail!.cronbachAlpha.toFixed(3) : '-'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Alpha</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{detail!.sampleSize ?? '-'}</p>
                <p className="text-xs text-muted-foreground mt-1">Выборка</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{detail!.itemCount ?? '-'}</p>
                <p className="text-xs text-muted-foreground mt-1">Вопросов</p>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p><strong>Интерпретация:</strong></p>
              {detail!.cronbachAlpha === null ? (
                <p>Недостаточно данных для расчета надежности.</p>
              ) : detail!.cronbachAlpha >= 0.7 ? (
                <p>Шкала показывает хорошую внутреннюю согласованность. Элементы измеряют один и тот же конструкт.</p>
              ) : detail!.cronbachAlpha >= 0.6 ? (
                <p>Приемлемая надежность. Рекомендуется пересмотреть элементы с низким вкладом.</p>
              ) : (
                <p>Низкая надежность. Элементы не образуют согласованную шкалу. Требуется серьезная ревизия.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{detail!.sampleSize ?? '-'}</p>
                  <p className="text-sm text-muted-foreground">Респондентов</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{detail!.itemCount ?? '-'}</p>
                  <p className="text-sm text-muted-foreground">Элементов оценки</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {detail!.lastCalculatedAt && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Последний расчет</p>
                <p className="font-medium mt-1">
                  {new Date(detail!.lastCalculatedAt).toLocaleString('ru-RU')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Items Lowering Alpha */}
      {detail!.itemsLoweringAlpha && detail!.itemsLoweringAlpha.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              Элементы, снижающие надежность
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Эти элементы негативно влияют на общую надежность шкалы. Рассмотрите возможность их пересмотра или удаления.
            </p>
            <div className="space-y-3">
              {detail!.itemsLoweringAlpha.map((item) => (
                <div
                  key={item.questionId}
                  className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/psychometrics/items/${item.questionId}`}
                      className="font-medium hover:underline text-sm"
                    >
                      {item.questionText.length > 80
                        ? item.questionText.slice(0, 80) + '...'
                        : item.questionText}
                    </Link>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Alpha без элемента</p>
                      <p className={`font-mono font-bold ${getAlphaColor(item.alphaWithout)}`}>
                        {item.alphaWithout.toFixed(3)}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      +{item.improvement.toFixed(3)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alpha if Deleted Chart */}
      {sortedAlphaIfDeleted.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Alpha если элемент удален
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Показывает, как изменится Alpha, если удалить конкретный элемент. Положительное улучшение означает, что элемент снижает надежность.
            </p>
            <div className="space-y-2">
              {sortedAlphaIfDeleted.map(([questionId, entry]) => (
                <div key={questionId} className="flex items-center gap-3">
                  <Link
                    href={`/psychometrics/items/${questionId}`}
                    className="text-sm hover:underline flex-1 min-w-0 truncate"
                    title={entry.questionText}
                  >
                    {entry.questionText.length > 60
                      ? entry.questionText.slice(0, 60) + '...'
                      : entry.questionText}
                  </Link>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-mono text-sm ${getAlphaColor(entry.alphaIfDeleted)}`}>
                      {entry.alphaIfDeleted.toFixed(3)}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        entry.improvement > 0
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : entry.improvement < 0
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                      }
                    >
                      {entry.improvement > 0 ? '+' : ''}
                      {entry.improvement.toFixed(3)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
