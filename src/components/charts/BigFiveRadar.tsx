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
import { BigFiveProfile, bigFiveToArray, getBigFiveLabels } from '@/hooks/useBigFiveProjection';

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
  // Transform profile to array format for Recharts
  const chartData = React.useMemo(() => bigFiveToArray(profile), [profile]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RadarChart data={chartData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="trait"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
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
                borderRadius: '6px'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            {showLegend && (
              <Legend
                wrapperStyle={{ color: 'hsl(var(--foreground))' }}
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
  const chartData = React.useMemo(() => bigFiveToArray(profile), [profile]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="trait"
          tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
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
            borderRadius: '6px'
          }}
        />
        {showLegend && <Legend />}
      </RadarChart>
    </ResponsiveContainer>
  );
});

BigFiveRadarSimple.displayName = 'BigFiveRadarSimple';
