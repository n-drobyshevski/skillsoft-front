'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ItemStatistics } from '@/types/psychometrics';
import { cn } from '@/lib/utils';
import { BarChart3, TrendingUp } from 'lucide-react';

interface MetricDistributionChartProps {
  items: ItemStatistics[];
  className?: string;
}

// Histogram bin configuration for difficulty (p-value)
const difficultyBins = [
  { min: 0.0, max: 0.1, label: '0.0-0.1', zone: 'hard' },
  { min: 0.1, max: 0.2, label: '0.1-0.2', zone: 'hard' },
  { min: 0.2, max: 0.3, label: '0.2-0.3', zone: 'optimal' },
  { min: 0.3, max: 0.4, label: '0.3-0.4', zone: 'optimal' },
  { min: 0.4, max: 0.5, label: '0.4-0.5', zone: 'optimal' },
  { min: 0.5, max: 0.6, label: '0.5-0.6', zone: 'optimal' },
  { min: 0.6, max: 0.7, label: '0.6-0.7', zone: 'optimal' },
  { min: 0.7, max: 0.8, label: '0.7-0.8', zone: 'optimal' },
  { min: 0.8, max: 0.9, label: '0.8-0.9', zone: 'easy' },
  { min: 0.9, max: 1.0, label: '0.9-1.0', zone: 'easy' },
];

// Color mapping for difficulty zones
const difficultyZoneColors: Record<string, { fill: string; stroke: string }> = {
  hard: { fill: '#3b82f6', stroke: '#2563eb' }, // blue
  optimal: { fill: '#10b981', stroke: '#059669' }, // emerald
  easy: { fill: '#8b5cf6', stroke: '#7c3aed' }, // violet
};

// Histogram bin configuration for discrimination (rpb)
const discriminationBins = [
  { min: -0.5, max: 0.0, label: '< 0', zone: 'negative' },
  { min: 0.0, max: 0.1, label: '0.0-0.1', zone: 'critical' },
  { min: 0.1, max: 0.25, label: '0.1-0.25', zone: 'warning' },
  { min: 0.25, max: 0.4, label: '0.25-0.4', zone: 'good' },
  { min: 0.4, max: 0.6, label: '0.4-0.6', zone: 'good' },
  { min: 0.6, max: 1.0, label: '0.6+', zone: 'good' },
];

// Color mapping for discrimination zones
const discriminationZoneColors: Record<string, { fill: string; stroke: string }> = {
  negative: { fill: '#ef4444', stroke: '#dc2626' }, // red
  critical: { fill: '#f97316', stroke: '#ea580c' }, // orange
  warning: { fill: '#f59e0b', stroke: '#d97706' }, // amber
  good: { fill: '#10b981', stroke: '#059669' }, // emerald
};

interface StatsSummary {
  mean: number;
  median: number;
  stdDev: number;
}

function calculateStats(values: number[]): StatsSummary | null {
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  const squareDiffs = values.map(v => Math.pow(v - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(avgSquareDiff);

  return { mean, median, stdDev };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: { label: string; count: number; zone: string };
  }>;
  label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-popover border border-border rounded-lg shadow-xl p-2 text-sm">
      <p className="font-medium">{data.label}</p>
      <p className="text-muted-foreground">{data.count} items</p>
    </div>
  );
}

function StatsSummaryDisplay({ stats }: { stats: StatsSummary | null }) {
  if (!stats) {
    return (
      <div className="text-xs text-muted-foreground text-center py-2">
        No data available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t">
      <div className="text-center">
        <div className="font-mono font-medium">{stats.mean.toFixed(2)}</div>
        <div className="text-muted-foreground">Mean</div>
      </div>
      <div className="text-center">
        <div className="font-mono font-medium">{stats.median.toFixed(2)}</div>
        <div className="text-muted-foreground">Median</div>
      </div>
      <div className="text-center">
        <div className="font-mono font-medium">{stats.stdDev.toFixed(2)}</div>
        <div className="text-muted-foreground">Std Dev</div>
      </div>
    </div>
  );
}

export function DifficultyDistributionChart({ items, className }: MetricDistributionChartProps) {
  const { chartData, stats } = useMemo(() => {
    const values = items
      .filter(item => item.difficultyIndex != null)
      .map(item => item.difficultyIndex!);

    const data = difficultyBins.map(bin => {
      const count = values.filter(v => v >= bin.min && v < bin.max).length;
      return {
        label: bin.label,
        count,
        zone: bin.zone,
      };
    });

    return {
      chartData: data,
      stats: calculateStats(values),
    };
  }, [items]);

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Question Difficulty Distribution
        </CardTitle>
        <CardDescription className="text-xs">
          p-value distribution (0.2-0.8 is optimal)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />

            {/* Optimal zone highlight */}
            <ReferenceArea
              x1="0.2-0.3"
              x2="0.7-0.8"
              fill="#10b981"
              fillOpacity={0.05}
            />

            <XAxis
              dataKey="label"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={40}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={30}
              domain={[0, maxCount]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={difficultyZoneColors[entry.zone].fill}
                  stroke={difficultyZoneColors[entry.zone].stroke}
                  strokeWidth={1}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded bg-blue-500" />
            <span>Too Hard</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded bg-emerald-500" />
            <span>Optimal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded bg-violet-500" />
            <span>Too Easy</span>
          </div>
        </div>

        <StatsSummaryDisplay stats={stats} />
      </CardContent>
    </Card>
  );
}

export function DiscriminationDistributionChart({ items, className }: MetricDistributionChartProps) {
  const { chartData, stats } = useMemo(() => {
    const values = items
      .filter(item => item.discriminationIndex != null)
      .map(item => item.discriminationIndex!);

    const data = discriminationBins.map(bin => {
      const count = values.filter(v => {
        if (bin.max === 1.0) {
          return v >= bin.min;
        }
        return v >= bin.min && v < bin.max;
      }).length;
      return {
        label: bin.label,
        count,
        zone: bin.zone,
      };
    });

    return {
      chartData: data,
      stats: calculateStats(values),
    };
  }, [items]);

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Question Effectiveness Distribution
        </CardTitle>
        <CardDescription className="text-xs">
          rpb distribution (0.25+ is good)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />

            {/* Reference line at 0.25 threshold */}
            <ReferenceLine
              x="0.25-0.4"
              stroke="#f59e0b"
              strokeDasharray="3 3"
              strokeWidth={1}
            />

            <XAxis
              dataKey="label"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={40}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={30}
              domain={[0, maxCount]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={discriminationZoneColors[entry.zone].fill}
                  stroke={discriminationZoneColors[entry.zone].stroke}
                  strokeWidth={1}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex justify-center gap-3 text-xs text-muted-foreground mt-2 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded bg-red-500" />
            <span>Negative</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded bg-orange-500" />
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded bg-amber-500" />
            <span>Warning</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded bg-emerald-500" />
            <span>Good</span>
          </div>
        </div>

        <StatsSummaryDisplay stats={stats} />
      </CardContent>
    </Card>
  );
}

// Combined component that shows both distributions
export function MetricDistributionCharts({ items, className }: MetricDistributionChartProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <DifficultyDistributionChart items={items} />
      <DiscriminationDistributionChart items={items} />
    </div>
  );
}
