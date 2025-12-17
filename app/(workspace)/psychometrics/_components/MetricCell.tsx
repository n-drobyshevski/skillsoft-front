'use client';

import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type MetricType = 'difficulty' | 'discrimination';

interface MetricCellProps {
  value: number | null;
  type: MetricType;
  showBar?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Get color class based on difficulty (p-value)
 * < 0.2 = blue (too hard)
 * 0.2-0.8 = emerald (optimal)
 * > 0.9 = violet (too easy)
 */
function getDifficultyColor(value: number): {
  text: string;
  bg: string;
  bar: string;
  label: string;
  description: string;
} {
  if (value < 0.2) {
    return {
      text: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      bar: 'bg-blue-500',
      label: 'Слишком сложный',
      description: 'p < 0.2: Большинство респондентов не справляются',
    };
  }
  if (value > 0.9) {
    return {
      text: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-100 dark:bg-violet-900/30',
      bar: 'bg-violet-500',
      label: 'Слишком легкий',
      description: 'p > 0.9: Почти все отвечают правильно',
    };
  }
  return {
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    bar: 'bg-emerald-500',
    label: 'Оптимально',
    description: '0.2 <= p <= 0.9: Хороший уровень сложности',
  };
}

/**
 * Get color class based on discrimination (rpb)
 * < 0 = red (toxic/negative)
 * 0-0.1 = orange (critical)
 * 0.1-0.25 = amber (warning)
 * >= 0.25 = emerald (good)
 */
function getDiscriminationColor(value: number): {
  text: string;
  bg: string;
  bar: string;
  label: string;
  description: string;
} {
  if (value < 0) {
    return {
      text: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
      bar: 'bg-red-500',
      label: 'Токсичный',
      description: 'rpb < 0: Неправильные ответы коррелируют с высокими баллами',
    };
  }
  if (value < 0.1) {
    return {
      text: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      bar: 'bg-orange-500',
      label: 'Критично',
      description: 'rpb < 0.1: Очень низкая дискриминация',
    };
  }
  if (value < 0.25) {
    return {
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      bar: 'bg-amber-500',
      label: 'Предупреждение',
      description: '0.1 <= rpb < 0.25: Пограничная дискриминация',
    };
  }
  return {
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    bar: 'bg-emerald-500',
    label: 'Хорошо',
    description: 'rpb >= 0.25: Хорошая дискриминация',
  };
}

function getMetricColors(value: number, type: MetricType) {
  return type === 'difficulty'
    ? getDifficultyColor(value)
    : getDiscriminationColor(value);
}

/**
 * Calculate bar width percentage
 * For difficulty: direct percentage (0-100%)
 * For discrimination: -0.5 to 1.0 range mapped to 0-100%
 */
function getBarWidth(value: number, type: MetricType): number {
  if (type === 'difficulty') {
    return Math.max(0, Math.min(100, value * 100));
  }
  // Discrimination: map -0.5 to 1.0 => 0% to 100%
  const normalized = (value + 0.5) / 1.5;
  return Math.max(0, Math.min(100, normalized * 100));
}

const sizeStyles = {
  sm: {
    text: 'text-xs',
    barHeight: 'h-1',
    barWidth: 'w-12',
    padding: 'px-1.5 py-0.5',
  },
  md: {
    text: 'text-sm',
    barHeight: 'h-1.5',
    barWidth: 'w-16',
    padding: 'px-2 py-1',
  },
};

/**
 * MetricCell - Display difficulty (p-value) and discrimination (rpb) metrics
 * with visual color coding and optional progress bar.
 */
export function MetricCell({
  value,
  type,
  showBar = false,
  size = 'md',
  className,
}: MetricCellProps) {
  const styles = sizeStyles[size];

  if (value === null || value === undefined) {
    return (
      <span className={cn('font-mono text-muted-foreground', styles.text, className)}>
        -
      </span>
    );
  }

  const colors = getMetricColors(value, type);
  const displayValue = value.toFixed(2);
  const barWidth = getBarWidth(value, type);

  const content = (
    <div className={cn('inline-flex flex-col items-center gap-0.5', className)}>
      <span className={cn('font-mono font-medium', styles.text, colors.text)}>
        {displayValue}
      </span>
      {showBar && (
        <div
          className={cn(
            'rounded-full bg-muted overflow-hidden',
            styles.barHeight,
            styles.barWidth
          )}
        >
          <div
            className={cn('h-full rounded-full transition-all', colors.bar)}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      )}
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help">{content}</span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-medium">{colors.label}</p>
          <p className="text-xs text-muted-foreground">{colors.description}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * MetricCellCompact - A more compact version without tooltip wrapper
 * Useful when rendering many cells in a table
 */
export function MetricCellCompact({
  value,
  type,
  size = 'sm',
  className,
}: Omit<MetricCellProps, 'showBar'>) {
  const styles = sizeStyles[size];

  if (value === null || value === undefined) {
    return (
      <span className={cn('font-mono text-muted-foreground', styles.text, className)}>
        -
      </span>
    );
  }

  const colors = getMetricColors(value, type);
  const displayValue = value.toFixed(2);

  return (
    <span className={cn('font-mono font-medium', styles.text, colors.text, className)}>
      {displayValue}
    </span>
  );
}

/**
 * MetricBadge - A badge-style metric display with background color
 */
export function MetricBadge({
  value,
  type,
  size = 'sm',
  className,
}: Omit<MetricCellProps, 'showBar'>) {
  const styles = sizeStyles[size];

  if (value === null || value === undefined) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-md font-mono',
          'bg-muted text-muted-foreground',
          styles.text,
          styles.padding,
          className
        )}
      >
        -
      </span>
    );
  }

  const colors = getMetricColors(value, type);
  const displayValue = value.toFixed(2);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-md font-mono font-medium cursor-help',
            colors.bg,
            colors.text,
            styles.text,
            styles.padding,
            className
          )}
        >
          {displayValue}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-medium">{colors.label}</p>
          <p className="text-xs text-muted-foreground">{colors.description}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export default MetricCell;
