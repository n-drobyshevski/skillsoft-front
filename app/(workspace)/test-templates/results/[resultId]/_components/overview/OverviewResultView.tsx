'use client';

import { useMemo, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Award, Lightbulb, Brain, Target, GitCompareArrows, AlertTriangle, CheckCircle2, ShieldAlert, TrendingUp, ChevronDown, History, Grid3X3 } from 'lucide-react';
import {
  LazyBigFiveRadarSimple as BigFiveRadarSimple,
  LazyCompetencyRadarChart as CompetencyRadarChart,
  LazyIndicatorHeatmap as IndicatorHeatmap,
} from '@/components/data-display/charts/LazyChartsBundle';
import type { CompetencyRadarDataPoint } from '@/components/data-display/charts/CompetencyRadarChart';
import dynamic from 'next/dynamic';
import { BigFiveMappingInsights } from '@/components/charts/BigFiveMappingInsights';
import { ChartErrorBoundary } from '@/components/charts/ChartErrorBoundary';
import { useBigFiveProjectionDetailed, getBigFiveLabels } from '@/hooks/useBigFiveProjection';
import { getScoreInterpretation, getProficiencyLabel } from '@/lib/scoreInterpretation';
import { testResultsApi } from '@/services/api/results';
import type { TrendDataPoint } from '@/types/domain';
import { CompetencyPassportHero } from './CompetencyPassportHero';
import { ProfilePatternSummary } from './ProfilePatternSummary';
import { CompetencyProfile } from '../shared/CompetencyProfile';
import { ActionButtonsBar } from '../shared/ActionButtonsBar';
import { BaseResultViewProps } from '../shared/types';

const TrendOverview = dynamic(
  () => import('@/components/results/trends/TrendOverview').then(m => m.TrendOverview),
  { ssr: false, loading: () => <div className="h-64 animate-pulse bg-muted rounded-lg" /> }
);

/**
 * Trait key mapping for i18n lookup.
 * Maps display labels to translation key prefixes.
 */
const TRAIT_KEYS: Record<string, string> = {
  Openness: 'openness',
  Conscientiousness: 'conscientiousness',
  Extraversion: 'extraversion',
  Agreeableness: 'agreeableness',
  'Emotional Stability': 'emotionalStability',
};

/**
 * Get personality trait description based on score, using translations.
 */
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

/**
 * Overview Result View for Scenario A (Competency Passport).
 *
 * Key differences from Job Fit/Team Fit:
 * - NO score percentage circle in hero
 * - NO pass/fail badge
 * - Big Five personality radar as primary visualization
 * - Neutral color palette (no red/green pass/fail)
 * - "Your Competency Profile" messaging
 * - 5-level proficiency labels (Expert -> Foundational)
 * - Consistency score and flags display
 * - Percentile ranking when available
 */
export function OverviewResultView({ result, template }: BaseResultViewProps) {
  const t = useTranslations('template.resultsView.overview');
  const tResults = useTranslations('template.resultsView');
  const competencyScores = result.competencyScores ?? [];

  // Extract consistency metrics from extendedMetrics (same pattern as JobFitResultView)
  const extendedMetrics = result.extendedMetrics as
    | (Record<string, unknown> & {
        confidenceLevel?: string;
        confidenceMessage?: string;
        consistencyScore?: number;
        consistencyFlags?: string[];
      })
    | null
    | undefined;
  const consistencyScore = typeof extendedMetrics?.consistencyScore === 'number'
    ? extendedMetrics.consistencyScore
    : undefined;
  const consistencyFlags = Array.isArray(extendedMetrics?.consistencyFlags)
    ? extendedMetrics.consistencyFlags
    : undefined;

  // Growth trajectory: fetch historical trend data for this template
  const [trendData, setTrendData] = useState<TrendDataPoint[] | null>(null);
  const [trendOpen, setTrendOpen] = useState(true);
  const [heatmapOpen, setHeatmapOpen] = useState(false);

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

  // Project competencies to Big Five personality profile with detailed contributions
  const { profile: bigFiveProfile, contributions, metadata } = useBigFiveProjectionDetailed(competencyScores);
  const bigFiveLabels = getBigFiveLabels();

  // Get top 2 traits for insights
  const topTraits = useMemo(() => {
    const traits = Object.entries(bigFiveProfile)
      .map(([key, value]) => ({
        key,
        label: bigFiveLabels[key as keyof typeof bigFiveLabels],
        value
      }))
      .sort((a, b) => b.value - a.value);

    return traits.slice(0, 2);
  }, [bigFiveProfile, bigFiveLabels]);

  // Check if we have valid Big Five data
  const hasBigFiveData = useMemo(() => {
    const values = Object.values(bigFiveProfile);
    // Check if we have meaningful variance (not all 50s which is the default)
    return values.some(v => v !== 50);
  }, [bigFiveProfile]);

  // Check if we have any mapping contributions
  const hasMappingData = metadata.mappedCompetencies > 0;

  // Transform competency scores to radar chart format
  // For OVERVIEW mode (no O*NET benchmark), add a static 70% "Target" reference line
  const competencyRadarData: CompetencyRadarDataPoint[] = useMemo(() => {
    return competencyScores.map(score => ({
      subject: score.competencyName,
      A: Math.round(score.percentage),
      fullMark: 100,
      benchmark: 70,
    }));
  }, [competencyScores]);

  // Check if we have competency data for the radar
  const hasCompetencyData = competencyRadarData.length >= 3;

  // Categorize competencies using the 5-level interpretation system (Task 5)
  const categorizedCompetencies = useMemo(() => {
    return competencyScores.map(c => ({
      ...c,
      interpretation: getScoreInterpretation(c.percentage),
    }));
  }, [competencyScores]);

  // Get top competencies (expert + advanced) for display
  const topCompetencies = useMemo(() => {
    return categorizedCompetencies
      .filter(c => c.interpretation.level === 'expert' || c.interpretation.level === 'advanced')
      .slice(0, 4);
  }, [categorizedCompetencies]);

  // Get developing competencies (developing + foundational)
  const developingCompetencies = useMemo(() => {
    return categorizedCompetencies
      .filter(c => c.interpretation.level === 'developing' || c.interpretation.level === 'foundational')
      .slice(0, 3);
  }, [categorizedCompetencies]);

  // Check if any competencies have indicator-level data for the heatmap
  const hasIndicatorData = useMemo(() => {
    return competencyScores.some(c => c.indicatorScores && c.indicatorScores.length > 0);
  }, [competencyScores]);

  return (
    <div className="min-h-screen bg-muted/30 py-3 sm:py-4 md:py-8">
      <div className="container max-w-7xl mx-auto px-2 sm:px-4 space-y-3 sm:space-y-4">
        {/* Hero without scores/badges */}
        <CompetencyPassportHero
          templateName={result.templateName}
          completedAt={result.completedAt}
          questionsAnswered={result.questionsAnswered}
          totalQuestions={result.totalQuestions}
          timeSpent={result.totalTimeSeconds}
          competencyCount={competencyScores.length}
        />

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Profile Charts with Tabs */}
          <Card className="h-full">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <CardTitle className="text-base sm:text-lg font-semibold">
                {t('profileOverview')}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t('assessmentResults')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <Tabs defaultValue="competency" className="w-full">
                {/* Mobile-optimized segmented tabs with 44px touch targets */}
                <TabsList className="grid grid-cols-3 w-full mb-3 sm:mb-4 h-auto p-1 gap-1">
                  <TabsTrigger
                    value="competency"
                    className="gap-1 sm:gap-1.5 px-2 sm:px-3 py-2.5 sm:py-2 data-[state=active]:shadow-md touch-manipulation"
                    title={t('skills')}
                  >
                    <Target className="h-4 w-4 shrink-0" />
                    <span className="sr-only xs:not-sr-only xs:inline text-xs sm:text-sm font-medium truncate">
                      {t('skills')}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="personality"
                    className="gap-1 sm:gap-1.5 px-2 sm:px-3 py-2.5 sm:py-2 data-[state=active]:shadow-md touch-manipulation"
                    title={t('bigFive')}
                  >
                    <Brain className="h-4 w-4 shrink-0" />
                    <span className="sr-only xs:not-sr-only xs:inline text-xs sm:text-sm font-medium truncate">
                      {t('bigFive')}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="mapping"
                    className="gap-1 sm:gap-1.5 px-2 sm:px-3 py-2.5 sm:py-2 data-[state=active]:shadow-md touch-manipulation"
                    title={t('map')}
                  >
                    <GitCompareArrows className="h-4 w-4 shrink-0" />
                    <span className="sr-only xs:not-sr-only xs:inline text-xs sm:text-sm font-medium truncate">
                      {t('map')}
                    </span>
                  </TabsTrigger>
                </TabsList>

                {/* Competency Radar Tab */}
                <TabsContent value="competency" className="mt-0">
                  {hasCompetencyData ? (
                    <ChartErrorBoundary>
                      <CompetencyRadarChart
                        data={competencyRadarData}
                        passingScore={0}
                        animated={true}
                        className="min-h-[240px] sm:min-h-[300px]"
                      />
                    </ChartErrorBoundary>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[200px] sm:min-h-[280px] text-center p-4 sm:p-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                        <Target className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t('minCompetenciesRequired')}
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Personality (Big Five) Tab */}
                <TabsContent value="personality" className="mt-0">
                  {hasBigFiveData ? (
                    <ChartErrorBoundary>
                      <div className="min-h-[240px] sm:min-h-[300px]">
                        <BigFiveRadarSimple
                          profile={bigFiveProfile}
                          height={280}
                        />
                      </div>
                    </ChartErrorBoundary>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[200px] sm:min-h-[280px] text-center p-4 sm:p-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                        <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t('requiresOnetMappings')}
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Mapping Insights Tab */}
                <TabsContent value="mapping" className="mt-0 overflow-hidden">
                  {hasMappingData ? (
                    <ChartErrorBoundary>
                      <div className="min-h-[240px] sm:min-h-[300px] max-h-[350px] sm:max-h-[400px] overflow-y-auto overflow-x-hidden">
                        {metadata.mappingConfidence === 'low' && (
                          <div className="flex items-start gap-2 p-2 sm:p-3 mb-2 sm:mb-3 bg-muted/50 rounded-lg border border-muted-foreground/20">
                            <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <div className="text-[10px] sm:text-xs text-muted-foreground">
                              <span className="font-medium">{t('limitedCoverage')}</span>{' '}
                              {t('onlyMapped', { percentage: metadata.coveragePercentage })}
                            </div>
                          </div>
                        )}
                        <BigFiveMappingInsights
                          profile={bigFiveProfile}
                          contributions={contributions}
                        />
                      </div>
                    </ChartErrorBoundary>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[200px] sm:min-h-[280px] text-center p-4 sm:p-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                        <GitCompareArrows className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t('noOnetMappings')}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
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
              {/* Profile Summary - Primary focal point */}
              <div className="p-3 sm:p-4 bg-linear-to-br from-primary/8 to-primary/4 rounded-xl border border-primary/15">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/15 shrink-0">
                    <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm sm:text-base text-foreground mb-1">
                      {t('profileSummary')}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {t('competenciesAssessed', { count: competencyScores.length })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Task 3: Consistency Score Badge */}
              {consistencyScore !== undefined && (
                <div className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-xl border ${
                  consistencyScore >= 0.7
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-amber-500/5 border-amber-500/20'
                }`}>
                  {consistencyScore >= 0.7 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs sm:text-sm font-medium ${
                      consistencyScore >= 0.7
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-amber-700 dark:text-amber-400'
                    }`}>
                      {consistencyScore >= 0.7
                        ? t('consistencyGood')
                        : t('consistencyWarning')}
                    </span>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                      {t('consistencyScore', { score: Math.round(consistencyScore * 100) })}
                    </p>
                    {consistencyFlags && consistencyFlags.length > 0 && consistencyScore < 0.7 && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                        {t('consistencyFlags', { flags: consistencyFlags.join(', ') })}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Top Traits - Secondary importance */}
              {hasBigFiveData && topTraits.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary/60 rounded-full" />
                    {t('topTraits')}
                  </h5>
                  <div className="space-y-2.5 sm:space-y-3">
                    {topTraits.map(trait => (
                      <div
                        key={trait.key}
                        className="p-3 sm:p-4 bg-muted/40 hover:bg-muted/60 rounded-xl border border-border/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                          <span className="text-sm sm:text-base font-medium text-foreground">
                            {trait.label}
                          </span>
                          <span className="text-lg sm:text-xl font-bold text-primary tabular-nums">
                            {trait.value}%
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {getTraitDescription(t, trait.label, trait.value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Task 5: 5-level proficiency chips instead of binary Strength/Developing */}
              {topCompetencies.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-4 bg-emerald-500/60 rounded-full" />
                    {t('strengths')}
                  </h5>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {topCompetencies.map(c => (
                      <span
                        key={c.competencyId}
                        className={`text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium border ${c.interpretation.bgColor} ${c.interpretation.color} ${c.interpretation.borderColor}`}
                      >
                        {c.competencyName}
                        <Badge variant="secondary" className={`ml-1.5 text-[10px] px-1.5 py-0 ${c.interpretation.bgColor} ${c.interpretation.color}`}>
                          {getProficiencyLabel(c.interpretation.level, (key: string) => tResults(key), c.proficiencyLabel)}
                        </Badge>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Developing competencies with 5-level labels */}
              {developingCompetencies.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-4 bg-amber-500/60 rounded-full" />
                    {t('keepDevelopingSkills')}
                  </h5>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {developingCompetencies.map(c => (
                      <span
                        key={c.competencyId}
                        className={`text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium border ${c.interpretation.bgColor} ${c.interpretation.color} ${c.interpretation.borderColor}`}
                      >
                        {c.competencyName}
                        <Badge variant="secondary" className={`ml-1.5 text-[10px] px-1.5 py-0 ${c.interpretation.bgColor} ${c.interpretation.color}`}>
                          {getProficiencyLabel(c.interpretation.level, (key: string) => tResults(key), c.proficiencyLabel)}
                        </Badge>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* No strengths fallback */}
              {topCompetencies.length === 0 && developingCompetencies.length === 0 && competencyScores.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-4 bg-emerald-500/60 rounded-full" />
                    {t('strengths')}
                  </h5>
                  <p className="text-xs sm:text-sm text-muted-foreground italic">
                    {t('keepDevelopingSkills')}
                  </p>
                </div>
              )}

              {/* Task 4: Percentile display */}
              {result.percentile !== undefined && result.percentile !== null && (
                <div className="p-3 sm:p-4 bg-muted/30 rounded-xl border border-border/40">
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    {t.rich('betterThan', {
                      percentage: result.percentile,
                      bold: (chunks) => <span className="font-bold text-foreground text-sm sm:text-base">{chunks}</span>,
                    })}
                  </p>
                </div>
              )}

              {/* Coverage - Compact info row */}
              {hasMappingData && (
                <div className="p-3 sm:p-4 bg-muted/30 rounded-xl border border-border/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider">
                        {t('coverage')}
                      </h5>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {t('mapped', { mapped: metadata.mappedCompetencies, total: metadata.totalCompetencies })}
                      </span>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-foreground tabular-nums">
                      {metadata.coveragePercentage}%
                    </span>
                  </div>
                </div>
              )}

              {/* Development note - Footer */}
              <div className="pt-3 sm:pt-4 border-t border-border/50 mt-auto">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-center">
                  {t('developmentNote')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Pattern Summary - Backend-computed competency categorization */}
        <ProfilePatternSummary extendedMetrics={extendedMetrics} />

        {/* Competency Profile - Mobile-First Unified Component */}
        <CompetencyProfile
          competencies={competencyScores}
          resultId={result.id}
          showPassFail={false}
        />

        {/* Indicator Heatmap - Per-indicator score breakdown */}
        {hasIndicatorData && (
          <Collapsible open={heatmapOpen} onOpenChange={setHeatmapOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer select-none hover:bg-muted/30 transition-colors rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2.5">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                        <Grid3X3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      {t('indicatorBreakdown')}
                    </CardTitle>
                    <ChevronDown
                      className={`h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-transform duration-200 ${
                        heatmapOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                  <CardDescription className="text-xs sm:text-sm">
                    {t('indicatorBreakdownDescription')}
                  </CardDescription>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="px-2 sm:px-6">
                  <ChartErrorBoundary>
                    <IndicatorHeatmap
                      competencies={competencyScores}
                      translationNamespace="results.shared"
                    />
                  </ChartErrorBoundary>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Growth Trajectory - Progress Over Time */}
        {trendData && trendData.length >= 2 ? (
          <Collapsible open={trendOpen} onOpenChange={setTrendOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer select-none hover:bg-muted/30 transition-colors rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2.5">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      {t('growthTrajectory.title')}
                    </CardTitle>
                    <ChevronDown
                      className={`h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-transform duration-200 ${
                        trendOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                  <CardDescription className="text-xs sm:text-sm">
                    {t('growthTrajectory.description')}
                  </CardDescription>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <ChartErrorBoundary>
                    <TrendOverview data={trendData} passingThreshold={0} />
                  </ChartErrorBoundary>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ) : trendData && trendData.length < 2 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2.5">
                <div className="p-1.5 sm:p-2 rounded-lg bg-muted/50">
                  <History className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                </div>
                {t('growthTrajectory.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mb-3 rounded-full bg-muted/50 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
                  {t('growthTrajectory.emptyState')}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Action buttons */}
        <ActionButtonsBar
          templateId={result.templateId}
          resultId={result.id}
          actions={['download_profile', 'retake', 'save_to_profile', 'manager_summary']}
          result={result}
          template={template}
        />
      </div>
    </div>
  );
}
