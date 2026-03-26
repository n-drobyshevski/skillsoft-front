'use client';

import { useMemo, useState, useRef, useCallback, useEffect, type KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, CircleCheck, CircleMinus, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import type { CompetencyScore } from '@/types/domain';

// ============================================================================
// Status helpers
// ============================================================================

type CompStatus = 'exceeds' | 'meets' | 'below';

function getCompStatus(score: number, benchmark: number | undefined, passingScore: number): CompStatus {
  const target = benchmark ?? passingScore;
  if (score > target + 2) return 'exceeds';
  if (score >= target - 2) return 'meets';
  return 'below';
}

const STATUS_ICON = {
  exceeds: CircleCheck,
  meets: CircleMinus,
  below: AlertTriangle,
} as const;

const STATUS_STYLES = {
  exceeds: {
    text: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30 dark:border-emerald-500/25',
    bar: 'bg-emerald-500',
    cardBg: '',
    labelKey: 'statusExceeds' as const,
  },
  meets: {
    text: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-500/15 border-blue-500/30',
    badgeText: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/30 dark:border-blue-500/25',
    bar: 'bg-blue-500',
    cardBg: '',
    labelKey: 'statusMeets' as const,
  },
  below: {
    text: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-500/15 border-amber-500/30',
    badgeText: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30 dark:border-amber-500/25',
    bar: 'bg-amber-500',
    cardBg: 'bg-amber-500/[0.03] dark:bg-amber-500/[0.04]',
    labelKey: 'statusBelow' as const,
  },
} as const;

// ============================================================================
// MiniSparkline — inline SVG sparkline for card trend visualization
// ============================================================================

const STATUS_HEX = {
  exceeds: '#10b981',
  meets: '#3b82f6',
  below: '#f59e0b',
} as const;

function MiniSparkline({ data, color, height = 24 }: { data: number[]; color: string; height?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data) - 5;
  const max = Math.max(...data) + 5;
  const range = max - min || 1;
  const w = 80;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  const gradId = `sparkgrad-${color.replace('#', '')}`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="block" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${points} ${w},${height}`} fill={`url(#${gradId})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ============================================================================
// ScoreBar — mini progress bar showing score relative to benchmark
// ============================================================================

function ScoreBar({ score, benchmark, barClass }: { score: number; benchmark: number; barClass: string }) {
  return (
    <div className="relative h-1.5 w-full rounded-full bg-muted/80 overflow-hidden" aria-hidden="true">
      <div
        className={cn('absolute inset-y-0 left-0 rounded-full transition-all duration-500', barClass)}
        style={{ width: `${Math.min(score, 100)}%` }}
      />
      {/* Benchmark marker */}
      <div
        className="absolute top-0 h-full w-px bg-foreground/30"
        style={{ left: `${Math.min(benchmark, 100)}%` }}
      />
    </div>
  );
}

// ============================================================================
// Props
// ============================================================================

const VISIBLE_LIMIT = 6;

interface CompetencyCardGridProps {
  competencies: CompetencyScore[];
  passingScore: number;
  onCardClick?: (competencyId: string) => void;
  /** Real historical scores per competency name — used for sparklines */
  trendMap?: Record<string, number[]>;
}

// ============================================================================
// CompetencyCardGrid — 2×N compact card grid with progressive disclosure
// ============================================================================

const FILTER_OPTIONS: CompStatus[] = ['exceeds', 'meets', 'below'];

const FILTER_STYLES: Record<CompStatus, { active: string; inactive: string }> = {
  exceeds: {
    active: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40',
    inactive: 'bg-transparent text-muted-foreground border-border hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400',
  },
  meets: {
    active: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/40',
    inactive: 'bg-transparent text-muted-foreground border-border hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400',
  },
  below: {
    active: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40',
    inactive: 'bg-transparent text-muted-foreground border-border hover:border-amber-500/30 hover:text-amber-600 dark:hover:text-amber-400',
  },
};

export function CompetencyCardGrid({
  competencies,
  passingScore,
  onCardClick,
  trendMap,
}: CompetencyCardGridProps) {
  const t = useTranslations('results.shared.competencyCards');
  const [expanded, setExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<CompStatus | null>(null);
  const collapsibleRef = useRef<HTMLDivElement>(null);
  const [collapsibleHeight, setCollapsibleHeight] = useState(0);

  const allCards = useMemo(() => {
    return competencies.map((c) => {
      const status = getCompStatus(c.percentage, c.benchmarkScore, passingScore);
      const benchmark = c.benchmarkScore ?? passingScore;
      const gap = Math.round(c.percentage) - Math.round(benchmark);
      const gapStr = gap >= 0 ? `+${gap}` : String(gap);
      return { ...c, status, benchmark: Math.round(benchmark), gap, gapStr };
    });
  }, [competencies, passingScore]);

  // Status counts for filter chips
  const statusCounts = useMemo(() => {
    const counts: Record<CompStatus, number> = { exceeds: 0, meets: 0, below: 0 };
    for (const c of allCards) counts[c.status]++;
    return counts;
  }, [allCards]);

  // Filtered cards
  const cards = activeFilter ? allCards.filter((c) => c.status === activeFilter) : allCards;

  // Reset expand when filter changes
  useEffect(() => {
    setExpanded(false);
  }, [activeFilter]);

  const hasOverflow = cards.length > VISIBLE_LIMIT;
  const visibleCards = hasOverflow ? cards.slice(0, VISIBLE_LIMIT) : cards;
  const hiddenCards = hasOverflow ? cards.slice(VISIBLE_LIMIT) : [];
  const hiddenCount = hiddenCards.length;

  // Measure collapsible content height for smooth animation
  const measureHeight = useCallback(() => {
    if (collapsibleRef.current) {
      setCollapsibleHeight(collapsibleRef.current.scrollHeight);
    }
  }, []);

  useEffect(() => {
    measureHeight();
  }, [hiddenCards.length, measureHeight]);

  const handleCardKeyDown = (e: KeyboardEvent, competencyId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCardClick?.(competencyId);
    }
  };

  const renderCard = (card: (typeof cards)[number]) => {
    const styles = STATUS_STYLES[card.status];
    const StatusIcon = STATUS_ICON[card.status];
    const realPoints = trendMap?.[card.competencyName];
    const hasRealTrend = realPoints && realPoints.length >= 2;

    return (
      <div
        key={card.competencyId}
        role="listitem button"
        tabIndex={0}
        aria-label={`${card.competencyName}: ${Math.round(card.percentage)}%, ${t(styles.labelKey)}`}
        className={cn(
          'rounded-xl border p-3 text-left transition-all duration-200 cursor-pointer',
          'hover:-translate-y-px hover:shadow-md active:scale-[0.98]',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          'bg-card touch-manipulation select-none',
          styles.border,
          styles.cardBg,
        )}
        onClick={() => onCardClick?.(card.competencyId)}
        onKeyDown={(e) => handleCardKeyDown(e, card.competencyId)}
      >
        {/* Header: name + status badge with icon */}
        <div className="flex items-start justify-between mb-2 gap-2">
          <span className="text-xs-safe font-medium text-muted-foreground leading-snug min-w-0">
            {card.competencyName}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  'text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full border whitespace-nowrap shrink-0',
                  'inline-flex items-center gap-1',
                  styles.badgeBg,
                  styles.badgeText,
                )}
              >
                <StatusIcon className="size-2.5" aria-hidden="true" />
                {t(styles.labelKey)}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px]">
              {t(`tipStatus.${card.status}`)}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Score + gap row */}
        <div className="flex items-baseline justify-between mb-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={cn('text-xl font-bold tabular-nums tracking-tight', styles.text)}>
                {Math.round(card.percentage)}
                <span className="text-xs font-medium text-muted-foreground">%</span>
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">{t('tipScore')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={cn('text-[10px] font-semibold tabular-nums', styles.text)}>
                {card.gapStr}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">{t('tipGap')}</TooltipContent>
          </Tooltip>
        </div>

        {/* Score bar — visual benchmark comparison */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <ScoreBar score={Math.round(card.percentage)} benchmark={card.benchmark} barClass={styles.bar} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {t('tipBar', { score: Math.round(card.percentage), bench: card.benchmark })}
          </TooltipContent>
        </Tooltip>

        {/* Benchmark label */}
        <div className="flex items-center justify-between mt-1.5 mb-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {t('benchLabel', { value: card.benchmark })}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">{t('tipBench')}</TooltipContent>
          </Tooltip>
        </div>

        {/* SVG sparkline — ONLY with real historical data (no simulated) */}
        {hasRealTrend && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <MiniSparkline data={realPoints} color={STATUS_HEX[card.status]} height={24} />
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {realPoints[0]}% → {realPoints[realPoints.length - 1]}%
                  </span>
                  <span className={cn('text-[10px] font-medium tabular-nums', styles.text)}>
                    {t('attemptCount', { count: realPoints.length })}
                  </span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">{t('tipTrend')}</TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div>
        {/* Filter bar: counter + status chips */}
        <div className="flex items-center gap-1.5 mb-3" role="radiogroup" aria-label={t('filterAriaLabel')}>
          <span className="text-[10px] text-muted-foreground tabular-nums mr-1">
            {activeFilter
              ? t('countFiltered', { shown: cards.length, total: allCards.length })
              : t('countTotal', { count: allCards.length })}
          </span>
          {FILTER_OPTIONS.map((status) => {
            const Icon = STATUS_ICON[status];
            const isActive = activeFilter === status;
            const count = statusCounts[status];
            if (count === 0) return null;
            return (
              <button
                key={status}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setActiveFilter(isActive ? null : status)}
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-semibold',
                  'transition-all duration-150 touch-manipulation',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                  isActive ? FILTER_STYLES[status].active : FILTER_STYLES[status].inactive,
                )}
              >
                <Icon className="size-2.5" aria-hidden="true" />
                <span className="uppercase tracking-wider">{t(STATUS_STYLES[status].labelKey)}</span>
                <span className="tabular-nums opacity-70">{count}</span>
              </button>
            );
          })}
          {activeFilter && (
            <button
              type="button"
              onClick={() => setActiveFilter(null)}
              className={cn(
                'text-[10px] text-muted-foreground hover:text-foreground',
                'transition-colors duration-150 px-1.5 py-1 touch-manipulation',
              )}
            >
              {t('filterClear')}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="list" aria-label={t('ariaLabel')}>
          {visibleCards.map(renderCard)}
        </div>

        {hasOverflow && (
          <>
            {/* Collapsible overflow section */}
            <div
              ref={collapsibleRef}
              className="overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out"
              style={{
                maxHeight: expanded ? collapsibleHeight : 0,
                opacity: expanded ? 1 : 0,
              }}
              aria-hidden={!expanded}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2.5" role="list">
                {hiddenCards.map(renderCard)}
              </div>
            </div>

            {/* Toggle button */}
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className={cn(
                'mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg',
                'text-xs font-medium text-muted-foreground',
                'hover:bg-muted/60 hover:text-foreground',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                'transition-colors duration-200 touch-manipulation',
              )}
              aria-expanded={expanded}
              aria-controls="competency-overflow"
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
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
