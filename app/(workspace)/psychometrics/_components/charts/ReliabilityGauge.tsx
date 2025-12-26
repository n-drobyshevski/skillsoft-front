'use client';

import { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ReliabilityGaugeProps {
  value: number | null | undefined;
  competencyName?: string;
  sampleSize?: number | null;
  itemCount?: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showAnimation?: boolean;
}

// Size configurations
const sizeConfig = {
  sm: { width: 140, height: 84, strokeWidth: 8, fontSize: 18, labelSize: 10 },
  md: { width: 180, height: 108, strokeWidth: 10, fontSize: 24, labelSize: 12 },
  lg: { width: 220, height: 132, strokeWidth: 12, fontSize: 32, labelSize: 14 },
};

// Color configuration based on alpha value ranges
function getColorConfig(value: number | null | undefined): { color: string; bgColor: string; label: string; textColor: string } {
  if (value == null) {
    return {
      color: '#9ca3af', // gray-400
      bgColor: '#f3f4f6', // gray-100
      label: 'Insufficient data',
      textColor: 'text-gray-500',
    };
  }
  if (value >= 0.8) {
    return {
      color: '#10b981', // emerald-500
      bgColor: '#d1fae5', // emerald-100
      label: 'Excellent',
      textColor: 'text-emerald-600',
    };
  }
  if (value >= 0.7) {
    return {
      color: '#3b82f6', // blue-500
      bgColor: '#dbeafe', // blue-100
      label: 'Good',
      textColor: 'text-blue-600',
    };
  }
  if (value >= 0.6) {
    return {
      color: '#f59e0b', // amber-500
      bgColor: '#fef3c7', // amber-100
      label: 'Acceptable',
      textColor: 'text-amber-600',
    };
  }
  return {
    color: '#ef4444', // red-500
    bgColor: '#fee2e2', // red-100
    label: 'Unreliable',
    textColor: 'text-red-600',
  };
}

// Get Russian label for status
function getStatusLabel(value: number | null | undefined): string {
  if (value == null) return 'Insufficient Data';
  if (value >= 0.8) return 'Excellent';
  if (value >= 0.7) return 'Good';
  if (value >= 0.6) return 'Acceptable';
  return 'Unreliable';
}

export function ReliabilityGauge({
  value,
  competencyName,
  sampleSize,
  itemCount,
  size = 'md',
  className,
  showAnimation = true,
}: ReliabilityGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(value ?? 0);
  const sizeConfigItem = sizeConfig[size];
  const colorConfig = getColorConfig(value);

  // Calculate arc parameters
  const radius = (sizeConfigItem.width - sizeConfigItem.strokeWidth) / 2;
  const centerX = sizeConfigItem.width / 2;
  const centerY = sizeConfigItem.height;

  // Arc path for 180 degrees (semi-circle)
  const circumference = Math.PI * radius;
  const startAngle = Math.PI; // 180 degrees (left side)

  // Animate the value on mount
  useEffect(() => {
    if (!showAnimation || value == null) {
      return;
    }

    const duration = 1000; // 1 second
    const startTime = Date.now();
    const startValue = animatedValue;
    const targetValue = value;

    let frameId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(startValue + (targetValue - startValue) * easeOut);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, showAnimation]);

  // Calculate the stroke offset for the progress arc
  const progressPercentage = value != null ? Math.min(Math.max(animatedValue, 0), 1) : 0;
  const strokeDashoffset = circumference * (1 - progressPercentage);

  // Create arc path
  const arcPath = useMemo(() => {
    const endX = centerX + radius * Math.cos(startAngle);
    const endY = centerY + radius * Math.sin(startAngle);
    const startX = centerX + radius * Math.cos(0);
    const startY = centerY + radius * Math.sin(0);

    return `M ${endX} ${endY} A ${radius} ${radius} 0 0 1 ${startX} ${startY}`;
  }, [centerX, centerY, radius, startAngle]);

  // Threshold tick positions
  const thresholds = [0.6, 0.7, 0.8];
  const tickMarks = thresholds.map(threshold => {
    const angle = Math.PI * (1 - threshold);
    return {
      x1: centerX + (radius - sizeConfigItem.strokeWidth / 2 - 2) * Math.cos(angle),
      y1: centerY + (radius - sizeConfigItem.strokeWidth / 2 - 2) * Math.sin(angle),
      x2: centerX + (radius + sizeConfigItem.strokeWidth / 2 + 2) * Math.cos(angle),
      y2: centerY + (radius + sizeConfigItem.strokeWidth / 2 + 2) * Math.sin(angle),
      value: threshold,
    };
  });

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <svg
        width={sizeConfigItem.width}
        height={sizeConfigItem.height + 10}
        viewBox={`0 0 ${sizeConfigItem.width} ${sizeConfigItem.height + 10}`}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={arcPath}
          fill="none"
          stroke="currentColor"
          strokeWidth={sizeConfigItem.strokeWidth}
          strokeLinecap="round"
          className="text-muted/30"
          strokeDasharray={value == null ? '4 4' : 'none'}
        />

        {/* Progress arc */}
        {value != null && (
          <path
            d={arcPath}
            fill="none"
            stroke={colorConfig.color}
            strokeWidth={sizeConfigItem.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: showAnimation ? 'none' : 'stroke-dashoffset 0.5s ease-out',
            }}
          />
        )}

        {/* Threshold tick marks */}
        {tickMarks.map((tick, index) => (
          <g key={index}>
            <line
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke="currentColor"
              strokeWidth={1.5}
              className="text-muted-foreground/50"
            />
          </g>
        ))}

        {/* Center display */}
        {value != null ? (
          <>
            {/* Value */}
            <text
              x={centerX}
              y={centerY - sizeConfigItem.fontSize * 0.3}
              textAnchor="middle"
              className="font-bold"
              style={{
                fontSize: sizeConfigItem.fontSize,
                fill: colorConfig.color,
              }}
            >
              {animatedValue.toFixed(2)}
            </text>
            {/* Status label */}
            <text
              x={centerX}
              y={centerY + 4}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: sizeConfigItem.labelSize }}
            >
              {getStatusLabel(value)}
            </text>
          </>
        ) : (
          <>
            {/* Question mark for null value */}
            <text
              x={centerX}
              y={centerY - sizeConfigItem.fontSize * 0.2}
              textAnchor="middle"
              className="fill-muted-foreground font-bold"
              style={{ fontSize: sizeConfigItem.fontSize }}
            >
              ?
            </text>
            <text
              x={centerX}
              y={centerY + 6}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: sizeConfigItem.labelSize - 1 }}
            >
              Insufficient data
            </text>
          </>
        )}

        {/* Scale labels */}
        <text
          x={sizeConfigItem.strokeWidth / 2 + 4}
          y={centerY + sizeConfigItem.labelSize + 4}
          textAnchor="start"
          className="fill-muted-foreground"
          style={{ fontSize: sizeConfigItem.labelSize - 2 }}
        >
          0
        </text>
        <text
          x={sizeConfigItem.width - sizeConfigItem.strokeWidth / 2 - 4}
          y={centerY + sizeConfigItem.labelSize + 4}
          textAnchor="end"
          className="fill-muted-foreground"
          style={{ fontSize: sizeConfigItem.labelSize - 2 }}
        >
          1
        </text>
      </svg>

      {/* Bottom info */}
      {(competencyName || sampleSize != null || itemCount != null) && (
        <div className="text-center mt-2 space-y-0.5">
          {competencyName && (
            <p
              className="font-medium text-sm truncate max-w-[180px]"
              title={competencyName}
            >
              {competencyName}
            </p>
          )}
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
            {sampleSize != null && (
              <span>{sampleSize.toLocaleString()} responses</span>
            )}
            {itemCount != null && (
              <span>{itemCount} items</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Mini version for inline display
interface ReliabilityGaugeMiniProps {
  value: number | null | undefined;
  className?: string;
}

export function ReliabilityGaugeMini({ value, className }: ReliabilityGaugeMiniProps) {
  const colorConfig = getColorConfig(value);

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div
        className="w-8 h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: colorConfig.bgColor }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: value != null ? `${value * 100}%` : '0%',
            backgroundColor: colorConfig.color,
          }}
        />
      </div>
      <span className={cn('font-mono text-sm font-medium', colorConfig.textColor)}>
        {value != null ? value.toFixed(2) : '-'}
      </span>
    </div>
  );
}

// Status border color mapping
function getStatusBorderColor(value: number | null | undefined): string {
  if (value == null) return 'border-l-gray-400 dark:border-l-gray-500';
  if (value >= 0.8) return 'border-l-emerald-500 dark:border-l-emerald-400';
  if (value >= 0.7) return 'border-l-blue-500 dark:border-l-blue-400';
  if (value >= 0.6) return 'border-l-amber-500 dark:border-l-amber-400';
  return 'border-l-red-500 dark:border-l-red-400';
}

// Status dot color mapping
function getStatusDotColor(value: number | null | undefined): string {
  if (value == null) return 'bg-gray-400 dark:bg-gray-500';
  if (value >= 0.8) return 'bg-emerald-500 dark:bg-emerald-400';
  if (value >= 0.7) return 'bg-blue-500 dark:bg-blue-400';
  if (value >= 0.6) return 'bg-amber-500 dark:bg-amber-400';
  return 'bg-red-500 dark:bg-red-400';
}

// Compact mobile card version - value-first design for 2-column grid
interface ReliabilityGaugeCompactProps {
  value: number | null | undefined;
  competencyName?: string;
  sampleSize?: number | null;
  itemCount?: number | null;
  className?: string;
}

export function ReliabilityGaugeCompact({
  value,
  competencyName,
  sampleSize,
  itemCount,
  className,
}: ReliabilityGaugeCompactProps) {
  const colorConfig = getColorConfig(value);

  return (
    <div
      className={cn(
        'flex flex-col p-2 rounded-md border border-l-2 bg-card min-w-0 min-h-[56px] overflow-hidden',
        getStatusBorderColor(value),
        className
      )}
    >
      {/* Row 1: Name + Value */}
      <div className="flex items-start gap-1.5 mb-auto">
        <span
          className="text-xs font-medium leading-snug line-clamp-2 min-w-0 flex-1"
          title={competencyName}
        >
          {competencyName || 'Competency'}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <div className={cn('size-1.5 rounded-full', getStatusDotColor(value))} />
          <span className={cn('text-sm font-bold tabular-nums', colorConfig.textColor)}>
            {value != null ? value.toFixed(2) : '--'}
          </span>
        </div>
      </div>

      {/* Row 2: Status + Meta */}
      <div className="flex items-center justify-between gap-1 text-[10px] mt-1">
        <span className={cn('font-medium', colorConfig.textColor)}>
          {colorConfig.label}
        </span>
        <span className="text-muted-foreground tabular-nums shrink-0">
          {[
            itemCount != null && `${itemCount}q`,
            sampleSize != null && `${sampleSize}r`,
          ]
            .filter(Boolean)
            .join(' ')}
        </span>
      </div>
    </div>
  );
}
