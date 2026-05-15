'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type {
  GapAnalysisChartProps,
  GapDataPoint,
  GapStatus,
  GapSummary,
} from '@/types/results';

// Helper Functions

/**
 * Determine gap status based on actual vs target scores
 */
export function getGapStatus(
  actual: number,
  target: number,
  tolerance: number = 5
): GapStatus {
  const gap = target - actual;
  if (gap <= -tolerance) return 'exceeds';
  if (Math.abs(gap) < tolerance) return 'meets';
  if (gap < 20) return 'below';
  return 'critical';
}

/**
 * Calculate summary statistics for gap data
 */
export function calculateGapSummary(
  data: GapDataPoint[],
  tolerance: number = 5
): GapSummary {
  if (data.length === 0) {
    return {
      averageGap: 0,
      exceedsCount: 0,
      meetsCount: 0,
      belowCount: 0,
      criticalCount: 0,
      overallStatus: 'meets',
    };
  }

  let totalGap = 0;
  let totalWeightedScore = 0;
  let totalWeight = 0;
  let exceedsCount = 0;
  let meetsCount = 0;
  let belowCount = 0;
  let criticalCount = 0;

  data.forEach((d) => {
    const status = getGapStatus(d.actualScore, d.targetScore, tolerance);
    totalGap += d.gap;

    if (d.weight) {
      totalWeightedScore += d.actualScore * d.weight;
      totalWeight += d.weight;
    }

    switch (status) {
      case 'exceeds':
        exceedsCount++;
        break;
      case 'meets':
        meetsCount++;
        break;
      case 'below':
        belowCount++;
        break;
      case 'critical':
        criticalCount++;
        break;
    }
  });

  const averageGap = totalGap / data.length;

  // Determine overall status
  let overallStatus: GapStatus = 'meets';
  if (criticalCount > 0) overallStatus = 'critical';
  else if (belowCount > exceedsCount + meetsCount) overallStatus = 'below';
  else if (exceedsCount > meetsCount) overallStatus = 'exceeds';

  return {
    averageGap,
    exceedsCount,
    meetsCount,
    belowCount,
    criticalCount,
    overallStatus,
    weightedAverageScore: totalWeight > 0 ? totalWeightedScore / totalWeight : undefined,
  };
}

// Status Colors & Icons

const STATUS_CONFIG: Record<
  GapStatus,
  { color: string; bg: string; icon: React.ComponentType<{ className?: string }> }
> = {
  exceeds: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500',
    icon: TrendingUp,
  },
  meets: {
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500',
    icon: Minus,
  },
  below: {
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500',
    icon: TrendingDown,
  },
  critical: {
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-500',
    icon: TrendingDown,
  },
};

// Gap Bar Component

interface GapBarProps {
  dataPoint: GapDataPoint;
  maxValue: number;
  passingThreshold: number;
  tolerance: number;
  animate: boolean;
  index: number;
  onClick?: (dataPoint: GapDataPoint) => void;
  isMobile?: boolean;
}

export function GapBar({
  dataPoint,
  maxValue,
  passingThreshold,
  tolerance,
  animate,
  index,
  onClick,
  isMobile = false,
}: GapBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const effectiveAnimate = animate && !shouldReduceMotion;

  const status = getGapStatus(dataPoint.actualScore, dataPoint.targetScore, tolerance);
  const config = STATUS_CONFIG[status];
  const actualPercent = (dataPoint.actualScore / maxValue) * 100;
  const targetPercent = (dataPoint.targetScore / maxValue) * 100;

  // Truncate name for mobile
  const displayName = isMobile && dataPoint.name.length > 14
    ? `${dataPoint.name.slice(0, 14)}...`
    : dataPoint.name;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={effectiveAnimate ? { opacity: 0, x: -20 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className={cn(
              'group relative flex items-center gap-2 py-2 px-2 rounded-lg transition-colors',
              'hover:bg-muted/50 cursor-pointer',
              isMobile ? 'gap-1.5' : 'gap-3'
            )}
            onClick={() => onClick?.(dataPoint)}
          >
            {/* Name */}
            <div
              className={cn(
                'font-medium text-foreground truncate shrink-0',
                isMobile ? 'text-xs w-[80px]' : 'text-sm w-[140px]'
              )}
            >
              {displayName}
            </div>

            {/* Bar container */}
            <div className="flex-1 relative h-6">
              {/* Background */}
              <div className="absolute inset-0 bg-muted/40 rounded" />

              {/* Target line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-muted-foreground/60 z-10"
                style={{ left: `${targetPercent}%` }}
              />

              {/* Actual bar */}
              <motion.div
                initial={effectiveAnimate ? { width: 0 } : false}
                animate={{ width: `${actualPercent}%` }}
                transition={{ delay: index * 0.05 + 0.2, duration: 0.5, ease: 'easeOut' }}
                className={cn('absolute top-0 bottom-0 rounded', config.bg)}
              />

              {/* Confidence interval error bars (whisker marks) */}
              {dataPoint.ciLower != null && dataPoint.ciUpper != null && (
                <>
                  {/* CI horizontal line */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-foreground/30 z-15"
                    style={{
                      left: `${(dataPoint.ciLower / maxValue) * 100}%`,
                      width: `${((dataPoint.ciUpper - dataPoint.ciLower) / maxValue) * 100}%`,
                    }}
                  />
                  {/* Left whisker cap */}
                  <div
                    className="absolute top-1 bottom-1 w-0.5 bg-foreground/30 z-15"
                    style={{ left: `${(dataPoint.ciLower / maxValue) * 100}%` }}
                  />
                  {/* Right whisker cap */}
                  <div
                    className="absolute top-1 bottom-1 w-0.5 bg-foreground/30 z-15"
                    style={{ left: `${(dataPoint.ciUpper / maxValue) * 100}%` }}
                  />
                </>
              )}

              {/* Score label inside bar */}
              <div
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 font-bold tabular-nums text-white px-1.5 z-20',
                  isMobile ? 'text-[10px]' : 'text-xs'
                )}
                style={{ left: Math.min(actualPercent - 1, 90) + '%' }}
              >
                {Math.round(dataPoint.actualScore)}
              </div>
            </div>

            {/* Status indicator */}
            <div
              className={cn(
                'shrink-0 flex items-center justify-center',
                isMobile ? 'w-5' : 'w-6'
              )}
            >
              <config.icon
                className={cn('w-4 h-4', config.color)}
              />
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{dataPoint.name}</p>
            <div className="text-xs space-y-0.5">
              <p>Your Score: <span className="font-bold">{Math.round(dataPoint.actualScore)}%</span></p>
              <p>Target: <span className="font-bold">{Math.round(dataPoint.targetScore)}%</span></p>
              <p className={config.color}>
                Gap: {dataPoint.gap > 0 ? '+' : ''}{Math.round(dataPoint.gap)}%
              </p>
              {dataPoint.ciLower != null && dataPoint.ciUpper != null && (
                <p className="text-muted-foreground">
                  95% CI: {Math.round(dataPoint.ciLower)}&ndash;{Math.round(dataPoint.ciUpper)}%
                </p>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Gap Legend Component

interface GapLegendProps {
  className?: string;
}

export function GapLegend({ className }: GapLegendProps) {
  return (
    <div className={cn('flex flex-wrap gap-3 text-xs', className)}>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded bg-emerald-500" />
        <span className="text-muted-foreground">Exceeds</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded bg-blue-500" />
        <span className="text-muted-foreground">Meets</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded bg-amber-500" />
        <span className="text-muted-foreground">Below</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded bg-red-500" />
        <span className="text-muted-foreground">Critical</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-0.5 h-3 bg-muted-foreground/60" />
        <span className="text-muted-foreground">Target</span>
      </div>
    </div>
  );
}

// Main Component

export function GapAnalysisChart({
  data,
  passingThreshold = 70,
  meetsTolerance = 5,
  height,
  showLegend = true,
  showGrid = true,
  animate = true,
  sortBy = 'gap',
  sortDirection = 'desc',
  maxItems,
  onBarClick,
  className,
}: GapAnalysisChartProps) {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);

  // Sort and limit data
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'gap':
          comparison = Math.abs(b.gap) - Math.abs(a.gap);
          break;
        case 'score':
          comparison = b.actualScore - a.actualScore;
          break;
        case 'weight':
          comparison = (b.weight ?? 0) - (a.weight ?? 0);
          break;
      }
      return sortDirection === 'desc' ? comparison : -comparison;
    });
  }, [data, sortBy, sortDirection]);

  // Apply max items limit
  const effectiveMaxItems = maxItems ?? (isMobile ? 5 : 8);
  const visibleData = isExpanded ? sortedData : sortedData.slice(0, effectiveMaxItems);
  const hasMore = sortedData.length > effectiveMaxItems;

  // Calculate summary
  const summary = useMemo(
    () => calculateGapSummary(data, meetsTolerance),
    [data, meetsTolerance]
  );

  // Determine chart height
  const chartHeight = height ?? (isMobile ? 'auto' : 'auto');

  return (
    <div className={cn('space-y-3', className)}>
      {/* Legend */}
      {showLegend && <GapLegend className="mb-2" />}

      {/* Chart area */}
      <div
        className="space-y-1"
        style={{ height: chartHeight !== 'auto' ? chartHeight : undefined }}
      >
        <AnimatePresence mode="popLayout">
          {visibleData.map((dataPoint, index) => (
            <GapBar
              key={dataPoint.id}
              dataPoint={dataPoint}
              maxValue={100}
              passingThreshold={passingThreshold}
              tolerance={meetsTolerance}
              animate={animate}
              index={index}
              onClick={onBarClick}
              isMobile={isMobile}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Expand/Collapse button */}
      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'w-full flex items-center justify-center gap-1.5 py-2 text-xs',
            'text-muted-foreground hover:text-foreground transition-colors',
            'border border-dashed border-muted-foreground/30 rounded-lg',
            'hover:border-muted-foreground/50'
          )}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show {sortedData.length - effectiveMaxItems} more
            </>
          )}
        </button>
      )}

      {/* Summary stats */}
      <div className={cn(
        'grid gap-2 pt-2 border-t',
        isMobile ? 'grid-cols-2' : 'grid-cols-4'
      )}>
        <div className="text-center p-2 bg-emerald-500/10 rounded-lg">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
            Exceeds
          </div>
          <div className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {summary.exceedsCount}
          </div>
        </div>
        <div className="text-center p-2 bg-blue-500/10 rounded-lg">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
            Meets
          </div>
          <div className="text-sm font-bold tabular-nums text-blue-600 dark:text-blue-400">
            {summary.meetsCount}
          </div>
        </div>
        <div className="text-center p-2 bg-amber-500/10 rounded-lg">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
            Below
          </div>
          <div className="text-sm font-bold tabular-nums text-amber-600 dark:text-amber-400">
            {summary.belowCount}
          </div>
        </div>
        <div className="text-center p-2 bg-red-500/10 rounded-lg">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
            Critical
          </div>
          <div className="text-sm font-bold tabular-nums text-red-600 dark:text-red-400">
            {summary.criticalCount}
          </div>
        </div>
      </div>

      {/* Screen reader: accessible data table */}
      <div className="sr-only" role="table" aria-label="Gap analysis data">
        <div role="rowgroup">
          <div role="row">
            <span role="columnheader">Competency</span>
            <span role="columnheader">Your Score</span>
            <span role="columnheader">Target</span>
            <span role="columnheader">Gap</span>
          </div>
        </div>
        <div role="rowgroup">
          {data.map((d) => (
            <div key={d.id} role="row">
              <span role="cell">{d.name}</span>
              <span role="cell">{Math.round(d.actualScore)}%</span>
              <span role="cell">{Math.round(d.targetScore)}%</span>
              <span role="cell">{d.gap > 0 ? '+' : ''}{Math.round(d.gap)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GapAnalysisChart;
