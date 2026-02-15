'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ImprovementBadgeProps {
  /** Change in percentage points (positive = improvement) */
  change: number;
  /** Show as compact inline badge */
  compact?: boolean;
  className?: string;
}

/**
 * ImprovementBadge - Shows score change between attempts.
 * Displays "+12%" with a trend icon, color-coded by direction.
 */
export function ImprovementBadge({ change, compact = false, className }: ImprovementBadgeProps) {
  const rounded = Math.round(change);
  const isPositive = rounded > 0;
  const isNegative = rounded < 0;
  const isNeutral = rounded === 0;

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 font-medium tabular-nums',
        compact ? 'text-[10px]' : 'text-xs',
        isPositive && 'text-emerald-600 dark:text-emerald-400',
        isNegative && 'text-red-600 dark:text-red-400',
        isNeutral && 'text-muted-foreground',
        className
      )}
    >
      <Icon className={cn(compact ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
      {isPositive ? '+' : ''}{rounded}%
    </span>
  );
}

export default ImprovementBadge;
