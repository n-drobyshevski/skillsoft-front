'use client';

import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  BarChart3, Award, AlertTriangle, CheckCircle2,
  Target, Briefcase, Grid3x3,
} from 'lucide-react';
import { ChartErrorBoundary } from '@/components/charts/ChartErrorBoundary';
import { ComparisonRadarChart } from '../shared/ComparisonRadarChart';
import { CompetencyCardGrid } from '../shared/CompetencyCardGrid';
import { CompetencyDetailTable } from '../shared/CompetencyDetailTable';
import { TrendAnalysisPanel } from '../shared/TrendAnalysisPanel';
import { BaseResultViewProps } from '../shared/types';
import { HeroStrip } from '../shared/HeroStrip';
import { ResultTabs } from '../shared/ResultTabs';
import { InsightsBar } from '../shared/InsightsBar';
import { DashboardPanel } from '../shared/DashboardPanel';
import { MetricCards } from '../shared/MetricCards';
import { GapAnalysisBarChart } from '../shared/GapAnalysisBarChart';
import { toGapData } from '@/lib/result-transformers';
import type { GapDataPoint } from '@/types/results';
import type { TrendDataPoint } from '@/types/domain';
import { testResultsApi } from '@/services/api/results';
import { useLensStore } from '@/store/lens-store';
import { selectActiveLens } from '@/store/lens-selectors';

/**
 * Job Fit Result View — Direction B "Command Center" Dashboard.
 *
 * Evaluates candidates against O*NET benchmarks for hiring managers.
 * Replaces the vertical card stack with the shared dashboard layout:
 * HeroStrip → ResultTabs → InsightsBar → sectioned DashboardPanels.
 */
export function JobFitResultView({ result, template, trendData: prefetchedTrend }: BaseResultViewProps) {
  const t = useTranslations('results.jobFit');

  // 1. O*NET extraction
  const onetSocCode = template.blueprint?.onetSocCode ?? template.blueprint?.onet_soc_code;
  const isPassed = result.passed ?? false;
  const passingScore = template.passingScore || 70;
  const competencyScores = result.competencyScores ?? [];

  // Lens-based visibility: hide manager-only panels/actions for user lens
  const activeLens = useLensStore(selectActiveLens);
  const isElevated = activeLens !== 'user';

  // 2. Gap bar click → competency expand
  const [focusedCompetencyId, setFocusedCompetencyId] = useState<string | null>(null);
  const competencyProfileRef = useRef<HTMLDivElement>(null);

  // 3. Trend — use server-prefetched data, fall back to client fetch
  const [trendData, setTrendData] = useState<TrendDataPoint[] | null>(prefetchedTrend ?? null);

  // 4. Extended metrics extraction (consistency for insights bar)
  const extendedMetrics = result.extendedMetrics as
    | (Record<string, unknown> & { consistencyScore?: number })
    | null | undefined;
  const consistencyScore = typeof extendedMetrics?.consistencyScore === 'number'
    ? extendedMetrics.consistencyScore : undefined;

  // 5. Client-side trend fetch fallback (skipped when server data is available)
  useEffect(() => {
    if (prefetchedTrend !== undefined) return;
    let cancelled = false;
    async function fetchTrend() {
      try {
        const history = await testResultsApi.getUserHistory(result.clerkUserId, result.templateId);
        if (!cancelled && history) setTrendData(history);
      } catch {
        if (!cancelled) setTrendData(null);
      }
    }
    if (result.clerkUserId && result.templateId) fetchTrend();
    return () => { cancelled = true; };
  }, [result.clerkUserId, result.templateId, prefetchedTrend]);

  // 6. Gap data transform
  const gapData = useMemo(() => toGapData(competencyScores, { defaultTarget: passingScore }), [competencyScores, passingScore]);

  // 7. Radar data (for JobFitRadarChart — label + candidate + benchmark)
  const radarData = useMemo(() => competencyScores.map(cs => ({
    label: cs.competencyName,
    primary: Math.round(cs.percentage),
    secondary: cs.benchmarkScore != null ? Math.round(cs.benchmarkScore) : passingScore,
  })), [competencyScores, passingScore]);

  // 9. Insights calc
  const insights = useMemo(() => {
    const strengths = competencyScores.filter(c => c.percentage >= passingScore);
    const gaps = competencyScores.filter(c => c.percentage < passingScore);
    const avgScore = competencyScores.length > 0
      ? Math.round(competencyScores.reduce((sum, c) => sum + c.percentage, 0) / competencyScores.length) : 0;
    return { strengths, gaps, avgScore };
  }, [competencyScores, passingScore]);

  // 10. Sparkline data for metric cards
  const exceedsSparklines = useMemo(() => {
    return insights.strengths
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3)
      .map(c => ({ name: c.competencyName, value: c.percentage }));
  }, [insights.strengths]);

  const meetsSparklines = useMemo(() => {
    return competencyScores
      .filter(c => c.percentage >= passingScore && c.percentage < passingScore + 15)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3)
      .map(c => ({ name: c.competencyName, value: c.percentage }));
  }, [competencyScores, passingScore]);

  const belowSparklines = useMemo(() => {
    return insights.gaps
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 3)
      .map(c => ({ name: c.competencyName, value: c.percentage }));
  }, [insights.gaps]);

  // 11. Build per-competency trend map for sparklines in CompetencyCardGrid
  const trendMap = useMemo<Record<string, number[]>>(() => {
    if (!trendData || trendData.length < 2) return {};
    const map: Record<string, number[]> = {};
    for (const cs of competencyScores) {
      const points: number[] = [];
      for (const d of trendData) {
        const match = d.competencyScores?.find(c => c.competencyName === cs.competencyName);
        if (match?.percentage != null) points.push(Math.round(match.percentage));
      }
      if (points.length >= 2) map[cs.competencyName] = points;
    }
    return map;
  }, [trendData, competencyScores]);

  // 12. Gap bar click handler
  const handleGapBarClick = useCallback((dataPoint: GapDataPoint) => {
    const match = competencyScores.find(cs => cs.competencyName === dataPoint.name);
    if (match) {
      setFocusedCompetencyId(match.competencyId);
      competencyProfileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [competencyScores]);

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      {/* Sticky Hero Strip */}
      <HeroStrip
        goal="JOB_FIT"
        templateName={result.templateName}
        completedAt={result.completedAt}
        totalTimeSeconds={result.totalTimeSeconds}
        questionsAnswered={result.questionsAnswered}
        totalQuestions={result.totalQuestions}
        overallPercentage={result.overallPercentage}
        passed={result.passed}
        percentile={result.percentile}
        statusLabel={isPassed ? 'Qualified' : 'Below Requirements'}
        statusVariant={isPassed ? 'success' : 'warning'}
        metadata={[
          ...(onetSocCode ? [{ icon: Briefcase, label: `O*NET: ${onetSocCode}` }] : []),
        ]}
        actions={isElevated ? ['download_report', 'share', 'manager_summary'] : ['share']}
        result={result}
        template={template}
      />

      {/* Tab Navigation */}
      <ResultTabs
        tabs={[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'gap-analysis', label: 'Gap Analysis', icon: Target },
          { id: 'competencies', label: 'Competencies', icon: Grid3x3 },
          { id: 'details', label: 'Details', icon: Award },
        ]}
        accentColor="emerald"
      />

      {/* Dismissible Insights */}
      <InsightsBar
        insights={[
          ...(insights.strengths.length > 0 ? [{
            id: 'strongest',
            icon: CheckCircle2,
            text: `Strongest: ${insights.strengths[0]?.competencyName} (${Math.round(insights.strengths[0]?.percentage ?? 0)}%)`,
            variant: 'success' as const,
          }] : []),
          ...(insights.gaps.length > 0 ? [{
            id: 'gap',
            icon: AlertTriangle,
            text: `Largest gap: ${insights.gaps[insights.gaps.length - 1]?.competencyName} (${Math.round(insights.gaps[insights.gaps.length - 1]?.percentage ?? 0)}%)`,
            variant: 'warning' as const,
          }] : []),
          ...(consistencyScore !== undefined ? [{
            id: 'consistency',
            icon: BarChart3,
            text: `Consistency: ${consistencyScore.toFixed(2)} (${consistencyScore >= 0.8 ? 'reliable' : 'moderate'})`,
            variant: 'info' as const,
          }] : []),
        ]}
      />

      {/* Dashboard Content */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">

        {/* Section: Overview */}
        <section id="section-overview">
          <MetricCards
            metrics={[
              { label: 'Exceeds', value: insights.strengths.length, icon: CheckCircle2, variant: 'success', sparklines: exceedsSparklines, tooltip: t('tooltips.exceeds') },
              { label: 'Meets', value: competencyScores.filter(c => c.percentage >= passingScore && c.percentage < passingScore + 15).length, icon: Target, variant: 'info', sparklines: meetsSparklines, tooltip: t('tooltips.meets') },
              { label: 'Below', value: insights.gaps.length, icon: AlertTriangle, variant: 'warning', sparklines: belowSparklines, tooltip: t('tooltips.below') },
            ]}
          />
        </section>

        {/* Section: Gap Analysis */}
        <section id="section-gap-analysis">
          <DashboardPanel title="Gap Analysis" subtitle="Score vs. Benchmark by Competency" icon={BarChart3} iconVariant="warning" tooltip={t('tooltips.gapAnalysis')}>
            {/* Legend — shows benchmark ghost + 3 status colors */}
            <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 mb-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-2 rounded bg-white/15 border border-white/20" />
                Benchmark
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-2 rounded-sm bg-emerald-500" />
                Exceeds
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-2 rounded-sm bg-blue-500" />
                Meets
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-2 rounded-sm bg-amber-500" />
                Below
              </span>
            </div>
            <ChartErrorBoundary>
              <GapAnalysisBarChart
                data={gapData}
                onBarClick={handleGapBarClick}
              />
            </ChartErrorBoundary>
          </DashboardPanel>
        </section>

        {/* Section: Competencies — card grid + radar + trend (merged) */}
        <section id="section-competencies" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 sm:gap-6">
            {/* Competency Card Grid — with real trend sparklines when available */}
            <DashboardPanel title="Competency Cards" icon={Grid3x3} tooltip={t('tooltips.competencyCards')}>
              <CompetencyCardGrid
                competencies={competencyScores}
                passingScore={passingScore}
                trendMap={trendMap}
                onCardClick={(id) => {
                  setFocusedCompetencyId(id);
                  competencyProfileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              />
            </DashboardPanel>

            {/* Radar Chart */}
            {radarData.length >= 3 && (
              <DashboardPanel title="Radar — Candidate vs Benchmark" icon={BarChart3} tooltip={t('tooltips.radarChart')}>
                <ChartErrorBoundary>
                  <ComparisonRadarChart data={radarData} />
                </ChartErrorBoundary>
              </DashboardPanel>
            )}
          </div>

          {/* Overall Trend — embedded below the cards when history exists */}
          {trendData && trendData.length > 1 && (
            <ChartErrorBoundary>
              <TrendAnalysisPanel
                trendData={trendData}
                currentResult={result}
                competencyNames={competencyScores.map(c => c.competencyName)}
              />
            </ChartErrorBoundary>
          )}
        </section>

        {/* Section: Details — collapsible sortable table matching design preview */}
        <section id="section-details">
          <CompetencyDetailTable
            competencies={competencyScores}
            passingScore={passingScore}
            onRowClick={(id) => {
              setFocusedCompetencyId(id);
            }}
            ref={competencyProfileRef}
          />
        </section>
      </div>
    </div>
  );
}
