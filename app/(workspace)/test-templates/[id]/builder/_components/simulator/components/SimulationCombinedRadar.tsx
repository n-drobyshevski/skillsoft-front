'use client';

import React, { useMemo, useState, useEffect } from 'react';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  CompetencyDistribution,
  transformSimulationToRadar,
  estimateBigFiveFromCompetencies,
  truncateLabel,
  COMPETENCY_COLORS,
  BIG_FIVE_TRAIT_COLORS,
} from '../utils/transformSimulationToRadar';
import { BigFiveProfile } from '@/hooks/useBigFiveProjection';

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

/**
 * Hook to get computed CSS color values from CSS custom properties.
 * Necessary because SVG elements don't properly resolve CSS variables
 * with oklch() values in some browsers.
 */
function useComputedColors() {
  const [colors, setColors] = useState({
    primary: '#3b82f6', // blue-500 fallback
    secondary: '#8b5cf6', // violet-500 fallback
    border: '#e5e7eb', // gray-200 fallback
    foreground: '#1f2937', // gray-800 fallback
    mutedForeground: '#6b7280', // gray-500 fallback
    card: '#ffffff', // white fallback
  });

  useEffect(() => {
    const computeColors = () => {
      if (typeof window === 'undefined') return;

      const tempEl = document.createElement('div');
      tempEl.style.display = 'none';
      document.body.appendChild(tempEl);

      const getColor = (cssVar: string, fallback: string): string => {
        tempEl.style.color = `var(${cssVar})`;
        const computed = getComputedStyle(tempEl).color;
        if (computed && computed !== 'inherit' && computed !== '') {
          return computed;
        }
        return fallback;
      };

      setColors({
        primary: getColor('--primary', '#3b82f6'),
        secondary: getColor('--chart-2', '#8b5cf6'),
        border: getColor('--border', '#e5e7eb'),
        foreground: getColor('--foreground', '#1f2937'),
        mutedForeground: getColor('--muted-foreground', '#6b7280'),
        card: getColor('--card', '#ffffff'),
      });

      document.body.removeChild(tempEl);
    };

    computeColors();

    // Re-compute on theme change
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme') {
          computeColors();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => computeColors();
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return colors;
}

// ============================================
// CONFIG
// ============================================

const CONFIG = {
  default: {
    desktop: {
      height: 340,
      outerRadius: '75%',
      fontSize: 11,
      radiusFontSize: 9,
      maxLabelLength: 14,
    },
    mobile: {
      height: 280,
      outerRadius: '65%',
      fontSize: 9,
      radiusFontSize: 8,
      maxLabelLength: 10,
    },
  },
  compact: {
    desktop: {
      height: 260,
      outerRadius: '70%',
      fontSize: 10,
      radiusFontSize: 8,
      maxLabelLength: 12,
    },
    mobile: {
      height: 220,
      outerRadius: '60%',
      fontSize: 8,
      radiusFontSize: 7,
      maxLabelLength: 8,
    },
  },
};

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
    const isMobile = useIsMobile();
    const colors = useComputedColors();

    // Get config based on variant and device
    const config = CONFIG[variant][isMobile ? 'mobile' : 'desktop'];
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
          No competencies selected
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

    return (
      <div
        className={cn('w-full', className)}
        style={{ height: chartHeight }}
        role="img"
        aria-label={`Radar chart showing ${radarData.competencies.length} competencies${
          showBigFive ? ' and Big Five personality traits' : ''
        }`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius={config.outerRadius}
            data={chartData}
            margin={isMobile ? { top: 5, right: 5, bottom: 5, left: 5 } : { top: 10, right: 10, bottom: 10, left: 10 }}
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
              strokeWidth={isMobile ? 0.5 : 1}
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
              tickCount={isMobile ? 3 : 5}
              tickFormatter={(value) => {
                const numValue = Number(value);
                if (isMobile && numValue !== 0 && numValue !== 50 && numValue !== 100) {
                  return '';
                }
                return `${numValue}`;
              }}
              axisLine={false}
            />

            {/* Competency radar */}
            <Radar
              name="Competency Weight"
              dataKey="competency"
              stroke="#3b82f6"
              strokeWidth={isMobile ? 1.5 : 2}
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
                name="Big Five"
                dataKey="bigFive"
                stroke="#8b5cf6"
                strokeWidth={isMobile ? 1.5 : 2}
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
                        {isCompetency ? 'Weight:' : 'Score:'}
                      </span>
                      <span
                        className="text-lg font-bold tabular-nums"
                        style={{ color }}
                      >
                        {value}%
                      </span>
                    </div>
                    {isCompetency && (
                      <p
                        className="text-[10px] mt-1.5 pt-1.5 border-t border-border/50"
                        style={{ color: colors.mutedForeground }}
                      >
                        Relative weight in assessment
                      </p>
                    )}
                    {!isCompetency && (
                      <p
                        className="text-[10px] mt-1.5 pt-1.5 border-t border-border/50"
                        style={{ color: colors.mutedForeground }}
                      >
                        Estimated personality trait
                      </p>
                    )}
                  </div>
                );
              }}
            />

            {/* Legend (desktop only) */}
            {!isMobile && showBigFive && radarData.bigFive.length > 0 && (
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
