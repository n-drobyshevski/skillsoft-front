'use client';

import React from 'react';
import { ClipboardList, LayoutGrid, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Strategy, STRATEGY_CONFIG } from '../strategy-context';
import { SimulationResult } from '../types';
import { JobFitAlignmentCard } from '../JobFitAlignmentCard';
import { TeamComparisonCard } from '../TeamComparisonCard';

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
// UNIVERSAL BASELINE INSIGHTS
// ============================================

function UniversalBaselineInsights({ result }: { result: SimulationResult }) {
  const config = STRATEGY_CONFIG.UNIVERSAL_BASELINE;
  const competencyData = result.distributionByCompetency || [];

  // Calculate weight percentages
  const totalWeight = competencyData.reduce((sum, c) => sum + (c.weight || 1), 0);

  return (
    <div className="space-y-3">
      {/* Competency Profile Preview */}
      <div className={cn('p-3 rounded-xl border', config.border, config.bg)}>
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList
            className={cn('h-4 w-4', config.iconText)}
            aria-hidden="true"
          />
          <span className="text-sm font-medium">Competency Profile Preview</span>
        </div>

        <div className="space-y-2">
          {/* Total competencies card */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="text-sm font-medium">Total Competencies</span>
            </div>
            <span className="text-lg font-bold text-primary tabular-nums">
              {competencyData.length}
            </span>
          </div>

          {/* Top competencies grid */}
          <div className="grid grid-cols-2 gap-2">
            {competencyData.slice(0, 4).map((comp) => (
              <div
                key={comp.competencyId}
                className="p-2 rounded-lg bg-muted/50 border"
              >
                <span className="text-xs text-muted-foreground block truncate">
                  {comp.competencyName}
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {comp.questionCount} questions
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          This assessment will generate a competency passport without pass/fail
          scoring. Each competency will be measured independently.
        </p>
      </div>

      {/* Coverage Balance */}
      <div className={cn('p-3 rounded-xl border', config.border, config.bg)}>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm font-medium">Coverage Balance</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {competencyData.map((comp) => {
            const weightPercent =
              totalWeight > 0
                ? Math.round(((comp.weight || 1) / totalWeight) * 100)
                : 0;
            return (
              <Badge
                key={comp.competencyId}
                variant="outline"
                className="text-[10px] tabular-nums"
              >
                {comp.competencyName}: {weightPercent}%
              </Badge>
            );
          })}
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
  const competencyData = result.distributionByCompetency || [];

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
  const competencyData = result.distributionByCompetency || [];

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
