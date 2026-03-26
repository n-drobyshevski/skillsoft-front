'use client';

import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useComputedColors } from '@/hooks/useComputedColors';
import { useIsMobile } from '@/hooks/use-mobile';
import type { GapDataPoint } from '@/types/results';

// ============================================================================
// Status colors (hardcoded hex for Recharts SVG — no OKLCH support)
// ============================================================================

type BarStatus = 'exceeds' | 'meets' | 'below';

function getBarStatus(actual: number, target: number): BarStatus {
  const gap = actual - target;
  if (gap > 2) return 'exceeds';
  if (gap >= -2) return 'meets';
  return 'below';
}

const STATUS_COLORS: Record<BarStatus, string> = {
  exceeds: '#10b981', // emerald-500
  meets: '#3b82f6',   // blue-500
  below: '#f59e0b',   // amber-500
};

function getBarColor(actual: number, target: number): string {
  return STATUS_COLORS[getBarStatus(actual, target)];
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
  const status = getBarStatus(row.score, row.benchmark);
  const statusLabel = status === 'exceeds' ? 'Exceeds' : status === 'meets' ? 'Meets' : 'Below';

  return (
    <div
      style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 12,
        lineHeight: 1.5,
        maxWidth: 260,
      }}
    >
      <div style={{ fontWeight: 600, color: colors.fg, marginBottom: 4 }}>{row.fullName}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: 2,
            background: STATUS_COLORS[status],
          }}
        />
        <span style={{ color: colors.mutedFg }}>{statusLabel}</span>
      </div>
      <div style={{ color: colors.mutedFg }}>
        Score: <span style={{ fontWeight: 600, color: STATUS_COLORS[status], fontVariantNumeric: 'tabular-nums' }}>{row.score}%</span>
      </div>
      <div style={{ color: colors.mutedFg }}>
        Benchmark: <span style={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{row.benchmark}%</span>
      </div>
      <div style={{ color: colors.mutedFg, marginTop: 2, paddingTop: 2, borderTop: `1px solid ${colors.border}` }}>
        Gap: <span style={{ fontWeight: 600, color: STATUS_COLORS[status], fontVariantNumeric: 'tabular-nums' }}>
          {gapStr}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Chart data row
// ============================================================================

interface ChartRow {
  name: string;
  fullName: string;
  score: number;
  benchmark: number;
  id: string;
}

// ============================================================================
// Custom Y-axis tick with full-name tooltip via <title>
// ============================================================================

function YAxisTick(props: {
  x: number; y: number; payload: { value: string; index: number };
  chartData: ChartRow[];
  colors: { mutedFg: string };
  isMobile: boolean;
}) {
  const { x, y, payload, chartData, colors, isMobile } = props;
  const row = chartData[payload.index];
  const maxLen = isMobile ? 10 : 18;
  const display = row?.fullName && row.fullName.length > maxLen
    ? row.fullName.slice(0, maxLen - 1) + '…'
    : row?.fullName ?? payload.value;

  return (
    <g transform={`translate(${x},${y})`}>
      <title>{row?.fullName}</title>
      <text
        x={-4}
        y={0}
        dy={4}
        textAnchor="end"
        fill={colors.mutedFg}
        fontSize={isMobile ? 9 : 11}
        style={{ cursor: 'default' }}
      >
        {display}
      </text>
    </g>
  );
}

// ============================================================================
// Score label rendered at end of each bar
// ============================================================================

function ScoreLabel(props: { x?: number; y?: number; width?: number; height?: number; value?: number; index?: number; chartData: ChartRow[] }) {
  const { x = 0, y = 0, width = 0, height = 0, value, index = 0, chartData } = props;
  if (value == null) return null;
  const row = chartData[index];
  if (!row) return null;

  const color = getBarColor(row.score, row.benchmark);
  const labelX = x + width + 4;
  const labelY = y + height / 2;

  return (
    <text
      x={labelX}
      y={labelY}
      dy={3.5}
      fill={color}
      fontSize={10}
      fontWeight={600}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {value}%
    </text>
  );
}

// ============================================================================
// Props
// ============================================================================

const BAR_VISIBLE_LIMIT = 7;

interface GapAnalysisBarChartProps {
  data: GapDataPoint[];
  height?: number;
  onBarClick?: (dataPoint: GapDataPoint) => void;
}

// ============================================================================
// GapAnalysisBarChart — Recharts horizontal grouped bar chart
// ============================================================================

export function GapAnalysisBarChart({
  data,
  height,
  onBarClick,
}: GapAnalysisBarChartProps) {
  const t = useTranslations('results.shared.gapChart');
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);
  const colors = useComputedColors({
    card: ['--card', '#303030'],
    fg: ['--foreground', '#fbfbfb'],
    mutedFg: ['--muted-foreground', '#b0b0b0'],
    border: ['--border', 'rgba(255,255,255,0.15)'],
    muted: ['--muted', '#3e3e3e'],
  });

  const allChartData: ChartRow[] = useMemo(() => {
    return data.map((d) => ({
      name: d.name,
      fullName: d.name,
      score: Math.round(d.actualScore),
      benchmark: Math.round(d.targetScore),
      id: d.id,
    }));
  }, [data]);

  const hasOverflow = allChartData.length > BAR_VISIBLE_LIMIT;
  const chartData = hasOverflow && !expanded
    ? allChartData.slice(0, BAR_VISIBLE_LIMIT)
    : allChartData;
  const hiddenCount = allChartData.length - BAR_VISIBLE_LIMIT;

  // Dynamic height: 48px per row, minimum 200px, max 600px
  const rowHeight = isMobile ? 44 : 48;
  const dynamicHeight = height ?? Math.max(200, Math.min(chartData.length * rowHeight + 40, 600));

  // Accessibility summary
  const exceeds = allChartData.filter(r => getBarStatus(r.score, r.benchmark) === 'exceeds').length;
  const meets = allChartData.filter(r => getBarStatus(r.score, r.benchmark) === 'meets').length;
  const below = allChartData.filter(r => getBarStatus(r.score, r.benchmark) === 'below').length;
  const ariaLabel = `Gap analysis chart: ${allChartData.length} competencies. ${exceeds} exceed benchmark, ${meets} meet benchmark, ${below} below benchmark.`;

  return (
    <div>
      <div
        style={{ width: '100%', height: dynamicHeight }}
        role="img"
        aria-label={ariaLabel}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{
              top: 2,
              right: isMobile ? 36 : 44,
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
              width={isMobile ? 85 : 140}
              tick={(tickProps: { x: number; y: number; payload: { value: string; index: number } }) => (
                <YAxisTick {...tickProps} chartData={chartData} colors={colors} isMobile={isMobile} />
              )}
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
              animationDuration={800}
              animationEasing="ease-out"
            />

            {/* Score bars (colored by status) with direct labels */}
            <Bar
              dataKey="score"
              name="Score"
              radius={[4, 4, 4, 4]}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
              cursor={onBarClick ? 'pointer' : undefined}
              onClick={(_: unknown, index: number) => {
                if (onBarClick && data[index]) {
                  onBarClick(data[index]);
                }
              }}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={getBarColor(entry.score, entry.benchmark)}
                />
              ))}
              {/* Direct score labels at end of bars */}
              <LabelList
                dataKey="score"
                position="right"
                content={(labelProps) => (
                  <ScoreLabel {...(labelProps as { x: number; y: number; width: number; height: number; value: number; index: number })} chartData={chartData} />
                )}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Toggle button */}
      {hasOverflow && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className={cn(
            'mt-1 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg',
            'text-xs font-medium text-muted-foreground',
            'hover:bg-muted/60 hover:text-foreground',
            'transition-colors duration-200 touch-manipulation',
          )}
          aria-expanded={expanded}
        >
          <span>
            {expanded
              ? t('showLess')
              : t('showMore', { count: hiddenCount })}
          </span>
          <ChevronDown
            className={cn(
              'size-3.5 transition-transform duration-300',
              expanded && 'rotate-180',
            )}
          />
        </button>
      )}
    </div>
  );
}
