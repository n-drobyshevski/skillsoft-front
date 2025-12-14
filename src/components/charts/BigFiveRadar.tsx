"use client";

import React from 'react';
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
import { BigFiveProfile, bigFiveToArray } from '@/hooks/useBigFiveProjection';
import { useIsMobile } from '@/hooks/use-mobile';

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

  // Transform profile to array format for Recharts
  const chartData = React.useMemo(() => bigFiveToArray(profile), [profile]);

  // Responsive height: use prop on desktop, reduced on mobile
  const responsiveHeight = isMobile ? Math.min(height, 280) : height;
  const fontSize = isMobile ? 10 : 12;
  const radiusFontSize = isMobile ? 8 : 10;

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
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="trait"
              tick={{ fill: 'hsl(var(--foreground))', fontSize }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: radiusFontSize }}
            />
            <Radar
              name="Personality Score"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.6}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: isMobile ? '12px' : '14px',
                padding: isMobile ? '8px' : '12px'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            {showLegend && !isMobile && (
              <Legend
                wrapperStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}
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
  const chartData = React.useMemo(() => bigFiveToArray(profile), [profile]);

  // Responsive sizing
  const responsiveHeight = isMobile ? Math.min(height, 220) : height;
  const fontSize = isMobile ? 10 : 12;
  const radiusFontSize = isMobile ? 8 : 10;

  return (
    <ResponsiveContainer width="100%" height={responsiveHeight}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="trait"
          tick={{ fill: 'hsl(var(--foreground))', fontSize }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: radiusFontSize }}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.6}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: isMobile ? '12px' : '14px',
            padding: isMobile ? '8px' : '12px'
          }}
        />
        {showLegend && !isMobile && <Legend wrapperStyle={{ fontSize: '12px' }} />}
      </RadarChart>
    </ResponsiveContainer>
  );
});

BigFiveRadarSimple.displayName = 'BigFiveRadarSimple';
