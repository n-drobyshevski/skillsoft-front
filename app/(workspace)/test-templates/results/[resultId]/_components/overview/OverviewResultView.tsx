'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Lightbulb, Brain, Target, GitCompareArrows, AlertTriangle } from 'lucide-react';
import { LazyBigFiveRadarSimple as BigFiveRadarSimple, LazyCompetencyRadarChart as CompetencyRadarChart } from '@/lib/lazy-charts';
import type { CompetencyRadarDataPoint } from '@/components/data-display/charts/CompetencyRadarChart';
import { BigFiveMappingInsights } from '@/components/charts/BigFiveMappingInsights';
import { ChartErrorBoundary } from '@/components/charts/ChartErrorBoundary';
import { useBigFiveProjectionDetailed, getBigFiveLabels } from '@/hooks/useBigFiveProjection';
import { CompetencyPassportHero } from './CompetencyPassportHero';
import { CompetencyProfile } from '../shared/CompetencyProfile';
import { ActionButtonsBar } from '../shared/ActionButtonsBar';
import { BaseResultViewProps } from '../shared/types';

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
 */
export function OverviewResultView({ result, template }: BaseResultViewProps) {
  const t = useTranslations('template.resultsView.overview');
  const competencyScores = result.competencyScores ?? [];

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
  const competencyRadarData: CompetencyRadarDataPoint[] = useMemo(() => {
    return competencyScores.map(score => ({
      subject: score.competencyName,
      A: Math.round(score.percentage),
      fullMark: 100
    }));
  }, [competencyScores]);

  // Check if we have competency data for the radar
  const hasCompetencyData = competencyRadarData.length >= 3;

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

              {/* Strengths - Tertiary importance */}
              {competencyScores.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-4 bg-emerald-500/60 rounded-full" />
                    {t('strengths')}
                  </h5>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {competencyScores
                      .filter(c => c.percentage >= 70)
                      .slice(0, 3)
                      .map(c => (
                        <span
                          key={c.competencyId}
                          className="text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full font-medium border border-emerald-500/20"
                        >
                          {c.competencyName}
                        </span>
                      ))}
                    {competencyScores.filter(c => c.percentage >= 70).length === 0 && (
                      <p className="text-xs sm:text-sm text-muted-foreground italic">
                        {t('keepDevelopingSkills')}
                      </p>
                    )}
                  </div>
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

        {/* Competency Profile - Mobile-First Unified Component */}
        <CompetencyProfile
          competencies={competencyScores}
          resultId={result.id}
          showPassFail={false}
        />

        {/* Action buttons */}
        <ActionButtonsBar
          templateId={result.templateId}
          resultId={result.id}
          actions={['download_profile', 'retake', 'save_to_profile']}
        />
      </div>
    </div>
  );
}
