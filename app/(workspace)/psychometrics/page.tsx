import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/common/PageHeader';
import { InlineError } from '@/components/feedback';
import {
  ArrowRight,
  RefreshCw,
  Shield,
  AlertTriangle,
  Brain,
  FileText,
  Clock,
  BarChart3,
} from 'lucide-react';
import {
  PsychometricStatsCards,
  FlaggedItemsTable,
  TriggerAuditButton,
  DashboardHero,
  ActionableInsightsList,
  ItemQualityScatter,
  ReliabilityGauge,
  MetricDistributionCharts,
  MobileChartsSection,
  AverageDiscriminationHelp,
  AverageAlphaHelp,
  ActiveItemsHelp,
  ReliableCompetenciesHelp,
} from './_components';
import {
  getPsychometricsDashboardCached,
  getPsychometricsItemsCached,
  getPsychometricsCompetenciesCached,
} from '@/services/api.cache.psychometrics';
import type { PsychometricHealthReport, ItemStatistics, CompetencyReliability } from '@/types/psychometrics';
import { ErrorCategory, ErrorAction } from '@/types/errors';

export const metadata: Metadata = {
  title: 'Psychometrics - SkillSoft',
  description: 'Psychometric analysis dashboard for assessment items, competency reliability, and Big Five traits.',
  openGraph: {
    title: 'Psychometrics - SkillSoft',
    description: 'Analyze assessment item quality and measurement reliability.',
  },
};

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

// Quick navigation card
function QuickNavCard({
  href,
  icon: Icon,
  title,
  description,
  count,
  iconColor,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  count?: number;
  iconColor: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-all hover:border-primary/20 cursor-pointer group h-full">
        <CardContent className="p-4 flex items-start gap-4">
          <div className={`p-2 rounded-lg ${iconColor} shrink-0`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{title}</h3>
              {count !== undefined && (
                <span className="text-lg font-bold text-muted-foreground">{count}</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-center" />
        </CardContent>
      </Card>
    </Link>
  );
}

// Async wrapper for ItemQualityScatter chart
async function ItemQualityScatterWrapper() {
  const itemsPage = await getPsychometricsItemsCached({ size: 1000 });
  const items = itemsPage?.content ?? [];

  if (items.length === 0) {
    return (
      <Card className="flex items-center justify-center h-[450px]">
        <p className="text-muted-foreground">No item data available</p>
      </Card>
    );
  }

  return <ItemQualityScatter items={items} height={450} />;
}

// Async wrapper for MetricDistributionCharts
async function MetricDistributionWrapper() {
  const itemsPage = await getPsychometricsItemsCached({ size: 1000 });
  const items = itemsPage?.content ?? [];

  if (items.length === 0) {
    return (
      <Card className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">No distribution data available</p>
      </Card>
    );
  }

  return <MetricDistributionCharts items={items} />;
}

// Async wrapper for ReliabilityGauges
async function ReliabilityGaugesWrapper() {
  const competenciesPage = await getPsychometricsCompetenciesCached({ size: 100 });
  const competencies = competenciesPage?.content ?? [];

  if (competencies.length === 0) {
    return (
      <Card className="flex items-center justify-center h-[200px]">
        <p className="text-muted-foreground">No reliability data available</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          Test Reliability Scores
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile: show 4 in 2x2, Desktop: show 6 in 2x3 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Show first 4 on mobile (via CSS), 6 on desktop */}
          {competencies.slice(0, 6).map((comp, index) => (
            <Link
              key={comp.competencyId}
              href={`/psychometrics/competencies/${comp.competencyId}`}
              className={`hover:opacity-80 transition-opacity ${index >= 4 ? 'hidden md:block' : ''}`}
            >
              <ReliabilityGauge
                value={comp.cronbachAlpha}
                competencyName={comp.competencyName}
                sampleSize={comp.sampleSize}
                itemCount={comp.itemCount}
                size="sm"
              />
            </Link>
          ))}
        </div>
        {/* Show "view all" if more than 4 on mobile, or more than 6 on desktop */}
        {competencies.length > 4 && (
          <Link href="/psychometrics/competencies">
            <Button variant="ghost" size="sm" className="w-full mt-4">
              <span className="md:hidden">
                View all {competencies.length} competencies
              </span>
              <span className="hidden md:inline">
                {competencies.length > 6 ? `View all ${competencies.length} competencies` : 'View competencies page'}
              </span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export default async function PsychometricsPage() {
  // Fetch dashboard report first (fast data for immediate render)
  const report = await getPsychometricsDashboardCached();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:gap-8 md:p-6">
      <PageHeader
        title="Psychometrics"
        description="Analyze assessment item quality, competency reliability, and personality trait measurements"
      >
        <div className="flex gap-2">
          <TriggerAuditButton />
        </div>
      </PageHeader>

      {/* Error Display if no data */}
      {!report && (
        <InlineError
          error={{
            message: 'Failed to load psychometrics dashboard data',
            status: 500,
            category: ErrorCategory.SERVER,
            isRetryable: true,
            suggestedAction: ErrorAction.RETRY,
          }}
          variant="banner"
          title="Data Loading Error"
        />
      )}

      {/* Dashboard Hero - renders immediately with report data */}
      {report && (
        <Suspense fallback={<HeroSkeleton />}>
          <DashboardHero report={report} />
        </Suspense>
      )}

      {/* Quick Navigation */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <QuickNavCard
          href="/psychometrics/items"
          icon={FileText}
          title="Assessment Items"
          description="Question statistics"
          count={report?.totalItems}
          iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <QuickNavCard
          href="/psychometrics/competencies"
          icon={Shield}
          title="Competencies"
          description="Measurement reliability"
          count={report?.reliableCompetencies}
          iconColor="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        />
        <QuickNavCard
          href="/psychometrics/flagged"
          icon={AlertTriangle}
          title="Flagged Items"
          description="Items needing attention"
          count={report?.flaggedItems}
          iconColor="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
        />
        <QuickNavCard
          href="/psychometrics/big-five"
          icon={Brain}
          title="Big Five"
          description="Trait reliability"
          count={report?.bigFiveReliabilitySummary?.reliableTraits}
          iconColor="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />
      </div>

      {/* Main Dashboard Content */}
      {report && (
        <>
          {/* Analytics Zone - 2 Column Layout (collapsible on mobile) */}
          <MobileChartsSection>
            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              {/* Left Column - Item Quality Scatter (streaming) */}
              <Suspense fallback={<ChartSkeleton />}>
                <ItemQualityScatterWrapper />
              </Suspense>

              {/* Right Column - Distribution Charts (streaming) */}
              <Suspense fallback={<ChartSkeleton />}>
                <MetricDistributionWrapper />
              </Suspense>
            </div>
          </MobileChartsSection>

          {/* Stats Cards - renders immediately with report data */}
          <Suspense fallback={<StatsCardsSkeleton />}>
            <PsychometricStatsCards report={report} />
          </Suspense>

          {/* Bottom Zone - Insights and Reliability Gauges */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left - Flagged Items Table + Insights */}
            <div className="space-y-4">
              <FlaggedItemsTable items={report.topFlaggedItems} maxItems={5} />
              <ActionableInsightsList report={report} maxInsights={3} compact />
            </div>

            {/* Right - Reliability Gauges (streaming) + Last Audit Info */}
            <div className="space-y-4">
              {/* Reliability Gauges Grid - 2x2 on mobile, 3 columns on tablet+ */}
              <Suspense fallback={<ReliabilityGaugesSkeleton />}>
                <ReliabilityGaugesWrapper />
              </Suspense>

              {/* Last Audit Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Last Audit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {report.lastAuditRun ? (
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">
                        {new Date(report.lastAuditRun).toLocaleString('en-US', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Recommended to run audit after significant new response data
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <RefreshCw className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Audit not yet run</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Click &quot;Run Audit&quot; to start analysis
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Key Metrics Summary - with help tooltips */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    Key Metrics
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
                        Avg. Question Effectiveness
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
                        Avg. Reliability Score
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
                        Active Items
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
                        Reliable Competencies
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
    </div>
  );
}
