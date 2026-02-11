'use client';

import { useState, useEffect, useRef } from 'react';

interface UseCountAnimationOptions {
  duration?: number;
  delay?: number;
  easing?: 'linear' | 'easeOut' | 'easeInOut';
  decimals?: number;
}

type EasingType = 'linear' | 'easeOut' | 'easeInOut';
type EasingFunction = (t: number) => number;

/**
 * Get easing function by type (safe accessor to avoid lint warning)
 */
function getEasingFunction(easing: EasingType): EasingFunction {
  switch (easing) {
    case 'linear':
      return (t: number) => t;
    case 'easeOut':
      return (t: number) => 1 - Math.pow(1 - t, 3);
    case 'easeInOut':
      return (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    default:
      return (t: number) => t;
  }
}

/**
 * Hook for animating numeric values with easing
 *
 * @param targetValue - The final value to animate to
 * @param options - Animation configuration
 * @returns The current animated value
 *
 * @example
 * ```tsx
 * const animatedScore = useCountAnimation(85, { duration: 1000, decimals: 0 });
 * return <span>{animatedScore}%</span>;
 * ```
 */
export function useCountAnimation(
  targetValue: number,
  options: UseCountAnimationOptions = {}
): number {
  const {
    duration = 1000,
    delay = 0,
    easing = 'easeOut',
    decimals = 0,
  } = options;

  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // Reset when target changes
    hasStartedRef.current = false;
    startTimeRef.current = null;

    const startAnimation = () => {
      hasStartedRef.current = true;

      const animate = (currentTime: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = currentTime;
        }

        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        const easingFn = getEasingFunction(easing);
        const easedProgress = easingFn(progress);

        const currentValue = easedProgress * targetValue;
        const roundedValue = Number(currentValue.toFixed(decimals));

        setDisplayValue(roundedValue);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    };

    const timeoutId = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timeoutId);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [targetValue, duration, delay, easing, decimals]);

  return displayValue;
}

/**
 * Hook for animating percentage values (0-100)
 * Convenience wrapper with sensible defaults for percentages
 */
export function usePercentageAnimation(
  targetValue: number,
  options: Omit<UseCountAnimationOptions, 'decimals'> = {}
): number {
  return useCountAnimation(targetValue, {
    duration: 800,
    easing: 'easeOut',
    decimals: 0,
    ...options,
  });
}

/**
 * Hook for animating integer counts
 * Convenience wrapper with sensible defaults for counts
 */
export function useCounterAnimation(
  targetValue: number,
  options: Omit<UseCountAnimationOptions, 'decimals'> = {}
): number {
  return useCountAnimation(targetValue, {
    duration: 600,
    easing: 'easeOut',
    decimals: 0,
    ...options,
  });
}
