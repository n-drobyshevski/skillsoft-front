'use client';

import { useMemo } from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, Label } from 'recharts';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import type { ReliabilityStatus } from '@/types/psychometrics';

interface RadialReliabilityChartProps {
  /** Cronbach's Alpha value (0-1) or null for insufficient data */
  value: number | null | undefined;
  /** Display name for the competency */
  competencyName?: string;
  /** Number of responses used in calculation */
  sampleSize?: number | null;
  /** Number of items in the competency */
  itemCount?: number | null;
  /** Chart size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    width: 100,
    height: 100,
    innerRadius: 30,
    outerRadius: 42,
    fontSize: 16,
    labelSize: 9,
    nameSize: 11,
  },
  md: {
    width: 140,
    height: 140,
    innerRadius: 42,
    outerRadius: 58,
    fontSize: 20,
    labelSize: 10,
    nameSize: 12,
  },
  lg: {
    width: 180,
    height: 180,
    innerRadius: 55,
    outerRadius: 75,
    fontSize: 26,
    labelSize: 11,
    nameSize: 13,
  },
};

// Color configuration based on alpha value ranges
interface StatusConfig {
  color: string;
  bgColor: string;
  label: string;
  labelEn: string;
}

function getStatusConfig(value: number | null | undefined): StatusConfig {
  if (value == null) {
    return {
      color: 'hsl(var(--muted-foreground))',
      bgColor: 'hsl(var(--muted))',
      label: 'Нет данных',
      labelEn: 'No Data',
    };
  }
  if (value >= 0.8) {
    return {
      color: 'hsl(142 76% 36%)', // emerald-600
      bgColor: 'hsl(142 76% 36% / 0.15)',
      label: 'Отлично',
      labelEn: 'Excellent',
    };
  }
  if (value >= 0.7) {
    return {
      color: 'hsl(217 91% 60%)', // blue-500
      bgColor: 'hsl(217 91% 60% / 0.15)',
      label: 'Хорошо',
      labelEn: 'Good',
    };
  }
  if (value >= 0.6) {
    return {
      color: 'hsl(38 92% 50%)', // amber-500
      bgColor: 'hsl(38 92% 50% / 0.15)',
      label: 'Допустимо',
      labelEn: 'Acceptable',
    };
  }
  return {
    color: 'hsl(0 84% 60%)', // red-500
    bgColor: 'hsl(0 84% 60% / 0.15)',
    label: 'Ненадежный',
    labelEn: 'Unreliable',
  };
}

const chartConfig: ChartConfig = {
  value: { label: 'Alpha' },
  background: { label: 'Background' },
};

export function RadialReliabilityChart({
  value,
  competencyName,
  sampleSize,
  itemCount,
  size = 'md',
  className,
  onClick,
}: RadialReliabilityChartProps) {
  const config = sizeConfig[size];
  const statusConfig = getStatusConfig(value);

  // Normalize value to percentage for the chart (0-100)
  const displayValue = value != null ? Math.min(Math.max(value, 0), 1) * 100 : 0;

  const chartData = useMemo(() => [
    {
      name: 'reliability',
      value: displayValue,
      fill: statusConfig.color,
    },
  ], [displayValue, statusConfig.color]);

  return (
    <div
      className={cn(
        'flex flex-col items-center transition-all',
        onClick && 'cursor-pointer hover:opacity-80 active:scale-[0.98]',
        className
      )}
      onClick={onClick}
      role="meter"
      aria-label={`${competencyName ?? 'Competency'} reliability: ${value != null ? value.toFixed(2) : 'no data'}`}
      aria-valuenow={value != null ? value * 100 : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={`${value != null ? value.toFixed(2) : 'No data'} - ${statusConfig.labelEn}`}
    >
      <ChartContainer
        config={chartConfig}
        className="mx-auto"
        style={{
          width: config.width,
          height: config.height * 0.7,
        }}
      >
        <RadialBarChart
          data={chartData}
          startAngle={180}
          endAngle={0}
          innerRadius={config.innerRadius}
          outerRadius={config.outerRadius}
          barSize={config.outerRadius - config.innerRadius}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: 'hsl(var(--muted) / 0.4)' }}
            dataKey="value"
            cornerRadius={10}
            fill={statusConfig.color}
          />
          <Label
            content={({ viewBox }) => {
              if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) - 4}
                      style={{
                        fontSize: config.fontSize,
                        fontWeight: 700,
                        fill: statusConfig.color,
                      }}
                    >
                      {value != null ? value.toFixed(2) : '—'}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + config.fontSize * 0.7}
                      style={{
                        fontSize: config.labelSize,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                    >
                      {statusConfig.labelEn}
                    </tspan>
                  </text>
                );
              }
              return null;
            }}
          />
        </RadialBarChart>
      </ChartContainer>

      {/* Competency Name & Metadata */}
      {(competencyName || sampleSize != null || itemCount != null) && (
        <div className="text-center mt-1 space-y-0.5 w-full">
          {competencyName && (
            <p
              className="font-medium truncate px-1"
              style={{ fontSize: config.nameSize }}
              title={competencyName}
            >
              {competencyName}
            </p>
          )}
          <div
            className="flex items-center justify-center gap-2 text-muted-foreground"
            style={{ fontSize: config.labelSize }}
          >
            {sampleSize != null && (
              <span className="tabular-nums">{sampleSize.toLocaleString()} resp.</span>
            )}
            {itemCount != null && (
              <span className="tabular-nums">{itemCount} items</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Mini inline version for tables/lists
interface RadialReliabilityMiniProps {
  value: number | null | undefined;
  className?: string;
}

export function RadialReliabilityMini({ value, className }: RadialReliabilityMiniProps) {
  const statusConfig = getStatusConfig(value);

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div
        className="w-8 h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: 'hsl(var(--muted))' }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: value != null ? `${value * 100}%` : '0%',
            backgroundColor: statusConfig.color,
          }}
        />
      </div>
      <span
        className="font-mono text-sm font-medium tabular-nums"
        style={{ color: statusConfig.color }}
      >
        {value != null ? value.toFixed(2) : '—'}
      </span>
    </div>
  );
}

// Helper function to get status for external use
export function getReliabilityStatusConfig(value: number | null | undefined) {
  return getStatusConfig(value);
}
