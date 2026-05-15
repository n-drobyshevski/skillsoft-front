'use client';

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowDown, Loader2 } from 'lucide-react';

// TYPES

export interface PullToRefreshProps {
  /** Async callback invoked when pull-to-refresh is triggered */
  onRefresh: () => Promise<void>;
  /** Content to wrap */
  children: ReactNode;
  /** Disable the pull-to-refresh gesture */
  disabled?: boolean;
  /** Pull distance (px) required to trigger refresh. Default: 80 */
  threshold?: number;
}

type PullState = 'idle' | 'pulling' | 'threshold' | 'refreshing';

// CONSTANTS

const DEFAULT_THRESHOLD = 80;
const MAX_PULL = 120;
const RESISTANCE = 0.45;

// COMPONENT

/**
 * PullToRefresh wraps its children and provides a mobile pull-to-refresh gesture.
 *
 * - Only activates on touch devices (no-op on desktop).
 * - Shows a rotating arrow indicator while pulling and a spinner during refresh.
 * - Uses `aria-live="polite"` to announce refresh state to screen readers.
 */
export function PullToRefresh({
  onRefresh,
  children,
  disabled = false,
  threshold = DEFAULT_THRESHOLD,
}: PullToRefreshProps) {
  const [pullState, setPullState] = useState<PullState>('idle');
  const [pullDistance, setPullDistance] = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const isPullingRef = useRef(false);

  // Detect touch support on mount
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || pullState === 'refreshing') return;

      const container = containerRef.current;
      if (!container) return;

      // Only activate when scrolled to the very top
      if (container.scrollTop > 0) return;

      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    },
    [disabled, pullState],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPullingRef.current || disabled || pullState === 'refreshing') return;

      currentYRef.current = e.touches[0].clientY;
      const rawDistance = currentYRef.current - startYRef.current;

      // Only handle downward pulls
      if (rawDistance <= 0) {
        setPullDistance(0);
        setPullState('idle');
        return;
      }

      // Apply resistance so the pull feels natural
      const resistedDistance = Math.min(rawDistance * RESISTANCE, MAX_PULL);
      setPullDistance(resistedDistance);

      if (resistedDistance >= threshold) {
        setPullState('threshold');
      } else {
        setPullState('pulling');
      }
    },
    [disabled, pullState, threshold],
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPullingRef.current) return;
    isPullingRef.current = false;

    if (pullState === 'threshold') {
      setPullState('refreshing');
      setPullDistance(threshold * 0.6); // Settle indicator at partial height

      try {
        await onRefresh();
      } finally {
        setPullState('idle');
        setPullDistance(0);
      }
    } else {
      setPullState('idle');
      setPullDistance(0);
    }
  }, [pullState, threshold, onRefresh]);

  // On desktop, render children directly with no overhead
  if (!isTouchDevice) {
    return <>{children}</>;
  }

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 180; // 0 -> 180 degrees (arrow down -> arrow up)

  const ariaLabel =
    pullState === 'refreshing'
      ? 'Refreshing content'
      : pullState === 'threshold'
        ? 'Release to refresh'
        : pullState === 'pulling'
          ? 'Pull down to refresh'
          : undefined;

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {pullState !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: pullDistance,
            }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex items-center justify-center overflow-hidden"
            aria-live="polite"
            aria-label={ariaLabel}
          >
            {pullState === 'refreshing' ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <motion.div
                animate={{ rotate: rotation }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <ArrowDown
                  className={`h-6 w-6 transition-colors ${
                    pullState === 'threshold'
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wrapped content */}
      {children}
    </div>
  );
}
