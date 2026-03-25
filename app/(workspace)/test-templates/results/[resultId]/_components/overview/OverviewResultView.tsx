'use client';

import { useMemo, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Award,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  TrendingUp,
  Grid3X3,
  History,
  Lightbulb,
} from 'lucide-react';
import {
  LazyIndicatorHeatmap as IndicatorHeatmap,
} from '@/components/data-display/charts/LazyChartsBundle';
import { ComparisonRadarChart } from '../shared/ComparisonRadarChart';
import type { RadarDataPoint } from '../shared/ComparisonRadarChart';
import dynamic from 'next/dynamic';
import { ChartErrorBoundary } from '@/components/charts/ChartErrorBoundary';
import { useBigFiveProjectionDetailed, getBigFiveLabels } from '@/hooks/useBigFiveProjection';
import type { BigFiveContributions, CompetencyContribution } from '@/hooks/useBigFiveProjection';
import { cn } from '@/lib/utils';
import { getScoreInterpretation, getProficiencyLabel } from '@/lib/scoreInterpretation';
import { testResultsApi } from '@/services/api/results';
import type { TrendDataPoint } from '@/types/domain';
import { CompetencyProfile } from '../shared/CompetencyProfile';
import { BaseResultViewProps } from '../shared/types';
import { HeroStrip } from '../shared/HeroStrip';
import { ResultTabs } from '../shared/ResultTabs';
import { InsightsBar } from '../shared/InsightsBar';
import { DashboardPanel } from '../shared/DashboardPanel';
import { MetricCards } from '../shared/MetricCards';
import { useLensStore } from '@/store/lens-store';
import { selectActiveLens } from '@/store/lens-selectors';

const TrendOverview = dynamic(
  () => import('@/components/results/trends/TrendOverview').then(m => m.TrendOverview),
  { ssr: false, loading: () => <div className="h-64 animate-pulse bg-muted rounded-lg" /> }
);

// ============================================================================
// Trait key mapping for i18n lookup.
// Maps display labels to translation key prefixes.
// ============================================================================

const TRAIT_KEYS: Record<string, string> = {
  Openness: 'openness',
  Conscientiousness: 'conscientiousness',
  Extraversion: 'extraversion',
  Agreeableness: 'agreeableness',
  'Emotional Stability': 'emotionalStability',
};

// Per-trait Tailwind color utilities (score bar + text)
const TRAIT_COLORS: Record<string, { bar: string; text: string }> = {
  Openness: { bar: 'bg-violet-500', text: 'text-violet-600 dark:text-violet-400' },
  Conscientiousness: { bar: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
  Extraversion: { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  Agreeableness: { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  'Emotional Stability': { bar: 'bg-cyan-500', text: 'text-cyan-600 dark:text-cyan-400' },
};

// Map trait display labels to BigFiveContributions keys
const TRAIT_CONTRIBUTION_KEYS: Record<string, keyof BigFiveContributions> = {
  Openness: 'OPENNESS',
  Conscientiousness: 'CONSCIENTIOUSNESS',
  Extraversion: 'EXTRAVERSION',
  Agreeableness: 'AGREEABLENESS',
  'Emotional Stability': 'EMOTIONAL_STABILITY',
};

// Contribution type dot color (replicates BigFiveMappingInsights logic)
function getContributionDotColor(type: string): string {
  if (type === 'primary') return 'bg-primary';
  if (type === 'secondary') return 'bg-muted-foreground/60';
  return 'bg-muted-foreground/30';
}

// Subtle background tints per trait for card wrappers
const TRAIT_BG_TINTS: Record<string, string> = {
  Openness: 'bg-violet-50/40 dark:bg-violet-950/15',
  Conscientiousness: 'bg-blue-50/40 dark:bg-blue-950/15',
  Extraversion: 'bg-amber-50/40 dark:bg-amber-950/15',
  Agreeableness: 'bg-emerald-50/40 dark:bg-emerald-950/15',
  'Emotional Stability': 'bg-cyan-50/40 dark:bg-cyan-950/15',
};

// ============================================================================
// Get personality trait description based on score, using translations.
// ============================================================================

function getTraitDescription(
  t: ReturnType<typeof useTranslations>,
  trait: string,
  score: number
): string {
  const key = TRAIT_KEYS[trait];
  if (!key) return '';

  if (score >= 70) return t(`traits.${key}.high`);
  if (score >= 40) return t(`traits.${key}.medium`);
  return t(`traits.${key}.low`);
}

// ============================================================================
// Tab definitions (stable reference — defined outside component)
// ============================================================================

function getOverviewTabs(t: (key: string) => string, showTrend: boolean) {
  const tabs = [
    { id: 'personality', label: t('tabs.personality'), icon: Brain },
    { id: 'strengths', label: t('tabs.strengths'), icon: Award },
    { id: 'development', label: t('tabs.development'), icon: TrendingUp },
    { id: 'competencies', label: t('tabs.allCompetencies'), icon: Grid3X3 },
  ];
  if (showTrend) tabs.push({ id: 'trend', label: t('tabs.trend'), icon: History });
  return tabs;
}

// ============================================================================
// OverviewResultView — Competency Passport (Scenario A)
//
// Key traits:
// - NO score percentage ring
// - NO pass/fail badge
// - Big Five personality radar as primary visualization
// - Violet accent throughout
// - 5-level proficiency labels (Expert -> Foundational)
// - Consistency score and flags display
// - Percentile ranking when available
// ============================================================================

export function OverviewResultView({ result, template, trendData: prefetchedTrend }: BaseResultViewProps) {
  const t = useTranslations('template.resultsView.overview');
  const tResults = useTranslations('template.resultsView');
  const competencyScores = result.competencyScores ?? [];

  // Lens-based visibility: hide trend panel for personal/user lens
  const activeLens = useLensStore(selectActiveLens);
  const isElevated = activeLens !== 'user';

  // Extended metrics extraction
  const extendedMetrics = result.extendedMetrics as
    | (Record<string, unknown> & {
        confidenceLevel?: string;
        confidenceMessage?: string;
        consistencyScore?: number;
        consistencyFlags?: string[];
      })
    | null
    | undefined;
  const consistencyScore =
    typeof extendedMetrics?.consistencyScore === 'number'
      ? extendedMetrics.consistencyScore
      : undefined;
  const consistencyFlags = Array.isArray(extendedMetrics?.consistencyFlags)
    ? extendedMetrics.consistencyFlags
    : undefined;

  // Trend — use server-prefetched data, fall back to client fetch if not provided
  const [trendData, setTrendData] = useState<TrendDataPoint[] | null>(prefetchedTrend ?? null);
  const [expandedTrait, setExpandedTrait] = useState<string | null>(null);

  useEffect(() => {
    // Skip client fetch if server already provided trend data
    if (prefetchedTrend !== undefined) return;

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
        if (!cancelled) setTrendData(null);
      }
    }

    if (result.clerkUserId && result.templateId) fetchTrend();
    return () => { cancelled = true; };
  }, [result.clerkUserId, result.templateId, prefetchedTrend]);

  // Big Five
  const { profile: bigFiveProfile, contributions, metadata } =
    useBigFiveProjectionDetailed(competencyScores);
  const bigFiveLabels = getBigFiveLabels();

  const topTraits = useMemo(() => {
    const traits = Object.entries(bigFiveProfile)
      .map(([key, value]) => ({
        key,
        label: bigFiveLabels[key as keyof typeof bigFiveLabels],
        value,
      }))
      .sort((a, b) => b.value - a.value);
    return traits.slice(0, 2);
  }, [bigFiveProfile, bigFiveLabels]);

  // All 5 traits sorted descending for Trait Breakdown panel
  const allTraitsSorted = useMemo(() => {
    return Object.entries(bigFiveProfile)
      .map(([key, value]) => ({
        key,
        label: bigFiveLabels[key as keyof typeof bigFiveLabels],
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [bigFiveProfile, bigFiveLabels]);

  const hasBigFiveData = useMemo(() => {
    const values = Object.values(bigFiveProfile);
    return values.some(v => v !== 50);
  }, [bigFiveProfile]);

  const hasMappingData = metadata.mappedCompetencies > 0;

  // Big Five as RadarDataPoint[] for ComparisonRadarChart
  const bigFiveRadarData = useMemo<RadarDataPoint[]>(() => {
    return Object.entries(bigFiveProfile).map(([key, value]) => ({
      label: bigFiveLabels[key as keyof typeof bigFiveLabels],
      primary: value,
      secondary: 50,
    }));
  }, [bigFiveProfile, bigFiveLabels]);

  // Competencies as RadarDataPoint[] for ComparisonRadarChart
  const competencyRadarData = useMemo<RadarDataPoint[]>(() => {
    return competencyScores.map(score => ({
      label: score.competencyName,
      primary: Math.round(score.percentage),
      secondary: 50,
    }));
  }, [competencyScores]);

  const hasCompetencyData = competencyRadarData.length >= 3;

  const categorizedCompetencies = useMemo(() => {
    return competencyScores.map(c => ({
      ...c,
      interpretation: getScoreInterpretation(c.percentage),
    }));
  }, [competencyScores]);

  const topCompetencies = useMemo(() => {
    return categorizedCompetencies
      .filter(
        c =>
          c.interpretation.level === 'expert' ||
          c.interpretation.level === 'advanced'
      )
      .slice(0, 4);
  }, [categorizedCompetencies]);

  const developingCompetencies = useMemo(() => {
    return categorizedCompetencies
      .filter(
        c =>
          c.interpretation.level === 'developing' ||
          c.interpretation.level === 'foundational'
      )
      .slice(0, 3);
  }, [categorizedCompetencies]);

  // Sparkline data for MetricCards
  const topSparklines = useMemo(() => {
    return [...competencyScores]
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3)
      .map(c => ({ name: c.competencyName, value: c.percentage }));
  }, [competencyScores]);

  const developSparklines = useMemo(() => {
    return [...developingCompetencies]
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 3)
      .map(c => ({ name: c.competencyName, value: c.percentage }));
  }, [developingCompetencies]);

  const hasIndicatorData = useMemo(() => {
    return competencyScores.some(
      c => c.indicatorScores && c.indicatorScores.length > 0
    );
  }, [competencyScores]);

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      <HeroStrip
        goal="OVERVIEW"
        templateName={result.templateName}
        completedAt={result.completedAt}
        totalTimeSeconds={result.totalTimeSeconds}
        questionsAnswered={result.questionsAnswered}
        totalQuestions={result.totalQuestions}
        overallPercentage={null}
        passed={null}
        percentile={result.percentile}
        statusVariant="neutral"
        actions={['download_profile', 'save_to_profile']}
        result={result}
        template={template}
      />

      <ResultTabs
        tabs={getOverviewTabs(t, isElevated)}
        accentColor="violet"
      />

      <InsightsBar
        insights={[
          ...(topTraits.length > 0
            ? [
                {
                  id: 'traits',
                  icon: Brain,
                  text: t('insights.topTraits', { traits: topTraits.map(tr => tr.label).join(' & ') }),
                  variant: 'info' as const,
                },
              ]
            : []),
          ...(topCompetencies.length > 0
            ? [
                {
                  id: 'expert',
                  icon: Award,
                  text: t('insights.expertAdvanced', { count: topCompetencies.length }),
                  variant: 'success' as const,
                },
              ]
            : []),
          ...(consistencyScore !== undefined
            ? [
                {
                  id: 'consistency',
                  icon: CheckCircle2,
                  text: t('insights.confidence', { level: consistencyScore >= 0.8 ? t('insights.confidenceHigh') : t('insights.confidenceModerate'), percentage: Math.round(consistencyScore * 100) }),
                  variant: 'info' as const,
                },
              ]
            : []),
        ]}
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">

        {/* ---------------------------------------------------------------- */}
        {/* Section: Summary Metrics                                         */}
        {/* ---------------------------------------------------------------- */}
        <section>
          <MetricCards
            metrics={[
              {
                label: t('metrics.assessed'),
                value: competencyScores.length,
                icon: Grid3X3,
                variant: 'info',
                sublabel: t('metrics.competencies'),
                sparklines: topSparklines,
                tooltip: t('tooltips.assessed'),
              },
              {
                label: t('metrics.strengths'),
                value: topCompetencies.length,
                icon: Award,
                variant: 'success',
                sparklines: topCompetencies.slice(0, 3).map(c => ({
                  name: c.competencyName,
                  value: c.percentage,
                })),
                tooltip: t('tooltips.strengthCount'),
              },
              {
                label: t('metrics.toDevelop'),
                value: developingCompetencies.length,
                icon: TrendingUp,
                variant: 'warning',
                sparklines: developSparklines,
                tooltip: t('tooltips.developCount'),
              },
            ]}
          />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Section: Personality                                             */}
        {/* ---------------------------------------------------------------- */}
        <section id="section-personality">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <DashboardPanel title={t('panels.personalityCompetencies')} icon={Brain} iconVariant="info" tooltip={t('tooltips.personalityCompetencies')}>
            <Tabs defaultValue="bigfive" className="gap-3">
              <TabsList className="w-full">
                <TabsTrigger value="bigfive" className="min-h-[36px]">
                  <Brain className="h-3.5 w-3.5" />
                  {t('innerTabs.bigFive')}
                </TabsTrigger>
                {hasCompetencyData && (
                  <TabsTrigger value="competency" className="min-h-[36px]">
                    <Target className="h-3.5 w-3.5" />
                    {t('competencyRadar')}
                  </TabsTrigger>
                )}
                <TabsTrigger value="breakdown" className="min-h-[36px]">
                  <ChevronDown className="h-3.5 w-3.5" />
                  {t('innerTabs.breakdown')}
                </TabsTrigger>
              </TabsList>

              {/* Tab: Big Five Radar */}
              <TabsContent value="bigfive" className="min-h-[280px]">
                {hasBigFiveData ? (
                  <ChartErrorBoundary>
                    <ComparisonRadarChart
                      data={bigFiveRadarData}
                      primary={{
                        label: t('radar.profile'),
                        stroke: '#8b5cf6',
                        fill: 'rgba(139,92,246,0.10)',
                        dotFill: '#a78bfa',
                        dotStroke: '#212121',
                      }}
                      secondary={{
                        label: t('radar.average'),
                      }}
                      className="max-w-[400px] mx-auto"
                    />
                  </ChartErrorBoundary>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[200px] text-center p-6">
                    <div className="w-14 h-14 mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                      <Brain className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('requiresOnetMappings')}
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Tab: Competency Radar */}
              {hasCompetencyData && (
                <TabsContent value="competency" className="min-h-[280px]">
                  <ChartErrorBoundary>
                    <ComparisonRadarChart
                      data={competencyRadarData}
                      primary={{
                        label: t('radar.score'),
                        stroke: '#10b981',
                        fill: 'rgba(16,185,129,0.10)',
                        dotFill: '#34d399',
                        dotStroke: '#212121',
                      }}
                      secondary={{
                        label: t('radar.baseline'),
                      }}
                      className="max-w-[400px] mx-auto"
                    />
                  </ChartErrorBoundary>
                </TabsContent>
              )}

              {/* Tab: Trait Breakdown with expandable mapping */}
              <TabsContent value="breakdown">
                {hasBigFiveData ? (
                  <div className="space-y-2.5">
                    {metadata.mappingConfidence === 'low' && hasMappingData && (
                      <div className="flex items-start gap-2 p-2.5 bg-muted/50 rounded-lg border border-muted-foreground/20">
                        <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="text-[11px] text-muted-foreground">
                          <span className="font-medium">{t('limitedCoverage')}</span>{' '}
                          {t('onlyMapped', { percentage: metadata.coveragePercentage })}
                        </div>
                      </div>
                    )}
                    {allTraitsSorted.map(trait => {
                      const colors = TRAIT_COLORS[trait.label] ?? {
                        bar: 'bg-violet-500',
                        text: 'text-violet-600 dark:text-violet-400',
                      };
                      const bgTint = TRAIT_BG_TINTS[trait.label] ?? '';
                      const contribKey = TRAIT_CONTRIBUTION_KEYS[trait.label];
                      const traitContributions = contribKey ? contributions[contribKey] : [];
                      const hasContributions = traitContributions.length > 0;
                      const isExpanded = expandedTrait === trait.key;
                      const traitKey = TRAIT_KEYS[trait.label];
                      const traitName = traitKey ? t(`traits.${traitKey}.name`) : trait.label;

                      return (
                        <div key={trait.key} className={cn(
                          'rounded-lg border transition-all',
                          isExpanded ? 'border-border bg-card shadow-sm' : 'border-transparent',
                          bgTint,
                        )}>
                          <button
                            type="button"
                            onClick={() => hasContributions && setExpandedTrait(isExpanded ? null : trait.key)}
                            className={cn(
                              'w-full p-3 text-left',
                              hasContributions && 'cursor-pointer',
                              !hasContributions && 'cursor-default',
                            )}
                            aria-expanded={isExpanded}
                            aria-label={`${traitName} ${trait.value}%`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', colors.bar)} />
                                <span className="text-sm font-medium text-foreground">
                                  {traitName}
                                </span>
                                {hasContributions && (
                                  <span className="text-[10px] text-muted-foreground tabular-nums">
                                    ({traitContributions.length})
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={cn(
                                    'text-xs font-bold tabular-nums px-2 py-0.5 rounded-full',
                                    colors.text, bgTint
                                  )}
                                >
                                  {trait.value}%
                                </span>
                                {hasContributions && (
                                  <ChevronDown className={cn(
                                    'h-3.5 w-3.5 text-muted-foreground/50 transition-transform duration-200',
                                    isExpanded && 'rotate-180'
                                  )} />
                                )}
                              </div>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted">
                              <div
                                className={cn('h-2 rounded-full transition-all duration-700 ease-out', colors.bar)}
                                style={{ width: `${trait.value}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                              {getTraitDescription(t, trait.label, trait.value)}
                            </p>
                          </button>

                          {isExpanded && hasContributions && (
                            <div className="px-3 pb-3">
                              <div className="border-t border-border/40 pt-2.5">
                                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                  {t('contributingCompetencies')}
                                </div>
                                <div className="space-y-1">
                                  {[...traitContributions]
                                    .sort((a, b) => {
                                      const order: Record<string, number> = { primary: 0, secondary: 1, tertiary: 2 };
                                      return (order[a.contributionType] ?? 3) - (order[b.contributionType] ?? 3);
                                    })
                                    .map((c, i) => {
                                      const maxWeighted = Math.max(...traitContributions.map(x => x.weightedScore));
                                      const barWidth = maxWeighted > 0 ? (c.weightedScore / maxWeighted) * 100 : 0;
                                      return (
                                        <div key={`${c.competencyId}-${i}`} className="py-1">
                                          <div className="flex items-center gap-1.5 w-full">
                                            <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', getContributionDotColor(c.contributionType))} />
                                            <span className="flex-1 text-xs font-medium truncate min-w-0">
                                              {c.competencyName}
                                            </span>
                                            <span className={cn('text-xs font-bold tabular-nums shrink-0', colors.text)}>
                                              {Math.round(c.competencyScore)}%
                                            </span>
                                          </div>
                                          <div className="mt-1 ml-3">
                                            <div className="h-1 w-full bg-muted/40 rounded-full overflow-hidden">
                                              <div
                                                className={cn(
                                                  'h-full rounded-full',
                                                  c.contributionType === 'primary' ? colors.bar : 'bg-muted-foreground/40'
                                                )}
                                                style={{ width: `${Math.min(barWidth, 100)}%` }}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[200px] text-center p-6">
                    <div className="w-14 h-14 mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                      <Brain className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('requiresOnetMappings')}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DashboardPanel>

            {/* Strengths & Development — second column, tabbed */}
            <div id="section-strengths">
              <DashboardPanel
                title={t('panels.signatureStrengths')}
                icon={Award}
                iconVariant="success"
                tooltip={t('tooltips.signatureStrengths')}
              >
                <Tabs defaultValue="strengths" className="gap-3">
                  <TabsList className="w-full">
                    <TabsTrigger value="strengths" className="min-h-[36px]">
                      <Award className="h-3.5 w-3.5" />
                      {t('tabs.strengths')}
                    </TabsTrigger>
                    <TabsTrigger value="development" className="min-h-[36px]">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {t('tabs.development')}
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab: Strengths */}
                  <TabsContent value="strengths">
                    {topCompetencies.length > 0 ? (
                      <div className="space-y-2">
                        {topCompetencies.map(c => (
                          <div
                            key={c.competencyId}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-lg border-l-[3px] bg-card',
                              'border border-border/50',
                              c.interpretation.borderColor,
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-foreground truncate">
                                  {c.competencyName}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className={cn('text-[10px] px-1.5 py-0 shrink-0 ml-2',
                                    c.interpretation.bgColor, c.interpretation.color
                                  )}
                                >
                                  {getProficiencyLabel(
                                    c.interpretation.level,
                                    (key: string) => tResults(key),
                                    c.proficiencyLabel
                                  )}
                                </Badge>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-muted">
                                <div
                                  className={cn('h-1.5 rounded-full transition-all duration-500', c.interpretation.progressColor)}
                                  style={{ width: `${c.percentage}%` }}
                                />
                              </div>
                            </div>
                            <span className={cn('text-lg font-bold tabular-nums shrink-0', c.interpretation.color)}>
                              {Math.round(c.percentage)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center min-h-[120px] text-center p-4">
                        <p className="text-sm text-muted-foreground italic">
                          {t('keepDevelopingSkills')}
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Tab: Development */}
                  <TabsContent value="development" id="section-development">
                    {developingCompetencies.length > 0 ? (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          {developingCompetencies.map(c => (
                            <div
                              key={c.competencyId}
                              className={cn(
                                'p-3 rounded-lg border-l-[3px] bg-card border border-border/50',
                                c.interpretation.borderColor,
                              )}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-foreground truncate">
                                  {c.competencyName}
                                </span>
                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                  <Badge
                                    variant="secondary"
                                    className={cn('text-[10px] px-1.5 py-0',
                                      c.interpretation.bgColor, c.interpretation.color
                                    )}
                                  >
                                    {getProficiencyLabel(
                                      c.interpretation.level,
                                      (key: string) => tResults(key),
                                      c.proficiencyLabel
                                    )}
                                  </Badge>
                                  <span className={cn('text-lg font-bold tabular-nums', c.interpretation.color)}>
                                    {Math.round(c.percentage)}%
                                  </span>
                                </div>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-muted mb-2">
                                <div
                                  className={cn('h-1.5 rounded-full transition-all duration-500', c.interpretation.progressColor)}
                                  style={{ width: `${c.percentage}%` }}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground italic">
                                {t(`development.suggestion.${c.interpretation.level === 'foundational' ? 'foundational' : 'developing'}`)}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Motivational footer */}
                        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50/30 dark:bg-amber-950/10 border border-amber-500/10">
                          <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {t('development.encouragement')}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center min-h-[120px] text-center p-4">
                        <div className="w-12 h-12 mb-3 rounded-full bg-muted/50 flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t('developmentNote')}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </DashboardPanel>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Section: All Competencies                                        */}
        {/* ---------------------------------------------------------------- */}
        <section id="section-competencies" className="space-y-4 sm:space-y-6">
          <CompetencyProfile
            competencies={competencyScores}
            resultId={result.id}
            showPassFail={false}
          />

          {hasIndicatorData && (
            <DashboardPanel title={t('panels.indicatorBreakdown')} icon={Grid3X3} tooltip={t('tooltips.indicatorBreakdown')}>
              <ChartErrorBoundary>
                <IndicatorHeatmap
                  competencies={competencyScores}
                  translationNamespace="results.shared"
                />
              </ChartErrorBoundary>
            </DashboardPanel>
          )}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Section: Trend                                                   */}
        {/* ---------------------------------------------------------------- */}
        {isElevated && trendData && trendData.length > 1 && (
          <section id="section-trend">
            <DashboardPanel
              title={t('panels.growthTrajectory')}
              icon={TrendingUp}
              iconVariant="info"
              tooltip={t('tooltips.growthTrajectory')}
            >
              <ChartErrorBoundary>
                <TrendOverview data={trendData} passingThreshold={0} />
              </ChartErrorBoundary>
            </DashboardPanel>
          </section>
        )}
      </div>
    </div>
  );
}
