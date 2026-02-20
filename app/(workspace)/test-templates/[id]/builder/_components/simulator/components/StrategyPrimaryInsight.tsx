'use client';

/**
 * StrategyPrimaryInsight
 *
 * Renders the most relevant insight based on the current assessment strategy.
 * This is always shown expanded in the mobile priority stack, providing
 * immediate value without requiring taps to expand.
 *
 * - UNIVERSAL_BASELINE: Competency radar/profile preview
 * - TARGETED_FIT: Job alignment gauge with O*NET match
 * - DYNAMIC_GAP_ANALYSIS: Team comparison summary
 */

import React, { memo, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  Briefcase,
  CheckCircle2,
  LayoutGrid,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Strategy, STRATEGY_CONFIG } from '../strategy-context';
import { SimulationResult } from '../types';

// ============================================
// TYPES
// ============================================

interface StrategyPrimaryInsightProps {
  /** Simulation result data */
  result: SimulationResult;
  /** Current assessment strategy */
  strategy: Strategy;
  /** Passing score threshold */
  passingScore: number;
  /** O*NET SOC code for job fit */
  onetSocCode?: string;
  /** Team ID for gap analysis */
  teamId?: string;
  /** Team name for display */
  teamName?: string;
}

// ============================================
// UNIVERSAL BASELINE INSIGHT
// ============================================

interface CompetencyDistribution {
  competencyId: string;
  competencyName: string;
  questionCount: number;
  weight?: number;
}

function UniversalBaselineInsight({
  result,
  passingScore,
}: {
  result: SimulationResult;
  passingScore: number;
}) {
  const t = useTranslations('builder.simulator');
  const config = STRATEGY_CONFIG.UNIVERSAL_BASELINE;
  const competencyData = result.distributionByCompetency || [];
  const totalQuestions = result.sampleQuestions.length;

  // Calculate the top 4 competencies by question count
  const topCompetencies = useMemo(() => {
    return [...competencyData]
      .sort((a, b) => b.questionCount - a.questionCount)
      .slice(0, 4);
  }, [competencyData]);

  return (
    <Card className={cn('border-2', config.border)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <LayoutGrid className={cn('h-4 w-4', config.iconText)} />
          {t('score.competencyProfile')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {competencyData.length} {t('score.competencies')}
            </span>
          </div>
          <Badge variant="secondary" className="tabular-nums">
            {totalQuestions} {t('results.questions')}
          </Badge>
        </div>

        {/* Top Competencies Grid */}
        <div className="grid grid-cols-2 gap-2">
          {topCompetencies.map((comp) => {
            const percentage = totalQuestions > 0
              ? Math.round((comp.questionCount / totalQuestions) * 100)
              : 0;

            return (
              <div
                key={comp.competencyId}
                className="p-3 rounded-lg border bg-background"
              >
                <div className="text-xs text-muted-foreground truncate mb-1">
                  {comp.competencyName}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold tabular-nums">
                    {comp.questionCount}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {percentage}%
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Insight */}
        <p className="text-xs text-muted-foreground">
          {t('score.noPassFail')}
        </p>
      </CardContent>
    </Card>
  );
}

// ============================================
// TARGETED FIT INSIGHT
// ============================================

function TargetedFitInsight({
  result,
  passingScore,
  onetSocCode,
}: {
  result: SimulationResult;
  passingScore: number;
  onetSocCode?: string;
}) {
  const t = useTranslations('builder.simulator');
  const config = STRATEGY_CONFIG.TARGETED_FIT;
  const score = result.simulatedScore ?? 0;
  const passed = score >= passingScore;

  // Mock job alignment data - in real implementation would come from O*NET
  const alignmentScore = Math.min(100, Math.round(score * 1.1));

  return (
    <Card className={cn('border-2', config.border)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Briefcase className={cn('h-4 w-4', config.iconText)} />
          {t('score.jobFitScore')}
          {onetSocCode && (
            <Badge variant="outline" className="text-[10px] ml-auto">
              {onetSocCode}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div
          className={cn(
            'p-4 rounded-xl text-center',
            passed ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-red-50 dark:bg-red-950/30'
          )}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {passed ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
              )}
            >
              {passed ? t('score.qualified') : t('score.belowThreshold')}
            </span>
          </div>
          <div className="text-4xl font-bold tabular-nums mb-1">
            {score}%
          </div>
          <Progress
            value={score}
            className={cn(
              'h-2 mt-2',
              passed ? '[&>div]:bg-emerald-500' : '[&>div]:bg-red-500'
            )}
          />
          <div className="text-xs text-muted-foreground mt-2">
            {t('score.toQualify', { score: passingScore })}
          </div>
        </div>

        {/* Alignment Score */}
        {onetSocCode && (
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{t('score.jobFitScore')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold tabular-nums">{alignmentScore}%</span>
              {alignmentScore >= 80 ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-amber-500" />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// DYNAMIC GAP ANALYSIS INSIGHT
// ============================================

function DynamicGapInsight({
  result,
  passingScore,
  teamId,
  teamName,
}: {
  result: SimulationResult;
  passingScore: number;
  teamId?: string;
  teamName?: string;
}) {
  const t = useTranslations('builder.simulator');
  const config = STRATEGY_CONFIG.DYNAMIC_GAP_ANALYSIS;
  const score = result.simulatedScore ?? 0;

  // Mock team comparison data
  const teamAvg = 72;
  const gap = score - teamAvg;
  const isAboveAvg = gap >= 0;

  const competencyData = result.distributionByCompetency || [];
  const strengthCount = Math.ceil(competencyData.length * 0.4);
  const gapCount = Math.floor(competencyData.length * 0.3);

  const gapLabel = isAboveAvg
    ? t('score.aboveTeam', { gap: Math.abs(gap) })
    : t('score.belowTeam', { gap: Math.abs(gap) });

  return (
    <Card className={cn('border-2', config.border)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className={cn('h-4 w-4', config.iconText)} />
          {t('score.teamGapAnalysis')}
          {teamName && (
            <Badge variant="outline" className="text-[10px] ml-auto">
              {teamName}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gap Display */}
        <div
          className={cn(
            'p-4 rounded-xl text-center',
            isAboveAvg ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-amber-50 dark:bg-amber-950/30'
          )}
        >
          <div className="text-sm text-muted-foreground mb-1">
            {t('score.teamBenchmark')} ({teamAvg}%)
          </div>
          <div
            className={cn(
              'text-4xl font-bold tabular-nums',
              isAboveAvg ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'
            )}
          >
            {isAboveAvg ? '+' : ''}{gap}%
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            {isAboveAvg ? (
              <>
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-600 dark:text-blue-400">{gapLabel}</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-amber-600 dark:text-amber-400">{gapLabel}</span>
              </>
            )}
          </div>
        </div>

        {/* Strengths & Gaps Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="text-xs text-emerald-700 dark:text-emerald-400">
                {t('score.individual')}
              </span>
            </div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {strengthCount}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-amber-600" />
              <span className="text-xs text-amber-700 dark:text-amber-400">
                {t('score.teamGapAnalysis')}
              </span>
            </div>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 tabular-nums">
              {gapCount}
            </div>
          </div>
        </div>

        {!teamId && (
          <p className="text-xs text-muted-foreground text-center">
            {t('emptyState.missingConfig.teamGap')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export const StrategyPrimaryInsight = memo(function StrategyPrimaryInsight({
  result,
  strategy,
  passingScore,
  onetSocCode,
  teamId,
  teamName,
}: StrategyPrimaryInsightProps) {
  switch (strategy) {
    case 'UNIVERSAL_BASELINE':
      return (
        <UniversalBaselineInsight result={result} passingScore={passingScore} />
      );

    case 'TARGETED_FIT':
      return (
        <TargetedFitInsight
          result={result}
          passingScore={passingScore}
          onetSocCode={onetSocCode}
        />
      );

    case 'DYNAMIC_GAP_ANALYSIS':
      return (
        <DynamicGapInsight
          result={result}
          passingScore={passingScore}
          teamId={teamId}
          teamName={teamName}
        />
      );

    default:
      return (
        <UniversalBaselineInsight result={result} passingScore={passingScore} />
      );
  }
});

export default StrategyPrimaryInsight;
