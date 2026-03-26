'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Brain,
  Sparkles,
  ArrowUp,
  HelpCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useBigFiveProjection, getBigFiveLabels } from '@/hooks/useBigFiveProjection';
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
import { ComparisonRadarChart } from '../shared/ComparisonRadarChart';
import { toTeamSaturationData, toTeamSaturationDataSimulated } from '@/lib/result-transformers';
import type { TeamSaturationDataPoint } from '@/types/results';
import { analyzeTeamFit } from '@/components/results/TeamSaturationRadar';
import { isTeamFitMetrics } from '@/types/domain';
import { teamsApi } from '@/services/api/teams';
import { OnboardingRecommendations } from './OnboardingRecommendations';
import { useLensStore } from '@/store/lens-store';
import { selectActiveLens } from '@/store/lens-selectors';

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

  // Lens-based visibility: hide manager-only panels/actions for user lens
  const activeLens = useLensStore(selectActiveLens);
  const isElevated = activeLens !== 'user';

  // Resolve team name for display (falls back to UUID)
  const [teamName, setTeamName] = useState<string | undefined>();

  useEffect(() => {
    if (!teamId || !isElevated) return;
    teamsApi.getTeamProfile(teamId)
      .then(profile => setTeamName(profile.teamName))
      .catch(() => {}); // Silently fall back to UUID display
  }, [teamId, isElevated]);

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

  // Team fit analysis for the contribution card (gaps filled, compatibility, growth areas)
  const teamFitAnalysis = useMemo(() => analyzeTeamFit(teamSaturationData), [teamSaturationData]);

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
        statusLabel={isGoodFit ? t('statusCompatible') : t('statusNeedsAdaptation')}
        statusVariant={isGoodFit ? 'info' : 'neutral'}
        metadata={[
          ...(teamId ? [{ icon: Users, label: t('teamLabel', { name: teamName || teamId }) }] : []),
          ...(teamFitMetrics?.teamFitMultiplier && teamFitMetrics.teamFitMultiplier !== 1.0
            ? [{ icon: TrendingUp, label: t('synergyLabel', { value: teamFitMetrics.teamFitMultiplier.toFixed(2) }) }] : []),
        ]}
        actions={isElevated ? ['team_dashboard', 'share_with_team', 'manager_summary'] : ['team_dashboard']}
        result={result}
        template={template}
      />

      <ResultTabs
        tabs={[
          { id: 'overview', label: t('tabOverview'), icon: BarChart3 },
          { id: 'saturation', label: t('tabSaturation'), icon: Users },
          { id: 'comparison', label: t('tabComparison'), icon: UserCheck },
          { id: 'competencies', label: t('tabCompetencies'), icon: Target },
          ...(isElevated ? [{ id: 'onboarding', label: t('tabOnboarding'), icon: Lightbulb }] : []),
        ]}
        accentColor="blue"
      />

      <InsightsBar
        dismissible={false}
        insights={[
          ...(teamFitMetrics?.gapCount ? [{
            id: 'gaps',
            icon: CheckCircle2,
            text: t('insightGapsFilled', { count: teamFitMetrics.gapCount }),
            variant: 'success' as const,
          }] : []),
          ...(teamFitMetrics?.saturationCount ? [{
            id: 'redundant',
            icon: AlertTriangle,
            text: t('insightSaturatedOverlap', { count: teamFitMetrics.saturationCount }),
            variant: 'warning' as const,
          }] : []),
          ...(teamFitMetrics?.diversityRatio !== undefined ? [{
            id: 'diversity',
            icon: Users,
            text: t('insightDiversityRatio', { value: teamFitMetrics.diversityRatio.toFixed(2) }),
            variant: 'info' as const,
          }] : []),
        ]}
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">

        {/* ------------------------------------------------------------------ */}
        {/* Section: Overview                                                   */}
        {/* ------------------------------------------------------------------ */}
        <section id="section-overview" className="space-y-4">
          {isElevated && teamFitMetrics && (
            <MetricCards
              metrics={[
                { label: t('metricGapsFilled'), value: teamFitMetrics.gapCount ?? 0, sublabel: 'skills', icon: CheckCircle2, variant: 'success', tooltip: t('tooltips.gapsFilled') },
                { label: t('metricSaturated'), value: teamFitMetrics.saturationCount ?? 0, sublabel: 'overlaps', icon: AlertTriangle, variant: 'warning', tooltip: t('tooltips.saturated') },
                { label: t('metricDiversityRatio'), value: teamFitMetrics.diversityRatio?.toFixed(2) ?? 'N/A', sublabel: 'ratio', icon: Users, variant: 'info', tooltip: t('tooltips.diversityRatio') },
              ]}
            />
          )}
          {isElevated && teamFitMetrics && teamFitMetrics.teamFitMultiplier !== 1.0 && (
            <TeamFitMultiplierBanner
              teamFitMultiplier={teamFitMetrics.teamFitMultiplier}
              diversityRatio={teamFitMetrics.diversityRatio}
              saturationRatio={teamFitMetrics.saturationRatio}
            />
          )}
          {isElevated && teamFitMetrics && <TeamFitMetricsPanel extendedMetrics={teamFitMetrics} />}
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Section: Saturation                                                 */}
        {/* ------------------------------------------------------------------ */}
        <section id="section-saturation" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Team Saturation + Personality — tabbed card */}
            <SaturationCard
              teamSaturationData={teamSaturationData}
              hasBigFiveData={hasBigFiveData}
              bigFiveProfile={bigFiveProfile}
              t={t}
            />

            {/* Your Contribution */}
            <DashboardPanel title={t('sectionYourContribution')} icon={UserCheck} iconVariant="success" tooltip={t('tooltips.yourContribution')}>
              <div className="space-y-4 sm:space-y-5">
                {/* Gaps You Fill */}
                {teamFitAnalysis.gapsFilledCompetencies.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      {t('radar.gapsYouFill')}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-manipulation" aria-label="Help">
                            <HelpCircle className="w-3 h-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[240px]">{t('tooltips.gapsYouFill')}</TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {teamFitAnalysis.gapsFilledCompetencies.map((comp) => (
                        <Badge
                          key={comp.competencyId}
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-xs"
                        >
                          <ArrowUp className="w-3 h-3 mr-1" />
                          {comp.competencyName}
                          <span className="ml-1 opacity-70">
                            +{Math.round(comp.gapMagnitude || 0)}%
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center p-2 bg-primary/5 rounded-lg cursor-help">
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                          {t('radar.compatibility')}
                        </div>
                        <div className="text-sm font-bold tabular-nums text-primary">
                          {teamFitAnalysis.compatibilityScore}%
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px]">{t('tooltips.compatibility')}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center p-2 bg-emerald-500/10 rounded-lg cursor-help">
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                          {t('radar.gapsFilled')}
                        </div>
                        <div className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                          {teamFitAnalysis.gapsFilledCompetencies.length}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px]">{t('tooltips.statGapsFilled')}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center p-2 bg-muted/50 rounded-lg cursor-help">
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                          {t('radar.strengths')}
                        </div>
                        <div className="text-sm font-bold tabular-nums text-foreground">
                          {teamFitAnalysis.relativeStrengths.length}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px]">{t('tooltips.statStrengths')}</TooltipContent>
                  </Tooltip>
                </div>

                {/* Divider */}
                <div className="border-t border-border" />

                {/* What You Bring */}
                {insights.complementary.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t('whatYouBring')}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-manipulation" aria-label="Help">
                            <HelpCircle className="w-3 h-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[240px]">{t('tooltips.whatYouBring')}</TooltipContent>
                      </Tooltip>
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

                {/* Growth Areas */}
                {teamFitAnalysis.developmentAreas.length > 0 && (
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      <Target className="w-3.5 h-3.5" />
                      {t('radar.growthAreas')}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-manipulation" aria-label="Help">
                            <HelpCircle className="w-3 h-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[240px]">{t('tooltips.growthAreas')}</TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {teamFitAnalysis.developmentAreas.slice(0, 3).map((area) => (
                        <Badge
                          key={area}
                          variant="outline"
                          className="text-xs bg-background"
                        >
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DashboardPanel>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Section: Comparison — Indicator Heatmap                            */}
        {/* ------------------------------------------------------------------ */}
        {competencyScores.some(c => c.indicatorScores && c.indicatorScores.length > 0) && (
          <section id="section-comparison">
            <DashboardPanel title={t('sectionIndicatorBreakdown')} icon={BarChart3} tooltip={t('tooltips.indicatorBreakdown')}>
              <ChartErrorBoundary>
                <IndicatorHeatmap competencies={competencyScores} />
              </ChartErrorBoundary>
            </DashboardPanel>
          </section>
        )}

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
        {isElevated && (
          <section id="section-onboarding">
            <OnboardingRecommendations
              competencyScores={competencyScores}
              bigFiveProfile={bigFiveProfile}
              teamMetrics={teamFitMetrics}
            />
          </section>
        )}

      </div>
    </div>
  );
}

// ============================================================================
// SaturationCard — single card with inner Skills / Personality tab switcher
// ============================================================================

type RadarTab = 'skills' | 'personality';

interface SaturationCardProps {
  teamSaturationData: TeamSaturationDataPoint[];
  hasBigFiveData: boolean;
  bigFiveProfile: { OPENNESS: number; CONSCIENTIOUSNESS: number; EXTRAVERSION: number; AGREEABLENESS: number; EMOTIONAL_STABILITY: number };
  t: ReturnType<typeof useTranslations>;
}

function SaturationCard({ teamSaturationData, hasBigFiveData, bigFiveProfile, t }: SaturationCardProps) {
  const [activeTab, setActiveTab] = useState<RadarTab>('skills');

  const tabs: { id: RadarTab; label: string; icon: typeof Users }[] = [
    { id: 'skills', label: t('sectionTeamSaturation'), icon: Users },
    { id: 'personality', label: t('sectionPersonalityFit'), icon: Brain },
  ];

  return (
    <DashboardPanel
      title={tabs.find(tab => tab.id === activeTab)!.label}
      icon={tabs.find(tab => tab.id === activeTab)!.icon}
      iconVariant="info"
      tooltip={activeTab === 'skills' ? t('tooltips.teamSaturation') : t('tooltips.personalityFit')}
    >
      {/* Inner tab switcher */}
      <div className="flex gap-1 p-0.5 mb-4 bg-muted/50 rounded-lg w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                transition-all duration-150 touch-manipulation
                ${isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
              aria-pressed={isActive}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'skills' && (
        teamSaturationData.length >= 3 ? (
          <ChartErrorBoundary>
            <TeamSaturationRadar
              data={teamSaturationData}
              showCandidate={true}
              showTeam={true}
              animate={true}
              compact={true}
            />
          </ChartErrorBoundary>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[200px] sm:min-h-[280px] text-center p-4 sm:p-6">
            <Lightbulb className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground/50 mb-2 sm:mb-3" />
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('needMoreCompetencies')}
            </p>
          </div>
        )
      )}

      {activeTab === 'personality' && (
        hasBigFiveData ? (
          <div className="space-y-4">
            {/* Header matching Team Saturation tab style */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t('personality')}</span>
              </div>
              {(() => {
                const labels = getBigFiveLabels();
                const entries = Object.entries(bigFiveProfile) as [keyof typeof bigFiveProfile, number][];
                const dominant = entries.reduce((a, b) => b[1] > a[1] ? b : a);
                return (
                  <Badge variant="outline" className="text-xs bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20">
                    {labels[dominant[0]]}
                  </Badge>
                );
              })()}
            </div>
            <ChartErrorBoundary>
              <ComparisonRadarChart
                data={(() => {
                  const labels = getBigFiveLabels();
                  return (Object.entries(bigFiveProfile) as [keyof typeof bigFiveProfile, number][]).map(([key, value]) => ({
                    label: labels[key],
                    primary: Math.round(value),
                    secondary: 50,
                  }));
                })()}
                className="max-w-[400px] mx-auto"
                primary={{
                  label: t('radar.you'),
                  stroke: '#8b5cf6',
                  fill: 'rgba(139,92,246,0.10)',
                  dotFill: '#a78bfa',
                  dotStroke: '#212121',
                }}
                secondary={{
                  label: t('radar.baseline'),
                }}
              />
            </ChartErrorBoundary>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[200px] sm:min-h-[280px] text-center p-4 sm:p-6">
            <Brain className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground/50 mb-2 sm:mb-3" />
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('needMoreCompetencies')}
            </p>
          </div>
        )
      )}
    </DashboardPanel>
  );
}
