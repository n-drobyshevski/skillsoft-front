import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { getTranslations, getLocale } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/common/PageHeader';
import { ChartErrorBoundary, SectionErrorBoundary } from '@/components/common';
import { InlineError } from '@/components/feedback';
import { RefreshCw, Clock, BarChart3 } from 'lucide-react';
import {
  PsychometricStatsCards,
  FlaggedItemsTable,
  TriggerAuditButton,
  DashboardHero,
  ActionableInsightsList,
  ItemQualityScatterLazy as ItemQualityScatter,
  MetricDistributionChartsLazy as MetricDistributionCharts,
  MobileAnalyticsAccordion,
  AverageDiscriminationHelp,
  AverageAlphaHelp,
  ActiveItemsHelp,
  ReliableCompetenciesHelp,
  QuickNavCard,
} from './_components';
import { ReliabilityGaugesGrid } from './_components/ReliabilityGaugesGrid';
import {
  getPsychometricsDashboardCached,
  getPsychometricsItemsCached,
  getPsychometricsCompetenciesCached,
} from '@/services/api.cache.psychometrics';
import { getAuthHeaders } from '@/services/roleApi';
import { ErrorCategory, ErrorAction } from '@/types/errors';



export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('psychometrics');
  return {
    title: `${t('title')} - SkillSoft`,
    description: t('description'),
    openGraph: {
      title: `${t('title')} - SkillSoft`,
      description: t('description'),
    },
  };
}

// Loading skeleton for stats cards
function StatsCardsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-48" />
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// Loading skeleton for hero
function HeroSkeleton() {
  return <Skeleton className="h-[160px] md:h-[180px] rounded-xl" />;
}

// Loading skeleton for charts
function ChartSkeleton() {
  return <Skeleton className="h-[400px] rounded-lg" />;
}

// Loading skeleton for reliability gauges
function ReliabilityGaugesSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


// Async wrapper for ItemQualityScatter chart
// Uses sample of 300 items for efficient visualization (statistically representative)
async function ItemQualityScatterWrapper() {
  const t = await getTranslations('psychometrics');
  const authHeaders = await getAuthHeaders();
  const itemsPage = await getPsychometricsItemsCached(authHeaders, { size: 300 });
  const items = itemsPage?.content ?? [];

  if (items.length === 0) {
    return (
      <Card className="flex items-center justify-center h-[450px]">
        <p className="text-muted-foreground">{t('noItemDataAvailable')}</p>
      </Card>
    );
  }

  return (
    <ChartErrorBoundary
      height={450}
      title={t('chartError')}
      description={t('chartErrorDescription')}
    >
      <ItemQualityScatter items={items} height={450} />
    </ChartErrorBoundary>
  );
}

// Async wrapper for MetricDistributionCharts
// Uses sample of 300 items for efficient distribution histograms
async function MetricDistributionWrapper() {
  const t = await getTranslations('psychometrics');
  const authHeaders = await getAuthHeaders();
  const itemsPage = await getPsychometricsItemsCached(authHeaders, { size: 300 });
  const items = itemsPage?.content ?? [];

  if (items.length === 0) {
    return (
      <Card className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">{t('noDistributionData')}</p>
      </Card>
    );
  }

  return (
    <ChartErrorBoundary
      height={400}
      title={t('distributionChartError')}
      description={t('distributionChartErrorDescription')}
    >
      <MetricDistributionCharts items={items} />
    </ChartErrorBoundary>
  );
}

// Async wrapper for ReliabilityGauges - uses client component for mobile detection
async function ReliabilityGaugesWrapper() {
  const t = await getTranslations('psychometrics');
  const authHeaders = await getAuthHeaders();
  const competenciesPage = await getPsychometricsCompetenciesCached(authHeaders, { size: 100 });
  const competencies = competenciesPage?.content ?? [];

  return (
    <SectionErrorBoundary
      title={t('reliabilityGaugesError')}
      description={t('reliabilityGaugesErrorDescription')}
    >
      <ReliabilityGaugesGrid competencies={competencies} />
    </SectionErrorBoundary>
  );
}

// Async wrapper for MobileAnalyticsAccordion - fetches items and provides to accordion
// Uses sample of 300 items for mobile summary calculations (same as charts)
async function AnalyticsZoneWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const authHeaders = await getAuthHeaders();
  const itemsPage = await getPsychometricsItemsCached(authHeaders, { size: 300 });
  const items = itemsPage?.content ?? [];

  return (
    <MobileAnalyticsAccordion items={items}>
      {children}
    </MobileAnalyticsAccordion>
  );
}

// Async data component — all dynamic APIs (headers, auth) are inside Suspense
async function PsychometricsData() {
  const authHeaders = await getAuthHeaders();
  const report = await getPsychometricsDashboardCached(authHeaders);
  const t = await getTranslations('psychometrics');
  const locale = await getLocale();

  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('description')}
      >
        <div className="flex gap-2">
          <TriggerAuditButton />
        </div>
      </PageHeader>

      {/* Error Display if no data */}
      {!report && (
        <InlineError
          error={{
            message: t('failedToLoadDashboard'),
            status: 500,
            category: ErrorCategory.SERVER,
            isRetryable: true,
            suggestedAction: ErrorAction.RETRY,
          }}
          variant="banner"
          title={t('dataLoadingError')}
        />
      )}

      {/* Dashboard Hero - renders immediately with report data */}
      {report && (
        <Suspense fallback={<HeroSkeleton />}>
          <DashboardHero report={report} />
        </Suspense>
      )}

      {/* Quick Navigation - 2x2 full-width on mobile, 4 across on desktop */}
      <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <QuickNavCard
          href="/psychometrics/items"
          icon="FileText"
          title={t('items')}
          count={report?.totalItems}
          iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <QuickNavCard
          href="/psychometrics/competencies"
          icon="Shield"
          title={t('competencies')}
          count={report?.reliableCompetencies}
          iconColor="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        />
        <QuickNavCard
          href="/psychometrics/flagged"
          icon="AlertTriangle"
          title={t('flagged')}
          count={report?.flaggedItems}
          iconColor="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
        />
        <QuickNavCard
          href="/psychometrics/big-five"
          icon="Brain"
          title={t('bigFive')}
          count={report?.bigFiveReliabilitySummary?.reliableTraits}
          iconColor="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />
      </div>

      {/* Main Dashboard Content */}
      {report && (
        <>
          {/* Analytics Zone - Accordion on mobile, 2 Column Layout on desktop */}
          <Suspense fallback={<ChartSkeleton />}>
            <AnalyticsZoneWrapper>
              <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                {/* Left Column - Item Quality Scatter (streaming) */}
                <div className="min-w-0">
                  <Suspense fallback={<ChartSkeleton />}>
                    <ItemQualityScatterWrapper />
                  </Suspense>
                </div>

                {/* Right Column - Distribution Charts (streaming) */}
                <div className="min-w-0">
                  <Suspense fallback={<ChartSkeleton />}>
                    <MetricDistributionWrapper />
                  </Suspense>
                </div>
              </div>
            </AnalyticsZoneWrapper>
          </Suspense>

          {/* Stats Cards - renders immediately with report data */}
          <Suspense fallback={<StatsCardsSkeleton />}>
            <PsychometricStatsCards report={report} />
          </Suspense>

          {/* Bottom Zone - Insights and Reliability Gauges */}
          <div className="grid gap-2 sm:gap-3 md:gap-6 lg:grid-cols-2">
            {/* Left - Flagged Items Table + Insights */}
            <div className="space-y-2 sm:space-y-3 md:space-y-4 min-w-0">
              <FlaggedItemsTable items={report.topFlaggedItems} maxItems={5} />
              {/* Hide insights on mobile - already shown in accordion */}
              <div className="hidden md:block">
                <ActionableInsightsList report={report} maxInsights={3} compact />
              </div>
            </div>

            {/* Right - Reliability Gauges (streaming) + Last Audit Info */}
            <div className="space-y-2 sm:space-y-3 md:space-y-4 min-w-0">
              {/* Reliability Gauges Grid - 2x2 on mobile, 3 columns on tablet+ */}
              <Suspense fallback={<ReliabilityGaugesSkeleton />}>
                <ReliabilityGaugesWrapper />
              </Suspense>

              {/* Last Audit Info - compact on mobile */}
              <Card className="hidden md:block">
                <CardHeader className="pb-2 md:pb-3">
                  <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {t('lastAudit')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 md:pt-1">
                  {report.lastAuditRun ? (
                    <div className="space-y-1 md:space-y-2">
                      <p className="text-lg md:text-2xl font-bold">
                        {new Date(report.lastAuditRun).toLocaleString(locale, {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground hidden md:block">
                        {t('auditRecommendation')}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-2 md:py-4">
                      <RefreshCw className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">{t('auditNotRun')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Key Metrics Summary - hidden on mobile (already in hero scroll) */}
              <Card className="hidden md:block">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    {t('keyMetrics')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="text-2xl font-bold">
                        {report.averageDiscrimination != null
                          ? report.averageDiscrimination.toFixed(2)
                          : '-'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                        {t('avgQuestionEffectiveness')}
                        <AverageDiscriminationHelp />
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="text-2xl font-bold">
                        {report.averageAlpha != null
                          ? report.averageAlpha.toFixed(2)
                          : '-'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                        {t('avgReliabilityScore')}
                        <AverageAlphaHelp />
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="text-2xl font-bold">
                        {report.totalItems > 0
                          ? Math.round((report.activeItems / report.totalItems) * 100)
                          : 0}
                        %
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                        {t('activeItems')}
                        <ActiveItemsHelp />
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="text-2xl font-bold">
                        {(
                          ((report.reliableCompetencies + report.acceptableCompetencies) /
                            (report.reliableCompetencies +
                              report.acceptableCompetencies +
                              report.unreliableCompetencies +
                              report.insufficientDataCompetencies || 1)) *
                          100
                        ).toFixed(0)}
                        %
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                        {t('reliableCompetencies')}
                        <ReliableCompetenciesHelp />
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default async function PsychometricsPage() {
  return (
    <div className="flex flex-1 flex-col gap-3 p-2.5 pt-3 sm:gap-4 sm:p-3 sm:pt-4 md:gap-6 md:p-6 min-w-0 overflow-x-hidden">
      <Suspense fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[100px] rounded-lg" />
            ))}
          </div>
          <StatsCardsSkeleton />
          <ChartSkeleton />
        </div>
      }>
        <PsychometricsData />
      </Suspense>
    </div>
  );
}
