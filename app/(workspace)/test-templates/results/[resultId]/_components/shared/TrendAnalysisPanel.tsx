'use client';

import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChevronDown, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useComputedColors } from '@/hooks/useComputedColors';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { TrendDataPoint, TestResult } from '@/types/domain';

// ============================================================================
// Status color helper
// ============================================================================

function getScoreHex(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  return '#f59e0b';
}

function getScoreClass(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-blue-600 dark:text-blue-400';
  return 'text-amber-600 dark:text-amber-400';
}

// ============================================================================
// Inline SVG sparkline for per-competency cards
// ============================================================================

function CardSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data) - 5;
  const max = Math.max(...data) + 5;
  const range = max - min || 1;
  const w = 100;
  const h = 28;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  const gradId = `trendgrad-${color.replace('#', '')}`;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${points} ${w},${h}`} fill={`url(#${gradId})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ============================================================================
// Custom tooltip for main chart
// ============================================================================

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  colors: { card: string; fg: string; mutedFg: string; border: string };
}

function CustomTooltip({ active, payload, label, colors }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: colors.card, border: `1px solid ${colors.border}`,
      borderRadius: 8, padding: '8px 12px', fontSize: 12,
    }}>
      <div style={{ fontWeight: 600, color: colors.fg, marginBottom: 2 }}>{label}</div>
      <div style={{ color: colors.mutedFg }}>
        Score: <span style={{ fontWeight: 600, color: '#10b981' }}>{payload[0].value}%</span>
      </div>
    </div>
  );
}

// ============================================================================
// Props
// ============================================================================

interface TrendAnalysisPanelProps {
  trendData: TrendDataPoint[] | null;
  currentResult: TestResult;
  competencyNames: string[];
}

// ============================================================================
// TrendAnalysisPanel — matches design preview: main chart + sparkline grid
// Always renders. Falls back to current result if no historical trend data.
// ============================================================================

export function TrendAnalysisPanel({ trendData, currentResult, competencyNames }: TrendAnalysisPanelProps) {
  const isMobile = useIsMobile();
  const colors = useComputedColors({
    card: ['--card', '#303030'],
    fg: ['--foreground', '#fbfbfb'],
    mutedFg: ['--muted-foreground', '#b0b0b0'],
    border: ['--border', 'rgba(255,255,255,0.15)'],
  });

  // Build effective trend data — fallback to current result if no history
  const effectiveTrend: TrendDataPoint[] = useMemo(() => {
    if (trendData && trendData.length >= 1) return trendData;
    // Fallback: synthesize a single-point trend from current result
    return [{
      resultId: currentResult.id,
      templateId: currentResult.templateId,
      templateName: currentResult.templateName,
      overallPercentage: currentResult.overallPercentage,
      passed: currentResult.passed,
      completedAt: currentResult.completedAt,
      competencyScores: (currentResult.competencyScores ?? []).map(c => ({
        competencyId: c.competencyId,
        competencyName: c.competencyName,
        percentage: c.percentage,
      })),
    }];
  }, [trendData, currentResult]);

  const hasTrendHistory = effectiveTrend.length > 1;

  // Format dates for x-axis
  const chartData = useMemo(() => {
    return effectiveTrend.map((d) => {
      const date = new Date(d.completedAt);
      const label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      return {
        label,
        score: d.overallPercentage != null ? Math.round(d.overallPercentage * 10) / 10 : 0,
      };
    });
  }, [effectiveTrend]);

  // Calculate improvement badge (only when real trend history exists)
  const improvement = useMemo(() => {
    if (!hasTrendHistory || chartData.length < 2) return null;
    const first = chartData[0].score;
    const last = chartData[chartData.length - 1].score;
    const diff = last - first;
    const firstLabel = chartData[0].label.split(' ')[0]; // "Dec"
    return { diff: diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1), since: firstLabel };
  }, [chartData, hasTrendHistory]);

  // Build per-competency sparkline data
  const competencySparklines = useMemo(() => {
    const names = competencyNames.length > 0
      ? competencyNames
      : (effectiveTrend[0]?.competencyScores?.map((c) => c.competencyName) ?? []);

    return names.map((name) => {
      const points: number[] = [];
      effectiveTrend.forEach((d) => {
        const match = d.competencyScores?.find((c) => c.competencyName === name);
        if (match?.percentage != null) points.push(Math.round(match.percentage));
      });
      // For single-point data, duplicate to make sparkline visible
      if (points.length === 1) points.unshift(points[0]);
      const current = points.length > 0 ? points[points.length - 1] : 0;
      const first = points.length > 0 ? points[0] : 0;
      const rangeStr = hasTrendHistory && points.length >= 2 ? `${first}% → ${current}%` : '';
      return { name, points, current, rangeStr };
    });
  }, [effectiveTrend, competencyNames, hasTrendHistory]);

  // Y-axis domain
  const yMin = useMemo(() => {
    const min = Math.min(...chartData.map((d) => d.score));
    return Math.max(0, Math.floor((min - 5) / 10) * 10);
  }, [chartData]);

  // Collapsed by default when insufficient data, open when real trend exists
  const [expanded, setExpanded] = useState(hasTrendHistory);

  return (
    <Card className="rounded-xl shadow-sm overflow-hidden">
      {/* Header — clickable to toggle when collapsed */}
      <button
        type="button"
        className={cn(
          'w-full flex items-start justify-between px-6 pt-5 text-left transition-colors',
          hasTrendHistory ? 'pb-0 cursor-default' : 'pb-4 cursor-pointer hover:bg-muted/30',
        )}
        onClick={() => !hasTrendHistory && setExpanded(!expanded)}
        aria-expanded={expanded}
        disabled={hasTrendHistory}
      >
        <div className="flex items-center gap-3">
          {!hasTrendHistory && (
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Trend Analysis
            </div>
            <h2 className="text-sm font-semibold text-foreground tracking-tight">
              {hasTrendHistory ? 'Overall Score Progression' : 'Not enough data yet'}
            </h2>
            {!hasTrendHistory && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Complete more attempts to see your progression over time
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {improvement && (
            <span className={cn(
              'text-[11px] font-semibold tabular-nums px-2.5 py-1 rounded-md border',
              'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
            )}>
              {improvement.diff}% since {improvement.since}
            </span>
          )}
          {!hasTrendHistory && (
            <ChevronDown className={cn(
              'h-4 w-4 text-muted-foreground transition-transform duration-300',
              expanded && 'rotate-180',
            )} />
          )}
        </div>
      </button>

      {/* Collapsible content */}
      <div className={cn(
        'overflow-hidden transition-all duration-400',
        expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0',
      )}>

      {/* Main trend chart */}
      <div className="px-6 pb-5" style={{ height: isMobile ? 160 : 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 16, right: 8, bottom: 0, left: isMobile ? -10 : 0 }}>
            <defs>
              <linearGradient id="trendAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: isMobile ? 10 : 11, fill: colors.mutedFg }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[yMin, 100]}
              tick={{ fontSize: 10, fill: colors.mutedFg }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}%`}
              width={isMobile ? 35 : 40}
            />
            <RechartsTooltip content={<CustomTooltip colors={colors} />} cursor={false} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#trendAreaGrad)"
              dot={{ r: 5, fill: '#10b981', stroke: colors.card, strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#10b981', stroke: colors.card, strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={1200}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Separator + per-competency sparklines */}
      {competencySparklines.length > 0 && (
        <div className="border-t border-border px-6 py-4">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Per-Competency Sparklines
          </div>
          <div className={cn(
            'grid gap-2.5',
            isMobile ? 'grid-cols-2' : 'grid-cols-4',
          )}>
            {competencySparklines.map((comp) => {
              const scoreColor = getScoreHex(comp.current);
              const scoreClass = getScoreClass(comp.current);
              return (
                <div
                  key={comp.name}
                  className="bg-muted rounded-lg border border-border p-2.5"
                >
                  <div className="text-[10px] font-medium text-muted-foreground mb-1 truncate">
                    {comp.name}
                  </div>
                  <CardSparkline data={comp.points} color={scoreColor} />
                  <div className="flex items-center justify-between mt-1">
                    <span className={cn('text-[10px] font-semibold tabular-nums', scoreClass)}>
                      {comp.current}%
                    </span>
                    {comp.rangeStr && (
                      <span className="text-[9px] text-muted-foreground tabular-nums">
                        {comp.rangeStr}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      </div>{/* end collapsible content */}
    </Card>
  );
}
