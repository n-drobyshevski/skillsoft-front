'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, AlertCircle, MinusCircle } from 'lucide-react';

/** Format type for displaying values - use strings instead of functions for Server Component compatibility */
type FormatType = 'decimal2' | 'decimal3' | 'integer' | 'percentage';

interface MetricComparisonRowProps {
  /** Label for the metric */
  label: string;
  /** Current value */
  currentValue: number | null | undefined;
  /** Threshold value(s) */
  threshold: {
    /** Lower bound (optional) */
    min?: number;
    /** Upper bound (optional) */
    max?: number;
    /** Ideal/target value (optional) */
    ideal?: number;
  };
  /** Format type for displaying values (use string types for Server Component compatibility) */
  format?: FormatType;
  /** Show visual bar comparison */
  showBar?: boolean;
  /** Additional className */
  className?: string;
  /** Description or help text */
  description?: string;
}

type ComparisonStatus = 'pass' | 'fail' | 'warning' | 'unknown';

/**
 * Determines the comparison status based on value and thresholds
 */
function getComparisonStatus(
  value: number | null | undefined,
  threshold: MetricComparisonRowProps['threshold']
): ComparisonStatus {
  if (value == null) return 'unknown'; // Handles both null and undefined

  const { min, max, ideal } = threshold;

  // Check if value is outside acceptable range
  if (min !== undefined && value < min) return 'fail';
  if (max !== undefined && value > max) return 'fail';

  // Check if value is in warning zone (within 20% of bounds)
  if (min !== undefined) {
    const warningZone = min + (min * 0.2);
    if (value < warningZone) return 'warning';
  }
  if (max !== undefined) {
    const warningZone = max - (max * 0.2);
    if (value > warningZone) return 'warning';
  }

  // If ideal is specified, check proximity
  if (ideal !== undefined) {
    const deviation = Math.abs(value - ideal) / ideal;
    if (deviation > 0.3) return 'warning';
  }

  return 'pass';
}

const statusConfig: Record<
  ComparisonStatus,
  { icon: typeof CheckCircle2; color: string; bgColor: string; label: string }
> = {
  pass: {
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500',
    label: 'В норме',
  },
  fail: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-500',
    label: 'Вне нормы',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500',
    label: 'Пограничный',
  },
  unknown: {
    icon: MinusCircle,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    label: 'Нет данных',
  },
};

/** Format value based on format type */
function formatValue(value: number | null | undefined, format: FormatType): string {
  if (value == null) return '-'; // Handles both null and undefined
  switch (format) {
    case 'decimal2':
      return value.toFixed(2);
    case 'decimal3':
      return value.toFixed(3);
    case 'integer':
      return Math.round(value).toString();
    case 'percentage':
      return `${(value * 100).toFixed(0)}%`;
    default:
      return value.toFixed(2);
  }
}

/**
 * MetricComparisonRow - Current value vs threshold visualization
 *
 * Displays a metric's current value against its acceptable threshold,
 * with visual indicators for pass/fail/warning states.
 */
export function MetricComparisonRow({
  label,
  currentValue,
  threshold,
  format = 'decimal2',
  showBar = true,
  className,
  description,
}: MetricComparisonRowProps) {
  const status = getComparisonStatus(currentValue, threshold);
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  // Calculate bar position (0-100%)
  const barPosition =
    currentValue != null && threshold.min !== undefined && threshold.max !== undefined
      ? Math.max(0, Math.min(100, ((currentValue - threshold.min) / (threshold.max - threshold.min)) * 100))
      : currentValue != null
        ? Math.max(0, Math.min(100, currentValue * 100))
        : 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <StatusIcon className={cn('h-4 w-4 shrink-0', config.color)} aria-hidden="true" />
          <span className="text-sm font-medium truncate">{label}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={cn('text-sm font-mono font-semibold', config.color)}>
            {formatValue(currentValue, format)}
          </span>
          {threshold.min !== undefined && threshold.max !== undefined && (
            <span className="text-xs text-muted-foreground">
              ({threshold.min} - {threshold.max})
            </span>
          )}
          {threshold.min !== undefined && threshold.max === undefined && (
            <span className="text-xs text-muted-foreground">
              (min: {threshold.min})
            </span>
          )}
          {threshold.max !== undefined && threshold.min === undefined && (
            <span className="text-xs text-muted-foreground">
              (max: {threshold.max})
            </span>
          )}
        </div>
      </div>

      {showBar && (
        <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
          {/* Acceptable range highlight */}
          {threshold.min !== undefined && threshold.max !== undefined && (
            <div
              className="absolute h-full bg-emerald-200 dark:bg-emerald-900/50"
              style={{
                left: `${(threshold.min / 1) * 100}%`,
                width: `${((threshold.max - threshold.min) / 1) * 100}%`,
              }}
            />
          )}
          {/* Current value indicator */}
          {currentValue != null && (
            <div
              className={cn(
                'absolute top-1/2 -translate-y-1/2 h-3 w-1 rounded-full transition-all',
                config.bgColor
              )}
              style={{ left: `${barPosition}%` }}
            />
          )}
        </div>
      )}

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

/**
 * MetricComparisonCard - Card wrapper for multiple MetricComparisonRows
 */
export function MetricComparisonList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  );
}
