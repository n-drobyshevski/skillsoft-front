'use client';

import { useCountAnimation, usePercentageAnimation, useCounterAnimation } from '@/hooks/useCountAnimation';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}

/**
 * Animated Counter Component
 *
 * Displays a number that animates from 0 to the target value.
 *
 * @example
 * ```tsx
 * <AnimatedCounter value={85} suffix="%" />
 * <AnimatedCounter value={1234} prefix="$" />
 * ```
 */
export function AnimatedCounter({
  value,
  duration = 800,
  delay = 0,
  suffix = '',
  prefix = '',
  decimals = 0,
  className,
}: AnimatedCounterProps) {
  const animatedValue = useCountAnimation(value, {
    duration,
    delay,
    decimals,
    easing: 'easeOut',
  });

  return (
    <span className={className}>
      {prefix}
      {animatedValue}
      {suffix}
    </span>
  );
}

/**
 * Animated Percentage Component
 *
 * Convenience component for displaying animated percentages.
 */
export function AnimatedPercentage({
  value,
  duration = 800,
  delay = 0,
  className,
}: Omit<AnimatedCounterProps, 'suffix' | 'prefix' | 'decimals'>) {
  const animatedValue = usePercentageAnimation(value, { duration, delay });

  return (
    <span className={className}>
      {animatedValue}%
    </span>
  );
}

/**
 * Animated Integer Component
 *
 * Convenience component for displaying animated integer counts.
 */
export function AnimatedInteger({
  value,
  duration = 600,
  delay = 0,
  className,
}: Omit<AnimatedCounterProps, 'suffix' | 'prefix' | 'decimals'>) {
  const animatedValue = useCounterAnimation(value, { duration, delay });

  return <span className={className}>{animatedValue}</span>;
}
