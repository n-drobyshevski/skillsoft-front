'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
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

const STATUS_STYLES = {
  exceeds: {
    text: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30 dark:border-emerald-500/25',
    bar: 'bg-emerald-500',
    label: 'EXCEEDS',
  },
  meets: {
    text: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-500/15 border-blue-500/30',
    badgeText: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/30 dark:border-blue-500/25',
    bar: 'bg-blue-500',
    label: 'MEETS',
  },
  below: {
    text: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-500/15 border-amber-500/30',
    badgeText: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30 dark:border-amber-500/25',
    bar: 'bg-amber-500',
    label: 'BELOW',
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
  // Unique gradient ID per color to avoid SVG conflicts
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
// Props
// ============================================================================

interface CompetencyCardGridProps {
  competencies: CompetencyScore[];
  passingScore: number;
  onCardClick?: (competencyId: string) => void;
  /** Real historical scores per competency name — used for sparklines */
  trendMap?: Record<string, number[]>;
}

// ============================================================================
// CompetencyCardGrid — 2×N compact card grid matching Direction B preview
// ============================================================================

export function CompetencyCardGrid({
  competencies,
  passingScore,
  onCardClick,
  trendMap,
}: CompetencyCardGridProps) {
  const cards = useMemo(() => {
    return competencies.map((c) => {
      const status = getCompStatus(c.percentage, c.benchmarkScore, passingScore);
      const benchmark = c.benchmarkScore ?? passingScore;
      const gap = Math.round(c.percentage) - Math.round(benchmark);
      const gapStr = gap >= 0 ? `+${gap}` : String(gap);
      return { ...c, status, benchmark: Math.round(benchmark), gap, gapStr };
    });
  }, [competencies, passingScore]);

  return (
    <div className="grid grid-cols-2 gap-2.5" role="list" aria-label="Competency scores">
      {cards.map((card) => {
        const styles = STATUS_STYLES[card.status];
        return (
          <button
            key={card.competencyId}
            type="button"
            role="listitem"
            aria-label={`${card.competencyName}: ${Math.round(card.percentage)}%`}
            className={cn(
              'rounded-xl border p-3 text-left transition-all duration-200',
              'hover:-translate-y-px hover:shadow-md active:scale-[0.98]',
              'bg-card touch-manipulation',
              styles.border,
            )}
            onClick={() => onCardClick?.(card.competencyId)}
          >
            {/* Header: name + status badge */}
            <div className="flex items-start justify-between mb-2 gap-1">
              <span className="text-[10px] font-medium text-muted-foreground leading-snug max-w-[90px]">
                {card.competencyName}
              </span>
              <span
                className={cn(
                  'text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full border whitespace-nowrap shrink-0',
                  styles.badgeBg,
                  styles.badgeText,
                )}
              >
                {styles.label}
              </span>
            </div>

            {/* Score */}
            <div className={cn('text-xl font-bold tabular-nums tracking-tight mb-1', styles.text)}>
              {Math.round(card.percentage)}
              <span className="text-xs font-medium text-muted-foreground">%</span>
            </div>

            {/* Meta: benchmark + gap */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground">
                bench {card.benchmark}
              </span>
              <span className={cn('text-[10px] font-medium tabular-nums', styles.text)}>
                {card.gapStr}
              </span>
            </div>

            {/* SVG sparkline — real historical data when available, simulated fallback */}
            {(() => {
              const realPoints = trendMap?.[card.competencyName];
              const sparkData = realPoints && realPoints.length >= 2
                ? realPoints
                : [card.percentage * 0.7, card.percentage * 0.85, card.percentage];
              const hasRealTrend = realPoints && realPoints.length >= 2;
              return (
                <>
                  <MiniSparkline data={sparkData} color={STATUS_HEX[card.status]} height={24} />
                  {hasRealTrend && (
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[9px] text-muted-foreground tabular-nums">
                        {realPoints[0]}% → {realPoints[realPoints.length - 1]}%
                      </span>
                      <span className={cn('text-[9px] font-medium tabular-nums', styles.text)}>
                        {realPoints.length} attempts
                      </span>
                    </div>
                  )}
                </>
              );
            })()}
          </button>
        );
      })}
    </div>
  );
}
