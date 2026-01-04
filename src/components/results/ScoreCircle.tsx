'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import type {
  ScoreCircleProps,
  ScoreCircleVariant,
  ScoreCircleSize,
  ScoreCircleSizeConfig,
} from '@/types/results';

// ============================================================================
// Size Configuration (Mobile-First)
// ============================================================================

const SIZE_CONFIG: Record<ScoreCircleSize, ScoreCircleSizeConfig> = {
  xs: {
    containerSize: 48,
    fontSize: 'text-sm',
    labelFontSize: 'text-[8px]',
    strokeWidth: 4,
    radius: 18,
  },
  sm: {
    containerSize: 64,
    fontSize: 'text-base',
    labelFontSize: 'text-[9px]',
    strokeWidth: 5,
    radius: 24,
  },
  md: {
    containerSize: 96,
    fontSize: 'text-xl',
    labelFontSize: 'text-[10px]',
    strokeWidth: 6,
    radius: 38,
  },
  lg: {
    containerSize: 128,
    fontSize: 'text-3xl',
    labelFontSize: 'text-xs',
    strokeWidth: 8,
    radius: 52,
  },
  xl: {
    containerSize: 160,
    fontSize: 'text-4xl',
    labelFontSize: 'text-sm',
    strokeWidth: 10,
    radius: 66,
  },
};

// ============================================================================
// Variant Colors
// ============================================================================

const VARIANT_COLORS: Record<ScoreCircleVariant, { stroke: string; text: string; bg: string }> = {
  default: {
    stroke: 'stroke-primary',
    text: 'text-primary',
    bg: 'bg-primary/10',
  },
  success: {
    stroke: 'stroke-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  warning: {
    stroke: 'stroke-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
  },
  error: {
    stroke: 'stroke-red-500',
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-500/10',
  },
  neutral: {
    stroke: 'stroke-muted-foreground/50',
    text: 'text-muted-foreground',
    bg: 'bg-muted/30',
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get variant based on score value
 */
export function getVariantFromScore(
  score: number,
  threshold: number = 70
): ScoreCircleVariant {
  if (score >= threshold) return 'success';
  if (score >= threshold - 20) return 'warning';
  return 'error';
}

/**
 * Format score for display
 */
function formatScore(value: number, showPercent: boolean): string {
  const rounded = Math.round(value);
  return showPercent ? `${rounded}%` : `${rounded}`;
}

// ============================================================================
// Component
// ============================================================================

export function ScoreCircle({
  value,
  maxValue = 100,
  size = 'md',
  variant = 'default',
  label,
  sublabel,
  animate = true,
  animationDuration = 1000,
  strokeWidth: customStrokeWidth,
  showPercent = true,
  className,
  onAnimationComplete,
}: ScoreCircleProps) {
  const [hasAnimated, setHasAnimated] = useState(!animate);
  const config = SIZE_CONFIG[size];
  const colors = VARIANT_COLORS[variant];

  // Use custom stroke width if provided
  const strokeWidth = customStrokeWidth ?? config.strokeWidth;

  // Calculate circle dimensions
  const viewBoxSize = config.containerSize;
  const center = viewBoxSize / 2;
  const radius = config.radius;
  const circumference = 2 * Math.PI * radius;

  // Normalize value to 0-100 scale
  const normalizedValue = Math.min(Math.max((value / maxValue) * 100, 0), 100);

  // Spring animation for smooth progress
  const springProgress = useSpring(0, {
    stiffness: 60,
    damping: 20,
    duration: animationDuration,
  });

  // Transform spring to stroke dash offset
  const strokeDashoffset = useTransform(
    springProgress,
    [0, 100],
    [circumference, circumference * (1 - normalizedValue / 100)]
  );

  // Animated display value
  const displayValue = useTransform(springProgress, [0, 100], [0, normalizedValue]);
  const [currentDisplayValue, setCurrentDisplayValue] = useState(0);

  // Subscribe to display value changes
  useEffect(() => {
    return displayValue.on('change', (latest) => {
      setCurrentDisplayValue(latest);
    });
  }, [displayValue]);

  // Trigger animation on mount or value change
  useEffect(() => {
    if (animate && !hasAnimated) {
      springProgress.set(100);
      const timeout = setTimeout(() => {
        setHasAnimated(true);
        onAnimationComplete?.();
      }, animationDuration);
      return () => clearTimeout(timeout);
    } else if (!animate) {
      springProgress.jump(100);
      setCurrentDisplayValue(normalizedValue);
    }
  }, [animate, hasAnimated, springProgress, animationDuration, normalizedValue, onAnimationComplete]);

  // Handle value changes after initial animation
  useEffect(() => {
    if (hasAnimated) {
      springProgress.set(100);
    }
  }, [value, hasAnimated, springProgress]);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-1',
        className
      )}
    >
      {/* SVG Circle */}
      <div
        className="relative"
        style={{
          width: config.containerSize,
          height: config.containerSize,
        }}
      >
        <svg
          className="transform -rotate-90"
          width={config.containerSize}
          height={config.containerSize}
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-muted/40"
          />
          {/* Progress circle */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
            className={cn(colors.stroke, 'transition-colors')}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              'font-bold tabular-nums leading-none',
              config.fontSize,
              colors.text
            )}
          >
            {formatScore(currentDisplayValue, showPercent)}
          </span>
        </div>
      </div>

      {/* Labels */}
      {(label || sublabel) && (
        <div className="text-center space-y-0.5 max-w-full px-1">
          {label && (
            <p
              className={cn(
                'font-medium text-foreground truncate',
                config.labelFontSize
              )}
            >
              {label}
            </p>
          )}
          {sublabel && (
            <p
              className={cn(
                'text-muted-foreground truncate',
                size === 'xs' || size === 'sm' ? 'text-[8px]' : 'text-[10px]'
              )}
            >
              {sublabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Mini Score Circle (Inline variant)
// ============================================================================

interface MiniScoreCircleProps {
  value: number;
  variant?: ScoreCircleVariant;
  className?: string;
}

export function MiniScoreCircle({
  value,
  variant = 'default',
  className,
}: MiniScoreCircleProps) {
  const colors = VARIANT_COLORS[variant];
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const circumference = 2 * Math.PI * 12; // Fixed small radius
  const offset = circumference * (1 - normalizedValue / 100);

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <svg
        className="transform -rotate-90"
        width={28}
        height={28}
        viewBox="0 0 32 32"
      >
        <circle
          cx={16}
          cy={16}
          r={12}
          fill="none"
          strokeWidth={3}
          className="stroke-muted/30"
        />
        <circle
          cx={16}
          cy={16}
          r={12}
          fill="none"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(colors.stroke, 'transition-all duration-300')}
        />
      </svg>
      <span className={cn('text-xs font-bold tabular-nums', colors.text)}>
        {Math.round(value)}%
      </span>
    </div>
  );
}

// ============================================================================
// Score Ring (No center text, just ring)
// ============================================================================

interface ScoreRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  variant?: ScoreCircleVariant;
  className?: string;
}

export function ScoreRing({
  value,
  size = 24,
  strokeWidth = 3,
  variant = 'default',
  className,
}: ScoreRingProps) {
  const colors = VARIANT_COLORS[variant];
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(value, 0), 100) / 100);

  return (
    <svg
      className={cn('transform -rotate-90', className)}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className="stroke-muted/30"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={cn(colors.stroke, 'transition-all duration-500')}
      />
    </svg>
  );
}

export default ScoreCircle;
