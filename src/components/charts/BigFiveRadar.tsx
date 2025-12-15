"use client";

import React, { useState, useEffect } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BigFiveProfile, bigFiveToArray, getBigFiveLabels } from '@/hooks/useBigFiveProjection';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Big Five trait colors - distinct, visually appealing colors for each personality dimension.
 * These are used for visual differentiation in insights and charts.
 */
export const BIG_FIVE_COLORS = {
  OPENNESS: {
    primary: '#8b5cf6',      // violet-500 - creativity, imagination
    light: '#a78bfa',        // violet-400
    dark: '#7c3aed',         // violet-600
  },
  CONSCIENTIOUSNESS: {
    primary: '#3b82f6',      // blue-500 - organization, discipline
    light: '#60a5fa',        // blue-400
    dark: '#2563eb',         // blue-600
  },
  EXTRAVERSION: {
    primary: '#f59e0b',      // amber-500 - energy, sociability
    light: '#fbbf24',        // amber-400
    dark: '#d97706',         // amber-600
  },
  AGREEABLENESS: {
    primary: '#10b981',      // emerald-500 - cooperation, empathy
    light: '#34d399',        // emerald-400
    dark: '#059669',         // emerald-600
  },
  EMOTIONAL_STABILITY: {
    primary: '#06b6d4',      // cyan-500 - calmness, resilience
    light: '#22d3ee',        // cyan-400
    dark: '#0891b2',         // cyan-600
  },
} as const;

/**
 * Hook to get computed CSS color values from CSS custom properties.
 * This is necessary because SVG elements don't properly resolve CSS variables
 * with oklch() values in some browsers.
 */
function useComputedColors() {
  const [colors, setColors] = useState({
    primary: '#6366f1',       // indigo-500 fallback
    border: '#e5e7eb',        // gray-200 fallback
    foreground: '#1f2937',    // gray-800 fallback
    mutedForeground: '#6b7280', // gray-500 fallback
    card: '#ffffff',          // white fallback
  });

  useEffect(() => {
    const computeColors = () => {
      if (typeof window === 'undefined') return;

      // Create a temporary element to compute colors
      const tempEl = document.createElement('div');
      tempEl.style.display = 'none';
      document.body.appendChild(tempEl);

      // Helper to get computed color
      const getColor = (cssVar: string, fallback: string): string => {
        tempEl.style.color = `var(${cssVar})`;
        const computed = getComputedStyle(tempEl).color;
        // If computed is valid (not empty or "inherit"), return it
        if (computed && computed !== 'inherit' && computed !== '') {
          return computed;
        }
        return fallback;
      };

      setColors({
        primary: getColor('--primary', '#6366f1'),
        border: getColor('--border', '#e5e7eb'),
        foreground: getColor('--foreground', '#1f2937'),
        mutedForeground: getColor('--muted-foreground', '#6b7280'),
        card: getColor('--card', '#ffffff'),
      });

      document.body.removeChild(tempEl);
    };

    computeColors();

    // Re-compute on theme change (dark mode toggle)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme') {
          computeColors();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    // Also listen for media query changes (system dark mode)
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

interface BigFiveRadarProps {
  profile: BigFiveProfile;
  title?: string;
  description?: string;
  showLegend?: boolean;
  height?: number;
}

/**
 * Recharts Radar visualization for Big Five personality profile.
 * 
 * Displays the five personality dimensions (OCEAN model) on a radar chart:
 * - Openness to Experience
 * - Conscientiousness
 * - Extraversion
 * - Agreeableness
 * - Emotional Stability
 * 
 * @param profile - Big Five profile with trait scores (0-100)
 * @param title - Optional chart title
 * @param description - Optional chart description
 * @param showLegend - Show chart legend (default: true)
 * @param height - Chart height in pixels (default: 400)
 */
export const BigFiveRadar = React.memo<BigFiveRadarProps>(({
  profile,
  title = "Personality Profile",
  description = "Big Five (OCEAN) personality dimensions derived from competency assessment",
  showLegend = true,
  height = 400
}) => {
  const isMobile = useIsMobile();
  const colors = useComputedColors();

  // Transform profile to array format for Recharts
  const chartData = React.useMemo(() => bigFiveToArray(profile), [profile]);

  // Responsive height: use prop on desktop, reduced on mobile
  const responsiveHeight = isMobile ? Math.min(height, 280) : height;
  const fontSize = isMobile ? 10 : 12;
  const radiusFontSize = isMobile ? 8 : 10;

  // Use indigo/purple gradient for personality visualization
  const radarStroke = '#6366f1';  // indigo-500
  const radarFillStart = '#818cf8'; // indigo-400
  const radarFillEnd = '#6366f1';  // indigo-500

  return (
    <Card className="w-full">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
        {description && (
          <CardDescription className="text-xs sm:text-sm line-clamp-2">
            {isMobile ? "Big Five personality dimensions" : description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ResponsiveContainer width="100%" height={responsiveHeight}>
          <RadarChart data={chartData}>
            {/* Gradient definition for filled area */}
            <defs>
              <radialGradient id="bigFiveRadarGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={radarFillStart} stopOpacity={0.7} />
                <stop offset="100%" stopColor={radarFillEnd} stopOpacity={0.2} />
              </radialGradient>
            </defs>
            <PolarGrid
              stroke={colors.border}
              strokeOpacity={0.6}
              gridType="polygon"
            />
            <PolarAngleAxis
              dataKey="trait"
              tick={{ fill: colors.foreground, fontSize, fontWeight: 500 }}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: colors.mutedForeground, fontSize: radiusFontSize }}
              tickCount={5}
              axisLine={false}
            />
            <Radar
              name="Personality Score"
              dataKey="value"
              stroke={radarStroke}
              strokeWidth={2}
              fill="url(#bigFiveRadarGradient)"
              fillOpacity={1}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload[0]) return null;
                const item = payload[0].payload as { trait: string; value: number };
                const traitKey = Object.keys(BIG_FIVE_COLORS).find(
                  k => TRAIT_DESCRIPTIONS[k as keyof BigFiveProfile]?.includes(item.trait.toLowerCase()) ||
                       item.trait.toUpperCase().replace(/\s+/g, '_') === k ||
                       item.trait === getBigFiveLabels()[k as keyof BigFiveProfile]
                ) as keyof typeof BIG_FIVE_COLORS | undefined;
                const traitColor = traitKey ? BIG_FIVE_COLORS[traitKey].primary : radarStroke;

                return (
                  <div
                    className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[160px]"
                    style={{ backgroundColor: colors.card }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: traitColor }}
                      />
                      <p className="font-medium text-sm" style={{ color: colors.foreground }}>
                        {item.trait}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs" style={{ color: colors.mutedForeground }}>
                        Score:
                      </span>
                      <span
                        className="text-lg font-bold tabular-nums"
                        style={{ color: traitColor }}
                      >
                        {item.value}%
                      </span>
                    </div>
                  </div>
                );
              }}
            />
            {showLegend && !isMobile && (
              <Legend
                wrapperStyle={{ color: colors.foreground, fontSize: '12px' }}
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

BigFiveRadar.displayName = 'BigFiveRadar';

/**
 * Trait descriptions for tooltips/help text
 */
export const TRAIT_DESCRIPTIONS: Record<keyof BigFiveProfile, string> = {
  OPENNESS: 'Imagination, creativity, curiosity, and willingness to explore new ideas',
  CONSCIENTIOUSNESS: 'Organization, dependability, discipline, and achievement orientation',
  EXTRAVERSION: 'Sociability, assertiveness, energy, and enthusiasm in social situations',
  AGREEABLENESS: 'Cooperation, empathy, trust, and concern for others',
  EMOTIONAL_STABILITY: 'Calmness, resilience, stress tolerance, and emotional control'
};

/**
 * Simplified version without card wrapper for embedding
 */
export const BigFiveRadarSimple = React.memo<Omit<BigFiveRadarProps, 'title' | 'description'>>(({
  profile,
  showLegend = false,
  height = 300
}) => {
  const isMobile = useIsMobile();
  const colors = useComputedColors();
  const chartData = React.useMemo(() => bigFiveToArray(profile), [profile]);

  // Responsive sizing
  const responsiveHeight = isMobile ? Math.min(height, 220) : height;
  const fontSize = isMobile ? 10 : 12;
  const radiusFontSize = isMobile ? 8 : 10;

  // Use indigo/purple gradient for personality visualization
  const radarStroke = '#6366f1';  // indigo-500
  const radarFillStart = '#818cf8'; // indigo-400
  const radarFillEnd = '#6366f1';  // indigo-500

  return (
    <ResponsiveContainer width="100%" height={responsiveHeight}>
      <RadarChart data={chartData}>
        {/* Gradient definition for filled area */}
        <defs>
          <radialGradient id="bigFiveRadarGradientSimple" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={radarFillStart} stopOpacity={0.7} />
            <stop offset="100%" stopColor={radarFillEnd} stopOpacity={0.2} />
          </radialGradient>
        </defs>
        <PolarGrid
          stroke={colors.border}
          strokeOpacity={0.6}
          gridType="polygon"
        />
        <PolarAngleAxis
          dataKey="trait"
          tick={{ fill: colors.foreground, fontSize, fontWeight: 500 }}
          tickLine={false}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: colors.mutedForeground, fontSize: radiusFontSize }}
          tickCount={5}
          axisLine={false}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke={radarStroke}
          strokeWidth={2}
          fill="url(#bigFiveRadarGradientSimple)"
          fillOpacity={1}
          isAnimationActive={true}
          animationDuration={800}
          animationEasing="ease-out"
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || !payload[0]) return null;
            const item = payload[0].payload as { trait: string; value: number };
            const bigFiveLabels = getBigFiveLabels();
            const traitKey = Object.keys(BIG_FIVE_COLORS).find(
              k => item.trait === bigFiveLabels[k as keyof BigFiveProfile]
            ) as keyof typeof BIG_FIVE_COLORS | undefined;
            const traitColor = traitKey ? BIG_FIVE_COLORS[traitKey].primary : radarStroke;

            return (
              <div
                className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[160px]"
                style={{ backgroundColor: colors.card }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: traitColor }}
                  />
                  <p className="font-medium text-sm" style={{ color: colors.foreground }}>
                    {item.trait}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs" style={{ color: colors.mutedForeground }}>
                    Score:
                  </span>
                  <span
                    className="text-lg font-bold tabular-nums"
                    style={{ color: traitColor }}
                  >
                    {item.value}%
                  </span>
                </div>
              </div>
            );
          }}
        />
        {showLegend && !isMobile && (
          <Legend wrapperStyle={{ color: colors.foreground, fontSize: '12px' }} />
        )}
      </RadarChart>
    </ResponsiveContainer>
  );
});

BigFiveRadarSimple.displayName = 'BigFiveRadarSimple';
