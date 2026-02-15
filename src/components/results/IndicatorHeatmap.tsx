'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { CompetencyScore } from '@/types/domain';

interface IndicatorHeatmapProps {
  competencies: CompetencyScore[];
  className?: string;
  onIndicatorClick?: (competencyId: string, indicatorId: string) => void;
}

/**
 * Returns a Tailwind background class based on percentage score.
 * Uses discrete color bands for consistent dark mode support.
 */
function getHeatmapBgClass(percentage: number): string {
  if (percentage >= 80) return 'bg-emerald-500/80 text-white';
  if (percentage >= 60) return 'bg-emerald-400/60 text-emerald-950 dark:text-emerald-50';
  if (percentage >= 40) return 'bg-amber-400/60 text-amber-950 dark:text-amber-50';
  if (percentage >= 20) return 'bg-orange-400/60 text-orange-950 dark:text-orange-50';
  return 'bg-red-400/60 text-red-950 dark:text-red-50';
}

/**
 * Returns a Tailwind width class for horizontal bar based on percentage.
 * Clamped to minimum visible width for very low scores.
 */
function getBarWidthStyle(percentage: number): string {
  const clamped = Math.max(4, Math.min(100, percentage));
  return `${clamped}%`;
}

/**
 * IndicatorHeatmap - visual grid showing per-indicator score breakdown.
 *
 * Desktop: CSS Grid with competency rows and indicator columns, color-coded cells.
 * Mobile: Stacked cards with horizontal progress bars per indicator.
 */
export function IndicatorHeatmap({
  competencies,
  className,
  onIndicatorClick,
}: IndicatorHeatmapProps) {
  const t = useTranslations('results.teamFit');
  const isMobile = useIsMobile();

  // Filter to competencies that have indicator scores
  const competenciesWithIndicators = useMemo(
    () => competencies.filter(c => c.indicatorScores && c.indicatorScores.length > 0),
    [competencies]
  );

  if (competenciesWithIndicators.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        {t('heatmap.noData')}
      </div>
    );
  }

  // Find max indicator count for grid column sizing
  const maxIndicators = Math.max(
    ...competenciesWithIndicators.map(c => c.indicatorScores!.length)
  );

  // ── Mobile layout: stacked cards with horizontal bars ──
  if (isMobile) {
    return (
      <div className={cn('space-y-3', className)}>
        {competenciesWithIndicators.map((comp, compIdx) => (
          <div
            key={comp.competencyId}
            className="rounded-lg border bg-card p-3 space-y-2"
            style={{
              animationDelay: `${compIdx * 80}ms`,
              animation: 'fadeInUp 0.3s ease-out both',
            }}
          >
            {/* Competency header */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-foreground truncate">
                {comp.competencyName}
              </span>
              <span className="text-xs font-bold tabular-nums text-muted-foreground shrink-0">
                {Math.round(comp.percentage)}%
              </span>
            </div>

            {/* Indicator bars */}
            <div className="space-y-1.5">
              {comp.indicatorScores!.map((ind) => (
                <button
                  key={ind.indicatorId}
                  type="button"
                  className="w-full text-left group"
                  onClick={() => onIndicatorClick?.(comp.competencyId, ind.indicatorId)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground truncate flex-1 min-w-0">
                      {ind.indicatorTitle}
                    </span>
                    <span className="text-[10px] font-semibold tabular-nums shrink-0">
                      {Math.round(ind.percentage)}%
                    </span>
                  </div>
                  <div className="mt-0.5 h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500 ease-out',
                        getHeatmapBgClass(ind.percentage)
                      )}
                      style={{ width: getBarWidthStyle(ind.percentage) }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Desktop layout: CSS Grid heatmap ──
  return (
    <div className={cn('overflow-x-auto', className)}>
      <div
        className="grid gap-px bg-border/50 rounded-lg overflow-hidden"
        style={{
          gridTemplateColumns: `minmax(140px, 1fr) repeat(${maxIndicators}, minmax(48px, 1fr))`,
        }}
      >
        {/* Header row - column labels (Indicator 1, 2, 3...) */}
        <div className="bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground" />
        {Array.from({ length: maxIndicators }, (_, i) => (
          <div
            key={`header-${i}`}
            className="bg-muted/30 px-1 py-2 text-center text-[10px] font-medium text-muted-foreground truncate"
          >
            {i + 1}
          </div>
        ))}

        {/* Data rows - one per competency */}
        {competenciesWithIndicators.map((comp, compIdx) => (
          <React.Fragment key={comp.competencyId}>
            {/* Competency name cell */}
            <div
              className="bg-card px-3 py-2 text-xs font-medium text-foreground flex items-center truncate"
              style={{
                animationDelay: `${compIdx * 60}ms`,
                animation: 'fadeInUp 0.3s ease-out both',
              }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="truncate cursor-default">
                    {comp.competencyName}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[200px]">
                  <p className="font-medium">{comp.competencyName}</p>
                  <p className="text-muted-foreground">
                    {Math.round(comp.percentage)}% overall
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Indicator cells */}
            {Array.from({ length: maxIndicators }, (_, i) => {
              const indicator = comp.indicatorScores![i];

              if (!indicator) {
                // Empty cell for competencies with fewer indicators
                return (
                  <div
                    key={`${comp.competencyId}-empty-${i}`}
                    className="bg-card"
                  />
                );
              }

              return (
                <Tooltip key={indicator.indicatorId}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        'flex items-center justify-center min-h-[48px] text-xs font-bold tabular-nums',
                        'transition-all duration-200 hover:scale-105 hover:z-10 hover:shadow-md',
                        'cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        getHeatmapBgClass(indicator.percentage)
                      )}
                      style={{
                        animationDelay: `${compIdx * 60 + i * 40}ms`,
                        animation: 'fadeInUp 0.3s ease-out both',
                      }}
                      onClick={() =>
                        onIndicatorClick?.(comp.competencyId, indicator.indicatorId)
                      }
                    >
                      {Math.round(indicator.percentage)}%
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[250px]">
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">
                        {indicator.indicatorTitle}
                      </p>
                      <div className="flex items-center justify-between gap-4 text-xs">
                        <span className="text-muted-foreground">
                          {t('heatmap.score')}
                        </span>
                        <span className="font-medium">
                          {indicator.score}/{indicator.maxScore} ({Math.round(indicator.percentage)}%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-xs">
                        <span className="text-muted-foreground">
                          {t('heatmap.questions', { count: indicator.questionsAnswered })}
                        </span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
