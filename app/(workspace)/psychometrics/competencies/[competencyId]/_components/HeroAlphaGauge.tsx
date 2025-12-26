'use client';

/**
 * HeroAlphaGauge - Radial progress visualization for Cronbach's Alpha
 *
 * Features:
 * - CSS-based transitions (lighter than Framer Motion)
 * - Responsive sizing (smaller on mobile)
 * - Full ARIA accessibility
 * - Memoized calculations for performance
 * - Respects prefers-reduced-motion
 *
 * This replaces the inline RadialAlphaProgress component with a more
 * optimized and accessible version.
 */

import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { getAlphaQuality } from '../_lib/competency-detail.utils';

interface HeroAlphaGaugeProps {
  alpha: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

// Size configurations
const SIZE_CONFIG = {
  sm: { dimension: 120, stroke: 8, fontSize: 'text-xl' },
  md: { dimension: 160, stroke: 10, fontSize: 'text-2xl' },
  lg: { dimension: 180, stroke: 12, fontSize: 'text-3xl' },
} as const;

/**
 * Get stroke color class based on alpha value
 */
function getStrokeColorClass(alpha: number | null): string {
  if (alpha === null) return 'stroke-muted';
  if (alpha >= 0.7) return 'stroke-emerald-500';
  if (alpha >= 0.6) return 'stroke-amber-500';
  return 'stroke-red-500';
}

export const HeroAlphaGauge = memo(function HeroAlphaGauge({
  alpha,
  size = 'md',
  className,
  showLabel = true,
}: HeroAlphaGaugeProps) {
  const config = SIZE_CONFIG[size];
  const dimension = config.dimension;
  const strokeWidth = config.stroke;
  const radius = (dimension - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  // Memoize calculations
  const { strokeDashoffset, percentage, strokeClass } = useMemo(() => {
    const pct = alpha !== null ? Math.min(Math.max(alpha, 0), 1) * 100 : 0;
    const offset = circumference - (pct / 100) * circumference;
    const color = getStrokeColorClass(alpha);
    return { strokeDashoffset: offset, percentage: pct, strokeClass: color };
  }, [alpha, circumference]);

  const quality = getAlphaQuality(alpha);

  // Create descriptive label for screen readers
  const ariaLabel = alpha !== null
    ? `Cronbach's Alpha: ${alpha.toFixed(3)}. Качество: ${quality.label}. ${quality.description}`
    : 'Cronbach\'s Alpha: данные отсутствуют';

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: dimension, height: dimension }}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        width={dimension}
        height={dimension}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted/30"
        />

        {/* Progress circle with CSS transition */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn(
            strokeClass,
            'transition-[stroke-dashoffset] duration-1000 ease-out',
            'motion-reduce:transition-none'
          )}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: alpha !== null ? strokeDashoffset : circumference,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute flex flex-col items-center text-center">
        <span
          className={cn(
            'font-bold tabular-nums',
            config.fontSize,
            quality.textClass
          )}
        >
          {alpha !== null ? alpha.toFixed(3) : '-'}
        </span>
        {showLabel && (
          <span className="text-sm text-muted-foreground">Alpha</span>
        )}
      </div>
    </div>
  );
});

/**
 * Compact inline alpha display for mobile headers
 */
interface InlineAlphaDisplayProps {
  alpha: number | null;
  className?: string;
}

export function InlineAlphaDisplay({ alpha, className }: InlineAlphaDisplayProps) {
  const quality = getAlphaQuality(alpha);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('text-2xl font-bold tabular-nums', quality.textClass)}>
        {alpha !== null ? alpha.toFixed(3) : '-'}
      </span>
      <div className="flex flex-col text-xs text-muted-foreground">
        <span>Alpha</span>
        <span className={quality.textClass}>{quality.label}</span>
      </div>
    </div>
  );
}

/**
 * Mini gauge for card headers or list items
 */
interface MiniAlphaGaugeProps {
  alpha: number | null;
  className?: string;
}

export function MiniAlphaGauge({ alpha, className }: MiniAlphaGaugeProps) {
  const percentage = alpha !== null ? alpha * 100 : 0;
  const quality = getAlphaQuality(alpha);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md',
        quality.bgClass,
        className
      )}
    >
      {/* Mini progress bar */}
      <div className="w-8 h-1.5 rounded-full bg-muted/50 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            alpha !== null && alpha >= 0.7
              ? 'bg-emerald-500'
              : alpha !== null && alpha >= 0.6
                ? 'bg-amber-500'
                : 'bg-red-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={cn('text-sm font-medium tabular-nums', quality.textClass)}>
        {alpha !== null ? alpha.toFixed(2) : '-'}
      </span>
    </div>
  );
}

export default HeroAlphaGauge;
