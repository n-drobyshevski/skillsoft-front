'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  BarChart3,
  Users,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useBigFiveProjection, bigFiveToArray } from '@/hooks/useBigFiveProjection';
import { ChartErrorBoundary } from '@/components/charts/ChartErrorBoundary';
import { TeamFitMultiplierBanner } from './TeamFitMultiplierBanner';
import { TeamFitMetricsPanel } from './TeamFitMetricsPanel';
import { CompetencyProfile } from '../shared/CompetencyProfile';
import { BaseResultViewProps } from '../shared/types';
import { HeroStrip } from '../shared/HeroStrip';
import { ResultTabs } from '../shared/ResultTabs';
import { InsightsBar } from '../shared/InsightsBar';
import { DashboardPanel } from '../shared/DashboardPanel';
import { MetricCards } from '../shared/MetricCards';
import { LazyTeamSaturationRadar as TeamSaturationRadar, LazyIndicatorHeatmap as IndicatorHeatmap } from '@/lib/lazy-charts';
import { toTeamSaturationData, toTeamSaturationDataSimulated } from '@/lib/result-transformers';
import { isTeamFitMetrics } from '@/types/domain';
import { teamsApi } from '@/services/api/teams';
import { OnboardingRecommendations } from './OnboardingRecommendations';

/**
 * Team Fit Result View — Direction B "Command Center" Dashboard.
 *
 * Seen by team leads evaluating candidate compatibility. Blue accent.
 * Replaces TeamFitHero + ActionButtonsBar with HeroStrip + ResultTabs + InsightsBar.
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
    <div className="w-full max-w-[1600px] mx-auto">
      <HeroStrip
        goal="TEAM_FIT"
        templateName={result.templateName}
        completedAt={result.completedAt}
        totalTimeSeconds={result.totalTimeSeconds}
        questionsAnswered={result.questionsAnswered}
        totalQuestions={result.totalQuestions}
        overallPercentage={result.overallPercentage}
        passed={result.passed}
        statusLabel={isGoodFit ? 'Compatible' : 'Needs Adaptation'}
        statusVariant={isGoodFit ? 'info' : 'neutral'}
        metadata={[
          ...(teamId ? [{ icon: Users, label: `Team: ${teamName || teamId}` }] : []),
          ...(teamFitMetrics?.teamFitMultiplier && teamFitMetrics.teamFitMultiplier !== 1.0
            ? [{ icon: TrendingUp, label: `${teamFitMetrics.teamFitMultiplier.toFixed(2)}x synergy` }] : []),
        ]}
        actions={['team_dashboard', 'share_with_team', 'manager_summary']}
        result={result}
        template={template}
      />

      <ResultTabs
        tabs={[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'saturation', label: 'Saturation', icon: Users },
          { id: 'comparison', label: 'Comparison', icon: UserCheck },
          { id: 'competencies', label: 'Competencies', icon: Target },
          { id: 'onboarding', label: 'Onboarding', icon: Lightbulb },
        ]}
        accentColor="blue"
      />

      <InsightsBar
        insights={[
          ...(teamFitMetrics?.gapCount ? [{
            id: 'gaps',
            icon: CheckCircle2,
            text: `Fills ${teamFitMetrics.gapCount} team gaps`,
            variant: 'success' as const,
          }] : []),
          ...(teamFitMetrics?.saturationCount ? [{
            id: 'redundant',
            icon: AlertTriangle,
            text: `${teamFitMetrics.saturationCount} saturated overlap${teamFitMetrics.saturationCount > 1 ? 's' : ''}`,
            variant: 'warning' as const,
          }] : []),
          ...(teamFitMetrics?.diversityRatio !== undefined ? [{
            id: 'diversity',
            icon: Users,
            text: `Diversity ratio: ${teamFitMetrics.diversityRatio.toFixed(2)}`,
            variant: 'info' as const,
          }] : []),
        ]}
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">

        {/* ------------------------------------------------------------------ */}
        {/* Section: Overview                                                   */}
        {/* ------------------------------------------------------------------ */}
        <section id="section-overview" className="space-y-4">
          {teamFitMetrics && (
            <MetricCards
              metrics={[
                { label: 'Gaps Filled', value: teamFitMetrics.gapCount ?? 0, icon: CheckCircle2, variant: 'success' },
                { label: 'Saturated', value: teamFitMetrics.saturationCount ?? 0, icon: AlertTriangle, variant: 'warning' },
                { label: 'Diversity Ratio', value: teamFitMetrics.diversityRatio?.toFixed(2) ?? 'N/A', icon: Users, variant: 'info' },
              ]}
            />
          )}
          {teamFitMetrics && teamFitMetrics.teamFitMultiplier !== 1.0 && (
            <TeamFitMultiplierBanner
              teamFitMultiplier={teamFitMetrics.teamFitMultiplier}
              diversityRatio={teamFitMetrics.diversityRatio}
              saturationRatio={teamFitMetrics.saturationRatio}
            />
          )}
          {teamFitMetrics && <TeamFitMetricsPanel extendedMetrics={teamFitMetrics} />}
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Section: Saturation                                                 */}
        {/* ------------------------------------------------------------------ */}
        <section id="section-saturation">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Team Saturation Radar */}
            <DashboardPanel title="Team Saturation" icon={Users} iconVariant="info">
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
            </DashboardPanel>

            {/* Your Contribution */}
            <DashboardPanel title="Your Contribution" icon={UserCheck} iconVariant="success">
              <div className="space-y-4 sm:space-y-5">
                {insights.complementary.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      What You Bring
                    </h5>
                    <div className="space-y-2 sm:space-y-2.5">
                      {insights.complementary.map(c => (
                        <div
                          key={c.competencyId}
                          className="flex items-center justify-between bg-blue-500/5 border border-blue-500/15 rounded-xl p-2.5 sm:p-3 gap-3 transition-colors hover:bg-blue-500/10"
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

                {insights.gapAreas.length > 0 && (
                  <>
                    {insights.complementary.length > 0 && (
                      <div className="border-t border-border my-3" />
                    )}
                    <div className="space-y-3">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Growth Areas
                      </h5>
                      <div className="space-y-2 sm:space-y-2.5">
                        {insights.gapAreas.map(c => (
                          <div
                            key={c.competencyId}
                            className="flex items-center justify-between bg-muted/40 border border-border/50 rounded-xl p-2.5 sm:p-3 gap-3 transition-colors hover:bg-muted/60"
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
                  </>
                )}
              </div>
            </DashboardPanel>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Section: Comparison — Personality + Indicator Heatmap              */}
        {/* ------------------------------------------------------------------ */}
        <section id="section-comparison" className="space-y-4 sm:space-y-6">
          {hasBigFiveData && (
            <DashboardPanel title="Personality Fit" icon={Target} iconVariant="info">
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
            </DashboardPanel>
          )}

          {competencyScores.some(c => c.indicatorScores && c.indicatorScores.length > 0) && (
            <DashboardPanel title="Indicator Breakdown" icon={BarChart3}>
              <ChartErrorBoundary>
                <IndicatorHeatmap competencies={competencyScores} />
              </ChartErrorBoundary>
            </DashboardPanel>
          )}
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Section: Competencies                                               */}
        {/* ------------------------------------------------------------------ */}
        <section id="section-competencies">
          <CompetencyProfile
            competencies={competencyScores}
            resultId={result.id}
            showPassFail={true}
            passingScore={passingScore}
          />
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Section: Onboarding                                                 */}
        {/* ------------------------------------------------------------------ */}
        <section id="section-onboarding">
          <OnboardingRecommendations
            competencyScores={competencyScores}
            bigFiveProfile={bigFiveProfile}
            teamMetrics={teamFitMetrics}
          />
        </section>

      </div>
    </div>
  );
}
