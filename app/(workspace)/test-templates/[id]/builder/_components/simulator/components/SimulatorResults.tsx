'use client';

import React, { memo } from 'react';
import { Strategy } from '../strategy-context';
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

      {/* Inventory Warnings */}
      <WarningsList warnings={result.warnings} />
    </div>
  );
});

export default SimulatorResults;
