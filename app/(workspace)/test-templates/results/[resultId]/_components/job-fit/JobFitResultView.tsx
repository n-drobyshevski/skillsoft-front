'use client';

import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart3,
  Award,
  AlertTriangle,
  CheckCircle2,
  Target,
  Briefcase,
  Grid3x3,
  TrendingUp,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import {
  LazyCompetencyRadarChart as CompetencyRadarChart,
  LazyIndicatorHeatmap as IndicatorHeatmap,
} from '@/components/data-display/charts/LazyChartsBundle';
import { ChartErrorBoundary } from '@/components/charts/ChartErrorBoundary';
import { JobFitHero } from './JobFitHero';
import { CompetencyProfile } from '../shared/CompetencyProfile';
import { ActionButtonsBar } from '../shared/ActionButtonsBar';
import { BaseResultViewProps } from '../shared/types';
import {
  GapAnalysisChart,
  DevelopmentRecommendations,
  HiringScorecard,
} from '@/components/results';
import {
  toGapData,
  generateRecommendationsFromGaps,
} from '@/lib/result-transformers';
import type { GapDataPoint } from '@/types/results';
import type { TrendDataPoint } from '@/types/domain';
import { testResultsApi } from '@/services/api/results';

const TrendOverview = dynamic(
  () => import('@/components/results/trends/TrendOverview').then(m => m.TrendOverview),
  { ssr: false, loading: () => <div className="h-64 animate-pulse bg-muted rounded-lg" /> }
);

/**
 * Job Fit Result View for Scenario B (O*NET Benchmark Comparison).
 *
 * Key features:
 * - Score percentage circle in hero (appropriate for job fit)
 * - Pass/fail badge (Qualified/Not Qualified)
 * - Gap analysis visualization comparing to job benchmarks
 * - O*NET job context display
 * - Green/Amber color palette for pass/fail states
 */
export function JobFitResultView({ result, template }: BaseResultViewProps) {
  const t = useTranslations('results.jobFit');
  const onetSocCode = template.blueprint?.onet_soc_code;
  const isPassed = result.passed ?? false;
  const passingScore = template.passingScore || 70;

  const competencyScores = result.competencyScores ?? [];

  // V2: State and ref for gap bar click -> competency profile scroll/expand
  const [focusedCompetencyId, setFocusedCompetencyId] = useState<string | null>(null);
  const competencyProfileRef = useRef<HTMLDivElement>(null);

  // V7: Trend data for historical progress visualization
  const [trendData, setTrendData] = useState<TrendDataPoint[] | null>(null);

  // Extract confidence and consistency metrics from extendedMetrics (loosely typed for cross-scenario support)
  const extendedMetrics = result.extendedMetrics as
    | (Record<string, unknown> & {
        confidenceLevel?: string;
        confidenceMessage?: string;
        consistencyScore?: number;
        consistencyFlags?: string[];
      })
    | null
    | undefined;
  const confidenceLevel = extendedMetrics?.confidenceLevel;
  const confidenceMessage = extendedMetrics?.confidenceMessage;
  const consistencyScore = typeof extendedMetrics?.consistencyScore === 'number'
    ? extendedMetrics.consistencyScore
    : undefined;
  const consistencyFlags = Array.isArray(extendedMetrics?.consistencyFlags)
    ? extendedMetrics.consistencyFlags
    : undefined;

  // V7: Fetch historical trend data for this template
  useEffect(() => {
    let cancelled = false;

    async function fetchTrend() {
      try {
        const history = await testResultsApi.getUserHistory(
          result.clerkUserId,
          result.templateId
        );
        if (!cancelled && history) {
          setTrendData(history);
        }
      } catch {
        // Silently fail - trend is optional enhancement
        if (!cancelled) {
          setTrendData(null);
        }
      }
    }

    if (result.clerkUserId && result.templateId) {
      fetchTrend();
    }

    return () => {
      cancelled = true;
    };
  }, [result.clerkUserId, result.templateId]);

  // Transform data for enhanced gap analysis chart
  const gapData = useMemo(() => {
    return toGapData(competencyScores, { defaultTarget: passingScore });
  }, [competencyScores, passingScore]);

  // Generate development recommendations from gaps
  const recommendations = useMemo(() => {
    return generateRecommendationsFromGaps(gapData, {
      minGap: 5,
      maxRecommendations: 5,
    });
  }, [gapData]);

  // Prepare data for radar chart (V1: includes CI bands, V3: includes benchmark overlay)
  const radarData = useMemo(() => {
    return competencyScores.map(cs => ({
      subject: cs.competencyName,
      A: Math.round(cs.percentage),
      fullMark: 100,
      ciLower: cs.ciLower != null ? Math.round(cs.ciLower) : undefined,
      ciUpper: cs.ciUpper != null ? Math.round(cs.ciUpper) : undefined,
      benchmark: cs.benchmarkScore != null ? Math.round(cs.benchmarkScore) : undefined,
    }));
  }, [competencyScores]);

  // Calculate insights
  const insights = useMemo(() => {
    const strengths = competencyScores.filter(c => c.percentage >= passingScore);
    const gaps = competencyScores.filter(c => c.percentage < passingScore);
    const avgScore = competencyScores.length > 0
      ? Math.round(competencyScores.reduce((sum, c) => sum + c.percentage, 0) / competencyScores.length)
      : 0;

    return { strengths, gaps, avgScore };
  }, [competencyScores, passingScore]);

  // V2: Handler for gap bar click -> scroll to competency profile and expand
  const handleGapBarClick = useCallback((dataPoint: GapDataPoint) => {
    const match = competencyScores.find(
      cs => cs.competencyName === dataPoint.name
    );
    if (match) {
      setFocusedCompetencyId(match.competencyId);
      competencyProfileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [competencyScores]);

  return (
    <div className="min-h-screen bg-muted/30 py-3 sm:py-4 md:py-8">
      <div className="container max-w-7xl mx-auto px-2 sm:px-4 space-y-3 sm:space-y-4">
        {/* Hero with score circle and pass/fail badge */}
        <JobFitHero
          templateName={result.templateName}
          completedAt={result.completedAt}
          overallPercentage={result.overallPercentage ?? 0}
          passed={isPassed}
          onetSocCode={onetSocCode}
          questionsAnswered={result.questionsAnswered}
          totalQuestions={result.totalQuestions}
          timeSpent={result.totalTimeSeconds}
          percentile={result.percentile ?? undefined}
        />

        {/* V5: Hiring Scorecard - Executive Summary */}
        <HiringScorecard
          overallPercentage={result.overallPercentage ?? 0}
          passed={isPassed}
          competencyScores={competencyScores}
          passingScore={passingScore}
          onetSocCode={onetSocCode}
          confidenceLevel={confidenceLevel}
          confidenceMessage={confidenceMessage}
          consistencyScore={consistencyScore}
          consistencyFlags={consistencyFlags}
        />

        {/* Charts + Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 animate-fadeInUp-2">
          {/* Enhanced Gap Analysis Chart */}
          <Card className="h-full">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                {t('gapAnalysis')}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t('gapAnalysisDescription', { passingScore })}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <ChartErrorBoundary>
                <GapAnalysisChart
                  data={gapData}
                  passingThreshold={passingScore}
                  animate={true}
                  sortBy="gap"
                  sortDirection="desc"
                  onBarClick={handleGapBarClick}
                />
              </ChartErrorBoundary>
            </CardContent>
          </Card>

          {/* Key Insights - Enhanced Visual Hierarchy */}
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2.5">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                {t('keyInsights')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-4 sm:space-y-5 px-4 sm:px-6">
              {/* Job context - Primary context */}
              {onetSocCode && (
                <div className="p-3 sm:p-4 bg-muted/40 rounded-xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted shrink-0">
                      <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm sm:text-base font-medium text-foreground">{t('jobRequirements')}</span>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        O*NET: <code className="text-primary font-mono">{onetSocCode}</code>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pass/Fail summary - Primary focal point */}
              {isPassed ? (
                <div className="p-3 sm:p-4 bg-linear-to-br from-green-500/10 to-green-500/5 rounded-xl border border-green-500/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-500/15 shrink-0">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm sm:text-base text-green-800 dark:text-green-300 mb-1">
                        {t('qualified')}
                      </h4>
                      <p className="text-xs sm:text-sm text-green-700 dark:text-green-400 leading-relaxed">
                        {t('qualifiedMessage')}
                        {insights.strengths.length > 0 && (
                          <span className="hidden sm:inline"> {t('excelIn', { areas: insights.strengths.slice(0, 2).map(s => s.competencyName).join(', ') })}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 sm:p-4 bg-linear-to-br from-amber-500/10 to-amber-500/5 rounded-xl border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/15 shrink-0">
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm sm:text-base text-amber-800 dark:text-amber-300 mb-1">
                        {t('belowRequirements')}
                      </h4>
                      <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
                        {t('belowRequirementsMessage')}
                        {insights.gaps.length > 0 && (
                          <span className="hidden sm:inline"> {t('focusOn', { areas: insights.gaps.slice(0, 2).map(g => g.competencyName).join(', ') })}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Strengths - Secondary importance */}
              {insights.strengths.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-4 bg-green-500/60 rounded-full" />
                    {t('strengths', { count: insights.strengths.length })}
                  </h5>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {insights.strengths.slice(0, 3).map(s => (
                      <span
                        key={s.competencyId}
                        className="text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 bg-green-500/10 text-green-700 dark:text-green-400 rounded-full font-medium border border-green-500/20"
                      >
                        {s.competencyName} ({Math.round(s.percentage)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Development Areas - Tertiary */}
              {insights.gaps.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-4 bg-amber-500/60 rounded-full" />
                    {t('gaps', { count: insights.gaps.length })}
                  </h5>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {insights.gaps.slice(0, 3).map(g => (
                      <span
                        key={g.competencyId}
                        className="text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full font-medium border border-amber-500/20"
                      >
                        {g.competencyName} ({Math.round(g.percentage)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Percentile - Footer info */}
              {result.percentile !== undefined && result.percentile !== null && (
                <div className="p-3 sm:p-4 bg-muted/30 rounded-xl border border-border/40 mt-auto">
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    {t.rich('betterThan', {
                      percentage: result.percentile,
                      bold: (chunks) => <span className="font-bold text-foreground text-sm sm:text-base">{chunks}</span>,
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Competency Radar (optional secondary visualization) */}
        {radarData.length >= 3 && (
          <Card className="animate-fadeInUp-3">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <CardTitle className="text-sm sm:text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                {t('competencyMap')}
              </CardTitle>
              <CardDescription className="text-[10px] sm:text-sm">
                {t('visualProfile')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <ChartErrorBoundary>
                <div className="flex justify-center items-center min-h-[220px] sm:min-h-[280px] md:min-h-[340px]">
                  <CompetencyRadarChart
                    data={radarData}
                    passingScore={passingScore}
                  />
                </div>
              </ChartErrorBoundary>
            </CardContent>
          </Card>
        )}

        {/* Indicator-Level Heatmap */}
        {competencyScores.some(cs => cs.indicatorScores && cs.indicatorScores.length > 0) && (
          <Card className="animate-fadeInUp-3">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <CardTitle className="text-sm sm:text-lg font-semibold flex items-center gap-2">
                <Grid3x3 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                {t('indicatorBreakdown')}
              </CardTitle>
              <CardDescription className="text-[10px] sm:text-sm">
                {t('indicatorHeatmapDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <ChartErrorBoundary>
                <IndicatorHeatmap competencies={competencyScores} />
              </ChartErrorBoundary>
            </CardContent>
          </Card>
        )}

        {/* Detailed competency breakdown - Mobile-First */}
        <div ref={competencyProfileRef}>
          <CompetencyProfile
            competencies={competencyScores}
            resultId={result.id}
            showPassFail={true}
            passingScore={passingScore}
            expandedCompetencyId={focusedCompetencyId}
          />
        </div>

        {/* V7: Progress Over Time */}
        {trendData && trendData.length > 1 && (
          <Card className="animate-fadeInUp-4">
            <CardHeader>
              <CardTitle className="text-sm sm:text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                {t('progressOverTime')}
              </CardTitle>
              <CardDescription className="text-[10px] sm:text-sm">
                {t('improvementAcrossAttempts')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartErrorBoundary>
                <TrendOverview data={trendData} passingThreshold={passingScore} />
              </ChartErrorBoundary>
            </CardContent>
          </Card>
        )}

        {/* Development Recommendations */}
        {recommendations.length > 0 && (
          <Card className="animate-fadeInUp-4">
            <CardContent className="p-4 sm:p-6">
              <DevelopmentRecommendations
                recommendations={recommendations}
                initialCount={3}
                showPriority={true}
                showEstimatedTime={true}
                showResources={false}
              />
            </CardContent>
          </Card>
        )}

        {/* Action buttons */}
        <div className="print-hidden">
          <ActionButtonsBar
            templateId={result.templateId}
            resultId={result.id}
            actions={['download_report', 'retake', 'share']}
          />
        </div>
      </div>
    </div>
  );
}
