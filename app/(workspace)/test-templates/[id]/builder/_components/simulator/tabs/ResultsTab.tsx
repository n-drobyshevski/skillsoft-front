'use client';

/**
 * ResultsTab
 *
 * Unified results tab merging SimulatedResultsTab and StrategyInsightsTab into a
 * single coherent view. Renders in this order:
 *
 * 1. PersonaIndicator  — which candidate profile is being simulated
 * 2. ScoreSummary      — hero score card with pass/fail badge and progress bar
 * 3. Strategy insight  — branched by strategy:
 *      UNIVERSAL_BASELINE   → SimulationCombinedRadar + info card (compact, single radar)
 *      TARGETED_FIT         → JobFitAlignmentCard (richer than legacy JobAlignmentSection)
 *      DYNAMIC_GAP_ANALYSIS → TeamComparisonCard + complementary skills & growth area badges
 * 4. StrengthsGaps     — top-3 strengths / growth areas side-by-side
 * 5. CompetencyScores  — full competency breakdown list with pass/fail icons
 * 6. Disclaimer        — simulated data notice
 */

import React, { memo, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Shuffle,
  Target,
  AlertCircle,
  FileCheck,
  ClipboardList,
  LayoutGrid,
  Brain,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Strategy, STRATEGY_CONFIG, personaConfig } from '../strategy-context';
import { SimulationResult, SimulationProfile, Difficulty } from '../types';
import {
  generateSimulatedResults,
  SimulatedResultsData,
  SimulatedCompetencyScore,
  getScoreColorClass,
  getProgressBarColor,
} from '../utils/generateSimulatedResults';
import { CompetencyDistribution } from '../utils/transformSimulationToRadar';
import { SimulationCombinedRadar } from '../components/SimulationCombinedRadar';
import { JobFitAlignmentCard } from '../JobFitAlignmentCard';
import { TeamComparisonCard } from '../TeamComparisonCard';

// ============================================
// PROPS
// ============================================

interface ResultsTabProps {
  result: SimulationResult;
  strategy: Strategy;
  persona: SimulationProfile;
  passingScore: number;
  onetSocCode?: string;
  teamId?: string;
  teamName?: string;
}

// ============================================
// HELPER: Extract competency data with fallback
// ============================================

/**
 * Extracts competency distribution data from simulation result,
 * with fallback from distributionByCompetency to composition field.
 */
function extractCompetencyData(result: SimulationResult): CompetencyDistribution[] {
  // Primary source: distributionByCompetency (full data)
  if (result?.distributionByCompetency?.length) {
    return result.distributionByCompetency;
  }

  // Fallback: composition (legacy format - name -> count mapping)
  if (result?.composition && Object.keys(result.composition).length > 0) {
    return Object.entries(result.composition).map(([name, questionCount], index) => ({
      competencyId: `comp-${index}`,
      competencyName: name,
      questionCount: questionCount as number,
      weight: 1, // Default equal weight when using legacy format
      difficultyMix: {
        FOUNDATIONAL: 0,
        INTERMEDIATE: questionCount as number,
        ADVANCED: 0,
        EXPERT: 0,
      } as Record<Difficulty, number>,
    }));
  }

  return [];
}

// ============================================
// 1. PERSONA INDICATOR
// (source: SimulatedResultsTab lines 504–531)
// ============================================

interface PersonaIndicatorProps {
  persona: SimulationProfile;
}

function PersonaIndicator({ persona }: PersonaIndicatorProps) {
  const t = useTranslations('builder.simulator');
  const config = personaConfig[persona];
  const IconMap: Record<string, React.ElementType> = {
    Sparkles,
    Shuffle,
    TrendingDown,
  };
  const Icon = IconMap[config.icon] ?? Sparkles;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border',
        config.bgColor
      )}
    >
      <Icon className={cn('h-3.5 w-3.5', config.color)} aria-hidden="true" />
      <span className={config.color}>
        {t('personas.candidate', { persona: t(config.labelKey as Parameters<typeof t>[0]) })}
      </span>
    </div>
  );
}

// ============================================
// 2. SCORE SUMMARY CARD
// (source: SimulatedResultsTab lines 536–597)
// ============================================

interface ScoreSummaryProps {
  data: SimulatedResultsData;
  strategy: Strategy;
}

function ScoreSummary({ data, strategy }: ScoreSummaryProps) {
  const t = useTranslations('builder.simulator');
  const config = STRATEGY_CONFIG[strategy];
  const passedLabel = data.passed ? t('score.pass') : t('score.belowThreshold');
  const PassedIcon = data.passed ? CheckCircle2 : XCircle;

  return (
    <Card className={cn('border', config.border)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center justify-center h-12 w-12 rounded-xl',
                config.iconBg
              )}
            >
              <span className={cn('text-xl font-bold', config.iconText)}>
                {Math.round(data.overallScore)}%
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">{t('score.simulatedScore')}</p>
              <p className="text-xs text-muted-foreground">
                {t('simulatedResults.threshold', { score: data.passingThreshold })}
              </p>
            </div>
          </div>

          <Badge
            variant={data.passed ? 'default' : 'destructive'}
            className="gap-1"
          >
            <PassedIcon className="h-3 w-3" />
            {passedLabel}
          </Badge>
        </div>

        <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
          <div
            className={cn(
              'h-full transition-all',
              getProgressBarColor(data.overallScore, data.passingThreshold)
            )}
            style={{ width: `${data.overallScore}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{t('simulatedResults.totalQuestions', { count: data.totalQuestions })}</span>
          <span>{t('simulatedResults.estimatedDuration', { minutes: data.estimatedDuration })}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// 3a. STRATEGY INSIGHT: UNIVERSAL_BASELINE
// (source: StrategyInsightsTab UniversalBaselineInsights)
// Uses SimulationCombinedRadar — single compact radar replacing the two standalone charts
// ============================================

interface UniversalBaselineInsightsProps {
  result: SimulationResult;
}

function UniversalBaselineInsights({ result }: UniversalBaselineInsightsProps) {
  const t = useTranslations('builder.simulator');
  const config = STRATEGY_CONFIG.UNIVERSAL_BASELINE;
  const competencyData = useMemo(() => extractCompetencyData(result), [result]);

  return (
    <div className="space-y-3">
      {/* Competency & Personality Combined Radar */}
      <div className={cn('p-3 rounded-xl border', config.border, config.bg)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ClipboardList
              className={cn('h-4 w-4', config.iconText)}
              aria-hidden="true"
            />
            <span className="text-sm font-medium">{t('sections.assessmentProfile')}</span>
          </div>
          <Badge variant="outline" className="text-[10px] tabular-nums gap-1">
            <LayoutGrid className="h-3 w-3" aria-hidden="true" />
            {competencyData.length} {t('score.competencies')}
          </Badge>
        </div>

        <SimulationCombinedRadar
          distributionByCompetency={competencyData}
          showBigFive={true}
          maxCompetencies={6}
          variant="default"
        />

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-[10px] text-muted-foreground">{t('insights.competencyWeights')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
            <span className="text-[10px] text-muted-foreground">{t('insights.bigFiveTraits')}</span>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className={cn('p-3 rounded-xl border bg-muted/30', config.border)}>
        <div className="flex items-start gap-2">
          <Brain className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t('insights.radarDescription')}
            </p>
            <p className="text-[10px] text-muted-foreground/70">
              {t('insights.radarDisclaimer')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 3b. STRATEGY INSIGHT: TARGETED_FIT
// (source: StrategyInsightsTab TargetedFitInsights)
// Uses JobFitAlignmentCard — richer than the legacy JobAlignmentSection
// ============================================

interface TargetedFitInsightsProps {
  result: SimulationResult;
  onetSocCode?: string;
}

function TargetedFitInsights({ result, onetSocCode }: TargetedFitInsightsProps) {
  const competencyData = useMemo(() => extractCompetencyData(result), [result]);

  // Generate mock gap data based on simulation results.
  // In a real implementation this would come from an O*NET API comparison.
  const gaps = competencyData
    .filter((_, i) => i % 3 === 0)
    .map((comp) => ({
      competency: comp.competencyName,
      gap: -(Math.floor(Math.random() * 25) + 5),
    }))
    .slice(0, 3);

  const strengths = competencyData
    .filter((_, i) => i % 3 !== 0)
    .slice(0, 3)
    .map((comp) => ({
      competency: comp.competencyName,
      gap: Math.floor(Math.random() * 20) + 5,
    }));

  return (
    <JobFitAlignmentCard
      onetSocCode={onetSocCode}
      jobTitle={onetSocCode ? 'Job Role' : undefined}
      coveragePercentage={result.simulatedScore ?? 72}
      gaps={gaps}
      strengths={strengths}
    />
  );
}

// ============================================
// 3c. STRATEGY INSIGHT: DYNAMIC_GAP_ANALYSIS
// (source: StrategyInsightsTab DynamicGapInsights + SimulatedResultsTab TeamGapSection lines 832–874)
// Uses TeamComparisonCard PLUS the unique complementary skills and growth area badges
// ============================================

interface DynamicGapInsightsProps {
  result: SimulationResult;
  data: SimulatedResultsData;
  teamId?: string;
  teamName?: string;
}

function DynamicGapInsights({ result, data, teamId, teamName }: DynamicGapInsightsProps) {
  const t = useTranslations('builder.simulator');
  const competencyData = useMemo(() => extractCompetencyData(result), [result]);

  // Generate mock comparison data.
  // In a real implementation this would come from a team data API.
  const comparisons = competencyData.map((comp) => ({
    name: comp.competencyName,
    individual: Math.floor(Math.random() * 40) + 50,
    teamAvg: Math.floor(Math.random() * 30) + 60,
  }));

  const overallGap = Math.round(
    comparisons.reduce((sum, c) => sum + (c.individual - c.teamAvg), 0) /
      Math.max(comparisons.length, 1)
  );

  return (
    <div className="space-y-3">
      {/* TeamComparisonCard from StrategyInsightsTab */}
      <TeamComparisonCard
        teamId={teamId}
        teamName={teamName}
        comparisons={comparisons}
        overallGap={overallGap}
      />

      {/* Complementary Skills badges (unique content from SimulatedResultsTab lines 832–850) */}
      {data.complementarySkills && data.complementarySkills.length > 0 && (
        <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/30 dark:bg-emerald-950/10">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5" aria-hidden="true" />
            {t('simulatedResults.complementarySkills')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.complementarySkills.map((s) => (
              <Badge
                key={s.competencyId}
                variant="outline"
                className="text-[10px] border-emerald-300 dark:border-emerald-700"
              >
                {s.competencyName}: {s.simulatedPercentage}%
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Growth Areas badges (unique content from SimulatedResultsTab lines 852–871) */}
      {data.growthAreas && data.growthAreas.length > 0 && (
        <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50/30 dark:bg-amber-950/10">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {t('simulatedResults.developmentFocus')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.growthAreas.map((g) => (
              <Badge
                key={g.competencyId}
                variant="outline"
                className="text-[10px] border-amber-300 dark:border-amber-700"
              >
                {g.competencyName}: {g.simulatedPercentage}%
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// 4. STRENGTHS & GAPS
// (source: SimulatedResultsTab lines 669–728)
// ============================================

interface StrengthsGapsProps {
  strengths: SimulatedCompetencyScore[];
  gaps: SimulatedCompetencyScore[];
  threshold: number;
}

function StrengthsGaps({ strengths, gaps, threshold }: StrengthsGapsProps) {
  const t = useTranslations('builder.simulator');

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Top Strengths */}
      <Card className="border-emerald-200 dark:border-emerald-800/50">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            {t('simulatedResults.topStrengths')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="space-y-1.5">
            {strengths.slice(0, 3).map((s) => (
              <div key={s.competencyId} className="flex justify-between text-xs">
                <span className="truncate flex-1">{s.competencyName}</span>
                <span className={getScoreColorClass(s.simulatedPercentage, threshold)}>
                  {s.simulatedPercentage}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Growth Areas */}
      <Card className="border-amber-200 dark:border-amber-800/50">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {t('simulatedResults.growthAreas')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="space-y-1.5">
            {gaps.slice(0, 3).map((g) => (
              <div key={g.competencyId} className="flex justify-between text-xs">
                <span className="truncate flex-1">{g.competencyName}</span>
                <span className={getScoreColorClass(g.simulatedPercentage, threshold)}>
                  {g.simulatedPercentage}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// 5. COMPETENCY SCORES LIST
// (source: SimulatedResultsTab lines 600–667)
// ============================================

interface CompetencyScoresProps {
  scores: SimulatedCompetencyScore[];
  threshold: number;
  title: string;
  showAll?: boolean;
}

function CompetencyScores({ scores, threshold, title, showAll = false }: CompetencyScoresProps) {
  const t = useTranslations('builder.simulator');
  const displayScores = showAll ? scores : scores.slice(0, 5);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <div className="space-y-2">
        {displayScores.map((score) => (
          <div
            key={score.competencyId}
            className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-muted/30"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {score.passed ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" aria-hidden="true" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 shrink-0" aria-hidden="true" />
              )}
              <span className="text-sm truncate">{score.competencyName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-sm font-medium',
                  getScoreColorClass(score.simulatedPercentage, threshold)
                )}
              >
                {score.simulatedPercentage}%
              </span>
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px]',
                  score.confidence === 'high' && 'border-emerald-300',
                  score.confidence === 'medium' && 'border-amber-300',
                  score.confidence === 'low' && 'border-muted-foreground'
                )}
              >
                {t('radar.questionsAbbrev', { count: score.questionCount })}
              </Badge>
            </div>
          </div>
        ))}
      </div>
      {!showAll && scores.length > 5 && (
        <p className="text-xs text-muted-foreground text-center pt-1">
          {t('simulatedResults.moreCompetencies', { count: scores.length - 5 })}
        </p>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export const ResultsTab = memo(function ResultsTab({
  result,
  strategy,
  persona,
  passingScore,
  onetSocCode,
  teamId,
  teamName,
}: ResultsTabProps) {
  const t = useTranslations('builder.simulator');
  const strategyConfig = STRATEGY_CONFIG[strategy];

  // Generate simulated results based on the selected persona
  const simulatedData = useMemo(
    () =>
      generateSimulatedResults(
        result,
        strategy,
        persona,
        passingScore,
        onetSocCode,
        teamId
      ),
    [result, strategy, persona, passingScore, onetSocCode, teamId]
  );

  return (
    <div className="space-y-4">
      {/* 1. Persona Indicator row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCheck className={cn('h-4 w-4', strategyConfig.iconText)} aria-hidden="true" />
          <span className="text-sm font-medium">{t('results.detailedAnalysis')}</span>
        </div>
        <PersonaIndicator persona={persona} />
      </div>

      {/* 2. Score Summary — hero element */}
      <ScoreSummary data={simulatedData} strategy={strategy} />

      {/* 3. Strategy-specific insight section */}
      {strategy === 'UNIVERSAL_BASELINE' && (
        <UniversalBaselineInsights result={result} />
      )}

      {strategy === 'TARGETED_FIT' && (
        <TargetedFitInsights result={result} onetSocCode={onetSocCode} />
      )}

      {strategy === 'DYNAMIC_GAP_ANALYSIS' && (
        <DynamicGapInsights
          result={result}
          data={simulatedData}
          teamId={teamId}
          teamName={teamName}
        />
      )}

      {/* 4. Strengths & Gaps — side-by-side top-3 cards */}
      <StrengthsGaps
        strengths={simulatedData.strengths}
        gaps={simulatedData.gaps}
        threshold={passingScore}
      />

      {/* 5. Full Competency Breakdown */}
      {simulatedData.competencyScores.length > 0 && (
        <CompetencyScores
          scores={simulatedData.competencyScores}
          threshold={passingScore}
          title={t('score.competencyProfile')}
          showAll={simulatedData.competencyScores.length <= 8}
        />
      )}

      {/* 6. Disclaimer */}
      <p className="text-[10px] text-muted-foreground text-center pt-2">
        {t('score.competencyProfileAssessment')}
      </p>
    </div>
  );
});

export default ResultsTab;
