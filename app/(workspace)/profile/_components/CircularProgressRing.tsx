'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface CircularProgressRingProps {
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
  /** Animation delay in ms */
  animationDelay?: number;
  /** Whether to show glow effect on mount */
  showGlow?: boolean;
  /** Glow color (CSS color value) */
  glowColor?: string;
  /** Custom content to show inside */
  children?: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** ARIA value text for screen readers */
  'aria-valuetext'?: string;
}

/**
 * Animated Circular Progress Ring
 *
 * SVG-based ring progress with smooth entrance animation.
 * Features:
 * - Animated ring fill on mount
 * - Optional glow effect
 * - Respects prefers-reduced-motion
 * - Full ARIA support
 *
 * Based on CircularScore pattern from test-results HeroCard
 */
export function CircularProgressRing({
  value,
  size = 48,
  strokeWidth = 4,
  progressClassName = 'text-primary',
  trackClassName = 'text-muted/30',
  animationDelay = 0,
  showGlow = true,
  glowColor = 'hsl(var(--primary) / 0.4)',
  children,
  className,
  'aria-label': ariaLabel,
  'aria-valuetext': ariaValueText,
}: CircularProgressRingProps) {
  // Use ref to track if initial animation has run
  const hasAnimated = useRef(false);

  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value));

  // Initialize with 0 for animation, or clampedValue if reduced motion
  const getInitialValue = () => {
    if (typeof window === 'undefined') return 0;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? clampedValue : 0;
  };

  const [animatedValue, setAnimatedValue] = useState(getInitialValue);
  const [showGlowEffect, setShowGlowEffect] = useState(false);

  // Calculate circle dimensions
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedValue / 100) * circumference;

  // Animate on mount (only once)
  useEffect(() => {
    if (hasAnimated.current) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      hasAnimated.current = true;
      return;
    }

    const animationTimeout = setTimeout(() => {
      hasAnimated.current = true;
      setAnimatedValue(clampedValue);
      if (showGlow) {
        setShowGlowEffect(true);
        // Remove glow after animation
        setTimeout(() => setShowGlowEffect(false), 1000);
      }
    }, animationDelay);

    return () => clearTimeout(animationTimeout);
  }, [clampedValue, animationDelay, showGlow]);

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      aria-valuetext={ariaValueText}
    >
      <svg
        width={size}
        height={size}
        className="rotate-[-90deg]"
        aria-hidden="true"
        style={{
          filter: showGlowEffect ? `drop-shadow(0 0 8px ${glowColor})` : undefined,
          transition: 'filter 0.5s ease-out',
        }}
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
          className={cn(
            'transition-[stroke-dashoffset] duration-1000 ease-out',
            'motion-reduce:transition-none',
            progressClassName
          )}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export default CircularProgressRing;
