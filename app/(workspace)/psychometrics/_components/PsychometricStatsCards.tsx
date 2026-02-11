'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PsychometricHealthReport } from '@/types/psychometrics';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslations } from 'next-intl';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Shield,
  AlertCircle,
  HelpCircle,
  FileText,
} from 'lucide-react';
import {
  ItemStatusSectionHelp,
  CompetencyReliabilitySectionHelp,
  BigFiveReliabilitySectionHelp,
  ActiveStatusHelp,
  ProbationStatusHelp,
  FlaggedForReviewStatusHelp,
  RetiredStatusHelp,
  ReliableCompetencyStatusHelp,
  AcceptableCompetencyStatusHelp,
  UnreliableCompetencyStatusHelp,
  InsufficientDataCompetencyHelp,
  ReliableTraitStatusHelp,
  AcceptableTraitStatusHelp,
  UnreliableTraitStatusHelp,
  InsufficientDataTraitHelp,
  AverageAlphaHelp,
  AverageDiscriminationHelp,
  AverageBigFiveAlphaHelp,
} from './PsychometricHelpTooltip';

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
  helpComponent?: React.ReactNode;
}

function StatCard({ title, value, description, icon: Icon, iconColor, bgColor, helpComponent }: StatCardProps) {
  return (
    <Card className={`${bgColor} border-0`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          {title}
          {helpComponent}
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

// Compact mobile stat card - fits 2 per row with touch-friendly sizing
function MobileStatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  bgColor,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
}) {
  return (
    <div className={cn('flex flex-col p-2 rounded-md min-h-[48px]', bgColor)}>
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <Icon className={cn('h-3 w-3 shrink-0', iconColor)} />
        <span className="text-base font-bold tabular-nums leading-none">{value}</span>
      </div>
      <span className="text-xs text-muted-foreground truncate">{title}</span>
    </div>
  );
}

export function PsychometricStatsCards({ report }: PsychometricStatsCardsProps) {
  const isMobile = useIsMobile();
  const t = useTranslations('psychometrics');

  // Mobile Compact Grid Layout - optimized 2-column full width
  if (isMobile) {
    return (
      <div className="space-y-2">
        {/* Item Status - 2x2 grid */}
        <div className="space-y-1">
          <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-1 px-0.5 uppercase tracking-wide">
            <FileText className="h-3 w-3 text-blue-600" />
            {t('itemStatus')}
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            <MobileStatCard
              title={t('active')}
              value={report.activeItems}
              icon={CheckCircle}
              iconColor="text-emerald-600"
              bgColor="bg-emerald-50 dark:bg-emerald-950/20"
            />
            <MobileStatCard
              title={t('probation')}
              value={report.probationItems}
              icon={Clock}
              iconColor="text-amber-600"
              bgColor="bg-amber-50 dark:bg-amber-950/20"
            />
            <MobileStatCard
              title={t('flagged')}
              value={report.flaggedItems}
              icon={AlertTriangle}
              iconColor="text-orange-600"
              bgColor="bg-orange-50 dark:bg-orange-950/20"
            />
            <MobileStatCard
              title={t('retired')}
              value={report.retiredItems}
              icon={XCircle}
              iconColor="text-red-600"
              bgColor="bg-red-50 dark:bg-red-950/20"
            />
          </div>
        </div>

        {/* Competency Reliability - 2x2 grid */}
        <div className="space-y-1">
          <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-1 px-0.5 uppercase tracking-wide">
            <Shield className="h-3 w-3 text-emerald-600" />
            {t('reliability')}
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            <MobileStatCard
              title={t('reliable')}
              value={report.reliableCompetencies}
              icon={Shield}
              iconColor="text-emerald-600"
              bgColor="bg-emerald-50 dark:bg-emerald-950/20"
            />
            <MobileStatCard
              title={t('acceptable')}
              value={report.acceptableCompetencies}
              icon={AlertCircle}
              iconColor="text-amber-600"
              bgColor="bg-amber-50 dark:bg-amber-950/20"
            />
            <MobileStatCard
              title={t('unreliable')}
              value={report.unreliableCompetencies}
              icon={AlertTriangle}
              iconColor="text-red-600"
              bgColor="bg-red-50 dark:bg-red-950/20"
            />
            <MobileStatCard
              title={t('noDataShort')}
              value={report.insufficientDataCompetencies}
              icon={HelpCircle}
              iconColor="text-gray-600"
              bgColor="bg-gray-50 dark:bg-gray-950/20"
            />
          </div>
        </div>

        {/* Summary Metrics - compact 3-column grid */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="p-2 rounded-md bg-muted/40 text-center">
            <div className="text-sm font-bold tabular-nums leading-none">
              {report.averageAlpha != null ? report.averageAlpha.toFixed(2) : '-'}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{t('avgAlpha')}</p>
          </div>
          <div className="p-2 rounded-md bg-muted/40 text-center">
            <div className="text-sm font-bold tabular-nums leading-none">
              {report.averageDiscrimination != null ? report.averageDiscrimination.toFixed(2) : '-'}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{t('avgRpb')}</p>
          </div>
          <div className="p-2 rounded-md bg-muted/40 text-center">
            <div className="text-sm font-bold tabular-nums leading-none">
              {report.bigFiveReliabilitySummary?.averageTraitAlpha != null
                ? report.bigFiveReliabilitySummary.averageTraitAlpha.toFixed(2)
                : '-'}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{t('bigFiveAlpha')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="space-y-4">
      {/* Item Status Distribution */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
          {t('itemStatusSection')}
          <ItemStatusSectionHelp />
        </h3>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={t('active')}
            value={report.activeItems}
            description={t('fromTotal', { percentage: Math.round((report.activeItems / report.totalItems) * 100) })}
            icon={CheckCircle}
            iconColor="text-emerald-600"
            bgColor="bg-emerald-50 dark:bg-emerald-950/20"
            helpComponent={<ActiveStatusHelp />}
          />
          <StatCard
            title={t('probation')}
            value={report.probationItems}
            description={t('collectingData')}
            icon={Clock}
            iconColor="text-amber-600"
            bgColor="bg-amber-50 dark:bg-amber-950/20"
            helpComponent={<ProbationStatusHelp />}
          />
          <StatCard
            title={t('flagged')}
            value={report.flaggedItems}
            description={t('needsAttention')}
            icon={AlertTriangle}
            iconColor="text-orange-600"
            bgColor="bg-orange-50 dark:bg-orange-950/20"
            helpComponent={<FlaggedForReviewStatusHelp />}
          />
          <StatCard
            title={t('retired')}
            value={report.retiredItems}
            description={t('excludedFromUse')}
            icon={XCircle}
            iconColor="text-red-600"
            bgColor="bg-red-50 dark:bg-red-950/20"
            helpComponent={<RetiredStatusHelp />}
          />
        </div>
      </div>

      {/* Competency Reliability Summary */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
          {t('competencyReliability')}
          <CompetencyReliabilitySectionHelp />
        </h3>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={t('reliable')}
            value={report.reliableCompetencies}
            description="Alpha >= 0.7"
            icon={Shield}
            iconColor="text-emerald-600"
            bgColor="bg-emerald-50 dark:bg-emerald-950/20"
            helpComponent={<ReliableCompetencyStatusHelp />}
          />
          <StatCard
            title={t('acceptable')}
            value={report.acceptableCompetencies}
            description="Alpha 0.6 - 0.7"
            icon={AlertCircle}
            iconColor="text-amber-600"
            bgColor="bg-amber-50 dark:bg-amber-950/20"
            helpComponent={<AcceptableCompetencyStatusHelp />}
          />
          <StatCard
            title={t('unreliable')}
            value={report.unreliableCompetencies}
            description="Alpha < 0.6"
            icon={AlertTriangle}
            iconColor="text-red-600"
            bgColor="bg-red-50 dark:bg-red-950/20"
            helpComponent={<UnreliableCompetencyStatusHelp />}
          />
          <StatCard
            title={t('insufficientData')}
            value={report.insufficientDataCompetencies}
            description={t('moreDataNeeded')}
            icon={HelpCircle}
            iconColor="text-gray-600"
            bgColor="bg-gray-50 dark:bg-gray-950/20"
            helpComponent={<InsufficientDataCompetencyHelp />}
          />
        </div>
      </div>

      {/* Big Five Summary */}
      {report.bigFiveReliabilitySummary && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
            {t('bigFiveReliability')}
            <BigFiveReliabilitySectionHelp />
          </h3>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={t('reliableTraits')}
              value={report.bigFiveReliabilitySummary.reliableTraits}
              description="Alpha >= 0.7"
              icon={Shield}
              iconColor="text-emerald-600"
              bgColor="bg-emerald-50 dark:bg-emerald-950/20"
              helpComponent={<ReliableTraitStatusHelp />}
            />
            <StatCard
              title={t('acceptableTraits')}
              value={report.bigFiveReliabilitySummary.acceptableTraits ?? 0}
              description="Alpha 0.6 - 0.7"
              icon={AlertCircle}
              iconColor="text-amber-600"
              bgColor="bg-amber-50 dark:bg-amber-950/20"
              helpComponent={<AcceptableTraitStatusHelp />}
            />
            <StatCard
              title={t('unreliableTraits')}
              value={report.bigFiveReliabilitySummary.unreliableTraits}
              description="Alpha < 0.6"
              icon={AlertTriangle}
              iconColor="text-red-600"
              bgColor="bg-red-50 dark:bg-red-950/20"
              helpComponent={<UnreliableTraitStatusHelp />}
            />
            <StatCard
              title={t('insufficientDataTraits')}
              value={report.bigFiveReliabilitySummary.insufficientDataTraits}
              description={t('moreDataNeeded')}
              icon={HelpCircle}
              iconColor="text-gray-600"
              bgColor="bg-gray-50 dark:bg-gray-950/20"
              helpComponent={<InsufficientDataTraitHelp />}
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
              <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                {t('avgAlphaCompetencies')}
                <AverageAlphaHelp />
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
              <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                {t('avgDiscriminationIndex')}
                <AverageDiscriminationHelp />
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
              <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                {t('avgAlphaBigFive')}
                <AverageBigFiveAlphaHelp />
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
