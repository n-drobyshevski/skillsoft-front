'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  AlertTriangle,
  LayoutGrid,
  Briefcase,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Strategy, STRATEGY_CONFIG, personaConfig } from './strategy-context';
import { SimulationProfile } from './types';

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
}: {
  competencyCount: number;
  profile: SimulationProfile;
  className?: string;
}) {
  const config = STRATEGY_CONFIG.UNIVERSAL_BASELINE;
  const persona = personaConfig[profile];

  return (
    <div
      className={cn(
        'p-4 rounded-xl border relative overflow-hidden',
        config.border,
        config.bg,
        className
      )}
      role="region"
      aria-label="Competency Profile Assessment"
    >
      {/* Accent line */}
      <div
        className={cn('absolute top-0 inset-x-0 h-0.5 rounded-t-xl', config.accentGradient)}
        aria-hidden="true"
      />

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground">
          Competency Profile
        </span>
        <Badge
          variant="outline"
          className="text-[10px] bg-primary/10 text-primary border-primary/20"
        >
          Discovery Mode
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <div className={cn('p-2.5 rounded-xl', config.iconBg)}>
          <LayoutGrid className={cn('h-6 w-6', config.iconText)} aria-hidden="true" />
        </div>
        <div>
          <span className={cn('text-2xl font-bold tabular-nums', config.iconText)}>
            {competencyCount}
          </span>
          <span className="text-sm text-muted-foreground ml-1.5">competencies</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        No pass/fail scoring - this assessment builds a competency passport
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
}: {
  score: number;
  passingScore: number;
  profile: SimulationProfile;
  onetSocCode?: string;
  className?: string;
}) {
  const config = STRATEGY_CONFIG.TARGETED_FIT;
  const persona = personaConfig[profile];
  const passed = score >= passingScore;

  return (
    <div
      className={cn(
        'p-4 rounded-xl border relative overflow-hidden',
        persona.bgColor,
        className
      )}
      role="region"
      aria-label={`Job Fit Score: ${score}%${passed ? ', Qualified' : ', Below Threshold'}`}
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
          <span className="text-xs font-medium text-muted-foreground">Job Fit Score</span>
        </div>
        {passed ? (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800 text-[10px]"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
            Qualified
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800 text-[10px]"
          >
            <AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />
            Below Threshold
          </Badge>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className={cn('text-3xl font-bold tabular-nums', persona.color)}>
          {score}%
        </span>
        <span className="text-xs text-muted-foreground">/ {passingScore}% to qualify</span>
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

      {/* O*NET context */}
      {onetSocCode && (
        <a
          href={`https://www.onetonline.org/link/summary/${onetSocCode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <Briefcase className="h-3 w-3" aria-hidden="true" />
          O*NET: {onetSocCode}
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
}: {
  score: number;
  teamBenchmark: number;
  profile: SimulationProfile;
  teamId?: string;
  teamName?: string;
  className?: string;
}) {
  const config = STRATEGY_CONFIG.DYNAMIC_GAP_ANALYSIS;
  const persona = personaConfig[profile];
  const gap = score - teamBenchmark;
  const gapDirection = gap > 5 ? 'above' : gap < -5 ? 'below' : 'at';

  const getTrendIcon = () => {
    if (gapDirection === 'above') return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    if (gapDirection === 'below') return <TrendingDown className="h-4 w-4 text-amber-500" />;
    return <Minus className="h-4 w-4 text-blue-500" />;
  };

  return (
    <div
      className={cn(
        'p-4 rounded-xl border relative overflow-hidden',
        persona.bgColor,
        className
      )}
      role="region"
      aria-label={`Team Gap Analysis: ${Math.abs(gap)}% ${gapDirection} team average`}
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
            Team Gap Analysis
          </span>
        </div>
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
          <span className="ml-1">
            {Math.abs(gap)}% {gapDirection} team
          </span>
        </Badge>
      </div>

      {/* Comparison visualization */}
      <div className="space-y-3 mt-3">
        {/* Individual score */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Individual</span>
            <span className={cn('font-semibold tabular-nums', persona.color)}>
              {score}%
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

        {/* Team benchmark */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Team Benchmark</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
              {teamBenchmark}%
            </span>
          </div>
          <ProgressBar value={teamBenchmark} colorClass="bg-blue-500/50" />
        </div>
      </div>

      {/* Team context */}
      {(teamId || teamName) && (
        <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
          <Users className="h-3 w-3" aria-hidden="true" />
          <span>{teamName || `Team ${teamId}`}</span>
        </div>
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
}: StrategyScoreDisplayProps) {
  switch (strategy) {
    case 'UNIVERSAL_BASELINE':
      return (
        <UniversalBaselineDisplay
          competencyCount={competencyCount}
          profile={profile}
          className={className}
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
        />
      );

    default:
      return null;
  }
}

export default StrategyScoreDisplay;
