'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useComputedColors } from '@/hooks/useComputedColors';
import { useIsMobile } from '@/hooks/use-mobile';
import type { GapDataPoint } from '@/types/results';

// ============================================================================
// Status colors (hardcoded hex for Recharts SVG rendering — no OKLCH support)
// ============================================================================

function getBarColor(actual: number, target: number): string {
  const gap = actual - target;
  if (gap > 2) return '#10b981';   // emerald-500 — exceeds
  if (gap >= -2) return '#3b82f6'; // blue-500 — meets
  return '#f59e0b';                // amber-500 — below
}

// ============================================================================
// Custom Tooltip
// ============================================================================

interface TooltipPayload {
  dataKey: string;
  value: number;
  payload: ChartRow;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  colors: { card: string; fg: string; mutedFg: string; border: string };
}

function CustomTooltip({ active, payload, label, colors }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const row = payload[0]?.payload;
  if (!row) return null;

  const gap = row.score - row.benchmark;
  const gapStr = gap >= 0 ? `+${gap}` : String(gap);

  return (
    <div
      style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 12,
        lineHeight: 1.5,
      }}
    >
      <div style={{ fontWeight: 600, color: colors.fg, marginBottom: 4 }}>{label}</div>
      <div style={{ color: colors.mutedFg }}>
        Score: <span style={{ fontWeight: 600, color: getBarColor(row.score, row.benchmark) }}>{row.score}%</span>
      </div>
      <div style={{ color: colors.mutedFg }}>
        Benchmark: <span style={{ fontWeight: 500 }}>{row.benchmark}%</span>
      </div>
      <div style={{ color: colors.mutedFg }}>
        Gap: <span style={{ fontWeight: 600, color: getBarColor(row.score, row.benchmark) }}>{gapStr}</span>
      </div>
    </div>
  );
}

// ============================================================================
// Chart data row
// ============================================================================

interface ChartRow {
  name: string;
  score: number;
  benchmark: number;
  id: string;
}

// ============================================================================
// Props
// ============================================================================

interface GapAnalysisBarChartProps {
  data: GapDataPoint[];
  height?: number;
  onBarClick?: (dataPoint: GapDataPoint) => void;
}

// ============================================================================
// GapAnalysisBarChart — Recharts horizontal grouped bar chart
// Matches the Direction B design preview: two bars per competency
// (ghost benchmark + colored score), horizontal layout
// ============================================================================

export function GapAnalysisBarChart({
  data,
  height,
  onBarClick,
}: GapAnalysisBarChartProps) {
  const isMobile = useIsMobile();
  const colors = useComputedColors({
    card: ['--card', '#303030'],
    fg: ['--foreground', '#fbfbfb'],
    mutedFg: ['--muted-foreground', '#b0b0b0'],
    border: ['--border', 'rgba(255,255,255,0.15)'],
    muted: ['--muted', '#3e3e3e'],
  });

  const chartData: ChartRow[] = useMemo(() => {
    return data.map((d) => ({
      name: d.name.length > 16 ? d.name.slice(0, 14) + '…' : d.name,
      score: Math.round(d.actualScore),
      benchmark: Math.round(d.targetScore),
      id: d.id,
    }));
  }, [data]);

  const chartHeight = height ?? (isMobile ? 280 : 320);

  return (
    <div style={{ width: '100%', height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 2,
            right: isMobile ? 8 : 16,
            bottom: 2,
            left: isMobile ? 4 : 8,
          }}
          barCategoryGap="28%"
          barGap={2}
          barSize={isMobile ? 8 : 10}
        >
          <CartesianGrid
            horizontal={false}
            strokeDasharray=""
            stroke="rgba(255,255,255,0.04)"
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickCount={isMobile ? 6 : 11}
            tick={{ fontSize: isMobile ? 9 : 10, fill: colors.mutedFg }}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={isMobile ? 75 : 120}
            tick={{ fontSize: isMobile ? 9 : 11, fill: colors.mutedFg }}
            axisLine={false}
            tickLine={false}
          />
          <RechartsTooltip
            content={<CustomTooltip colors={colors} />}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />

          {/* Benchmark bars (ghost) */}
          <Bar
            dataKey="benchmark"
            name="Benchmark"
            radius={[4, 4, 4, 4]}
            fill="rgba(255,255,255,0.08)"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={1}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-in-out"
          />

          {/* Score bars (colored by status) */}
          <Bar
            dataKey="score"
            name="Score"
            radius={[4, 4, 4, 4]}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-in-out"
            cursor={onBarClick ? 'pointer' : undefined}
            onClick={(_: unknown, index: number) => {
              if (onBarClick && data[index]) {
                onBarClick(data[index]);
              }
            }}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={entry.id}
                fill={getBarColor(entry.score, entry.benchmark)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
