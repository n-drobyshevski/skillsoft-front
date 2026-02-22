'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  AlertTriangle,
  LayoutGrid,
  Briefcase,
  Users,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Strategy, STRATEGY_CONFIG, personaConfig } from './strategy-context';
import { SimulationResult, SimulationProfile } from './types';

// ============================================
// TYPES
// ============================================

interface StrategyScoreDisplayProps {
  strategy: Strategy;
  score?: number;
  passingScore: number;
  profile: SimulationProfile;
  competencyCount?: number;
  teamBenchmark?: number;
  onetSocCode?: string;
  teamId?: string;
  teamName?: string;
  className?: string;
  /** compact = desktop inline, expanded = mobile card with more detail */
  variant?: 'compact' | 'expanded';
  /** Required for expanded variant (competency distribution data) */
  result?: SimulationResult;
}

// ============================================
// HELPER COMPONENTS
// ============================================

function ProgressBar({
  value,
  threshold,
  colorClass,
  showThreshold = false,
}: {
  value: number;
  threshold?: number;
  colorClass: string;
  showThreshold?: boolean;
}) {
  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden relative">
      <div
        className={cn('h-full rounded-full transition-all duration-500', colorClass)}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
      {showThreshold && threshold !== undefined && (
        <div
          className="absolute top-0 h-full w-0.5 bg-foreground/50"
          style={{ left: `${threshold}%` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

// ============================================
// UNIVERSAL BASELINE DISPLAY
// ============================================

function UniversalBaselineDisplay({
  competencyCount,
  profile,
  className,
  expanded = false,
  result,
}: {
  competencyCount: number;
  profile: SimulationProfile;
  className?: string;
  expanded?: boolean;
  result?: SimulationResult;
}) {
  const t = useTranslations('builder.simulator');
  const config = STRATEGY_CONFIG.UNIVERSAL_BASELINE;

  const topCompetencies = useMemo(() => {
    if (!expanded || !result?.distributionByCompetency) return [];
    return [...result.distributionByCompetency]
      .sort((a, b) => b.questionCount - a.questionCount)
      .slice(0, 4);
  }, [expanded, result?.distributionByCompetency]);

  const totalQuestions = result?.sampleQuestions.length ?? 0;

  return (
    <div
      className={cn(
        'p-4 rounded-xl border relative overflow-hidden',
        config.border,
        config.bg,
        expanded && 'border-2',
        className
      )}
      role="region"
      aria-label={t('score.competencyProfileAssessment')}
    >
      {/* Accent line */}
      <div
        className={cn('absolute top-0 inset-x-0 h-0.5 rounded-t-xl', config.accentGradient)}
        aria-hidden="true"
      />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className={cn('h-4 w-4', config.iconText)} aria-hidden="true" />
          <span className="text-xs font-medium text-muted-foreground">
            {t('score.competencyProfile')}
          </span>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] bg-primary/10 text-primary border-primary/20"
        >
          {t('score.discoveryMode')}
        </Badge>
      </div>

      {/* Summary row */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', config.iconBg)}>
            <LayoutGrid className={cn('h-5 w-5', config.iconText)} aria-hidden="true" />
          </div>
          <div>
            <span className={cn('text-2xl font-bold tabular-nums', config.iconText)}>
              {competencyCount}
            </span>
            <span className="text-sm text-muted-foreground ml-1.5">{t('score.competencies')}</span>
          </div>
        </div>
        {expanded && totalQuestions > 0 && (
          <Badge variant="secondary" className="tabular-nums">
            {totalQuestions} {t('results.questions')}
          </Badge>
        )}
      </div>

      {/* Expanded: Top competencies grid */}
      {expanded && topCompetencies.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {topCompetencies.map((comp) => {
            const percentage = totalQuestions > 0
              ? Math.round((comp.questionCount / totalQuestions) * 100)
              : 0;
            return (
              <div key={comp.competencyId} className="p-3 rounded-lg border bg-background">
                <div className="text-xs text-muted-foreground truncate mb-1">
                  {comp.competencyName}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold tabular-nums">{comp.questionCount}</span>
                  <Badge variant="outline" className="text-[10px]">{percentage}%</Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-3">
        {t('score.noPassFail')}
      </p>
    </div>
  );
}

// ============================================
// TARGETED FIT DISPLAY
// ============================================

function TargetedFitDisplay({
  score,
  passingScore,
  profile,
  onetSocCode,
  className,
  expanded = false,
}: {
  score: number;
  passingScore: number;
  profile: SimulationProfile;
  onetSocCode?: string;
  className?: string;
  expanded?: boolean;
}) {
  const t = useTranslations('builder.simulator');
  const config = STRATEGY_CONFIG.TARGETED_FIT;
  const persona = personaConfig[profile];
  const passed = score >= passingScore;
  const alignmentScore = Math.min(100, Math.round(score * 1.1));

  return (
    <div
      className={cn(
        'p-4 rounded-xl border relative overflow-hidden',
        persona.bgColor,
        expanded && 'border-2',
        className
      )}
      role="region"
      aria-label={`${t('score.jobFitScore')}: ${Math.round(score)}%${passed ? `, ${t('score.qualified')}` : `, ${t('score.belowThreshold')}`}`}
    >
      {/* Accent line */}
      <div
        className={cn(
          'absolute top-0 inset-x-0 h-0.5',
          passed
            ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent'
            : 'bg-gradient-to-r from-red-500 via-red-400 to-transparent'
        )}
        aria-hidden="true"
      />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-xs font-medium text-muted-foreground">{t('score.jobFitScore')}</span>
        </div>
        {onetSocCode && expanded && (
          <Badge variant="outline" className="text-[10px] ml-auto mr-2">
            {onetSocCode}
          </Badge>
        )}
        {passed ? (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800 text-[10px]"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
            {t('score.qualified')}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800 text-[10px]"
          >
            <AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />
            {t('score.belowThreshold')}
          </Badge>
        )}
      </div>

      {/* Expanded: Centered prominent score */}
      {expanded ? (
        <div
          className={cn(
            'p-4 rounded-xl text-center mt-2',
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
            {Math.round(score)}%
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
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <span className={cn('text-3xl font-bold tabular-nums', persona.color)}>
              {Math.round(score)}%
            </span>
            <span className="text-xs text-muted-foreground">{t('score.toQualify', { score: passingScore })}</span>
          </div>

          {/* Progress bar with threshold marker */}
          <div className="mt-3">
            <ProgressBar
              value={score}
              threshold={passingScore}
              colorClass={passed ? 'bg-emerald-500' : 'bg-red-500'}
              showThreshold
            />
          </div>
        </>
      )}

      {/* Expanded: Alignment score */}
      {expanded && onetSocCode && (
        <div className="flex items-center justify-between p-3 rounded-lg border mt-3">
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

      {/* O*NET context */}
      {onetSocCode && !expanded && (
        <a
          href={`https://www.onetonline.org/link/summary/${onetSocCode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground hover:text-primary transition-colors"
          aria-label={t('onetAriaLabel')}
        >
          <Briefcase className="h-3 w-3" aria-hidden="true" />
          {t('onetLink', { code: onetSocCode })}
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

// ============================================
// DYNAMIC GAP ANALYSIS DISPLAY
// ============================================

function DynamicGapDisplay({
  score,
  teamBenchmark,
  profile,
  teamId,
  teamName,
  className,
  expanded = false,
  result,
}: {
  score: number;
  teamBenchmark: number;
  profile: SimulationProfile;
  teamId?: string;
  teamName?: string;
  className?: string;
  expanded?: boolean;
  result?: SimulationResult;
}) {
  const t = useTranslations('builder.simulator');
  const config = STRATEGY_CONFIG.DYNAMIC_GAP_ANALYSIS;
  const persona = personaConfig[profile];
  const gap = score - teamBenchmark;
  const gapDirection = gap > 5 ? 'above' : gap < -5 ? 'below' : 'at';
  const isAboveAvg = gap >= 0;

  const competencyData = result?.distributionByCompetency || [];
  const strengthCount = Math.ceil(competencyData.length * 0.4);
  const gapCount = Math.floor(competencyData.length * 0.3);

  const getTrendIcon = () => {
    if (gapDirection === 'above') return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    if (gapDirection === 'below') return <TrendingDown className="h-4 w-4 text-amber-500" />;
    return <Minus className="h-4 w-4 text-blue-500" />;
  };

  const gapLabel = t(
    gapDirection === 'above' ? 'score.aboveTeam' : gapDirection === 'below' ? 'score.belowTeam' : 'score.atTeam',
    { gap: Math.abs(gap) }
  );

  return (
    <div
      className={cn(
        'p-4 rounded-xl border relative overflow-hidden',
        persona.bgColor,
        expanded && 'border-2',
        className
      )}
      role="region"
      aria-label={`${t('score.teamGapAnalysis')}: ${gapLabel}`}
    >
      {/* Accent line */}
      <div
        className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-blue-500 via-blue-400 to-transparent"
        aria-hidden="true"
      />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-xs font-medium text-muted-foreground">
            {t('score.teamGapAnalysis')}
          </span>
        </div>
        {teamName && expanded && (
          <Badge variant="outline" className="text-[10px] ml-auto mr-2">
            {teamName}
          </Badge>
        )}
        <Badge
          variant="outline"
          className={cn(
            'text-[10px]',
            gapDirection === 'above' &&
              'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
            gapDirection === 'below' &&
              'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
            gapDirection === 'at' &&
              'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800'
          )}
        >
          {getTrendIcon()}
          <span className="ml-1">{gapLabel}</span>
        </Badge>
      </div>

      {/* Expanded: Prominent centered gap display */}
      {expanded ? (
        <>
          <div
            className={cn(
              'p-4 rounded-xl text-center mt-2',
              isAboveAvg ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-amber-50 dark:bg-amber-950/30'
            )}
          >
            <div className="text-sm text-muted-foreground mb-1">
              {t('score.teamBenchmark')} ({Math.round(teamBenchmark)}%)
            </div>
            <div
              className={cn(
                'text-4xl font-bold tabular-nums',
                isAboveAvg ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'
              )}
            >
              {isAboveAvg ? '+' : ''}{Math.round(gap)}%
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              {getTrendIcon()}
              <span
                className={cn(
                  'text-sm',
                  isAboveAvg ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'
                )}
              >
                {gapLabel}
              </span>
            </div>
          </div>

          {/* Strengths & Gaps Summary */}
          <div className="grid grid-cols-2 gap-3 mt-3">
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
        </>
      ) : (
        <>
          {/* Compact: Comparison visualization */}
          <div className="space-y-3 mt-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t('score.individual')}</span>
                <span className={cn('font-semibold tabular-nums', persona.color)}>
                  {Math.round(score)}%
                </span>
              </div>
              <ProgressBar
                value={score}
                colorClass={
                  gapDirection === 'above'
                    ? 'bg-emerald-500'
                    : gapDirection === 'below'
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                }
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t('score.teamBenchmark')}</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                  {teamBenchmark}%
                </span>
              </div>
              <ProgressBar value={teamBenchmark} colorClass="bg-blue-500/50" />
            </div>
          </div>
        </>
      )}

      {/* Team context */}
      {(teamId || teamName) && !expanded && (
        <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
          <Users className="h-3 w-3" aria-hidden="true" />
          <span>{teamName || t('teamComparison.teamFallbackName', { id: teamId ?? '' })}</span>
        </div>
      )}

      {!teamId && expanded && (
        <p className="text-xs text-muted-foreground text-center mt-3">
          {t('emptyState.missingConfig.teamGap')}
        </p>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function StrategyScoreDisplay({
  strategy,
  score = 0,
  passingScore,
  profile,
  competencyCount = 0,
  teamBenchmark = 75,
  onetSocCode,
  teamId,
  teamName,
  className,
  variant = 'compact',
  result,
}: StrategyScoreDisplayProps) {
  const expanded = variant === 'expanded';

  switch (strategy) {
    case 'UNIVERSAL_BASELINE':
      return (
        <UniversalBaselineDisplay
          competencyCount={competencyCount}
          profile={profile}
          className={className}
          expanded={expanded}
          result={result}
        />
      );

    case 'TARGETED_FIT':
      return (
        <TargetedFitDisplay
          score={score}
          passingScore={passingScore}
          profile={profile}
          onetSocCode={onetSocCode}
          className={className}
          expanded={expanded}
        />
      );

    case 'DYNAMIC_GAP_ANALYSIS':
      return (
        <DynamicGapDisplay
          score={score}
          teamBenchmark={teamBenchmark}
          profile={profile}
          teamId={teamId}
          teamName={teamName}
          className={className}
          expanded={expanded}
          result={result}
        />
      );

    default:
      return null;
  }
}

export default StrategyScoreDisplay;
