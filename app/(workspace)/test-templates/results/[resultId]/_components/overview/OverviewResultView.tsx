'use client';

import { useMemo, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  Brain,
  Target,
  GitCompareArrows,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  TrendingUp,
  Grid3X3,
  History,
  Lightbulb,
} from 'lucide-react';
import {
  LazyBigFiveRadarSimple as BigFiveRadarSimple,
  LazyCompetencyRadarChart as CompetencyRadarChart,
  LazyIndicatorHeatmap as IndicatorHeatmap,
} from '@/components/data-display/charts/LazyChartsBundle';
import dynamic from 'next/dynamic';
import { BigFiveMappingInsights } from '@/components/charts/BigFiveMappingInsights';
import { ChartErrorBoundary } from '@/components/charts/ChartErrorBoundary';
import { useBigFiveProjectionDetailed, getBigFiveLabels } from '@/hooks/useBigFiveProjection';
import { getScoreInterpretation, getProficiencyLabel } from '@/lib/scoreInterpretation';
import { testResultsApi } from '@/services/api/results';
import type { TrendDataPoint } from '@/types/domain';
import { ProfilePatternSummary } from './ProfilePatternSummary';
import { CompetencyProfile } from '../shared/CompetencyProfile';
import { BaseResultViewProps } from '../shared/types';
import { HeroStrip } from '../shared/HeroStrip';
import { ResultTabs } from '../shared/ResultTabs';
import { InsightsBar } from '../shared/InsightsBar';
import { DashboardPanel } from '../shared/DashboardPanel';

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

const OVERVIEW_TABS = [
  { id: 'personality', label: 'Personality', icon: Brain },
  { id: 'strengths', label: 'Strengths', icon: Award },
  { id: 'development', label: 'Development', icon: TrendingUp },
  { id: 'competencies', label: 'All Competencies', icon: Grid3X3 },
  { id: 'trend', label: 'Trend', icon: History },
] as const;

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

export function OverviewResultView({ result, template }: BaseResultViewProps) {
  const t = useTranslations('template.resultsView.overview');
  const tResults = useTranslations('template.resultsView');
  const competencyScores = result.competencyScores ?? [];

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

  // Trend
  const [trendData, setTrendData] = useState<TrendDataPoint[] | null>(null);

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
        // Silently fail — trend is optional enhancement
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

  const competencyRadarData = useMemo(() => {
    return competencyScores.map(score => ({
      subject: score.competencyName,
      A: Math.round(score.percentage),
      fullMark: 100,
      benchmark: 70,
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

  const hasIndicatorData = useMemo(() => {
    return competencyScores.some(
      c => c.indicatorScores && c.indicatorScores.length > 0
    );
  }, [competencyScores]);

  // Proficiency chip shared renderer
  function ProficiencyChips({
    items,
  }: {
    items: typeof categorizedCompetencies;
  }) {
    if (items.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {items.map(c => (
          <span
            key={c.competencyId}
            className={`text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium border ${c.interpretation.bgColor} ${c.interpretation.color} ${c.interpretation.borderColor}`}
          >
            {c.competencyName}
            <Badge
              variant="secondary"
              className={`ml-1.5 text-[10px] px-1.5 py-0 ${c.interpretation.bgColor} ${c.interpretation.color}`}
            >
              {getProficiencyLabel(
                c.interpretation.level,
                (key: string) => tResults(key),
                c.proficiencyLabel
              )}
            </Badge>
          </span>
        ))}
      </div>
    );
  }

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
        tabs={[...OVERVIEW_TABS]}
        accentColor="violet"
      />

      <InsightsBar
        insights={[
          ...(topTraits.length > 0
            ? [
                {
                  id: 'traits',
                  icon: Brain,
                  text: `Top traits: ${topTraits.map(tr => tr.label).join(' & ')}`,
                  variant: 'info' as const,
                },
              ]
            : []),
          ...(topCompetencies.length > 0
            ? [
                {
                  id: 'expert',
                  icon: Award,
                  text: `${topCompetencies.length} Expert/Advanced competencies`,
                  variant: 'success' as const,
                },
              ]
            : []),
          ...(consistencyScore !== undefined
            ? [
                {
                  id: 'consistency',
                  icon: CheckCircle2,
                  text: `Confidence: ${consistencyScore >= 0.8 ? 'High' : 'Moderate'} (${Math.round(consistencyScore * 100)}%)`,
                  variant: 'info' as const,
                },
              ]
            : []),
        ]}
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">

        {/* ---------------------------------------------------------------- */}
        {/* Section: Personality                                             */}
        {/* ---------------------------------------------------------------- */}
        <section id="section-personality">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Big Five Radar */}
            <DashboardPanel title="Big Five Profile" icon={Brain} iconVariant="info">
              {hasBigFiveData ? (
                <ChartErrorBoundary>
                  <BigFiveRadarSimple profile={bigFiveProfile} height={280} />
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
            </DashboardPanel>

            {/* Trait Breakdown — all 5 traits sorted by score descending */}
            <DashboardPanel title="Trait Breakdown" icon={Brain}>
              {hasBigFiveData ? (
                <div className="space-y-4">
                  {allTraitsSorted.map(trait => {
                    const colors = TRAIT_COLORS[trait.label] ?? {
                      bar: 'bg-violet-500',
                      text: 'text-violet-600 dark:text-violet-400',
                    };
                    return (
                      <div key={trait.key} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {trait.label}
                          </span>
                          <span
                            className={`text-sm font-bold tabular-nums ${colors.text}`}
                          >
                            {trait.value}%
                          </span>
                        </div>
                        {/* Score bar */}
                        <div className="h-0.5 w-full rounded-full bg-muted">
                          <div
                            className={`h-0.5 rounded-full transition-all duration-500 ${colors.bar}`}
                            style={{ width: `${trait.value}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {getTraitDescription(t, trait.label, trait.value)}
                        </p>
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
            </DashboardPanel>
          </div>

          {/* Competency-to-Trait Mapping — shown below the grid when available */}
          {hasMappingData && (
            <div className="mt-4 sm:mt-6">
              <DashboardPanel
                title="Competency-to-Trait Mapping"
                icon={GitCompareArrows}
              >
                {metadata.mappingConfidence === 'low' && (
                  <div className="flex items-start gap-2 p-3 mb-3 bg-muted/50 rounded-lg border border-muted-foreground/20">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">{t('limitedCoverage')}</span>{' '}
                      {t('onlyMapped', { percentage: metadata.coveragePercentage })}
                    </div>
                  </div>
                )}
                <BigFiveMappingInsights
                  profile={bigFiveProfile}
                  contributions={contributions}
                />
              </DashboardPanel>
            </div>
          )}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Section: Strengths                                               */}
        {/* ---------------------------------------------------------------- */}
        <section id="section-strengths">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <DashboardPanel
              title="Signature Strengths"
              icon={Award}
              iconVariant="success"
            >
              {topCompetencies.length > 0 ? (
                <ProficiencyChips items={topCompetencies} />
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[120px] text-center p-4">
                  <p className="text-sm text-muted-foreground italic">
                    {t('keepDevelopingSkills')}
                  </p>
                </div>
              )}
            </DashboardPanel>

            <ProfilePatternSummary extendedMetrics={extendedMetrics} />
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Section: Development                                             */}
        {/* ---------------------------------------------------------------- */}
        <section id="section-development">
          <DashboardPanel
            title="Areas to Develop"
            icon={TrendingUp}
            iconVariant="warning"
          >
            {developingCompetencies.length > 0 ? (
              <ProficiencyChips items={developingCompetencies} />
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
          </DashboardPanel>
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
            <DashboardPanel title="Indicator Breakdown" icon={Grid3X3}>
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
        {trendData && trendData.length > 1 && (
          <section id="section-trend">
            <DashboardPanel
              title="Growth Trajectory"
              icon={TrendingUp}
              iconVariant="info"
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
