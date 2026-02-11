'use client';

/**
 * AnalyticsTabOptimized
 *
 * Performance-optimized version of AnalyticsTab with:
 * - Memoized chart components
 * - Deferred chart data updates
 * - Lazy chart rendering
 * - Progressive disclosure (collapsible sections)
 */

import React, { useMemo, memo, useDeferredValue, useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Gauge, ChevronDown, ChevronUp, PieChartIcon } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartTooltip,
} from 'recharts';
import { cn } from '@/lib/utils';
import { SimulationResult, Difficulty, difficultyColors, selectionReasonLabels, SelectionReason } from '../types';

// ============================================
// TYPES
// ============================================

interface AnalyticsTabOptimizedProps {
  result: SimulationResult;
}

interface ChartData {
  name: string;
  value: number;
}

// ============================================
// CONSTANTS
// ============================================

const CHART_COLORS = ['#6366f1', '#22c55e', '#f97316', '#0ea5e9', '#8b5cf6', '#f59e0b'];

// ============================================
// MEMOIZED PIE CHART
// ============================================

interface CompetencyPieChartProps {
  data: ChartData[];
  isLoaded: boolean;
}

const CompetencyPieChart = memo(function CompetencyPieChart({
  data,
  isLoaded,
}: CompetencyPieChartProps) {
  if (!isLoaded) {
    return (
      <div className="h-[180px] sm:h-[220px] flex items-center justify-center">
        <div className="animate-pulse bg-muted rounded-full w-32 h-32" />
      </div>
    );
  }

  if (data.length === 0) {
    return <p className="text-xs text-muted-foreground py-4 text-center">No competencies selected</p>;
  }

  return (
    <div className="h-[180px] sm:h-[220px]">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius="75%"
            innerRadius="40%"
            animationDuration={300}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <RechartTooltip contentStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

// ============================================
// MEMOIZED BAR CHART
// ============================================

interface DifficultyBarChartProps {
  data: ChartData[];
  isLoaded: boolean;
}

const DifficultyBarChart = memo(function DifficultyBarChart({
  data,
  isLoaded,
}: DifficultyBarChartProps) {
  if (!isLoaded) {
    return (
      <div className="h-[180px] sm:h-[220px] flex items-center justify-center">
        <div className="animate-pulse bg-muted rounded-lg w-full h-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return <p className="text-xs text-muted-foreground py-4 text-center">No difficulty data</p>;
  }

  return (
    <div className="h-[180px] sm:h-[220px]">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, left: 0, right: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <RechartTooltip contentStyle={{ fontSize: 12 }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={300}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={difficultyColors[entry.name as Difficulty] || '#6366f1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

// ============================================
// COLLAPSIBLE SECTION
// ============================================

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection = memo(function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <div className="rounded-xl border bg-muted/30 overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
});

// ============================================
// LEGEND COMPONENT
// ============================================

interface ChartLegendProps {
  data: ChartData[];
  colors?: string[];
}

const ChartLegend = memo(function ChartLegend({
  data,
  colors = CHART_COLORS,
}: ChartLegendProps) {
  if (data.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
      {data.map((entry, index) => (
        <span
          key={entry.name}
          className="inline-flex items-center gap-2 px-2 py-1 rounded-full border bg-background"
        >
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: colors[index % colors.length] }}
          />
          <span className="truncate max-w-[120px]">{entry.name}</span>
        </span>
      ))}
    </div>
  );
});

// ============================================
// SELECTION REASONS BADGE LIST
// ============================================

interface SelectionReasonsBadgesProps {
  data: ChartData[];
}

const SelectionReasonsBadges = memo(function SelectionReasonsBadges({
  data,
}: SelectionReasonsBadgesProps) {
  if (data.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-2 text-center">
        Run a simulation to see selection logic
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 text-[11px]">
      {data.map((item) => (
        <Badge key={item.name} variant="outline" className="gap-1 rounded-full">
          <span className="font-semibold text-xs">{item.value}</span>
          {item.name}
        </Badge>
      ))}
    </div>
  );
});

// ============================================
// MAIN COMPONENT
// ============================================

export const AnalyticsTabOptimized = memo(function AnalyticsTabOptimized({
  result,
}: AnalyticsTabOptimizedProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Lazy load charts after initial render
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsLoaded(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // Compute chart data with memoization
  const rawCompetencyData = useMemo<ChartData[]>(() => {
    if (result.distributionByCompetency?.length) {
      return result.distributionByCompetency.map((entry) => ({
        name: entry.competencyName,
        value: entry.questionCount,
      }));
    }

    // Guard against undefined composition
    if (!result.composition) {
      return [];
    }

    return Object.entries(result.composition).map(([name, value]) => ({
      name,
      value,
    }));
  }, [result.distributionByCompetency, result.composition]);

  const rawDifficultyData = useMemo<ChartData[]>(() => {
    const distribution = result.distributionByDifficulty || result.difficultyDistribution;

    // Guard against undefined distribution
    if (!distribution) {
      return [];
    }

    return Object.entries(distribution).map(([difficulty, value]) => ({
      name: difficulty,
      value,
    }));
  }, [result.distributionByDifficulty, result.difficultyDistribution]);

  const rawSelectionData = useMemo<ChartData[]>(() => {
    return Object.entries(result.selectionReasons || {}).map(([reason, value]) => ({
      name: selectionReasonLabels[reason as SelectionReason] || reason,
      value,
    }));
  }, [result.selectionReasons]);

  // Use deferred values for smoother UI updates during heavy operations
  const competencyData = useDeferredValue(rawCompetencyData);
  const difficultyData = useDeferredValue(rawDifficultyData);
  const selectionData = useDeferredValue(rawSelectionData);

  return (
    <div className="space-y-3">
      {/* Coverage by Competency */}
      <CollapsibleSection
        title="Coverage by competency"
        icon={<PieChartIcon className="h-4 w-4 text-muted-foreground" />}
        defaultOpen={true}
      >
        <CompetencyPieChart data={competencyData} isLoaded={isLoaded} />
        <ChartLegend data={competencyData} />
      </CollapsibleSection>

      {/* Difficulty Balance */}
      <CollapsibleSection
        title="Difficulty balance"
        icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        defaultOpen={true}
      >
        <DifficultyBarChart data={difficultyData} isLoaded={isLoaded} />
      </CollapsibleSection>

      {/* Selection Reasons */}
      <CollapsibleSection
        title="Selection reasons"
        icon={<Gauge className="h-4 w-4 text-muted-foreground" />}
        defaultOpen={false}
      >
        <SelectionReasonsBadges data={selectionData} />
      </CollapsibleSection>
    </div>
  );
});

export default AnalyticsTabOptimized;
