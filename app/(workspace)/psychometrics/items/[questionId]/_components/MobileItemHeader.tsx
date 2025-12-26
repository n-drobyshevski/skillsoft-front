'use client';

import { cn } from '@/lib/utils';
import { ValidityStatusBadge } from '../../../_components';
import { ItemValidityStatus } from '@/types/psychometrics';
import { useIsMobile } from '@/hooks/use-mobile';
import Link from 'next/link';
import {
  ChevronLeft,
  MoreVertical,
  Users,
  Clock,
  Target,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileItemHeaderProps {
  /** Item validity status */
  status: ItemValidityStatus;
  /** Competency name for breadcrumb */
  competencyName: string;
  /** Number of responses */
  responseCount: number;
  /** Last calculation date */
  lastCalculatedAt: string | null;
  /** Difficulty index value */
  difficultyIndex: number | null;
  /** Discrimination index value */
  discriminationIndex: number | null;
  /** Whether item has issues requiring attention */
  hasIssues: boolean;
  /** Callback when actions button is clicked */
  onActionsClick: () => void;
  /** Additional className */
  className?: string;
}

/**
 * Get color class for metric value based on thresholds
 */
function getMetricColor(value: number | null | undefined, type: 'p' | 'rpb'): string {
  if (value == null) return 'text-muted-foreground'; // Handles both null and undefined

  if (type === 'p') {
    // Difficulty: optimal range 0.2 - 0.9
    if (value < 0.2 || value > 0.9) return 'text-amber-600 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
  }

  // Discrimination: good >= 0.25, warning < 0.25, critical < 0.1
  if (value < 0) return 'text-red-600 dark:text-red-400';
  if (value < 0.1) return 'text-orange-600 dark:text-orange-400';
  if (value < 0.25) return 'text-amber-600 dark:text-amber-400';
  return 'text-emerald-600 dark:text-emerald-400';
}

/**
 * Format metric value for display
 */
function formatMetric(value: number | null | undefined): string {
  if (value == null) return '-'; // Handles both null and undefined
  return value.toFixed(2);
}

/**
 * MobileItemHeader - Compact sticky header for mobile item detail page
 *
 * Features:
 * - Sticky positioning with backdrop blur
 * - 44px minimum touch targets
 * - Horizontal scrollable metrics on narrow screens
 * - Status-driven accent border when issues detected
 * - Back navigation to items list
 * - Actions FAB to trigger bottom sheet
 */
export function MobileItemHeader({
  status,
  competencyName,
  responseCount,
  lastCalculatedAt,
  difficultyIndex,
  discriminationIndex,
  hasIssues,
  onActionsClick,
  className,
}: MobileItemHeaderProps) {
  const isMobile = useIsMobile();

  // On desktop, render nothing - desktop uses the existing hero
  if (!isMobile) return null;

  return (
    <header
      className={cn(
        // Sticky header with blur
        'sticky top-0 z-40',
        'bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80',
        // Border
        'border-b',
        // Issue indicator - amber border when problems detected
        hasIssues && 'border-b-amber-500/50',
        className
      )}
    >
      {/* Row 1: Navigation + Status + Actions */}
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        {/* Back button - 44px touch target */}
        <Link
          href="/psychometrics/items"
          className={cn(
            'flex items-center gap-1 text-sm text-muted-foreground',
            'min-h-[44px] min-w-[44px] -ml-2 pl-2',
            'rounded-md hover:bg-accent transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
          aria-label="Вернуться к списку элементов"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="hidden xs:inline">Элементы</span>
        </Link>

        {/* Status badge - centered */}
        <div className="flex items-center gap-2">
          <ValidityStatusBadge status={status} size="md" />
          {hasIssues && (
            <AlertTriangle
              className="h-4 w-4 text-amber-500 animate-pulse"
              aria-label="Обнаружены проблемы"
            />
          )}
        </div>

        {/* Actions button - 44px touch target */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onActionsClick}
          className="min-h-[44px] min-w-[44px] -mr-2"
          aria-label="Открыть меню действий"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Row 2: Competency breadcrumb (truncated) */}
      <div className="px-3 pb-1">
        <p className="text-xs text-muted-foreground truncate">
          {competencyName}
        </p>
      </div>

      {/* Row 3: Quick metrics - horizontal scroll on tiny screens */}
      <div
        className={cn(
          'flex items-center gap-3 px-3 pb-2',
          'overflow-x-auto scrollbar-hide',
          '-mx-3 px-3' // Negative margin for edge-to-edge scroll
        )}
      >
        {/* Difficulty (p) */}
        <div className="flex items-center gap-1.5 shrink-0" title="Индекс сложности">
          <Target className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">p:</span>
          <span
            className={cn(
              'text-sm font-semibold tabular-nums',
              getMetricColor(difficultyIndex, 'p')
            )}
          >
            {formatMetric(difficultyIndex)}
          </span>
        </div>

        <div className="w-px h-4 bg-border shrink-0" aria-hidden="true" />

        {/* Discrimination (rpb) */}
        <div className="flex items-center gap-1.5 shrink-0" title="Индекс различения">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">rpb:</span>
          <span
            className={cn(
              'text-sm font-semibold tabular-nums',
              getMetricColor(discriminationIndex, 'rpb')
            )}
          >
            {formatMetric(discriminationIndex)}
          </span>
        </div>

        <div className="w-px h-4 bg-border shrink-0" aria-hidden="true" />

        {/* Response count */}
        <div className="flex items-center gap-1.5 shrink-0" title="Количество ответов">
          <Users className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm font-medium tabular-nums">
            {responseCount.toLocaleString('ru-RU')}
          </span>
        </div>

        {/* Last calculated */}
        {lastCalculatedAt && (
          <>
            <div className="w-px h-4 bg-border shrink-0" aria-hidden="true" />
            <div className="flex items-center gap-1.5 shrink-0" title="Дата расчета">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <span className="text-xs text-muted-foreground">
                {new Date(lastCalculatedAt).toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: 'short',
                })}
              </span>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export default MobileItemHeader;
