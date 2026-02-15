'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { TrendLineChart } from './TrendLineChart';
import { CompetencySparkline } from './CompetencySparkline';
import { ImprovementBadge } from './ImprovementBadge';
import type { TrendDataPoint } from '@/types/domain';

interface TrendOverviewProps {
  /** Historical trend data points (oldest first) */
  data: TrendDataPoint[];
  /** Passing threshold for reference line (default: 70) */
  passingThreshold?: number;
  /** Maximum competencies to show in the selector (default: 8) */
  maxCompetencies?: number;
  className?: string;
}

interface CompetencyTrend {
  id: string;
  name: string;
  scores: number[];
  change: number;
  latest: number;
}

/**
 * TrendOverview - Container component for historical trend visualization.
 * Shows an overall score trend chart with a competency selector for drill-down.
 */
export function TrendOverview({
  data,
  passingThreshold = 70,
  maxCompetencies = 8,
  className,
}: TrendOverviewProps) {
  const isMobile = useIsMobile();
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([]);

  // Extract unique competency trends
  const competencyTrends = useMemo((): CompetencyTrend[] => {
    if (data.length < 2) return [];

    const trendsMap: Record<string, { name: string; scores: (number | null)[] }> = {};

    data.forEach((dp) => {
      dp.competencyScores.forEach((cs) => {
        if (!trendsMap[cs.competencyId]) {
          trendsMap[cs.competencyId] = { name: cs.competencyName, scores: [] };
        }
        trendsMap[cs.competencyId].scores.push(cs.percentage);
      });
    });

    return Object.entries(trendsMap)
      .map(([id, { name, scores }]) => {
        const validScores = scores.filter((s): s is number => s != null);
        if (validScores.length < 2) return null;
        const first = validScores[0];
        const last = validScores[validScores.length - 1];
        return {
          id,
          name,
          scores: validScores,
          change: last - first,
          latest: last,
        };
      })
      .filter((t): t is CompetencyTrend => t != null)
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, maxCompetencies);
  }, [data, maxCompetencies]);

  // Overall improvement
  const overallChange = useMemo(() => {
    if (data.length < 2) return null;
    const first = data[0].overallPercentage;
    const last = data[data.length - 1].overallPercentage;
    if (first == null || last == null) return null;
    return last - first;
  }, [data]);

  const toggleCompetency = (compId: string) => {
    setSelectedCompetencies((prev) =>
      prev.includes(compId)
        ? prev.filter((id) => id !== compId)
        : [...prev, compId]
    );
  };

  if (data.length === 0) {
    return (
      <div className={cn('text-center py-8 text-sm text-muted-foreground', className)}>
        No historical data available yet.
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with overall stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Progress Over Time
          </h3>
          <p className="text-xs text-muted-foreground">
            {data.length} attempt{data.length !== 1 ? 's' : ''}
          </p>
        </div>
        {overallChange != null && (
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
              Overall Change
            </div>
            <ImprovementBadge change={overallChange} />
          </div>
        )}
      </div>

      {/* Main trend chart */}
      <TrendLineChart
        data={data}
        selectedCompetencies={selectedCompetencies}
        passingThreshold={passingThreshold}
        showConfidenceBands={selectedCompetencies.length === 1}
      />

      {/* Legend for selected competencies */}
      {selectedCompetencies.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          {selectedCompetencies.length === 0 && (
            <span className="text-muted-foreground">Showing overall score</span>
          )}
        </div>
      )}

      {/* Competency selector */}
      {competencyTrends.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Select competencies to compare
          </p>
          <div className="space-y-0.5">
            {competencyTrends.map((trend) => {
              const isSelected = selectedCompetencies.includes(trend.id);
              return (
                <button
                  key={trend.id}
                  onClick={() => toggleCompetency(trend.id)}
                  className={cn(
                    'w-full flex items-center gap-2 py-1.5 px-2 rounded-md text-left transition-colors',
                    isSelected
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-muted/50 border border-transparent'
                  )}
                >
                  <span
                    className={cn(
                      'font-medium truncate flex-1',
                      isMobile ? 'text-xs' : 'text-sm'
                    )}
                  >
                    {trend.name}
                  </span>
                  <CompetencySparkline
                    data={trend.scores.map((v) => ({ value: v }))}
                    width={isMobile ? 56 : 72}
                    height={20}
                  />
                  <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">
                    {Math.round(trend.latest)}%
                  </span>
                  <ImprovementBadge change={trend.change} compact />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default TrendOverview;
