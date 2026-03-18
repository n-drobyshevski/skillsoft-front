'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart3,
  Users,
  UserCheck,
  AlertTriangle,
  Lightbulb,
  Target
} from 'lucide-react';
import { useBigFiveProjection, bigFiveToArray } from '@/hooks/useBigFiveProjection';
import { ChartErrorBoundary } from '@/components/charts/ChartErrorBoundary';
import { TeamFitHero } from './TeamFitHero';
import { TeamFitMultiplierBanner } from './TeamFitMultiplierBanner';
import { TeamFitMetricsPanel } from './TeamFitMetricsPanel';
import { CompetencyProfile } from '../shared/CompetencyProfile';
import { ActionButtonsBar } from '../shared/ActionButtonsBar';
import { BaseResultViewProps } from '../shared/types';
import { LazyTeamSaturationRadar as TeamSaturationRadar, LazyIndicatorHeatmap as IndicatorHeatmap } from '@/lib/lazy-charts';
import { toTeamSaturationData, toTeamSaturationDataSimulated } from '@/lib/result-transformers';
import { isTeamFitMetrics } from '@/types/domain';
import { teamsApi } from '@/services/api/teams';
import { OnboardingRecommendations } from './OnboardingRecommendations';

/**
 * Team Fit Result View for Scenario C (Team Compatibility Analysis).
 *
 * Key features:
 * - Compatibility percentage (blue collaborative palette)
 * - Team context hero section
 * - You vs. team comparison (when team data available)
 * - Complementary skills display
 * - Focus on collaboration rather than individual achievement
 */
export function TeamFitResultView({ result, template }: BaseResultViewProps) {
  const t = useTranslations('results.teamFit');
  const teamId = template.blueprint?.teamId ?? template.blueprint?.team_id;
  const isGoodFit = result.passed ?? false;
  const passingScore = template.passingScore || 70;
  const competencyScores = result.competencyScores ?? [];

  // Resolve team name for display (falls back to UUID)
  const [teamName, setTeamName] = useState<string | undefined>();

  useEffect(() => {
    if (!teamId) return;
    teamsApi.getTeamProfile(teamId)
      .then(profile => setTeamName(profile.teamName))
      .catch(() => {}); // Silently fall back to UUID display
  }, [teamId]);

  // Project competencies to Big Five for personality fit visualization
  const projectedProfile = useBigFiveProjection(competencyScores);

  // Prefer backend-computed Big Five (direct competency mapping) over frontend projection (O*NET approximation)
  const hasBackendBigFive = result.bigFiveProfile && Object.keys(result.bigFiveProfile).length > 0;

  const bigFiveProfile = hasBackendBigFive
    ? {
        OPENNESS: result.bigFiveProfile!['OPENNESS'] ?? result.bigFiveProfile!['Openness'] ?? 50,
        CONSCIENTIOUSNESS: result.bigFiveProfile!['CONSCIENTIOUSNESS'] ?? result.bigFiveProfile!['Conscientiousness'] ?? 50,
        EXTRAVERSION: result.bigFiveProfile!['EXTRAVERSION'] ?? result.bigFiveProfile!['Extraversion'] ?? 50,
        AGREEABLENESS: result.bigFiveProfile!['AGREEABLENESS'] ?? result.bigFiveProfile!['Agreeableness'] ?? 50,
        EMOTIONAL_STABILITY: result.bigFiveProfile!['EMOTIONAL_STABILITY'] ?? result.bigFiveProfile!['Emotional_Stability'] ?? result.bigFiveProfile!['NEUROTICISM'] ?? 50,
      }
    : projectedProfile;

  const bigFiveData = bigFiveToArray(bigFiveProfile);

  // Type-guard for team-fit specific metrics access
  const teamFitMetrics = isTeamFitMetrics(result.extendedMetrics) ? result.extendedMetrics : null;

  // Transform competency scores to team saturation data for radar visualization
  // Prefer real per-competency saturation from backend when available; fall back to simulated for legacy results
  const competencySaturation = teamFitMetrics?.competencySaturation;
  const teamSaturationData = competencySaturation
    ? toTeamSaturationData(competencyScores, { teamSaturation: competencySaturation })
    : toTeamSaturationDataSimulated(competencyScores, 55, 20);

  // Calculate team contribution insights
  const strengths = competencyScores.filter(c => c.percentage >= 70);
  const developing = competencyScores.filter(c => c.percentage < 50);
  const avgScore = competencyScores.length > 0
    ? Math.round(competencyScores.reduce((sum, c) => sum + c.percentage, 0) / competencyScores.length)
    : 0;
  const complementary = strengths.slice(0, 3);
  const gapAreas = developing.slice(0, 3);
  const insights = { strengths, developing, avgScore, complementary, gapAreas };

  const hasBigFiveData = hasBackendBigFive || Object.values(projectedProfile).some(v => v !== 50);

  return (
    <div className="min-h-screen bg-muted/30 py-3 sm:py-4 md:py-8">
      <div className="container max-w-7xl mx-auto px-2 sm:px-4 space-y-3 sm:space-y-4">
        {/* Hero with team context and compatibility score */}
        <TeamFitHero
          templateName={result.templateName}
          completedAt={result.completedAt}
          overallPercentage={result.overallPercentage ?? 0}
          passed={isGoodFit}
          teamId={teamId}
          teamName={teamName}
          questionsAnswered={result.questionsAnswered}
          totalQuestions={result.totalQuestions}
          timeSpent={result.totalTimeSeconds}
        />

        {/* Multiplier banner (score boost/penalty explanation) */}
        {teamFitMetrics && teamFitMetrics.teamFitMultiplier !== 1.0 && (
          <TeamFitMultiplierBanner
            teamFitMultiplier={teamFitMetrics.teamFitMultiplier}
            diversityRatio={teamFitMetrics.diversityRatio}
            saturationRatio={teamFitMetrics.saturationRatio}
          />
        )}

        {/* Extended metrics overview panel */}
        {teamFitMetrics && (
          <TeamFitMetricsPanel extendedMetrics={teamFitMetrics} />
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 animate-fadeInUp-2">
          {/* Team Saturation Radar */}
          <Card className="h-full">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <CardTitle className="text-sm sm:text-lg font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                {t('title')}
              </CardTitle>
              <CardDescription className="text-[10px] sm:text-sm">
                {t('subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {teamSaturationData.length >= 3 ? (
                <ChartErrorBoundary>
                  <TeamSaturationRadar
                    data={teamSaturationData}
                    showCandidate={true}
                    showTeam={true}
                    animate={true}
                  />
                </ChartErrorBoundary>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[200px] sm:min-h-[280px] text-center p-4 sm:p-6">
                  <Lightbulb className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground/50 mb-2 sm:mb-3" />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t('needMoreCompetencies')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Insights - Enhanced Visual Hierarchy */}
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2.5">
                <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                </div>
                {t('insights')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-4 sm:space-y-5 px-4 sm:px-6">
              {/* Team context - Primary context */}
              {teamId && (
                <div className="p-3 sm:p-4 bg-blue-500/5 rounded-xl border border-blue-500/15">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/15 shrink-0">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm sm:text-base font-medium text-foreground">{t('teamAnalysis')}</span>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        Team: <code className="text-blue-600 dark:text-blue-400 font-mono">{teamId}</code>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Fit summary - Primary focal point */}
              {isGoodFit ? (
                <div className="p-3 sm:p-4 bg-linear-to-br from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/15 shrink-0">
                      <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm sm:text-base text-blue-800 dark:text-blue-300 mb-1">
                        {t('strongFit')}
                      </h4>
                      <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                        {t('strongFitDescription')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 sm:p-4 bg-linear-to-br from-slate-500/10 to-slate-500/5 rounded-xl border border-slate-500/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-500/15 shrink-0">
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-300 mb-1">
                        {t('alignmentNeeded')}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-400 leading-relaxed">
                        {t('alignmentNeededDescription')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Complementary skills - Secondary importance */}
              {insights.complementary.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500/60 rounded-full" />
                    {t('youBring')}
                  </h5>
                  <div className="space-y-2 sm:space-y-2.5">
                    {insights.complementary.map(c => (
                      <div
                        key={c.competencyId}
                        className="flex items-center justify-between p-2.5 sm:p-3 bg-blue-500/5 hover:bg-blue-500/10 rounded-xl border border-blue-500/15 gap-3 transition-colors"
                      >
                        <span className="text-xs sm:text-sm font-medium text-foreground">
                          {c.competencyName}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400 tabular-nums shrink-0">
                          {Math.round(c.percentage)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Development areas - Tertiary */}
              {insights.gapAreas.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-4 bg-slate-400/60 rounded-full" />
                    {t('growthAreas')}
                  </h5>
                  <div className="space-y-2 sm:space-y-2.5">
                    {insights.gapAreas.map(c => (
                      <div
                        key={c.competencyId}
                        className="flex items-center justify-between p-2.5 sm:p-3 bg-muted/40 hover:bg-muted/60 rounded-xl border border-border/50 gap-3 transition-colors"
                      >
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                          {c.competencyName}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-muted-foreground tabular-nums shrink-0">
                          {Math.round(c.percentage)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collaboration note - Footer */}
              <div className="pt-3 sm:pt-4 border-t border-border/50 mt-auto">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-center">
                  {t('collaborationNote')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Personality Fit Section (if Big Five data available) */}
        {hasBigFiveData && (
          <Card className="animate-fadeInUp-3">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <CardTitle className="text-sm sm:text-lg font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                <span className="truncate">{t('personality')}</span>
              </CardTitle>
              <CardDescription className="text-[10px] sm:text-sm">
                {t('personalityDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <ChartErrorBoundary>
                <div className="grid grid-cols-5 gap-1 sm:gap-4">
                  {bigFiveData.map(({ trait, value }) => (
                    <div
                      key={trait}
                      className="text-center p-1.5 sm:p-4 bg-muted/30 rounded-lg border min-w-0"
                    >
                      <div className="text-[8px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 sm:mb-2 truncate">
                        {trait.slice(0, 4)}
                      </div>
                      <div className="relative w-10 h-10 sm:w-16 sm:h-16 mx-auto mb-1 sm:mb-2">
                        <svg className="w-10 h-10 sm:w-16 sm:h-16 transform -rotate-90" viewBox="0 0 64 64">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-muted/30"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - value / 100)}`}
                            className="text-blue-500 transition-all duration-1000"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs sm:text-lg font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                            {value}
                          </span>
                        </div>
                      </div>
                      <div className="text-[8px] sm:text-xs text-muted-foreground hidden sm:block">
                        {value >= 70 ? t('high') : value >= 40 ? t('moderate') : t('low')}
                      </div>
                    </div>
                  ))}
                </div>
              </ChartErrorBoundary>
            </CardContent>
          </Card>
        )}

        {/* Indicator Heatmap - per-indicator score breakdown */}
        {competencyScores.some(c => c.indicatorScores && c.indicatorScores.length > 0) && (
          <Card className="animate-fadeInUp-3">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <CardTitle className="text-sm sm:text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                {t('heatmap.title')}
              </CardTitle>
              <CardDescription className="text-[10px] sm:text-sm">
                {t('heatmap.description')}
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
        <CompetencyProfile
          competencies={competencyScores}
          resultId={result.id}
          showPassFail={true}
          passingScore={passingScore}
        />

        {/* Onboarding Recommendations */}
        <OnboardingRecommendations
          competencyScores={competencyScores}
          bigFiveProfile={bigFiveProfile}
          teamMetrics={teamFitMetrics}
        />

        {/* Action buttons */}
        <ActionButtonsBar
          templateId={result.templateId}
          resultId={result.id}
          actions={['team_dashboard', 'retake', 'share_with_team', 'manager_summary']}
          result={result}
          template={template}
        />
      </div>
    </div>
  );
}
