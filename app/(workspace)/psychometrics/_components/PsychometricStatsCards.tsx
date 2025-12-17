'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PsychometricHealthReport } from '@/types/psychometrics';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Shield,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface PsychometricStatsCardsProps {
  report: PsychometricHealthReport;
}

interface StatCardProps {
  title: string;
  value: number;
  description?: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
}

function StatCard({ title, value, description, icon: Icon, iconColor, bgColor }: StatCardProps) {
  return (
    <Card className={`${bgColor} border-0`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function PsychometricStatsCards({ report }: PsychometricStatsCardsProps) {
  return (
    <div className="space-y-4">
      {/* Item Status Distribution */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Статус элементов оценки
        </h3>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Активные"
            value={report.activeItems}
            description={`${Math.round((report.activeItems / report.totalItems) * 100)}% от всех`}
            icon={CheckCircle}
            iconColor="text-emerald-600"
            bgColor="bg-emerald-50 dark:bg-emerald-950/20"
          />
          <StatCard
            title="Пробационные"
            value={report.probationItems}
            description="Собирают данные"
            icon={Clock}
            iconColor="text-amber-600"
            bgColor="bg-amber-50 dark:bg-amber-950/20"
          />
          <StatCard
            title="На проверке"
            value={report.flaggedItems}
            description="Требуют внимания"
            icon={AlertTriangle}
            iconColor="text-orange-600"
            bgColor="bg-orange-50 dark:bg-orange-950/20"
          />
          <StatCard
            title="Отключены"
            value={report.retiredItems}
            description="Исключены из использования"
            icon={XCircle}
            iconColor="text-red-600"
            bgColor="bg-red-50 dark:bg-red-950/20"
          />
        </div>
      </div>

      {/* Competency Reliability Summary */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Надежность компетенций
        </h3>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Надежные"
            value={report.reliableCompetencies}
            description="Alpha >= 0.7"
            icon={Shield}
            iconColor="text-emerald-600"
            bgColor="bg-emerald-50 dark:bg-emerald-950/20"
          />
          <StatCard
            title="Приемлемые"
            value={report.acceptableCompetencies}
            description="Alpha 0.6 - 0.7"
            icon={AlertCircle}
            iconColor="text-amber-600"
            bgColor="bg-amber-50 dark:bg-amber-950/20"
          />
          <StatCard
            title="Ненадежные"
            value={report.unreliableCompetencies}
            description="Alpha < 0.6"
            icon={AlertTriangle}
            iconColor="text-red-600"
            bgColor="bg-red-50 dark:bg-red-950/20"
          />
          <StatCard
            title="Недостаточно данных"
            value={report.insufficientDataCompetencies}
            description="Требуется больше ответов"
            icon={HelpCircle}
            iconColor="text-gray-600"
            bgColor="bg-gray-50 dark:bg-gray-950/20"
          />
        </div>
      </div>

      {/* Big Five Summary */}
      {report.bigFiveReliabilitySummary && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Надежность Big Five
          </h3>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Надежные черты"
              value={report.bigFiveReliabilitySummary.reliableTraits}
              description="Alpha >= 0.7"
              icon={Shield}
              iconColor="text-emerald-600"
              bgColor="bg-emerald-50 dark:bg-emerald-950/20"
            />
            <StatCard
              title="Приемлемые черты"
              value={report.bigFiveReliabilitySummary.acceptableTraits ?? 0}
              description="Alpha 0.6 - 0.7"
              icon={AlertCircle}
              iconColor="text-amber-600"
              bgColor="bg-amber-50 dark:bg-amber-950/20"
            />
            <StatCard
              title="Ненадежные черты"
              value={report.bigFiveReliabilitySummary.unreliableTraits}
              description="Alpha < 0.6"
              icon={AlertTriangle}
              iconColor="text-red-600"
              bgColor="bg-red-50 dark:bg-red-950/20"
            />
            <StatCard
              title="Недостаточно данных"
              value={report.bigFiveReliabilitySummary.insufficientDataTraits}
              description="Требуется больше данных"
              icon={HelpCircle}
              iconColor="text-gray-600"
              bgColor="bg-gray-50 dark:bg-gray-950/20"
            />
          </div>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">
                {report.averageAlpha != null
                  ? report.averageAlpha.toFixed(2)
                  : '-'}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Средний Alpha компетенций
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">
                {report.averageDiscrimination != null
                  ? report.averageDiscrimination.toFixed(2)
                  : '-'}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Средний индекс различения
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">
                {report.bigFiveReliabilitySummary?.averageTraitAlpha != null
                  ? report.bigFiveReliabilitySummary.averageTraitAlpha.toFixed(2)
                  : '-'}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Средний Alpha Big Five
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
