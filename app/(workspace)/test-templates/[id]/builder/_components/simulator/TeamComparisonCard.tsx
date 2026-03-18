'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  AlertCircle,
  Radar as RadarIcon,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { STRATEGY_CONFIG } from './strategy-context';
import { useComputedColors } from '@/hooks/useComputedColors';

// ============================================
// TYPES
// ============================================

interface CompetencyComparison {
  name: string;
  individual: number;
  teamAvg: number;
}

interface TeamComparisonCardProps {
  teamId?: string;
  teamName?: string;
  comparisons: CompetencyComparison[];
  overallGap: number;
  isLoading?: boolean;
  className?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getGapDirection(gap: number): 'above' | 'below' | 'at' {
  if (gap > 5) return 'above';
  if (gap < -5) return 'below';
  return 'at';
}

function getTrendIcon(gap: number) {
  const direction = getGapDirection(gap);
  if (direction === 'above') {
    return <TrendingUp className="h-3 w-3 text-emerald-500" aria-hidden="true" />;
  }
  if (direction === 'below') {
    return <TrendingDown className="h-3 w-3 text-amber-500" aria-hidden="true" />;
  }
  return <Minus className="h-3 w-3 text-blue-500" aria-hidden="true" />;
}

function truncateRadarLabel(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

const GAP_DIRECTION_COLORS = {
  above: '#10b981',
  below: '#f59e0b',
  at: '#3b82f6',
} as const;

// ============================================
// LOADING SKELETON
// ============================================

function TeamComparisonSkeleton() {
  return (
    <div className="p-3 rounded-xl border bg-muted/30 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-10 rounded-lg" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MISSING CONFIG WARNING
// ============================================

function MissingTeamWarning() {
  const t = useTranslations('builder.simulator');
  return (
    <div
      className="p-4 rounded-xl border border-purple-200 bg-purple-50 dark:bg-purple-950/30 dark:border-purple-800/50"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className="h-5 w-5 text-purple-500 mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
            {t('teamComparison.notConfigured')}
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400">
            {t('teamComparison.notConfiguredDescription')}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function TeamComparisonCard({
  teamId,
  teamName,
  comparisons,
  overallGap,
  isLoading,
  className,
}: TeamComparisonCardProps) {
  const t = useTranslations('builder.simulator');
  const config = STRATEGY_CONFIG.DYNAMIC_GAP_ANALYSIS;

  const [view, setView] = useState<'bars' | 'radar'>('bars');

  const colors = useComputedColors({
    border: ['--border', '#e5e7eb'],
    foreground: ['--foreground', '#1f2937'],
    mutedForeground: ['--muted-foreground', '#6b7280'],
    card: ['--card', '#ffffff'],
  });

  // Compute before early returns to avoid Rules of Hooks violation
  const sortedComparisons = teamId
    ? [...comparisons].sort(
        (a, b) => b.individual - b.teamAvg - (a.individual - a.teamAvg)
      )
    : [];
  const topComparisons = sortedComparisons.slice(0, 5);
  const overallDirection = getGapDirection(overallGap);
  // Radar needs >= 3 axes to form a meaningful polygon
  const canShowRadar = topComparisons.length >= 3;
  const effectiveView = canShowRadar ? view : 'bars';

  // Show loading skeleton
  if (isLoading) {
    return <TeamComparisonSkeleton />;
  }

  // Show warning if no team ID
  if (!teamId) {
    return <MissingTeamWarning />;
  }

  return (
    <div
      className={cn('p-3 rounded-xl border space-y-3', config.border, config.bg, className)}
      role="region"
      aria-label={t('teamComparison.ariaLabel')}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Users className={cn('h-4 w-4', config.iconText)} aria-hidden="true" />
          <span className="text-sm font-medium">{t('teamComparison.title')}</span>
        </div>

        <div className="flex items-center gap-2">
          {canShowRadar && (
            <div
              className="flex items-center gap-0.5 rounded-md border p-0.5"
              role="group"
              aria-label={t('teamComparison.viewToggle')}
            >
              <button
                type="button"
                onClick={() => setView('bars')}
                aria-pressed={effectiveView === 'bars'}
                aria-label={t('teamComparison.viewBars')}
                className={cn(
                  'rounded min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors',
                  effectiveView === 'bars'
                    ? cn(config.iconText, config.iconBg)
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <BarChart3 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setView('radar')}
                aria-pressed={effectiveView === 'radar'}
                aria-label={t('teamComparison.viewRadar')}
                className={cn(
                  'rounded min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors',
                  effectiveView === 'radar'
                    ? cn(config.iconText, config.iconBg)
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <RadarIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <Badge
            variant="outline"
            className={cn(
              'text-[10px] tabular-nums',
              overallDirection === 'above' &&
                'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
              overallDirection === 'below' &&
                'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
              overallDirection === 'at' &&
                'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800'
            )}
          >
            {overallGap > 0 ? '+' : ''}{t('teamComparison.overallGap', { gap: overallGap })}
          </Badge>
        </div>
      </div>

      {/* Team Info */}
      <div className={cn('flex items-center gap-2 p-2 rounded-lg border', config.iconBg, config.border)}>
        <Users className={cn('h-4 w-4 shrink-0', config.iconText)} aria-hidden="true" />
        <span className="text-sm truncate">{teamName || t('teamComparison.teamFallbackName', { id: teamId })}</span>
      </div>

      {/* Chart Area — fixed min-height prevents layout shift when toggling */}
      <div className="min-h-[220px]">
        {effectiveView === 'bars' ? (
          /* === BARS VIEW — existing code, unchanged === */
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <BarChart3 className="h-3 w-3" aria-hidden="true" />
              <span>{t('teamComparison.vsTeamAverage')}</span>
            </div>

            {topComparisons.map((comp) => {
              const gap = comp.individual - comp.teamAvg;
              const direction = getGapDirection(gap);

              return (
                <div key={comp.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate max-w-[60%]">{comp.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {getTrendIcon(gap)}
                      <span
                        className={cn(
                          'font-medium tabular-nums',
                          direction === 'above' && 'text-emerald-600 dark:text-emerald-400',
                          direction === 'below' && 'text-amber-600 dark:text-amber-400',
                          direction === 'at' && 'text-blue-600 dark:text-blue-400'
                        )}
                      >
                        {gap > 0 ? '+' : ''}
                        {Math.round(gap)}%
                      </span>
                    </div>
                  </div>

                  {/* Dual progress bar */}
                  <div
                    className="relative h-3 bg-muted rounded-full overflow-hidden"
                    role="img"
                    aria-label={`${comp.name}: Individual ${comp.individual}%, Team average ${comp.teamAvg}%`}
                  >
                    {/* Team benchmark (background) */}
                    <div
                      className="absolute inset-y-0 left-0 bg-blue-200 dark:bg-blue-800/50 rounded-full"
                      style={{ width: `${Math.min(comp.teamAvg, 100)}%` }}
                    />
                    {/* Individual score (foreground, smaller height) */}
                    <div
                      className={cn(
                        'absolute left-0 rounded-full transition-all',
                        direction === 'above' && 'bg-emerald-500',
                        direction === 'below' && 'bg-amber-500',
                        direction === 'at' && 'bg-blue-500'
                      )}
                      style={{
                        width: `${Math.min(comp.individual, 100)}%`,
                        height: '60%',
                        top: '20%',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* === RADAR VIEW === */
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <RadarIcon className="h-3 w-3" aria-hidden="true" />
              <span>{t('teamComparison.vsTeamAverage')}</span>
            </div>

            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="65%"
                  data={topComparisons.map((comp) => ({
                    subject: truncateRadarLabel(comp.name, 10),
                    individual: comp.individual,
                    teamAvg: comp.teamAvg,
                    fullMark: 100,
                    fullName: comp.name,
                  }))}
                  margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                >
                  <defs>
                    <radialGradient id="teamComparisonTeamGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#93c5fd" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.1} />
                    </radialGradient>
                    <radialGradient id="teamComparisonIndividualGradient" cx="50%" cy="50%" r="50%">
                      <stop
                        offset="0%"
                        stopColor={
                          GAP_DIRECTION_COLORS[overallDirection]
                        }
                        stopOpacity={0.5}
                      />
                      <stop
                        offset="100%"
                        stopColor={
                          GAP_DIRECTION_COLORS[overallDirection]
                        }
                        stopOpacity={0.1}
                      />
                    </radialGradient>
                  </defs>

                  <PolarGrid
                    stroke={colors.border}
                    strokeOpacity={0.4}
                    strokeWidth={0.5}
                    gridType="polygon"
                  />

                  <PolarAngleAxis
                    dataKey="subject"
                    tick={({ x, y, payload, textAnchor }: { x: number; y: number; payload: { value: string }; textAnchor: 'start' | 'middle' | 'end' | 'inherit' | undefined }) => (
                      <text
                        x={x}
                        y={y}
                        textAnchor={textAnchor}
                        fill={colors.foreground}
                        fontSize={9}
                        fontWeight={500}
                        className="select-none"
                      >
                        {payload.value}
                      </text>
                    )}
                    tickLine={false}
                  />

                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{
                      fill: colors.mutedForeground,
                      fontSize: 8,
                    }}
                    tickCount={3}
                    tickFormatter={(value) => {
                      const n = Number(value);
                      if (n !== 0 && n !== 50 && n !== 100) return '';
                      return `${n}`;
                    }}
                    axisLine={false}
                  />

                  {/* Team Average — background polygon */}
                  <Radar
                    name={t('teamComparison.legendTeamAvg')}
                    dataKey="teamAvg"
                    stroke="#93c5fd"
                    strokeWidth={1.5}
                    fill="url(#teamComparisonTeamGradient)"
                    fillOpacity={1}
                    isAnimationActive={true}
                    animationDuration={600}
                    dot={false}
                  />

                  {/* Individual — foreground polygon */}
                  <Radar
                    name={t('teamComparison.legendIndividual')}
                    dataKey="individual"
                    stroke={
                      overallDirection === 'above' ? '#10b981'
                      : overallDirection === 'below' ? '#f59e0b'
                      : '#3b82f6'
                    }
                    strokeWidth={2}
                    fill="url(#teamComparisonIndividualGradient)"
                    fillOpacity={1}
                    isAnimationActive={true}
                    animationDuration={600}
                    dot={false}
                  />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload[0]) return null;
                      const item = payload[0].payload as {
                        fullName: string;
                        individual: number;
                        teamAvg: number;
                      };
                      const gap = item.individual - item.teamAvg;
                      const dir = getGapDirection(gap);
                      return (
                        <div
                          className="bg-popover/95 backdrop-blur-sm border border-border rounded-xl shadow-xl p-3 min-w-[140px]"
                          style={{ backgroundColor: colors.card }}
                        >
                          <p className="font-medium text-xs mb-1.5" style={{ color: colors.foreground }}>
                            {item.fullName}
                          </p>
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <span style={{ color: colors.mutedForeground }}>
                              {t('teamComparison.legendIndividual')}
                            </span>
                            <span className="font-bold tabular-nums" style={{ color: colors.foreground }}>
                              {item.individual}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <span style={{ color: colors.mutedForeground }}>
                              {t('teamComparison.legendTeamAvg')}
                            </span>
                            <span className="font-bold tabular-nums" style={{ color: colors.foreground }}>
                              {item.teamAvg}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-xs mt-1 pt-1 border-t border-border/50">
                            <span style={{ color: colors.mutedForeground }}>{t('teamComparison.tooltipGap')}</span>
                            <span
                              className="font-bold tabular-nums"
                              style={{
                                color: GAP_DIRECTION_COLORS[dir],
                              }}
                            >
                              {gap > 0 ? '+' : ''}{Math.round(gap)}%
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Screen reader fallback */}
            <div className="sr-only">
              <ul>
                {topComparisons.map((comp) => (
                  <li key={comp.name}>
                    {comp.name}: Individual {comp.individual}%, Team Avg {comp.teamAvg}%
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Legend — color dots match both bar and radar views */}
      <div className="flex items-center justify-center gap-4 pt-2 border-t text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <div
            className="h-2.5 w-2.5 rounded-full bg-blue-300 dark:bg-blue-700"
            aria-hidden="true"
          />
          <span>{t('teamComparison.legendTeamAvg')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className={cn(
              'h-2.5 w-2.5 rounded-full',
              overallDirection === 'above' && 'bg-emerald-500',
              overallDirection === 'below' && 'bg-amber-500',
              overallDirection === 'at' && 'bg-blue-500'
            )}
            aria-hidden="true"
          />
          <span>{t('teamComparison.legendIndividual')}</span>
        </div>
      </div>
    </div>
  );
}

export default TeamComparisonCard;
