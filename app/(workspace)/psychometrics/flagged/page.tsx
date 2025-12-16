import { Metadata } from 'next';
import Link from 'next/link';
import { psychometricsApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/common/PageHeader';
import {
  FlaggedItemSummary,
  DiscriminationFlag,
  DiscriminationFlagDisplay,
  DifficultyFlag,
  DifficultyFlagDisplay
} from '@/types/psychometrics';
import { ValidityStatusBadge } from '../_components/ValidityStatusBadge';
import {
  AlertTriangle,
  AlertCircle,
  XCircle,
  ArrowRight,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Проблемные элементы - Психометрика - SkillSoft',
  description: 'Элементы оценки, требующие внимания и проверки.',
};

async function getFlaggedItems() {
  try {
    const items = await psychometricsApi.getFlaggedItems();
    return { items, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Не удалось загрузить данные.';
    return { items: [], error: message };
  }
}

// Severity order for sorting
const discriminationSeverity: Record<DiscriminationFlag, number> = {
  [DiscriminationFlag.NEGATIVE]: 4,
  [DiscriminationFlag.CRITICAL]: 3,
  [DiscriminationFlag.WARNING]: 2,
  [DiscriminationFlag.NONE]: 1,
};

// Severity icon and color
function getSeverityInfo(flag: DiscriminationFlag | null) {
  if (!flag) return { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Неизвестно' };

  switch (flag) {
    case DiscriminationFlag.NEGATIVE:
      return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Негативный' };
    case DiscriminationFlag.CRITICAL:
      return { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30', label: 'Критично' };
    case DiscriminationFlag.WARNING:
      return { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Предупреждение' };
    default:
      return { icon: AlertCircle, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Нормально' };
  }
}

// Group items by severity
function groupBySeverity(items: FlaggedItemSummary[]) {
  const groups: Record<string, FlaggedItemSummary[]> = {
    negative: [],
    critical: [],
    warning: [],
    other: [],
  };

  items.forEach((item) => {
    switch (item.discriminationFlag) {
      case DiscriminationFlag.NEGATIVE:
        groups.negative.push(item);
        break;
      case DiscriminationFlag.CRITICAL:
        groups.critical.push(item);
        break;
      case DiscriminationFlag.WARNING:
        groups.warning.push(item);
        break;
      default:
        groups.other.push(item);
    }
  });

  return groups;
}

function FlaggedItemCard({ item }: { item: FlaggedItemSummary }) {
  const severityInfo = getSeverityInfo(item.discriminationFlag);
  const SeverityIcon = severityInfo.icon;

  return (
    <Card className={`border-l-4 ${
      item.discriminationFlag === DiscriminationFlag.NEGATIVE ? 'border-l-red-500' :
      item.discriminationFlag === DiscriminationFlag.CRITICAL ? 'border-l-orange-500' :
      'border-l-amber-500'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-lg ${severityInfo.bg} shrink-0`}>
            <SeverityIcon className={`h-5 w-5 ${severityInfo.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={`/psychometrics/items/${item.questionId}`}
              className="font-medium hover:underline block"
            >
              {item.questionTextPreview}
            </Link>
            <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
              <span>{item.competencyName}</span>
              {item.indicatorTitle && (
                <>
                  <span>|</span>
                  <span>{item.indicatorTitle}</span>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {/* Difficulty */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">p:</span>
                <span className="font-mono text-sm">
                  {item.difficultyIndex != null ? item.difficultyIndex.toFixed(2) : '-'}
                </span>
                {item.difficultyFlag && item.difficultyFlag !== DifficultyFlag.NONE && (
                  <Badge variant="outline" className="text-xs">
                    {item.difficultyFlag === DifficultyFlag.TOO_HARD ? (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    )}
                    {DifficultyFlagDisplay[item.difficultyFlag].label}
                  </Badge>
                )}
              </div>
              {/* Discrimination */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">rpb:</span>
                <span className={`font-mono text-sm font-bold ${severityInfo.color}`}>
                  {item.discriminationIndex != null ? item.discriminationIndex.toFixed(2) : '-'}
                </span>
              </div>
              {/* Response count */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Ответов:</span>
                <span className="text-sm">{item.responseCount}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <ValidityStatusBadge status={item.validityStatus} />
            <Link href={`/psychometrics/items/${item.questionId}`}>
              <Button variant="ghost" size="sm" className="gap-1">
                Детали
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SeveritySection({
  title,
  description,
  items,
  icon: Icon,
  iconColor,
  bgColor
}: {
  title: string;
  description: string;
  items: FlaggedItemSummary[];
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-3 p-3 rounded-lg ${bgColor}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <div>
          <h3 className="font-semibold">{title} ({items.length})</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-3 pl-4">
        {items.map((item) => (
          <FlaggedItemCard key={item.questionId} item={item} />
        ))}
      </div>
    </div>
  );
}

export default async function FlaggedItemsPage() {
  const { items, error } = await getFlaggedItems();
  const groups = groupBySeverity(items);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:gap-8 md:p-6">
      <PageHeader
        title="Проблемные элементы"
        description="Элементы оценки, требующие внимания из-за низких психометрических показателей"
      />

      {/* Summary Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Негативные</p>
                <p className="text-2xl font-bold text-red-600">{groups.negative.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Критичные</p>
                <p className="text-2xl font-bold text-orange-600">{groups.critical.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Предупреждения</p>
                <p className="text-2xl font-bold text-amber-600">{groups.warning.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground opacity-30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4">
            <div className="text-destructive font-medium mb-1">Ошибка загрузки данных</div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* No Items Message */}
      {items.length === 0 && !error && (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="font-semibold text-lg mb-2">Нет проблемных элементов</h3>
            <p className="text-muted-foreground">
              Все элементы оценки соответствуют психометрическим требованиям
            </p>
          </CardContent>
        </Card>
      )}

      {/* Grouped Items */}
      <div className="space-y-8">
        <SeveritySection
          title="Негативная дискриминация"
          description="Элементы работают в обратном направлении - высокопроизводительные респонденты отвечают хуже"
          items={groups.negative}
          icon={XCircle}
          iconColor="text-red-600"
          bgColor="bg-red-50 dark:bg-red-950/20"
        />
        <SeveritySection
          title="Критичная дискриминация"
          description="Элементы практически не различают респондентов по уровню компетенции"
          items={groups.critical}
          icon={AlertTriangle}
          iconColor="text-orange-600"
          bgColor="bg-orange-50 dark:bg-orange-950/20"
        />
        <SeveritySection
          title="Предупреждения"
          description="Элементы имеют слабую дискриминацию и требуют наблюдения"
          items={groups.warning}
          icon={AlertCircle}
          iconColor="text-amber-600"
          bgColor="bg-amber-50 dark:bg-amber-950/20"
        />
        {groups.other.length > 0 && (
          <SeveritySection
            title="Другие проблемы"
            description="Элементы с иными проблемами (например, только по сложности)"
            items={groups.other}
            icon={AlertCircle}
            iconColor="text-gray-600"
            bgColor="bg-gray-50 dark:bg-gray-950/20"
          />
        )}
      </div>
    </div>
  );
}
