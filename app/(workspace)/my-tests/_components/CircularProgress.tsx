'use client';

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface CircularProgressProps {
  /** Progress value from 0 to 100 */
  value: number;
  /** Size of the circle in pixels */
  size?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Color class for the progress stroke */
  progressClassName?: string;
  /** Color class for the track stroke */
  trackClassName?: string;
  /** Whether to show the percentage text inside */
  showValue?: boolean;
  /** Custom content to show inside instead of percentage */
  children?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * Circular Progress Indicator
 * SVG-based ring progress with customizable colors and size
 */
export function CircularProgress({
  value,
  size = 48,
  strokeWidth = 4,
  progressClassName = 'text-amber-500',
  trackClassName = 'text-muted',
  showValue = true,
  children,
  className,
}: CircularProgressProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value));

  // Calculate circle dimensions
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (clampedValue / 100) * circumference;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        width={size}
        height={size}
        className="rotate-[-90deg]"
        aria-hidden="true"
      >
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={trackClassName}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn('transition-all duration-500 ease-out', progressClassName)}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children ?? (
          showValue && (
            <span className="text-xs font-semibold tabular-nums">{Math.round(clampedValue)}%</span>
          )
        )}
      </div>
    </div>
  );
}

/**
 * Score Gauge - specialized circular progress for test scores
 * Shows pass/fail coloring based on threshold
 */
interface ScoreGaugeProps {
  score: number;
  passed: boolean;
  size?: number;
  showLabel?: boolean;
  /** Additional class names */
  className?: string;
}

export function ScoreGauge({ score, passed, size = 52, showLabel = true, className }: ScoreGaugeProps) {
  const t = useTranslations('myTests');

  return (
    <div className={cn('flex items-center gap-2 sm:gap-3', className)}>
      <CircularProgress
        value={score}
        size={size}
        strokeWidth={4}
        progressClassName={passed ? 'text-emerald-500' : 'text-red-500'}
        trackClassName={passed ? 'text-emerald-100 dark:text-emerald-950' : 'text-red-100 dark:text-red-950'}
        showValue={false}
      >
        <span
          className={cn(
            'text-xs sm:text-sm font-bold tabular-nums',
            passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
          )}
        >
          {Math.round(score)}
        </span>
      </CircularProgress>

      {showLabel && (
        <div className="flex flex-col">
          <span
            className={cn(
              'text-xs sm:text-sm font-medium',
              passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
            )}
          >
            {passed ? t('scoreGauge.passed') : t('scoreGauge.failed')}
          </span>
          <span className="text-xs text-muted-foreground hidden sm:block">{t('scoreGauge.result')}</span>
        </div>
      )}
    </div>
  );
}
