'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface GaugeZone {
  min: number;
  max: number;
  color: string;
  labelKey: string;
  bgClass: string;
  textClass: string;
}

interface MobileMetricPillProps {
  /** Short label like "p" or "rpb" */
  shortLabel: string;
  /** Full label for tooltip */
  fullLabel: string;
  /** Current value */
  value: number | null;
  /** Zone definitions for color coding */
  zones: GaugeZone[];
  /** Min value for scale */
  minValue?: number;
  /** Max value for scale */
  maxValue?: number;
  /** Format type */
  format?: 'decimal2' | 'integer';
  /** onClick handler for expanding details */
  onClick?: () => void;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Additional className */
  className?: string;
}

/**
 * Determines which zone the value falls into
 */
function getActiveZone(value: number | null, zones: GaugeZone[]): GaugeZone | null {
  if (value === null) return null;
  return zones.find((zone) => value >= zone.min && value <= zone.max) || null;
}

/**
 * Format value based on format type
 */
function formatValue(value: number | null, format: 'decimal2' | 'integer'): string {
  if (value === null) return '-';
  return format === 'integer' ? Math.round(value).toString() : value.toFixed(2);
}

/**
 * Calculate percentage for progress bar
 */
function calculatePercentage(value: number | null, minValue: number, maxValue: number): number {
  if (value === null) return 0;
  const clamped = Math.max(minValue, Math.min(maxValue, value));
  return ((clamped - minValue) / (maxValue - minValue)) * 100;
}

/**
 * MobileMetricPill - Compact linear gauge for mobile
 *
 * Displays a metric value with a horizontal progress bar and color coding.
 * Designed for mobile viewports where semi-circular gauges would be too large.
 */
export function MobileMetricPill({
  shortLabel,
  fullLabel,
  value,
  zones,
  minValue = 0,
  maxValue = 1,
  format = 'decimal2',
  onClick,
  size = 'md',
  className,
}: MobileMetricPillProps) {
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations('psychometrics.flaggedDetail.metrics');
  const activeZone = getActiveZone(value, zones);
  const percentage = calculatePercentage(value, minValue, maxValue);
  const formattedValue = formatValue(value, format);
  const zoneLabel = activeZone ? t(activeZone.labelKey) : t('noData');

  const sizeStyles = {
    sm: {
      container: 'px-2 py-1.5',
      label: 'text-[10px]',
      value: 'text-sm',
      track: 'h-1',
      zoneBadge: 'text-[9px]',
    },
    md: {
      container: 'px-3 py-2',
      label: 'text-xs',
      value: 'text-base sm:text-lg',
      track: 'h-1.5',
      zoneBadge: 'text-[10px]',
    },
  };

  const styles = sizeStyles[size];

  const content = (
    <div
      className={cn(
        'rounded-lg border bg-card',
        'flex flex-col gap-1',
        onClick && 'cursor-pointer hover:bg-accent/50 active:scale-[0.98] transition-all',
        styles.container,
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Header row: label + value */}
      <div className="flex items-baseline justify-between gap-2">
        <span className={cn('text-muted-foreground uppercase tracking-wider font-medium', styles.label)}>
          {shortLabel}
        </span>
        <span
          className={cn(
            'font-bold tabular-nums leading-none',
            styles.value,
            activeZone?.textClass || 'text-muted-foreground'
          )}
        >
          {formattedValue}
        </span>
      </div>

      {/* Progress bar */}
      <div className={cn('w-full bg-muted rounded-full overflow-hidden', styles.track)}>
        <motion.div
          className={cn('h-full rounded-full', styles.track)}
          style={{ backgroundColor: activeZone?.color || 'hsl(var(--muted-foreground))' }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Zone label */}
      {activeZone && (
        <span
          className={cn(
            'uppercase tracking-wider font-medium truncate',
            styles.zoneBadge,
            activeZone.textClass
          )}
        >
          {zoneLabel}
        </span>
      )}
    </div>
  );

  // Wrap with tooltip on non-touch devices
  if (!onClick) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p className="font-medium">{fullLabel}</p>
          <p className="text-muted-foreground">{zoneLabel}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

// ============================================
// PRESET ZONE CONFIGURATIONS (copied from SemiCircularGauge)
// ============================================

/**
 * Zone configuration for difficulty index (p-value)
 * Good range: 0.2 - 0.9
 */
export const DIFFICULTY_ZONES: GaugeZone[] = [
  {
    min: 0,
    max: 0.2,
    color: '#3b82f6', // blue
    labelKey: 'tooHard',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-600 dark:text-blue-400',
  },
  {
    min: 0.2,
    max: 0.9,
    color: '#10b981', // emerald
    labelKey: 'optimal',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    textClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    min: 0.9,
    max: 1,
    color: '#a855f7', // purple
    labelKey: 'tooEasy',
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    textClass: 'text-purple-600 dark:text-purple-400',
  },
];

/**
 * Zone configuration for discrimination index (rpb)
 */
export const DISCRIMINATION_ZONES: GaugeZone[] = [
  {
    min: -1,
    max: 0,
    color: '#dc2626', // red
    labelKey: 'negative',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-600 dark:text-red-400',
  },
  {
    min: 0,
    max: 0.1,
    color: '#f97316', // orange
    labelKey: 'critical',
    bgClass: 'bg-orange-100 dark:bg-orange-900/30',
    textClass: 'text-orange-600 dark:text-orange-400',
  },
  {
    min: 0.1,
    max: 0.25,
    color: '#f59e0b', // amber
    labelKey: 'warning',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    textClass: 'text-amber-600 dark:text-amber-400',
  },
  {
    min: 0.25,
    max: 0.35,
    color: '#22c55e', // green
    labelKey: 'good',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-600 dark:text-green-400',
  },
  {
    min: 0.35,
    max: 1,
    color: '#10b981', // emerald
    labelKey: 'excellent',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    textClass: 'text-emerald-600 dark:text-emerald-400',
  },
];

/**
 * Zone configuration for response count (integer)
 */
export const RESPONSE_COUNT_ZONES: GaugeZone[] = [
  {
    min: 0,
    max: 30,
    color: '#dc2626', // red
    labelKey: 'insufficient',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-600 dark:text-red-400',
  },
  {
    min: 30,
    max: 50,
    color: '#f59e0b', // amber
    labelKey: 'minimum',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    textClass: 'text-amber-600 dark:text-amber-400',
  },
  {
    min: 50,
    max: 100,
    color: '#22c55e', // green
    labelKey: 'good',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-600 dark:text-green-400',
  },
  {
    min: 100,
    max: 10000,
    color: '#10b981', // emerald
    labelKey: 'excellent',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    textClass: 'text-emerald-600 dark:text-emerald-400',
  },
];

// ============================================
// CONVENIENCE WRAPPER COMPONENTS
// ============================================

interface SpecificPillProps {
  value: number | null;
  onClick?: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Pre-configured pill for difficulty index display
 */
export function DifficultyPill({ value, onClick, size, className }: SpecificPillProps) {
  const t = useTranslations('psychometrics.flaggedDetail.metrics');
  return (
    <MobileMetricPill
      shortLabel="p"
      fullLabel={t('difficultyIndex')}
      value={value}
      zones={DIFFICULTY_ZONES}
      minValue={0}
      maxValue={1}
      format="decimal2"
      onClick={onClick}
      size={size}
      className={className}
    />
  );
}

/**
 * Pre-configured pill for discrimination index display
 */
export function DiscriminationPill({ value, onClick, size, className }: SpecificPillProps) {
  const t = useTranslations('psychometrics.flaggedDetail.metrics');
  return (
    <MobileMetricPill
      shortLabel="rpb"
      fullLabel={t('discriminationIndex')}
      value={value}
      zones={DISCRIMINATION_ZONES}
      minValue={-0.5}
      maxValue={1}
      format="decimal2"
      onClick={onClick}
      size={size}
      className={className}
    />
  );
}

/**
 * Pre-configured pill for response count display
 */
export function ResponseCountPill({ value, onClick, size, className }: SpecificPillProps) {
  const t = useTranslations('psychometrics.flaggedDetail.metrics');
  return (
    <MobileMetricPill
      shortLabel="n"
      fullLabel={t('responseCount')}
      value={value}
      zones={RESPONSE_COUNT_ZONES}
      minValue={0}
      maxValue={200}
      format="integer"
      onClick={onClick}
      size={size}
      className={className}
    />
  );
}

export default MobileMetricPill;
