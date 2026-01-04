'use client';

import React, { memo } from 'react';
import { Clock, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Strategy, STRATEGY_CONFIG } from '../strategy-context';
import { StrategyScoreDisplay } from '../StrategyScoreDisplay';
import { WarningsList } from '../WarningsList';
import { SimulationResult, SimulationProfile } from '../types';

// ============================================
// TYPES
// ============================================

interface SimulatorResultsProps {
  /** Simulation result data */
  result: SimulationResult;
  /** Current assessment strategy */
  strategy: Strategy;
  /** Selected simulation persona */
  profile: SimulationProfile;
  /** Passing score threshold */
  passingScore: number;
  /** Number of competencies in blueprint */
  competencyCount: number;
  /** O*NET SOC code for job fit strategy */
  onetSocCode?: string;
  /** Team ID for gap analysis strategy */
  teamId?: string;
  /** Team benchmark score */
  teamBenchmark?: number;
}

// ============================================
// STATS GRID
// ============================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const StatCard = memo(function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="p-3 rounded-xl bg-muted/30 border">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  );
});

interface StatsGridProps {
  durationMinutes: number;
  questionCount: number;
}

const StatsGrid = memo(function StatsGrid({
  durationMinutes,
  questionCount,
}: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <StatCard
        icon={<Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />}
        label="Duration"
        value={`${durationMinutes} min`}
      />
      <StatCard
        icon={<Target className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />}
        label="Questions"
        value={questionCount}
      />
    </div>
  );
});

// ============================================
// MAIN COMPONENT
// ============================================

export const SimulatorResults = memo(function SimulatorResults({
  result,
  strategy,
  profile,
  passingScore,
  competencyCount,
  onetSocCode,
  teamId,
  teamBenchmark = 75,
}: SimulatorResultsProps) {
  return (
    <div className="space-y-4">
      {/* Strategy-Aware Score Display */}
      <StrategyScoreDisplay
        strategy={strategy}
        score={result.simulatedScore}
        passingScore={passingScore}
        profile={profile}
        competencyCount={competencyCount}
        onetSocCode={onetSocCode}
        teamId={teamId}
        teamBenchmark={teamBenchmark}
      />

      {/* Stats Grid */}
      <StatsGrid
        durationMinutes={result.estimatedDurationMinutes}
        questionCount={result.sampleQuestions.length}
      />

      {/* Inventory Warnings */}
      <WarningsList warnings={result.warnings} />
    </div>
  );
});

export default SimulatorResults;
