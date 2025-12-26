'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
} from 'recharts';

interface ScoreSparklineProps {
  scores: number[];
  className?: string;
  height?: number;
  width?: number;
}

/**
 * Score Sparkline Component
 *
 * A compact area chart showing score trend over recent tests.
 * Designed to fit in stat cards as a visual trend indicator.
 *
 * Features:
 * - Gradient fill for visual appeal
 * - Responsive width
 * - Animated entrance
 * - CSS variable for theming
 */
export function ScoreSparkline({
  scores,
  className,
  height = 24,
  width = 64,
}: ScoreSparklineProps) {
  // Transform scores to chart data
  const data = useMemo(() => {
    return scores.map((score, index) => ({
      index,
      score,
    }));
  }, [scores]);

  // Don't render if insufficient data
  if (scores.length < 2) {
    return null;
  }

  // Calculate min/max for Y axis domain with padding
  const minScore = Math.max(0, Math.min(...scores) - 10);
  const maxScore = Math.min(100, Math.max(...scores) + 10);

  return (
    <div className={className} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="hsl(var(--primary))"
                stopOpacity={0.4}
              />
              <stop
                offset="100%"
                stopColor="hsl(var(--primary))"
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <YAxis domain={[minScore, maxScore]} hide />
          <Area
            type="monotone"
            dataKey="score"
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
            fill="url(#sparklineGradient)"
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Extract recent scores from test results for sparkline display
 */
export function extractRecentScores(
  results: Array<{ overallPercentage: number }>,
  count: number = 10
): number[] {
  return results
    .slice(0, count)
    .map((r) => r.overallPercentage)
    .reverse(); // Oldest to newest for left-to-right reading
}
