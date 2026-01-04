'use client';

import React, { useMemo } from 'react';
import { ClipboardList, LayoutGrid, Brain, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Strategy, STRATEGY_CONFIG } from '../strategy-context';
import { SimulationResult, Difficulty } from '../types';
import { JobFitAlignmentCard } from '../JobFitAlignmentCard';
import { TeamComparisonCard } from '../TeamComparisonCard';
import { SimulationCombinedRadar } from '../components/SimulationCombinedRadar';
import { CompetencyDistribution } from '../utils/transformSimulationToRadar';

// ============================================
// TYPES
// ============================================

interface StrategyInsightsTabProps {
  result: SimulationResult;
  strategy: Strategy;
  onetSocCode?: string;
  teamId?: string;
  teamName?: string;
  isLoading?: boolean;
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
// UNIVERSAL BASELINE INSIGHTS
// ============================================

function UniversalBaselineInsights({ result }: { result: SimulationResult }) {
  const config = STRATEGY_CONFIG.UNIVERSAL_BASELINE;
  const competencyData = useMemo(() => extractCompetencyData(result), [result]);

  return (
    <div className="space-y-3">
      {/* Competency & Personality Radar */}
      <div className={cn('p-3 rounded-xl border', config.border, config.bg)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ClipboardList
              className={cn('h-4 w-4', config.iconText)}
              aria-hidden="true"
            />
            <span className="text-sm font-medium">Assessment Profile</span>
          </div>
          <Badge variant="outline" className="text-[10px] tabular-nums gap-1">
            <LayoutGrid className="h-3 w-3" aria-hidden="true" />
            {competencyData.length} competencies
          </Badge>
        </div>

        {/* Combined Radar Chart */}
        <SimulationCombinedRadar
          distributionByCompetency={competencyData}
          showBigFive={true}
          maxCompetencies={6}
          variant="default"
        />

        {/* Legend explanation */}
        <div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-[10px] text-muted-foreground">Competency Weights</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
            <span className="text-[10px] text-muted-foreground">Big Five Traits</span>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className={cn('p-3 rounded-xl border bg-muted/30', config.border)}>
        <div className="flex items-start gap-2">
          <Brain className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              The radar chart shows how competencies are distributed in this assessment,
              with an estimated Big Five personality profile based on the competency mix.
            </p>
            <p className="text-[10px] text-muted-foreground/70">
              Actual personality scores will be refined after O*NET competency mapping.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// TARGETED FIT INSIGHTS
// ============================================

function TargetedFitInsights({
  result,
  onetSocCode,
}: {
  result: SimulationResult;
  onetSocCode?: string;
}) {
  const competencyData = useMemo(() => extractCompetencyData(result), [result]);

  // Generate mock gap data based on simulation results
  // In real implementation, this would come from O*NET API comparison
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
      jobTitle={onetSocCode ? 'Job Role' : undefined} // Would come from O*NET API
      coveragePercentage={result.simulatedScore ?? 72}
      gaps={gaps}
      strengths={strengths}
    />
  );
}

// ============================================
// DYNAMIC GAP ANALYSIS INSIGHTS
// ============================================

function DynamicGapInsights({
  result,
  teamId,
  teamName,
}: {
  result: SimulationResult;
  teamId?: string;
  teamName?: string;
}) {
  const competencyData = useMemo(() => extractCompetencyData(result), [result]);

  // Generate mock comparison data
  // In real implementation, this would come from team data API
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
    <TeamComparisonCard
      teamId={teamId}
      teamName={teamName}
      comparisons={comparisons}
      overallGap={overallGap}
    />
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function StrategyInsightsTab({
  result,
  strategy,
  onetSocCode,
  teamId,
  teamName,
  isLoading,
}: StrategyInsightsTabProps) {
  switch (strategy) {
    case 'UNIVERSAL_BASELINE':
      return <UniversalBaselineInsights result={result} />;

    case 'TARGETED_FIT':
      return <TargetedFitInsights result={result} onetSocCode={onetSocCode} />;

    case 'DYNAMIC_GAP_ANALYSIS':
      return (
        <DynamicGapInsights result={result} teamId={teamId} teamName={teamName} />
      );

    default:
      return null;
  }
}

export default StrategyInsightsTab;
