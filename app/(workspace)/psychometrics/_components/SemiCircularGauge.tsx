'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export interface GaugeZone {
  min: number;
  max: number;
  color: string;
  label: string;
  bgClass: string;
  textClass: string;
}

/** Format type for displaying values - use strings for Server Component compatibility */
type GaugeFormatType = 'decimal2' | 'decimal3' | 'integer' | 'percentage';

/** Format value based on format type */
function formatGaugeValue(value: number | null | undefined, format: GaugeFormatType): string {
  if (value === null || value === undefined) return '-';
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

interface SemiCircularGaugeProps {
  /** Current value to display */
  value: number | null | undefined;
  /** Minimum value of the gauge scale */
  minValue?: number;
  /** Maximum value of the gauge scale */
  maxValue?: number;
  /** Zones for color coding (e.g., red/amber/green) */
  zones: GaugeZone[];
  /** Label text displayed below the value */
  label: string;
  /** Format type for displaying values (use string types for Server Component compatibility) */
  format?: GaugeFormatType;
  /** Optional className for container */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show zone label badge */
  showZoneBadge?: boolean;
  /** Show threshold markers on the gauge */
  showThresholds?: boolean;
}

const sizeConfig = {
  sm: {
    width: 120,
    height: 70,
    strokeWidth: 8,
    radius: 45,
    valueTextSize: 'text-lg',
    labelTextSize: 'text-xs',
    badgeSize: 'text-xs px-1.5 py-0.5',
  },
  md: {
    width: 180,
    height: 100,
    strokeWidth: 12,
    radius: 65,
    valueTextSize: 'text-2xl',
    labelTextSize: 'text-sm',
    badgeSize: 'text-xs px-2 py-0.5',
  },
  lg: {
    width: 240,
    height: 130,
    strokeWidth: 16,
    radius: 85,
    valueTextSize: 'text-3xl',
    labelTextSize: 'text-base',
    badgeSize: 'text-sm px-2.5 py-1',
  },
};

/**
 * Determines which zone the value falls into
 */
function getActiveZone(value: number | null | undefined, zones: GaugeZone[]): GaugeZone | null {
  if (value === null || value === undefined) return null;
  return zones.find((zone) => value >= zone.min && value <= zone.max) || null;
}

/**
 * Converts a value to an angle on the semi-circular gauge
 */
function valueToAngle(
  value: number,
  minValue: number,
  maxValue: number
): number {
  const clampedValue = Math.max(minValue, Math.min(maxValue, value));
  const percentage = (clampedValue - minValue) / (maxValue - minValue);
  // Semi-circle: 180 to 0 degrees (left to right)
  return 180 - percentage * 180;
}

/**
 * Round to fixed decimal places to avoid hydration mismatches
 * between server and client floating point calculations
 */
function roundTo(value: number, decimals: number = 4): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Converts angle to arc coordinates
 */
function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: roundTo(centerX + radius * Math.cos(angleInRadians)),
    y: roundTo(centerY - radius * Math.sin(angleInRadians)),
  };
}

/**
 * Creates an SVG arc path
 */
function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, startAngle);
  const end = polarToCartesian(x, y, radius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export function SemiCircularGauge({
  value,
  minValue = 0,
  maxValue = 1,
  zones,
  label,
  format = 'decimal2',
  className,
  size = 'md',
  showZoneBadge = true,
  showThresholds = true,
}: SemiCircularGaugeProps) {
  const config = sizeConfig[size];
  const centerX = config.width / 2;
  const centerY = config.height - 10;
  const radius = config.radius;
  const strokeWidth = config.strokeWidth;

  const activeZone = getActiveZone(value, zones);
  const displayValue = formatGaugeValue(value, format);

  // Calculate the end angle for the filled portion
  const endAngle = value != null ? valueToAngle(value, minValue, maxValue) : 180;

  // Background arc path (full semi-circle)
  const bgArcPath = describeArc(centerX, centerY, radius, 0, 180);

  // Value arc path (from 180 degrees down to the value angle)
  const valueArcPath =
    value != null ? describeArc(centerX, centerY, radius, endAngle, 180) : '';

  // Calculate threshold marker positions
  const thresholdMarkers = showThresholds
    ? zones
        .slice(0, -1) // Skip the last zone (no marker needed at the end)
        .map((zone) => ({
          angle: valueToAngle(zone.max, minValue, maxValue),
          value: zone.max,
        }))
    : [];

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <svg
        width={config.width}
        height={config.height}
        viewBox={`0 0 ${config.width} ${config.height}`}
        className="overflow-visible"
      >
        {/* Background track */}
        <path
          d={bgArcPath}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-muted/30"
        />

        {/* Zone-colored segments (optional background zones) */}
        {zones.map((zone, index) => {
          const zoneStartAngle = valueToAngle(zone.max, minValue, maxValue);
          const zoneEndAngle = valueToAngle(zone.min, minValue, maxValue);
          const zonePath = describeArc(
            centerX,
            centerY,
            radius,
            zoneStartAngle,
            zoneEndAngle
          );
          return (
            <path
              key={index}
              d={zonePath}
              fill="none"
              stroke={zone.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="opacity-20"
            />
          );
        })}

        {/* Value arc with animation */}
        {value != null && (
          <motion.path
            d={valueArcPath}
            fill="none"
            stroke={activeZone?.color || 'currentColor'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )}

        {/* Threshold markers */}
        {thresholdMarkers.map((marker, index) => {
          const pos = polarToCartesian(centerX, centerY, radius, marker.angle);
          return (
            <g key={index}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={strokeWidth / 4 + 1}
                className="fill-background stroke-muted-foreground"
                strokeWidth={1}
              />
            </g>
          );
        })}

        {/* Value indicator dot */}
        {value != null && (
          <motion.circle
            cx={polarToCartesian(centerX, centerY, radius, endAngle).x}
            cy={polarToCartesian(centerX, centerY, radius, endAngle).y}
            r={strokeWidth / 2 + 2}
            className="fill-background"
            stroke={activeZone?.color || 'currentColor'}
            strokeWidth={2}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          />
        )}
      </svg>

      {/* Value display */}
      <div className="flex flex-col items-center -mt-2">
        <span
          className={cn(
            'font-bold tabular-nums',
            config.valueTextSize,
            activeZone?.textClass || 'text-muted-foreground'
          )}
        >
          {displayValue}
        </span>
        <span className={cn('text-muted-foreground', config.labelTextSize)}>
          {label}
        </span>
      </div>

      {/* Zone badge */}
      {showZoneBadge && activeZone && (
        <Badge
          variant="outline"
          className={cn(
            'mt-2',
            config.badgeSize,
            activeZone.bgClass,
            activeZone.textClass,
            'border-current/30'
          )}
        >
          {activeZone.label}
        </Badge>
      )}
    </div>
  );
}

// ============================================
// PRESET ZONE CONFIGURATIONS
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
    label: 'Слишком сложный',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-600 dark:text-blue-400',
  },
  {
    min: 0.2,
    max: 0.9,
    color: '#10b981', // emerald
    label: 'Оптимальный',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    textClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    min: 0.9,
    max: 1,
    color: '#a855f7', // purple
    label: 'Слишком легкий',
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    textClass: 'text-purple-600 dark:text-purple-400',
  },
];

/**
 * Zone configuration for discrimination index (rpb)
 * Excellent: >= 0.35, Good: >= 0.25, Warning: >= 0.1, Critical: < 0.1
 */
export const DISCRIMINATION_ZONES: GaugeZone[] = [
  {
    min: -1,
    max: 0,
    color: '#dc2626', // red
    label: 'Токсичный',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-600 dark:text-red-400',
  },
  {
    min: 0,
    max: 0.1,
    color: '#f97316', // orange
    label: 'Критично',
    bgClass: 'bg-orange-100 dark:bg-orange-900/30',
    textClass: 'text-orange-600 dark:text-orange-400',
  },
  {
    min: 0.1,
    max: 0.25,
    color: '#f59e0b', // amber
    label: 'Предупреждение',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    textClass: 'text-amber-600 dark:text-amber-400',
  },
  {
    min: 0.25,
    max: 0.35,
    color: '#22c55e', // green
    label: 'Хорошо',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-600 dark:text-green-400',
  },
  {
    min: 0.35,
    max: 1,
    color: '#10b981', // emerald
    label: 'Отлично',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    textClass: 'text-emerald-600 dark:text-emerald-400',
  },
];

/**
 * Zone configuration for Cronbach's Alpha
 * Reliable: >= 0.7, Acceptable: >= 0.6, Unreliable: < 0.6
 */
export const ALPHA_ZONES: GaugeZone[] = [
  {
    min: 0,
    max: 0.6,
    color: '#dc2626', // red
    label: 'Ненадежный',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-600 dark:text-red-400',
  },
  {
    min: 0.6,
    max: 0.7,
    color: '#f59e0b', // amber
    label: 'Приемлемый',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    textClass: 'text-amber-600 dark:text-amber-400',
  },
  {
    min: 0.7,
    max: 0.8,
    color: '#22c55e', // green
    label: 'Хороший',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-600 dark:text-green-400',
  },
  {
    min: 0.8,
    max: 1,
    color: '#10b981', // emerald
    label: 'Отличный',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    textClass: 'text-emerald-600 dark:text-emerald-400',
  },
];

// ============================================
// CONVENIENCE WRAPPER COMPONENTS
// ============================================

interface SpecificGaugeProps {
  value: number | null | undefined;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showZoneBadge?: boolean;
}

/**
 * Pre-configured gauge for difficulty index display
 */
export function DifficultyGauge({
  value,
  className,
  size = 'md',
  showZoneBadge = true,
}: SpecificGaugeProps) {
  return (
    <SemiCircularGauge
      value={value}
      minValue={0}
      maxValue={1}
      zones={DIFFICULTY_ZONES}
      label="Индекс сложности (p)"
      format="decimal2"
      className={className}
      size={size}
      showZoneBadge={showZoneBadge}
    />
  );
}

/**
 * Pre-configured gauge for discrimination index display
 */
export function DiscriminationGauge({
  value,
  className,
  size = 'md',
  showZoneBadge = true,
}: SpecificGaugeProps) {
  return (
    <SemiCircularGauge
      value={value}
      minValue={-0.5}
      maxValue={1}
      zones={DISCRIMINATION_ZONES}
      label="Индекс различения (rpb)"
      format="decimal2"
      className={className}
      size={size}
      showZoneBadge={showZoneBadge}
    />
  );
}

/**
 * Pre-configured gauge for Cronbach's Alpha display
 */
export function AlphaGauge({
  value,
  className,
  size = 'md',
  showZoneBadge = true,
}: SpecificGaugeProps) {
  return (
    <SemiCircularGauge
      value={value}
      minValue={0}
      maxValue={1}
      zones={ALPHA_ZONES}
      label="Cronbach's Alpha"
      format="decimal3"
      className={className}
      size={size}
      showZoneBadge={showZoneBadge}
    />
  );
}
