'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';
import { BigFiveProfile, getBigFiveLabels } from '@/hooks/useBigFiveProjection';

/**
 * Hook to detect user's reduced motion preference.
 * Respects the prefers-reduced-motion media query for accessibility.
 */
function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

/**
 * Big Five trait colors - distinct, visually appealing colors for each personality dimension.
 * Matches the existing BigFiveRadar component for consistency.
 */
const BIG_FIVE_COLORS = {
  OPENNESS: {
    primary: '#8b5cf6',      // violet-500 - creativity, imagination
    light: '#a78bfa',        // violet-400
  },
  CONSCIENTIOUSNESS: {
    primary: '#3b82f6',      // blue-500 - organization, discipline
    light: '#60a5fa',        // blue-400
  },
  EXTRAVERSION: {
    primary: '#f59e0b',      // amber-500 - energy, sociability
    light: '#fbbf24',        // amber-400
  },
  AGREEABLENESS: {
    primary: '#10b981',      // emerald-500 - cooperation, empathy
    light: '#34d399',        // emerald-400
  },
  EMOTIONAL_STABILITY: {
    primary: '#06b6d4',      // cyan-500 - calmness, resilience
    light: '#22d3ee',        // cyan-400
  },
} as const;

/**
 * Trait order for consistent display
 */
const TRAIT_ORDER: Array<keyof BigFiveProfile> = [
  'OPENNESS',
  'CONSCIENTIOUSNESS',
  'EXTRAVERSION',
  'AGREEABLENESS',
  'EMOTIONAL_STABILITY',
];

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
    background: '#ffffff',    // white fallback
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
        background: getColor('--background', '#ffffff'),
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

interface BigFiveChartProps {
  profile: BigFiveProfile;
}

/**
 * Big Five Radar Chart - Client Component
 *
 * Visualizes personality traits on a radar/spider chart with:
 * - Gradient fill for visual appeal
 * - Trait-specific colors in tooltips
 * - Theme-aware coloring (dark mode support)
 * - Responsive sizing for mobile
 */
export function BigFiveChart({ profile }: BigFiveChartProps) {
  const isMobile = useIsMobile();
  const colors = useComputedColors();
  const labels = getBigFiveLabels();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Radar colors - using indigo for professional appearance
  const radarStroke = '#6366f1';     // indigo-500
  const radarFillStart = '#818cf8';  // indigo-400
  const radarFillEnd = '#6366f1';    // indigo-500

  // Transform profile to chart data with trait keys for tooltip coloring
  const data = useMemo(() =>
    TRAIT_ORDER.map((trait) => ({
      // eslint-disable-next-line security/detect-object-injection
      trait: labels[trait],
      traitKey: trait,
      // eslint-disable-next-line security/detect-object-injection
      value: profile[trait],
      fullMark: 100,
    })),
    [profile, labels]
  );

  // Responsive sizing
  const fontSize = isMobile ? 10 : 12;
  const radiusFontSize = isMobile ? 8 : 10;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius={isMobile ? '68%' : '75%'} data={data}>
        {/* Gradient definition for filled area */}
        <defs>
          <radialGradient id="profileBigFiveGradient" cx="50%" cy="50%" r="50%">
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
          tick={{
            fill: colors.foreground,
            fontSize,
            fontWeight: 500
          }}
          tickLine={false}
        />

        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{
            fill: colors.mutedForeground,
            fontSize: radiusFontSize
          }}
          tickCount={5}
          axisLine={false}
        />

        <Radar
          name="Профиль"
          dataKey="value"
          stroke={radarStroke}
          strokeWidth={2}
          fill="url(#profileBigFiveGradient)"
          fillOpacity={1}
          isAnimationActive={!prefersReducedMotion}
          animationDuration={prefersReducedMotion ? 0 : 800}
          animationEasing="ease-out"
        />

        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || !payload[0]) return null;

            const item = payload[0].payload as {
              trait: string;
              traitKey: keyof BigFiveProfile;
              value: number
            };

            const traitColor = BIG_FIVE_COLORS[item.traitKey]?.primary || radarStroke;

            return (
              <div
                className="rounded-lg shadow-lg p-3 min-w-[160px] border"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: traitColor }}
                  />
                  <p
                    className="font-medium text-sm"
                    style={{ color: colors.foreground }}
                  >
                    {item.trait}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span
                    className="text-xs"
                    style={{ color: colors.mutedForeground }}
                  >
                    Балл:
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
      </RadarChart>
    </ResponsiveContainer>
  );
}

// Export for potential reuse
export { BIG_FIVE_COLORS };
