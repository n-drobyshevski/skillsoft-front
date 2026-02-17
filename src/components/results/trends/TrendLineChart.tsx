'use client';

import { memo, useMemo, useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ReferenceLine,
} from 'recharts';
import { useTranslations, useLocale } from 'next-intl';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { TrendDataPoint } from '@/types/domain';

/**
 * Hook to get computed CSS color values for SVG elements.
 */
function useComputedColors() {
  const [colors, setColors] = useState({
    primary: '#3b82f6',
    border: '#e5e7eb',
    foreground: '#1f2937',
    mutedForeground: '#6b7280',
    emerald: '#10b981',
    amber: '#f59e0b',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const computeColors = () => {
      const tempEl = document.createElement('div');
      tempEl.style.display = 'none';
      document.body.appendChild(tempEl);

      const getColor = (cssVar: string, fallback: string): string => {
        tempEl.style.color = `var(${cssVar})`;
        const computed = getComputedStyle(tempEl).color;
        if (computed && computed !== 'inherit' && computed !== '') return computed;
        return fallback;
      };

      setColors({
        primary: getColor('--primary', '#3b82f6'),
        border: getColor('--border', '#e5e7eb'),
        foreground: getColor('--foreground', '#1f2937'),
        mutedForeground: getColor('--muted-foreground', '#6b7280'),
        emerald: '#10b981',
        amber: '#f59e0b',
      });

      document.body.removeChild(tempEl);
    };

    computeColors();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme') {
          computeColors();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });

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

interface TrendLineChartProps {
  /** Historical trend data points (ordered by date ascending) */
  data: TrendDataPoint[];
  /** Optional competency IDs to show as separate lines */
  selectedCompetencies?: string[];
  /** Passing threshold reference line (default: 70) */
  passingThreshold?: number;
  /** Show CI bands when available (default: false for overall, true for single competency) */
  showConfidenceBands?: boolean;
  /** Animate on mount (default: true) */
  animated?: boolean;
  className?: string;
}

interface ChartDataPoint {
  date: string;
  dateLabel: string;
  overall: number | null;
  [key: string]: string | number | null;
}

const COMPETENCY_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
];

function formatDate(dateStr: string, isMobile: boolean, locale: string): string {
  const date = new Date(dateStr);
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-US';
  if (isMobile) {
    return date.toLocaleDateString(dateLocale, { day: '2-digit', month: '2-digit' });
  }
  return date.toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: '2-digit' });
}

function TrendLineChartComponent({
  data,
  selectedCompetencies = [],
  passingThreshold = 70,
  showConfidenceBands = false,
  animated = true,
  className,
}: TrendLineChartProps) {
  const isMobile = useIsMobile();
  const colors = useComputedColors();
  const t = useTranslations('results.trends');
  const locale = useLocale();

  const config = useMemo(() => ({
    height: isMobile ? 220 : 300,
    fontSize: isMobile ? 10 : 12,
    tickFontSize: isMobile ? 9 : 11,
    strokeWidth: isMobile ? 1.5 : 2,
    dotRadius: isMobile ? 3 : 4,
  }), [isMobile]);

  // Build a competency name map from the data
  const competencyNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    data.forEach((dp) => {
      dp.competencyScores.forEach((cs) => {
        if (!map[cs.competencyId]) {
          map[cs.competencyId] = cs.competencyName;
        }
      });
    });
    return map;
  }, [data]);

  // Transform data for Recharts
  const chartData = useMemo((): ChartDataPoint[] => {
    return data.map((dp) => {
      const point: ChartDataPoint = {
        date: dp.completedAt,
        dateLabel: formatDate(dp.completedAt, isMobile, locale),
        overall: dp.overallPercentage,
      };

      // Add selected competency scores
      selectedCompetencies.forEach((compId) => {
        const cs = dp.competencyScores.find((c) => c.competencyId === compId);
        point[compId] = cs?.percentage ?? null;
        if (showConfidenceBands && cs) {
          point[`${compId}_ciLower`] = cs.ciLower ?? null;
          point[`${compId}_ciUpper`] = cs.ciUpper ?? null;
        }
      });

      return point;
    });
  }, [data, selectedCompetencies, showConfidenceBands, isMobile, locale]);

  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-[200px] text-sm text-muted-foreground', className)}>
        {t('noHistoricalData')}
      </div>
    );
  }

  if (data.length === 1) {
    return (
      <div className={cn('flex items-center justify-center h-[200px] text-sm text-muted-foreground', className)}>
        {t('needMoreAttempts')}
      </div>
    );
  }

  const showOverall = selectedCompetencies.length === 0;

  // Accessible description
  const firstScore = data[0].overallPercentage;
  const lastScore = data[data.length - 1].overallPercentage;
  const ariaLabel = firstScore != null && lastScore != null
    ? t('trendAriaLabel', { count: data.length, from: Math.round(firstScore), to: Math.round(lastScore) })
    : '';

  return (
    <div
      className={cn('w-full', className)}
      style={{ height: config.height }}
      role="img"
      aria-label={ariaLabel}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={isMobile
            ? { top: 8, right: 8, bottom: 4, left: -20 }
            : { top: 12, right: 16, bottom: 4, left: -10 }
          }
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={colors.border}
            strokeOpacity={0.5}
          />

          <XAxis
            dataKey="dateLabel"
            tick={{ fill: colors.mutedForeground, fontSize: config.tickFontSize }}
            tickLine={false}
            axisLine={{ stroke: colors.border }}
            interval={isMobile ? 'preserveStartEnd' : 0}
          />

          <YAxis
            domain={[0, 100]}
            tick={{ fill: colors.mutedForeground, fontSize: config.tickFontSize }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${val}%`}
            width={isMobile ? 35 : 45}
          />

          {/* Passing threshold reference line */}
          {passingThreshold > 0 && (
            <ReferenceLine
              y={passingThreshold}
              stroke={colors.mutedForeground}
              strokeDasharray="6 4"
              strokeOpacity={0.4}
              label={isMobile ? undefined : {
                value: `Target ${passingThreshold}%`,
                position: 'right',
                fill: colors.mutedForeground,
                fontSize: 10,
              }}
            />
          )}

          {/* Overall score line */}
          {showOverall && (
            <Line
              type="monotone"
              dataKey="overall"
              name="Overall"
              stroke={colors.primary}
              strokeWidth={config.strokeWidth}
              dot={{ r: config.dotRadius, fill: colors.primary, strokeWidth: 0 }}
              activeDot={{ r: config.dotRadius + 2, strokeWidth: 2, stroke: colors.primary, fill: 'white' }}
              isAnimationActive={animated}
              animationDuration={800}
              connectNulls
            />
          )}

          {/* Competency lines */}
          {selectedCompetencies.map((compId, i) => (
            <Line
              key={compId}
              type="monotone"
              dataKey={compId}
              name={competencyNameMap[compId] ?? compId}
              stroke={COMPETENCY_COLORS[i % COMPETENCY_COLORS.length]}
              strokeWidth={config.strokeWidth}
              dot={{ r: config.dotRadius - 1, fill: COMPETENCY_COLORS[i % COMPETENCY_COLORS.length], strokeWidth: 0 }}
              activeDot={{ r: config.dotRadius + 1, strokeWidth: 2, stroke: COMPETENCY_COLORS[i % COMPETENCY_COLORS.length], fill: 'white' }}
              isAnimationActive={animated}
              animationDuration={800}
              animationBegin={i * 150}
              connectNulls
            />
          ))}

          {/* CI area bands for competencies */}
          {showConfidenceBands && selectedCompetencies.map((compId, i) => (
            <Area
              key={`ci-${compId}`}
              type="monotone"
              dataKey={`${compId}_ciUpper`}
              stroke="none"
              fill={COMPETENCY_COLORS[i % COMPETENCY_COLORS.length]}
              fillOpacity={0.08}
              isAnimationActive={false}
              connectNulls
            />
          ))}

          {/* Tooltip */}
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || payload.length === 0) return null;
              return (
                <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-xl shadow-xl p-3 min-w-[140px]">
                  <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
                  {payload.map((entry) => {
                    if (!entry.value || String(entry.dataKey).includes('_ci')) return null;
                    const val = Number(entry.value);
                    return (
                      <div
                        key={entry.dataKey}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                            {entry.name}
                          </span>
                        </span>
                        <span className="font-bold tabular-nums">{Math.round(val)}%</span>
                      </div>
                    );
                  })}
                </div>
              );
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Screen reader data */}
      <div className="sr-only">
        <h3>{t('srHistoricalData')}</h3>
        <ul>
          {data.map((dp, i) => (
            <li key={i}>
              {new Date(dp.completedAt).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US')}: {dp.overallPercentage != null ? `${Math.round(dp.overallPercentage)}%` : 'N/A'}
              {dp.passed ? ` ${t('srPassed')}` : ` ${t('srNotPassed')}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const TrendLineChart = memo(TrendLineChartComponent);
export { TrendLineChart };
export default TrendLineChart;
