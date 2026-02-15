'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface SparklinePoint {
  value: number;
}

interface CompetencySparklineProps {
  /** Array of scores over time (oldest first) */
  data: SparklinePoint[];
  /** Width in pixels (default: 80) */
  width?: number;
  /** Height in pixels (default: 24) */
  height?: number;
  /** Line color CSS class (default: stroke-primary) */
  colorClass?: string;
  className?: string;
}

/**
 * CompetencySparkline - Tiny inline chart (80x24px) for competency score trends.
 * Renders a simple SVG polyline showing score trajectory over time.
 */
export function CompetencySparkline({
  data,
  width = 80,
  height = 24,
  colorClass,
  className,
}: CompetencySparklineProps) {
  const points = useMemo(() => {
    if (data.length < 2) return '';

    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Scale to 0-100 range
    const minVal = 0;
    const maxVal = 100;
    const range = maxVal - minVal || 1;

    return data
      .map((d, i) => {
        const x = padding + (i / (data.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((d.value - minVal) / range) * chartHeight;
        return `${x},${y}`;
      })
      .join(' ');
  }, [data, width, height]);

  if (data.length < 2) {
    return (
      <div
        className={cn('flex items-center justify-center text-[10px] text-muted-foreground', className)}
        style={{ width, height }}
      >
        --
      </div>
    );
  }

  // Determine trend for coloring
  const first = data[0].value;
  const last = data[data.length - 1].value;
  const defaultColor = last > first
    ? 'stroke-emerald-500'
    : last < first
      ? 'stroke-red-500'
      : 'stroke-muted-foreground';

  return (
    <svg
      width={width}
      height={height}
      className={cn('shrink-0', className)}
      role="img"
      aria-label={`Trend: ${Math.round(first)}% to ${Math.round(last)}%`}
    >
      <polyline
        points={points}
        fill="none"
        className={cn(colorClass ?? defaultColor)}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      {data.length >= 2 && (() => {
        const padding = 2;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        const lastX = padding + chartWidth;
        const lastY = padding + chartHeight - (last / 100) * chartHeight;
        return (
          <circle
            cx={lastX}
            cy={lastY}
            r={2}
            className={cn('fill-current', colorClass ?? defaultColor)}
          />
        );
      })()}
    </svg>
  );
}

export default CompetencySparkline;
