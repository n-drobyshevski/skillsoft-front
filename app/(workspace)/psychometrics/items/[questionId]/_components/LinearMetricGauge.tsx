'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { type GaugeZone } from '../../../_components/SemiCircularGauge';

/** Format type for displaying values */
type GaugeFormatType = 'decimal2' | 'decimal3' | 'integer' | 'percentage';

/** Format value based on format type */
function formatGaugeValue(value: number | null | undefined, format: GaugeFormatType): string {
  if (value == null) return '-';
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
 * Determines which zone the value falls into
 */
function getActiveZone(value: number | null | undefined, zones: GaugeZone[]): GaugeZone | null {
  if (value == null) return null;
  return zones.find((zone) => value >= zone.min && value <= zone.max) || null;
}

/**
 * Calculate value position as percentage
 */
function valueToPercentage(value: number, minValue: number, maxValue: number): number {
  const clampedValue = Math.max(minValue, Math.min(maxValue, value));
  return ((clampedValue - minValue) / (maxValue - minValue)) * 100;
}

interface LinearMetricGaugeProps {
  /** Current value to display */
  value: number | null | undefined;
  /** Minimum value of the gauge scale */
  minValue?: number;
  /** Maximum value of the gauge scale */
  maxValue?: number;
  /** Zones for color coding */
  zones: GaugeZone[];
  /** Label text */
  label: string;
  /** Short label for compact mode */
  shortLabel?: string;
  /** Format type for displaying values */
  format?: GaugeFormatType;
  /** Optional className for container */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show zone label badge */
  showZoneBadge?: boolean;
  /** Compact mode - inline label and value */
  compact?: boolean;
}

const sizeConfig = {
  sm: {
    height: 'h-1.5',
    valueTextSize: 'text-sm',
    labelTextSize: 'text-xs',
    indicatorSize: 'h-3 w-1',
    badgeSize: 'text-xs px-1.5 py-0',
  },
  md: {
    height: 'h-2',
    valueTextSize: 'text-base',
    labelTextSize: 'text-sm',
    indicatorSize: 'h-4 w-1.5',
    badgeSize: 'text-xs px-2 py-0.5',
  },
  lg: {
    height: 'h-2.5',
    valueTextSize: 'text-lg',
    labelTextSize: 'text-base',
    indicatorSize: 'h-5 w-2',
    badgeSize: 'text-sm px-2.5 py-0.5',
  },
};

/**
 * LinearMetricGauge - Horizontal gauge for mobile displays
 *
 * Features:
 * - Full-width horizontal track with zone colors
 * - Animated value indicator
 * - Compact inline layout for mobile
 * - Zone-colored backgrounds
 * - Framer Motion animations
 */
export function LinearMetricGauge({
  value,
  minValue = 0,
  maxValue = 1,
  zones,
  label,
  shortLabel,
  format = 'decimal2',
  className,
  size = 'md',
  showZoneBadge = true,
  compact = false,
}: LinearMetricGaugeProps) {
  const config = sizeConfig[size];
  const activeZone = getActiveZone(value, zones);
  const displayValue = formatGaugeValue(value, format);
  const percentage = value != null ? valueToPercentage(value, minValue, maxValue) : 0;

  // Calculate zone widths for background
  const zoneWidths = zones.map((zone) => ({
    zone,
    left: valueToPercentage(zone.min, minValue, maxValue),
    width: valueToPercentage(zone.max, minValue, maxValue) - valueToPercentage(zone.min, minValue, maxValue),
  }));

  if (compact) {
    return (
      <div className={cn('space-y-1', className)}>
        {/* Header row with label, value, and badge */}
        <div className="flex items-center justify-between gap-2">
          <span className={cn('text-muted-foreground truncate', config.labelTextSize)}>
            {shortLabel || label}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={cn(
                'font-bold tabular-nums',
                config.valueTextSize,
                activeZone?.textClass || 'text-muted-foreground'
              )}
            >
              {displayValue}
            </span>
            {showZoneBadge && activeZone && (
              <Badge
                variant="outline"
                className={cn(
                  config.badgeSize,
                  activeZone.bgClass,
                  activeZone.textClass,
                  'border-current/30 shrink-0'
                )}
              >
                {activeZone.label}
              </Badge>
            )}
          </div>
        </div>

        {/* Track with zones and indicator */}
        <div className="relative">
          {/* Background track with zones */}
          <div className={cn('relative w-full rounded-full bg-muted/30 overflow-hidden', config.height)}>
            {/* Zone backgrounds */}
            {zoneWidths.map(({ zone, left, width }, index) => (
              <div
                key={index}
                className="absolute inset-y-0 opacity-30"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  backgroundColor: zone.color,
                }}
              />
            ))}

            {/* Filled portion with animation */}
            {value != null && (
              <motion.div
                className={cn('absolute inset-y-0 left-0 rounded-full')}
                style={{ backgroundColor: activeZone?.color || '#888' }}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            )}
          </div>

          {/* Value indicator */}
          {value != null && (
            <motion.div
              className={cn(
                'absolute top-1/2 -translate-y-1/2 rounded-full bg-background shadow-sm',
                config.indicatorSize
              )}
              style={{
                left: `${percentage}%`,
                transform: `translateX(-50%) translateY(-50%)`,
                border: `2px solid ${activeZone?.color || '#888'}`,
              }}
              initial={{ scale: 0, left: '0%' }}
              animate={{ scale: 1, left: `${percentage}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          )}
        </div>
      </div>
    );
  }

  // Standard layout (vertical)
  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      <div className="flex items-center justify-between gap-2">
        <span className={cn('text-muted-foreground', config.labelTextSize)}>
          {label}
        </span>
        <span
          className={cn(
            'font-bold tabular-nums',
            config.valueTextSize,
            activeZone?.textClass || 'text-muted-foreground'
          )}
        >
          {displayValue}
        </span>
      </div>

      {/* Track with zones and indicator */}
      <div className="relative">
        {/* Background track with zones */}
        <div className={cn('relative w-full rounded-full bg-muted/30 overflow-hidden', config.height)}>
          {/* Zone backgrounds */}
          {zoneWidths.map(({ zone, left, width }, index) => (
            <div
              key={index}
              className="absolute inset-y-0 opacity-30"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                backgroundColor: zone.color,
              }}
            />
          ))}

          {/* Filled portion with animation */}
          {value != null && (
            <motion.div
              className={cn('absolute inset-y-0 left-0 rounded-full')}
              style={{ backgroundColor: activeZone?.color || '#888' }}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          )}
        </div>

        {/* Value indicator */}
        {value != null && (
          <motion.div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 rounded-full bg-background shadow-sm',
              config.indicatorSize
            )}
            style={{
              left: `${percentage}%`,
              transform: `translateX(-50%) translateY(-50%)`,
              border: `2px solid ${activeZone?.color || '#888'}`,
            }}
            initial={{ scale: 0, left: '0%' }}
            animate={{ scale: 1, left: `${percentage}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )}
      </div>

      {/* Zone badge */}
      {showZoneBadge && activeZone && (
        <div className="flex justify-center">
          <Badge
            variant="outline"
            className={cn(
              config.badgeSize,
              activeZone.bgClass,
              activeZone.textClass,
              'border-current/30'
            )}
          >
            {activeZone.label}
          </Badge>
        </div>
      )}
    </div>
  );
}

export default LinearMetricGauge;
