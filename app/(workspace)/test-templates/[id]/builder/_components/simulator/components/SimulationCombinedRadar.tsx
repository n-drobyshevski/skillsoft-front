'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import {
  CompetencyDistribution,
  transformSimulationToRadar,
  estimateBigFiveFromCompetencies,
  truncateLabel,
  BIG_FIVE_TRAIT_COLORS,
} from '../utils/transformSimulationToRadar';
import { BigFiveProfile } from '@/hooks/useBigFiveProjection';
import { useComputedColors } from '@/hooks/useComputedColors';

// ============================================
// TYPES
// ============================================

interface SimulationCombinedRadarProps {
  distributionByCompetency: CompetencyDistribution[];
  /** Show Big Five traits alongside competencies */
  showBigFive?: boolean;
  /** Custom Big Five profile (if available) - otherwise estimated from competencies */
  bigFiveProfile?: BigFiveProfile;
  /** Maximum number of competencies to display (default: 6) */
  maxCompetencies?: number;
  /** Chart height in pixels */
  height?: number;
  /** Variant for mobile vs desktop sizing */
  variant?: 'default' | 'compact';
  /** Optional class name */
  className?: string;
}

// ============================================
// HOOKS
// ============================================

// ============================================
// CONTAINER SIZE HOOK
// ============================================

/**
 * Hook to measure actual container width via ResizeObserver.
 * Enables continuous responsive sizing instead of binary mobile/desktop.
 */
function useContainerSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
        setWidth(w);
      }
    });

    observer.observe(el);
    // Initial measurement
    setWidth(el.clientWidth);

    return () => observer.disconnect();
  }, [ref]);

  return width;
}

// ============================================
// CONFIG
// ============================================

interface ChartConfig {
  height: number;
  outerRadius: string;
  fontSize: number;
  radiusFontSize: number;
  maxLabelLength: number;
  showLegend: boolean;
  showDetailedTooltip: boolean;
  tickCount: number;
}

/**
 * Derive chart config from actual container width for smooth responsive sizing.
 * Falls back to static configs when container width is not yet measured.
 */
function getResponsiveConfig(containerWidth: number, variant: 'default' | 'compact'): ChartConfig {
  const isCompact = variant === 'compact';

  // Breakpoints: <280 (tiny), 280-400 (small/mobile), 400-550 (medium), 550+ (large/desktop)
  if (containerWidth > 0 && containerWidth < 280) {
    return {
      height: isCompact ? 200 : 240,
      outerRadius: '55%',
      fontSize: 7,
      radiusFontSize: 6,
      maxLabelLength: 7,
      showLegend: false,
      showDetailedTooltip: false,
      tickCount: 3,
    };
  }
  if (containerWidth > 0 && containerWidth < 400) {
    return {
      height: isCompact ? 220 : 280,
      outerRadius: isCompact ? '60%' : '65%',
      fontSize: isCompact ? 8 : 9,
      radiusFontSize: isCompact ? 7 : 8,
      maxLabelLength: isCompact ? 8 : 10,
      showLegend: false,
      showDetailedTooltip: true,
      tickCount: 3,
    };
  }
  if (containerWidth > 0 && containerWidth < 550) {
    return {
      height: isCompact ? 240 : 300,
      outerRadius: isCompact ? '65%' : '70%',
      fontSize: isCompact ? 9 : 10,
      radiusFontSize: isCompact ? 7 : 8,
      maxLabelLength: isCompact ? 10 : 12,
      showLegend: true,
      showDetailedTooltip: true,
      tickCount: 4,
    };
  }
  // 550+ or not yet measured (0)
  return {
    height: isCompact ? 260 : 340,
    outerRadius: isCompact ? '70%' : '75%',
    fontSize: isCompact ? 10 : 11,
    radiusFontSize: isCompact ? 8 : 9,
    maxLabelLength: isCompact ? 12 : 14,
    showLegend: true,
    showDetailedTooltip: true,
    tickCount: 5,
  };
}

// ============================================
// COMPONENT
// ============================================

export const SimulationCombinedRadar = React.memo<SimulationCombinedRadarProps>(
  ({
    distributionByCompetency,
    showBigFive = true,
    bigFiveProfile,
    maxCompetencies = 6,
    height,
    variant = 'default',
    className,
  }) => {
    const t = useTranslations('builder.simulator');
    const containerRef = useRef<HTMLDivElement>(null);
    const containerWidth = useContainerSize(containerRef);
    const colors = useComputedColors({
      primary: ['--primary', '#3b82f6'],
      secondary: ['--chart-2', '#8b5cf6'],
      border: ['--border', '#e5e7eb'],
      foreground: ['--foreground', '#1f2937'],
      mutedForeground: ['--muted-foreground', '#6b7280'],
      card: ['--card', '#ffffff'],
    });

    // Responsive config derived from actual container width
    const config = useMemo(
      () => getResponsiveConfig(containerWidth, variant),
      [containerWidth, variant]
    );
    const chartHeight = height || config.height;

    // Generate or use Big Five profile
    const effectiveBigFive = useMemo(() => {
      if (!showBigFive) return undefined;
      if (bigFiveProfile) return bigFiveProfile;
      return estimateBigFiveFromCompetencies(distributionByCompetency);
    }, [showBigFive, bigFiveProfile, distributionByCompetency]);

    // Transform data to radar format
    const radarData = useMemo(() => {
      return transformSimulationToRadar(distributionByCompetency, {
        maxCompetencies,
        showBigFive,
        bigFiveProfile: effectiveBigFive,
      });
    }, [distributionByCompetency, maxCompetencies, showBigFive, effectiveBigFive]);

    // Early return for empty data
    if (distributionByCompetency.length === 0) {
      return (
        <div
          className={cn(
            'flex items-center justify-center text-sm text-muted-foreground',
            className
          )}
          style={{ height: chartHeight }}
        >
          {t('radar.noCompetencies')}
        </div>
      );
    }

    // Create combined data for the chart
    // We need a unified axis, so we combine both datasets with a discriminator
    const chartData = showBigFive && radarData.bigFive.length > 0
      ? [
          ...radarData.competencies.map(d => ({
            ...d,
            competency: d.value,
            bigFive: null as number | null,
          })),
          ...radarData.bigFive.map(d => ({
            ...d,
            competency: null as number | null,
            bigFive: d.value,
          })),
        ]
      : radarData.competencies.map(d => ({
          ...d,
          competency: d.value,
          bigFive: null as number | null,
        }));

    const isNarrow = containerWidth > 0 && containerWidth < 400;
    const margin = isNarrow
      ? { top: 5, right: 5, bottom: 5, left: 5 }
      : { top: 10, right: 10, bottom: 10, left: 10 };

    return (
      <div
        ref={containerRef}
        className={cn('w-full', className)}
        style={{ height: chartHeight }}
        role="img"
        aria-label={showBigFive
          ? t('radar.ariaLabelWithBigFive', { count: radarData.competencies.length })
          : t('radar.ariaLabel', { count: radarData.competencies.length })
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius={config.outerRadius}
            data={chartData}
            margin={margin}
          >
            {/* Gradient definitions */}
            <defs>
              {/* Competency gradient (blue) */}
              <radialGradient id="simulationCompetencyGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.15} />
              </radialGradient>
              {/* Big Five gradient (violet) */}
              <radialGradient id="simulationBigFiveGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
              </radialGradient>
            </defs>

            {/* Background grid */}
            <PolarGrid
              stroke={colors.border}
              strokeOpacity={0.5}
              strokeWidth={isNarrow ? 0.5 : 1}
              gridType="polygon"
            />

            {/* Axis labels */}
            <PolarAngleAxis
              dataKey="subject"
              tick={({ x, y, payload, textAnchor }) => {
                const item = chartData.find(d => d.subject === payload.value);
                const isCompetency = item?.type === 'competency';
                const label = truncateLabel(payload.value, config.maxLabelLength);

                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor={textAnchor}
                    fill={isCompetency ? colors.foreground : '#8b5cf6'}
                    fontSize={config.fontSize}
                    fontWeight={isCompetency ? 500 : 600}
                    className="select-none"
                  >
                    {label}
                  </text>
                );
              }}
              tickLine={false}
            />

            {/* Score axis */}
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{
                fill: colors.mutedForeground,
                fontSize: config.radiusFontSize,
              }}
              tickCount={config.tickCount}
              tickFormatter={(value) => {
                const numValue = Number(value);
                if (isNarrow && numValue !== 0 && numValue !== 50 && numValue !== 100) {
                  return '';
                }
                return `${numValue}`;
              }}
              axisLine={false}
            />

            {/* Competency radar */}
            <Radar
              name={t('radar.competencyWeight')}
              dataKey="competency"
              stroke="#3b82f6"
              strokeWidth={isNarrow ? 1.5 : 2}
              fill="url(#simulationCompetencyGradient)"
              fillOpacity={1}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
              dot={false}
            />

            {/* Big Five radar (if enabled) */}
            {showBigFive && radarData.bigFive.length > 0 && (
              <Radar
                name={t('radar.bigFive')}
                dataKey="bigFive"
                stroke="#8b5cf6"
                strokeWidth={isNarrow ? 1.5 : 2}
                strokeDasharray="5 3"
                fill="url(#simulationBigFiveGradient)"
                fillOpacity={1}
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-out"
                dot={false}
              />
            )}

            {/* Interactive tooltip */}
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload[0]) return null;

                const item = payload[0].payload;
                const isCompetency = item.type === 'competency';
                const value = isCompetency ? item.competency : item.bigFive;
                const color = isCompetency
                  ? '#3b82f6'
                  : BIG_FIVE_TRAIT_COLORS[item.id as keyof BigFiveProfile] || '#8b5cf6';

                // Compact tooltip for very narrow containers
                if (!config.showDetailedTooltip) {
                  return (
                    <div
                      className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg shadow-lg px-2.5 py-1.5"
                      style={{ backgroundColor: colors.card }}
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs font-medium" style={{ color: colors.foreground }}>
                          {truncateLabel(item.subject, 12)}
                        </span>
                        <span className="text-xs font-bold tabular-nums" style={{ color }}>
                          {Math.round(value)}%
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    className="bg-popover/95 backdrop-blur-sm border border-border rounded-xl shadow-xl p-3 min-w-[160px]"
                    style={{ backgroundColor: colors.card }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <p
                        className="font-medium text-sm"
                        style={{ color: colors.foreground }}
                      >
                        {item.subject}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span
                        className="text-xs"
                        style={{ color: colors.mutedForeground }}
                      >
                        {isCompetency ? t('radar.weight') : t('radar.score')}
                      </span>
                      <span
                        className="text-lg font-bold tabular-nums"
                        style={{ color }}
                      >
                        {Math.round(value)}%
                      </span>
                    </div>
                    {isCompetency && (
                      <p
                        className="text-[10px] mt-1.5 pt-1.5 border-t border-border/50"
                        style={{ color: colors.mutedForeground }}
                      >
                        {t('radar.relativeWeight')}
                      </p>
                    )}
                    {!isCompetency && (
                      <p
                        className="text-[10px] mt-1.5 pt-1.5 border-t border-border/50"
                        style={{ color: colors.mutedForeground }}
                      >
                        {t('radar.estimatedTrait')}
                      </p>
                    )}
                  </div>
                );
              }}
            />

            {/* Legend - hidden on narrow containers */}
            {config.showLegend && showBigFive && radarData.bigFive.length > 0 && (
              <Legend
                wrapperStyle={{
                  color: colors.foreground,
                  fontSize: '11px',
                  paddingTop: '8px',
                }}
                iconType="circle"
                iconSize={8}
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

SimulationCombinedRadar.displayName = 'SimulationCombinedRadar';

export default SimulationCombinedRadar;
