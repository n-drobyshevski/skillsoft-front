'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CompetencyReliability,
  ReliabilityStatus,
  ReliabilityStatusDisplay,
} from '@/types/psychometrics';
import { ReliabilityStatusBadge } from './ReliabilityStatusBadge';
import {
  ChevronDown,
  ChevronRight,
  Users,
  FileText,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
} from 'lucide-react';

/**
 * Disclosure level for progressive display
 * - collapsed: Only alpha gauge and name visible
 * - preview: Quick stats and status visible
 * - expanded: Full details with metrics
 */
type DisclosureLevel = 'collapsed' | 'preview' | 'expanded';

interface ProgressiveCompetencyCardProps {
  competency: CompetencyReliability;
  className?: string;
  /** Start expanded for problematic items */
  defaultExpanded?: boolean;
  /** Callback when navigating to detail */
  onNavigate?: (competencyId: string) => void;
  /** Show trend indicator if available */
  trend?: 'up' | 'down' | 'stable' | null;
  /** Previous alpha value for comparison */
  previousAlpha?: number | null;
}

/**
 * Get alpha color classes based on value
 */
function getAlphaColorClasses(alpha: number | null): {
  text: string;
  bg: string;
  ring: string;
  border: string;
} {
  if (alpha === null) {
    return {
      text: 'text-gray-500 dark:text-gray-400',
      bg: 'bg-gray-100 dark:bg-gray-800/50',
      ring: 'ring-gray-300 dark:ring-gray-600',
      border: 'border-l-gray-300 dark:border-l-gray-600',
    };
  }
  if (alpha >= 0.7) {
    return {
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      ring: 'ring-emerald-300 dark:ring-emerald-700',
      border: 'border-l-emerald-500',
    };
  }
  if (alpha >= 0.6) {
    return {
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      ring: 'ring-amber-300 dark:ring-amber-700',
      border: 'border-l-amber-500',
    };
  }
  return {
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/30',
    ring: 'ring-red-300 dark:ring-red-700',
    border: 'border-l-red-500',
  };
}

/**
 * Get status border color
 */
function getStatusBorderColor(status: ReliabilityStatus): string {
  switch (status) {
    case ReliabilityStatus.RELIABLE:
      return 'border-l-emerald-500';
    case ReliabilityStatus.ACCEPTABLE:
      return 'border-l-amber-500';
    case ReliabilityStatus.UNRELIABLE:
      return 'border-l-red-500';
    case ReliabilityStatus.INSUFFICIENT_DATA:
    default:
      return 'border-l-gray-300 dark:border-l-gray-600';
  }
}

/**
 * Trend icon component
 */
function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' | null }) {
  if (!trend) return null;

  switch (trend) {
    case 'up':
      return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
    case 'down':
      return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
    case 'stable':
      return <Minus className="h-3.5 w-3.5 text-gray-400" />;
  }
}

/**
 * ProgressiveCompetencyCard - Mobile-optimized card with progressive disclosure
 *
 * Features:
 * - Touch-friendly with 44px+ touch targets
 * - Three-level progressive disclosure
 * - Smooth animations with reduced motion support
 * - Accessibility compliant (ARIA, keyboard navigation)
 * - Status-based visual hierarchy
 */
export function ProgressiveCompetencyCard({
  competency,
  className,
  defaultExpanded = false,
  onNavigate,
  trend = null,
  previousAlpha = null,
}: ProgressiveCompetencyCardProps) {
  const [level, setLevel] = useState<DisclosureLevel>(
    defaultExpanded ? 'preview' : 'collapsed'
  );

  // Safely handle null/undefined alpha
  const alpha = competency.cronbachAlpha ?? null;
  const alphaColors = getAlphaColorClasses(alpha);
  const alphaDisplay = alpha !== null ? alpha.toFixed(2) : '-';

  // Determine if this competency needs attention
  const needsAttention = useMemo(() => {
    return (
      competency.reliabilityStatus === ReliabilityStatus.UNRELIABLE ||
      (alpha !== null && alpha < 0.6)
    );
  }, [competency.reliabilityStatus, alpha]);

  // Calculate alpha change if previous value available
  const alphaChange = useMemo(() => {
    if (alpha === null || previousAlpha === null) return null;
    return alpha - previousAlpha;
  }, [alpha, previousAlpha]);

  // Handle card tap - progressive disclosure
  const handleTap = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      // Prevent navigation if clicking on the expand button
      if ((e.target as HTMLElement).closest('[data-action="expand"]')) {
        return;
      }

      switch (level) {
        case 'collapsed':
          setLevel('preview');
          break;
        case 'preview':
          // Navigate to full detail on second tap
          if (onNavigate) {
            onNavigate(competency.competencyId);
          }
          break;
        case 'expanded':
          setLevel('collapsed');
          break;
      }
    },
    [level, competency.competencyId, onNavigate]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleTap(e);
      }
      if (e.key === 'Escape' && level !== 'collapsed') {
        setLevel('collapsed');
      }
    },
    [handleTap, level]
  );

  // Toggle expanded state
  const handleExpandToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setLevel((prev) => (prev === 'expanded' ? 'preview' : 'expanded'));
    },
    []
  );

  return (
    <Card
      role="article"
      tabIndex={0}
      aria-label={`${competency.competencyName}, Alpha: ${alphaDisplay}, Status: ${ReliabilityStatusDisplay[competency.reliabilityStatus].label}`}
      aria-expanded={level !== 'collapsed'}
      onClick={handleTap}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative transition-all duration-200 border-l-4 cursor-pointer',
        'hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'active:scale-[0.99] touch-manipulation',
        getStatusBorderColor(competency.reliabilityStatus),
        level !== 'collapsed' && 'ring-1 ring-primary/20 shadow-sm',
        needsAttention && level === 'collapsed' && 'animate-pulse-subtle',
        className
      )}
    >
      <CardContent className="p-3 sm:p-4">
        {/* Level 0: Always visible - Alpha gauge + Name + Chevron */}
        <div className="flex items-center gap-3 min-h-[44px]">
          {/* Alpha Gauge - Touch-friendly (48x48) */}
          <div
            className={cn(
              'flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full',
              'flex flex-col items-center justify-center',
              'ring-2 transition-all',
              alphaColors.bg,
              alphaColors.ring
            )}
            aria-hidden="true"
          >
            <span
              className={cn(
                'text-base sm:text-lg font-bold tabular-nums leading-none',
                alphaColors.text
              )}
            >
              {alphaDisplay}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              alpha
            </span>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-2">
                {competency.competencyName}
              </h3>
              {needsAttention && level === 'collapsed' && (
                <AlertTriangle
                  className="h-4 w-4 text-amber-500 flex-shrink-0"
                  aria-label="Требует внимания"
                />
              )}
            </div>

            {/* Status badge - always visible for quick scanning */}
            <div className="mt-1 flex items-center gap-2">
              <ReliabilityStatusBadge
                status={competency.reliabilityStatus}
                size="sm"
              />
              {trend && <TrendIcon trend={trend} />}
            </div>
          </div>

          {/* Chevron indicator */}
          <ChevronRight
            className={cn(
              'h-5 w-5 text-muted-foreground flex-shrink-0',
              'transition-transform duration-200',
              level !== 'collapsed' && 'rotate-90'
            )}
            aria-hidden="true"
          />
        </div>

        {/* Level 1: Preview details - Stats row */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-200',
            level === 'collapsed'
              ? 'max-h-0 opacity-0'
              : 'max-h-[200px] opacity-100'
          )}
        >
          <div className="mt-3 pt-3 border-t border-border/50">
            {/* Quick stats row */}
            <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 min-h-[44px] px-1">
                <Users className="h-4 w-4" aria-hidden="true" />
                <span className="tabular-nums">
                  {competency.sampleSize?.toLocaleString() ?? '-'}
                </span>
                <span className="hidden sm:inline">респондентов</span>
              </div>

              <div className="flex items-center gap-1.5 min-h-[44px] px-1">
                <FileText className="h-4 w-4" aria-hidden="true" />
                <span className="tabular-nums">
                  {competency.itemCount ?? '-'}
                </span>
                <span>вопросов</span>
              </div>

              {alphaChange !== null && (
                <div
                  className={cn(
                    'flex items-center gap-1 ml-auto',
                    alphaChange > 0
                      ? 'text-emerald-600'
                      : alphaChange < 0
                        ? 'text-red-600'
                        : 'text-gray-500'
                  )}
                >
                  {alphaChange > 0 ? '+' : ''}
                  {alphaChange.toFixed(2)}
                </div>
              )}
            </div>

            {/* Level 2: Expanded details */}
            <div
              className={cn(
                'overflow-hidden transition-all duration-200',
                level !== 'expanded'
                  ? 'max-h-0 opacity-0'
                  : 'max-h-[300px] opacity-100'
              )}
            >
              <div className="mt-3 space-y-3">
                {/* Detailed metrics grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-muted/50 rounded-lg min-h-[44px]">
                    <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">
                      Cronbach's Alpha
                    </div>
                    <div className="font-semibold text-sm sm:text-base tabular-nums">
                      {alpha?.toFixed(3) ?? 'N/A'}
                    </div>
                  </div>
                  <div className="p-2.5 bg-muted/50 rounded-lg min-h-[44px]">
                    <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">
                      Последний расчет
                    </div>
                    <div className="font-semibold text-sm sm:text-base">
                      {competency.lastCalculatedAt
                        ? new Date(
                            competency.lastCalculatedAt
                          ).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                          })
                        : 'Никогда'}
                    </div>
                  </div>
                </div>

                {/* Interpretation text */}
                <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded-lg">
                  {competency.reliabilityStatus === ReliabilityStatus.RELIABLE
                    ? 'Компетенция имеет достаточную внутреннюю согласованность для надежных измерений.'
                    : competency.reliabilityStatus ===
                        ReliabilityStatus.ACCEPTABLE
                      ? 'Приемлемый уровень надежности. Рекомендуется мониторинг.'
                      : competency.reliabilityStatus ===
                          ReliabilityStatus.UNRELIABLE
                        ? 'Низкая надежность. Необходим анализ проблемных вопросов.'
                        : 'Недостаточно данных для расчета надежности.'}
                </div>

                {/* View details link */}
                <Link
                  href={`/psychometrics/competencies/${competency.competencyId}`}
                  className={cn(
                    'flex items-center justify-center gap-2',
                    'w-full py-2.5 min-h-[44px] rounded-lg',
                    'bg-primary/10 hover:bg-primary/20 text-primary',
                    'text-sm font-medium transition-colors',
                    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  Подробный анализ
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Expand/collapse toggle */}
            <button
              data-action="expand"
              onClick={handleExpandToggle}
              className={cn(
                'w-full flex items-center justify-center gap-1.5',
                'mt-2 py-2 min-h-[44px] rounded-lg',
                'text-xs sm:text-sm text-muted-foreground hover:text-foreground',
                'hover:bg-muted/50 transition-colors',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              )}
              aria-expanded={level === 'expanded'}
              aria-label={level === 'expanded' ? 'Свернуть' : 'Развернуть'}
            >
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  level === 'expanded' && 'rotate-180'
                )}
              />
              {level === 'expanded' ? 'Свернуть' : 'Показать больше'}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * ProgressiveCompetencyCardList - Container for progressive competency cards
 */
interface ProgressiveCompetencyCardListProps {
  competencies: CompetencyReliability[];
  className?: string;
  onNavigate?: (competencyId: string) => void;
}

export function ProgressiveCompetencyCardList({
  competencies,
  className,
  onNavigate,
}: ProgressiveCompetencyCardListProps) {
  // Auto-expand problematic items
  const getDefaultExpanded = useCallback((competency: CompetencyReliability) => {
    return competency.reliabilityStatus === ReliabilityStatus.UNRELIABLE;
  }, []);

  return (
    <div className={cn('space-y-2 sm:space-y-3', className)} role="list">
      {competencies.map((competency) => (
        <div role="listitem" key={competency.id}>
          <ProgressiveCompetencyCard
            competency={competency}
            defaultExpanded={getDefaultExpanded(competency)}
            onNavigate={onNavigate}
          />
        </div>
      ))}
    </div>
  );
}

export default ProgressiveCompetencyCard;
