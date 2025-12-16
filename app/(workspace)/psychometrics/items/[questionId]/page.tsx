import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { psychometricsApi } from '@/services/api';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ValidityStatusBadge } from '../../_components/ValidityStatusBadge';
import { ItemDetailClient } from './_components/ItemDetailClient';
import { FileText, Target, TrendingUp, Users, Clock } from 'lucide-react';

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

// Metric card helper
function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  valueColor
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  valueColor?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${valueColor || ''}`}>{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
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

  // Determine discrimination quality
  const getDiscriminationQuality = (rpb: number | null): { label: string; color: string; description: string } => {
    if (rpb === null) return { label: '-', color: '', description: 'Нет данных' };
    if (rpb < 0) return { label: 'Негативный', color: 'text-red-600', description: 'Элемент работает в обратном направлении' };
    if (rpb < 0.1) return { label: 'Критично', color: 'text-orange-600', description: 'Элемент не различает респондентов' };
    if (rpb < 0.25) return { label: 'Слабый', color: 'text-amber-600', description: 'Маргинальное различение' };
    if (rpb < 0.4) return { label: 'Хороший', color: 'text-emerald-600', description: 'Приемлемое различение' };
    return { label: 'Отличный', color: 'text-emerald-600', description: 'Сильное различение' };
  };

  // Determine difficulty quality
  const getDifficultyQuality = (p: number | null): { label: string; color: string; description: string } => {
    if (p === null) return { label: '-', color: '', description: 'Нет данных' };
    if (p < 0.2) return { label: 'Слишком сложный', color: 'text-blue-600', description: 'Менее 20% правильных ответов' };
    if (p > 0.9) return { label: 'Слишком легкий', color: 'text-purple-600', description: 'Более 90% правильных ответов' };
    return { label: 'Оптимальный', color: 'text-emerald-600', description: 'Сложность в допустимом диапазоне' };
  };

  const discQuality = getDiscriminationQuality(item!.discriminationIndex);
  const diffQuality = getDifficultyQuality(item!.difficultyIndex);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:gap-8 md:p-6">
      <PageHeader
        title="Детали элемента"
        description={item!.competencyName}
      >
        <ValidityStatusBadge status={item!.validityStatus} className="text-sm" />
      </PageHeader>

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
          <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>Компетенция: <strong>{item!.competencyName}</strong></span>
            <span>|</span>
            <span>Индикатор: <strong>{item!.indicatorTitle}</strong></span>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Индекс сложности (p)"
          value={item!.difficultyIndex != null ? item!.difficultyIndex.toFixed(2) : '-'}
          description={diffQuality.description}
          icon={Target}
          valueColor={diffQuality.color}
        />
        <MetricCard
          title="Индекс различения (rpb)"
          value={item!.discriminationIndex != null ? item!.discriminationIndex.toFixed(2) : '-'}
          description={discQuality.description}
          icon={TrendingUp}
          valueColor={discQuality.color}
        />
        <MetricCard
          title="Количество ответов"
          value={item!.responseCount}
          description={item!.responseCount < 50 ? 'Недостаточно для надежной статистики' : 'Достаточно данных'}
          icon={Users}
        />
        <MetricCard
          title="Последний расчет"
          value={item!.lastCalculatedAt ? new Date(item!.lastCalculatedAt).toLocaleDateString('ru-RU') : '-'}
          description={item!.lastCalculatedAt ? new Date(item!.lastCalculatedAt).toLocaleTimeString('ru-RU') : undefined}
          icon={Clock}
        />
      </div>

      {/* Client-side interactive components */}
      <ItemDetailClient item={item!} />
    </div>
  );
}
