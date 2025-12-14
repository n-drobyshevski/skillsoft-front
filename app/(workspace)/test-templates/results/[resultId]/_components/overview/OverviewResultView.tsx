'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Lightbulb, Brain, Target, GitCompareArrows, AlertTriangle } from 'lucide-react';
import { BigFiveRadarSimple } from '@/components/charts/BigFiveRadar';
import { BigFiveMappingInsights } from '@/components/charts/BigFiveMappingInsights';
import CompetencyRadarChart, { CompetencyRadarDataPoint } from '@/components/data-display/charts/CompetencyRadarChart';
import { useBigFiveProjectionDetailed, getBigFiveLabels } from '@/hooks/useBigFiveProjection';
import { CompetencyPassportHero } from './CompetencyPassportHero';
import { ProfileCompetenciesCard } from './ProfileCompetenciesCard';
import { CompetencyDetailAccordion } from '../shared/CompetencyDetailAccordion';
import { ActionButtonsBar } from '../shared/ActionButtonsBar';
import { BaseResultViewProps } from '../shared/types';

/**
 * Get personality trait description based on score
 */
function getTraitDescription(trait: string, score: number): string {
  const descriptions: Record<string, { high: string; medium: string; low: string }> = {
    Openness: {
      high: 'You show strong creativity, curiosity, and openness to new experiences and ideas.',
      medium: 'You have a balanced approach to new experiences, combining creativity with practicality.',
      low: 'You prefer established routines and practical, concrete approaches to problems.'
    },
    Conscientiousness: {
      high: 'You demonstrate excellent organization, dependability, and goal-oriented behavior.',
      medium: 'You balance structure with flexibility, achieving goals while adapting to changes.',
      low: 'You prefer spontaneity and flexibility over rigid planning and structure.'
    },
    Extraversion: {
      high: 'You thrive in social settings, drawing energy from interactions with others.',
      medium: 'You comfortably navigate both social situations and solo activities.',
      low: 'You prefer thoughtful, one-on-one interactions and value your independent time.'
    },
    Agreeableness: {
      high: 'You prioritize harmony, cooperation, and concern for others in your interactions.',
      medium: 'You balance empathy with assertiveness, adapting your approach as needed.',
      low: 'You value directness and objectivity, prioritizing results over social harmony.'
    },
    'Emotional Stability': {
      high: 'You demonstrate excellent resilience, calmness, and stress management.',
      medium: 'You handle most situations calmly while acknowledging emotional responses.',
      low: 'You experience emotions deeply and may be more sensitive to stress.'
    }
  };

  const traitDesc = descriptions[trait];
  if (!traitDesc) return '';

  if (score >= 70) return traitDesc.high;
  if (score >= 40) return traitDesc.medium;
  return traitDesc.low;
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
  // Project competencies to Big Five personality profile with detailed contributions
  const { profile: bigFiveProfile, contributions, metadata } = useBigFiveProjectionDetailed(result.competencyScores);
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
    const hasVariance = values.some(v => v !== 50);
    return hasVariance;
  }, [bigFiveProfile]);

  // Check if we have any mapping contributions
  const hasMappingData = metadata.mappedCompetencies > 0;

  // Transform competency scores to radar chart format
  const competencyRadarData: CompetencyRadarDataPoint[] = useMemo(() => {
    return result.competencyScores.map(score => ({
      subject: score.competencyName,
      A: Math.round(score.percentage),
      fullMark: 100
    }));
  }, [result.competencyScores]);

  // Check if we have competency data for the radar
  const hasCompetencyData = competencyRadarData.length >= 3;

  return (
    <div className="min-h-screen bg-muted/30 py-4 md:py-8">
      <div className="container max-w-7xl mx-auto px-4 space-y-4">
        {/* Hero without scores/badges */}
        <CompetencyPassportHero
          templateName={result.templateName}
          completedAt={result.completedAt}
          questionsAnswered={result.questionsAnswered}
          totalQuestions={result.totalQuestions}
          timeSpent={result.totalTimeSeconds}
          competencyCount={result.competencyScores.length}
        />

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Profile Charts with Tabs */}
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">
                Profile Overview
              </CardTitle>
              <CardDescription className="text-sm">
                Your assessment results visualized
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="competency" className="w-full">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="competency" className="flex-1 gap-1.5">
                    <Target className="h-4 w-4" />
                    <span className="hidden sm:inline">Competencies</span>
                    <span className="sm:hidden">Skills</span>
                  </TabsTrigger>
                  <TabsTrigger value="personality" className="flex-1 gap-1.5">
                    <Brain className="h-4 w-4" />
                    <span className="hidden sm:inline">Personality</span>
                    <span className="sm:hidden">Big Five</span>
                  </TabsTrigger>
                  <TabsTrigger value="mapping" className="flex-1 gap-1.5">
                    <GitCompareArrows className="h-4 w-4" />
                    <span className="hidden sm:inline">Mapping</span>
                    <span className="sm:hidden">Map</span>
                  </TabsTrigger>
                </TabsList>

                {/* Competency Radar Tab */}
                <TabsContent value="competency" className="mt-0">
                  {hasCompetencyData ? (
                    <CompetencyRadarChart
                      data={competencyRadarData}
                      passingScore={0}
                      animated={true}
                      className="min-h-[300px]"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[280px] text-center p-6">
                      <div className="w-16 h-16 mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                        <Target className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        At least 3 competencies are required for the radar chart.
                        Complete more assessments to see your profile.
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Personality (Big Five) Tab */}
                <TabsContent value="personality" className="mt-0">
                  {hasBigFiveData ? (
                    <div className="min-h-[300px]">
                      <BigFiveRadarSimple
                        profile={bigFiveProfile}
                        height={300}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[280px] text-center p-6">
                      <div className="w-16 h-16 mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                        <Brain className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Personality profile requires competencies mapped to O*NET standards.
                        Contact your administrator to enable this feature.
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Mapping Insights Tab */}
                <TabsContent value="mapping" className="mt-0">
                  {hasMappingData ? (
                    <div className="min-h-[300px] max-h-[400px] overflow-y-auto">
                      {metadata.mappingConfidence === 'low' && (
                        <div className="flex items-start gap-2 p-3 mb-3 bg-muted/50 rounded-lg border border-muted-foreground/20">
                          <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Limited mapping coverage.</span>{' '}
                            Only {metadata.coveragePercentage}% of competencies have O*NET mappings.
                            Results may not fully represent your personality profile.
                          </div>
                        </div>
                      )}
                      <BigFiveMappingInsights
                        profile={bigFiveProfile}
                        contributions={contributions}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[280px] text-center p-6">
                      <div className="w-16 h-16 mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                        <GitCompareArrows className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No competency mappings available.
                        Competencies need O*NET codes to show Big Five trait contributions.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Profile summary */}
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                <h4 className="font-semibold text-sm text-primary mb-1.5 flex items-center gap-2">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Your Profile Summary
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This assessment provides a comprehensive view of your competencies
                  across {result.competencyScores.length} areas, building your Competency Passport
                  for professional development.
                </p>
              </div>

              {/* Top traits */}
              {hasBigFiveData && topTraits.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Dominant Personality Traits
                  </h5>
                  {topTraits.map(trait => (
                    <div key={trait.key} className="p-2.5 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{trait.label}</span>
                        <span className="text-sm font-bold text-primary tabular-nums">
                          {trait.value}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {getTraitDescription(trait.label, trait.value)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Competency strengths */}
              {result.competencyScores.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Competency Strengths
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {result.competencyScores
                      .filter(c => c.percentage >= 70)
                      .slice(0, 4)
                      .map(c => (
                        <span
                          key={c.competencyId}
                          className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                        >
                          {c.competencyName}
                        </span>
                      ))}
                    {result.competencyScores.filter(c => c.percentage >= 70).length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Continue developing your skills to build clear strengths.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Mapping coverage indicator */}
              {hasMappingData && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Mapping Coverage
                  </h5>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {metadata.mappedCompetencies} of {metadata.totalCompetencies} competencies mapped
                    </span>
                    <span className="font-medium tabular-nums">
                      {metadata.coveragePercentage}%
                    </span>
                  </div>
                </div>
              )}

              {/* Development note */}
              <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t">
                This profile is a snapshot of your current competencies. Regular
                reassessment helps track your professional growth over time.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Competency Profile (neutral colors) */}
        <ProfileCompetenciesCard
          competencies={result.competencyScores}
          showAsProfile={true}
        />

        {/* Detailed breakdown (neutral colors) */}
        <CompetencyDetailAccordion
          competencies={result.competencyScores}
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
