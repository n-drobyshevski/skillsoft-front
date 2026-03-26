'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { ItemStatistics, ItemValidityStatus, ItemValidityStatusDisplay } from '@/types/psychometrics';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ChevronRight,
  type LucideIcon
} from 'lucide-react';

interface MobileItemCardProps {
  item: ItemStatistics;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onPrefetch?: (questionId: string) => void;
  className?: string;
}

// Status configuration
const STATUS_CONFIG: Record<ItemValidityStatus, {
  border: string;
  icon: string;
  Icon: LucideIcon;
}> = {
  [ItemValidityStatus.ACTIVE]: {
    border: 'border-l-emerald-500',
    icon: 'text-emerald-600 dark:text-emerald-400',
    Icon: CheckCircle2,
  },
  [ItemValidityStatus.PRELIMINARY]: {
    border: 'border-l-blue-500',
    icon: 'text-blue-600 dark:text-blue-400',
    Icon: Clock,
  },
  [ItemValidityStatus.PROBATION]: {
    border: 'border-l-amber-500',
    icon: 'text-amber-600 dark:text-amber-400',
    Icon: Clock,
  },
  [ItemValidityStatus.FLAGGED_FOR_REVIEW]: {
    border: 'border-l-orange-500',
    icon: 'text-orange-600 dark:text-orange-400',
    Icon: AlertTriangle,
  },
  [ItemValidityStatus.RETIRED]: {
    border: 'border-l-red-500',
    icon: 'text-red-600 dark:text-red-400',
    Icon: XCircle,
  },
};

// Metric color based on quality thresholds
function getMetricColor(value: number | null | undefined, type: 'p' | 'rpb'): string {
  if (value == null) return 'text-muted-foreground';
  if (type === 'p') {
    if (value >= 0.2 && value <= 0.8) return 'text-emerald-600 dark:text-emerald-400';
    return 'text-amber-600 dark:text-amber-400';
  }
  if (value < 0) return 'text-red-600 dark:text-red-400';
  if (value < 0.2) return 'text-amber-600 dark:text-amber-400';
  return 'text-emerald-600 dark:text-emerald-400';
}

/**
 * MobileItemCard - Ultra-compact, overflow-safe mobile card
 *
 * Designed for screens as narrow as 280px with NO horizontal overflow.
 * Uses native div instead of Card component to avoid default padding/gap.
 */
export function MobileItemCard({
  item,
  isSelected,
  onToggle,
  onPrefetch,
  className,
}: MobileItemCardProps) {
  const status = STATUS_CONFIG[item.validityStatus] || STATUS_CONFIG[ItemValidityStatus.ACTIVE];
  const StatusIcon = status.Icon;
  const statusLabel = ItemValidityStatusDisplay[item.validityStatus]?.label;

  const fmt = (v: number | null | undefined): string => v != null ? v.toFixed(2) : '–';

  // Prefetch on touch start for mobile optimization
  const handlePrefetch = () => {
    onPrefetch?.(item.questionId);
  };

  return (
    <div
      className={cn(
        // Base card styles - no default padding
        'relative bg-card rounded-lg border shadow-sm',
        // Left border for status
        'border-l-4',
        status.border,
        // Selection state
        isSelected && 'bg-primary/5 ring-1 ring-primary/20',
        // Prevent ANY overflow
        'overflow-hidden w-full max-w-full',
        className
      )}
      role="article"
      aria-label={`Вопрос: ${item.questionText.slice(0, 40)}`}
    >
      {/* Single flex container for entire card content */}
      <div className="w-full overflow-hidden">
        {/* Row 1: Checkbox + Question + Chevron */}
        <div className="flex items-center gap-1.5 p-2 pb-1 min-h-[44px]">
          {/* Checkbox - touch-optimized wrapper with 44px target area */}
          <div
            className="shrink-0 flex items-center justify-center h-11 w-11 -m-1.5 rounded-lg active:bg-muted/50"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(item.id);
            }}
            role="button"
            tabIndex={0}
            aria-label={isSelected ? 'Снять выбор' : 'Выбрать'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggle(item.id);
              }
            }}
          >
            <Checkbox
              checked={isSelected}
              tabIndex={-1}
              aria-hidden="true"
              className="h-5 w-5 pointer-events-none"
            />
          </div>

          {/* Question - flex-1 with w-0 forces shrinking, break-words handles long text */}
          <Link
            href={`/psychometrics/items/${item.questionId}`}
            className="flex-1 w-0 min-w-0 py-2 min-h-[44px] flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            onTouchStart={handlePrefetch}
            onFocus={handlePrefetch}
          >
            <p className="text-[13px] leading-snug font-medium line-clamp-2 break-words">
              {item.questionText}
            </p>
          </Link>

          {/* Chevron - minimal fixed size */}
          <ChevronRight className="shrink-0 h-4 w-4 text-muted-foreground/30" aria-hidden="true" />
        </div>

        {/* Row 2: Competency + Metrics + Status - single compact row */}
        <div className="flex items-center gap-2 px-2 pb-2 pl-[30px]">
          {/* Competency - truncated, takes available space */}
          <p className="flex-1 w-0 min-w-0 text-xs text-muted-foreground truncate">
            {item.competencyName}
            {item.indicatorTitle && (
              <span className="opacity-60"> · {item.indicatorTitle}</span>
            )}
          </p>

          {/* Metrics - compact inline (12px minimum for a11y) */}
          <div className="shrink-0 flex items-baseline gap-1.5 text-xs">
            <span className="inline-flex items-baseline gap-px">
              <span className="text-muted-foreground/60">p</span>
              <span className={cn('font-medium tabular-nums', getMetricColor(item.difficultyIndex, 'p'))}>
                {fmt(item.difficultyIndex)}
              </span>
            </span>
            <span className="inline-flex items-baseline gap-px">
              <span className="text-muted-foreground/60">r</span>
              <span className={cn('font-medium tabular-nums', getMetricColor(item.discriminationIndex, 'rpb'))}>
                {fmt(item.discriminationIndex)}
              </span>
            </span>
          </div>

          {/* Status icon */}
          <StatusIcon className={cn('shrink-0 h-3.5 w-3.5', status.icon)} aria-label={statusLabel} />
        </div>
      </div>
    </div>
  );
}

/**
 * MobileItemCardList - Accessible list container
 */
interface MobileItemCardListProps {
  items: ItemStatistics[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onPrefetch?: (questionId: string) => void;
  className?: string;
}

export function MobileItemCardList({
  items,
  selectedIds,
  onToggle,
  onPrefetch,
  className,
}: MobileItemCardListProps) {
  return (
    <div
      className={cn('space-y-2 w-full overflow-hidden', className)}
      role="list"
      aria-label="Список элементов"
    >
      {items.map((item) => (
        <div key={item.id} role="listitem" className="w-full overflow-hidden">
          <MobileItemCard
            item={item}
            isSelected={selectedIds.has(item.id)}
            onToggle={onToggle}
            onPrefetch={onPrefetch}
          />
        </div>
      ))}
    </div>
  );
}

export default MobileItemCard;
