'use client';

import { useState, useCallback, useRef, useEffect, useSyncExternalStore } from 'react';
import {
  useMotionValue,
  useTransform,
  useAnimation,
  PanInfo,
  type MotionValue,
} from 'framer-motion';

/**
 * useSwipeActions Hook
 *
 * Provides swipe gesture handling for mobile interfaces with:
 * - Left/right swipe to reveal action buttons
 * - Configurable thresholds and velocities
 * - Haptic feedback support
 * - Long press detection for selection mode
 *
 * @example
 * ```tsx
 * const { handlers, x, state, reset } = useSwipeActions({
 *   onSwipeLeft: () => console.log('Swiped left'),
 *   onSwipeRight: () => console.log('Swiped right'),
 *   onLongPress: () => console.log('Long pressed'),
 *   leftThreshold: 80,
 *   rightThreshold: 80,
 * });
 *
 * return (
 *   <motion.div
 *     style={{ x }}
 *     drag="x"
 *     dragConstraints={{ left: -100, right: 100 }}
 *     {...handlers}
 *   >
 *     Content
 *   </motion.div>
 * );
 * ```
 */

export type SwipeState = 'idle' | 'swiping' | 'left-open' | 'right-open' | 'long-pressing';

export interface SwipeActionConfig {
  /** Callback when swiped left past threshold */
  onSwipeLeft?: () => void;

  /** Callback when swiped right past threshold */
  onSwipeRight?: () => void;

  /** Callback when long pressed (for selection mode) */
  onLongPress?: () => void;

  /** Callback when swipe is released without completing */
  onSwipeCancel?: () => void;

  /** Minimum distance to trigger left swipe (default: 80) */
  leftThreshold?: number;

  /** Minimum distance to trigger right swipe (default: 80) */
  rightThreshold?: number;

  /** Minimum velocity to trigger swipe (default: 500) */
  velocityThreshold?: number;

  /** Long press duration in ms (default: 500) */
  longPressDuration?: number;

  /** Enable haptic feedback (default: true) */
  enableHaptics?: boolean;

  /** Width of left action area */
  leftActionWidth?: number;

  /** Width of right action area */
  rightActionWidth?: number;

  /** Whether swiping is disabled */
  disabled?: boolean;
}

export interface SwipeActionHandlers {
  onDragStart: () => void;
  onDrag: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  onDragEnd: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  onPointerDown: (event: React.PointerEvent) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
}

export interface UseSwipeActionsReturn {
  /** Motion value for x translation */
  x: MotionValue<number>;

  /** Current swipe state */
  state: SwipeState;

  /** Opacity values for action indicators */
  leftOpacity: MotionValue<number>;
  rightOpacity: MotionValue<number>;

  /** Scale values for action indicators */
  leftScale: MotionValue<number>;
  rightScale: MotionValue<number>;

  /** Background colors based on swipe direction */
  backgroundColor: MotionValue<string>;

  /** Event handlers for motion component */
  handlers: SwipeActionHandlers;

  /** Reset swipe to idle state */
  reset: () => void;

  /** Open left actions programmatically */
  openLeft: () => void;

  /** Open right actions programmatically */
  openRight: () => void;

  /** Animation controls */
  controls: ReturnType<typeof useAnimation>;

  /** Whether currently swiping */
  isSwiping: boolean;
}

/**
 * Trigger haptic feedback if available
 */
type HapticIntensity = 'light' | 'medium' | 'heavy';
const HAPTIC_DURATIONS: Readonly<Record<HapticIntensity, number>> = {
  light: 10,
  medium: 20,
  heavy: 40,
} as const;

function triggerHaptic(intensity: HapticIntensity = 'medium') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    // Type-safe access: intensity is constrained to HapticIntensity type
    const duration = HAPTIC_DURATIONS[intensity];
    navigator.vibrate(duration);
  }
}

export function useSwipeActions(config: SwipeActionConfig = {}): UseSwipeActionsReturn {
  const {
    onSwipeLeft,
    onSwipeRight,
    onLongPress,
    onSwipeCancel,
    leftThreshold = 80,
    rightThreshold = 80,
    velocityThreshold = 500,
    longPressDuration = 500,
    enableHaptics = true,
    leftActionWidth = 100,
    rightActionWidth = 100,
    disabled = false,
  } = config;

  const [state, setState] = useState<SwipeState>('idle');
  const [isSwiping, setIsSwiping] = useState(false);

  const x = useMotionValue(0);
  const controls = useAnimation();

  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startPositionRef = useRef({ x: 0, y: 0 });
  const hasTriggeredHapticRef = useRef(false);

  // Transform x position to opacity and scale for action indicators
  const leftOpacity = useTransform(x, [-leftActionWidth, -leftThreshold / 2, 0], [1, 0.5, 0]);
  const rightOpacity = useTransform(x, [0, rightThreshold / 2, rightActionWidth], [0, 0.5, 1]);

  const leftScale = useTransform(x, [-leftActionWidth, -leftThreshold, 0], [1, 0.8, 0.5]);
  const rightScale = useTransform(x, [0, rightThreshold, rightActionWidth], [0.5, 0.8, 1]);

  // Background color based on swipe direction
  const backgroundColor = useTransform(
    x,
    [-leftActionWidth, -leftThreshold / 2, 0, rightThreshold / 2, rightActionWidth],
    [
      'rgba(239, 68, 68, 0.2)',  // Red for destructive (left)
      'rgba(239, 68, 68, 0.1)',
      'transparent',
      'rgba(34, 197, 94, 0.1)',
      'rgba(34, 197, 94, 0.2)',  // Green for approve (right)
    ]
  );

  // Clear long press timeout
  const clearLongPress = useCallback(() => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  }, []);

  // Reset to idle state
  const reset = useCallback(() => {
    controls.start({ x: 0 });
    setState('idle');
    setIsSwiping(false);
    hasTriggeredHapticRef.current = false;
  }, [controls]);

  // Open left actions
  const openLeft = useCallback(() => {
    if (disabled) return;
    controls.start({ x: -leftActionWidth });
    setState('left-open');
  }, [controls, leftActionWidth, disabled]);

  // Open right actions
  const openRight = useCallback(() => {
    if (disabled) return;
    controls.start({ x: rightActionWidth });
    setState('right-open');
  }, [controls, rightActionWidth, disabled]);

  // Handle drag start
  const onDragStart = useCallback(() => {
    if (disabled) return;
    clearLongPress();
    setIsSwiping(true);
    setState('swiping');
    hasTriggeredHapticRef.current = false;
  }, [disabled, clearLongPress]);

  // Handle drag
  const onDrag = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (disabled) return;

      const currentX = info.offset.x;

      // Trigger haptic when crossing thresholds
      if (enableHaptics && !hasTriggeredHapticRef.current) {
        if (currentX < -leftThreshold || currentX > rightThreshold) {
          triggerHaptic('light');
          hasTriggeredHapticRef.current = true;
        }
      }

      // Reset haptic trigger when returning to neutral
      if (Math.abs(currentX) < Math.min(leftThreshold, rightThreshold) / 2) {
        hasTriggeredHapticRef.current = false;
      }
    },
    [disabled, enableHaptics, leftThreshold, rightThreshold]
  );

  // Handle drag end
  const onDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (disabled) return;

      setIsSwiping(false);
      const { offset, velocity } = info;

      // Determine if swipe completed based on distance and velocity
      const isLeftSwipe =
        offset.x < -leftThreshold || (offset.x < 0 && velocity.x < -velocityThreshold);
      const isRightSwipe =
        offset.x > rightThreshold || (offset.x > 0 && velocity.x > velocityThreshold);

      if (isLeftSwipe && onSwipeLeft) {
        if (enableHaptics) triggerHaptic('medium');
        controls.start({ x: -leftActionWidth });
        setState('left-open');
        onSwipeLeft();
      } else if (isRightSwipe && onSwipeRight) {
        if (enableHaptics) triggerHaptic('medium');
        controls.start({ x: rightActionWidth });
        setState('right-open');
        onSwipeRight();
      } else {
        // Snap back to center
        controls.start({ x: 0 });
        setState('idle');
        onSwipeCancel?.();
      }
    },
    [
      disabled,
      leftThreshold,
      rightThreshold,
      velocityThreshold,
      leftActionWidth,
      rightActionWidth,
      onSwipeLeft,
      onSwipeRight,
      onSwipeCancel,
      controls,
      enableHaptics,
    ]
  );

  // Handle pointer down (for long press)
  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (disabled) return;

      startPositionRef.current = { x: event.clientX, y: event.clientY };

      // Start long press timer
      if (onLongPress) {
        longPressTimeoutRef.current = setTimeout(() => {
          if (enableHaptics) triggerHaptic('heavy');
          setState('long-pressing');
          onLongPress();
        }, longPressDuration);
      }
    },
    [disabled, onLongPress, longPressDuration, enableHaptics]
  );

  // Handle pointer up
  const onPointerUp = useCallback(() => {
    clearLongPress();
    if (state === 'long-pressing') {
      setState('idle');
    }
  }, [clearLongPress, state]);

  // Handle pointer cancel
  const onPointerCancel = useCallback(() => {
    clearLongPress();
    if (state === 'long-pressing') {
      setState('idle');
    }
  }, [clearLongPress, state]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLongPress();
    };
  }, [clearLongPress]);

  return {
    x,
    state,
    leftOpacity,
    rightOpacity,
    leftScale,
    rightScale,
    backgroundColor,
    handlers: {
      onDragStart,
      onDrag,
      onDragEnd,
      onPointerDown,
      onPointerUp,
      onPointerCancel,
    },
    reset,
    openLeft,
    openRight,
    controls,
    isSwiping,
  };
}

/**
 * Hook to detect if touch device using useSyncExternalStore
 */
export function useIsTouchDevice() {
  const subscribe = useCallback((callback: () => void) => {
    // Touch capability doesn't change at runtime, but we still set up subscription
    // for React's strict mode compatibility
    return () => {};
  }, []);

  const getSnapshot = useCallback(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Hook to detect preferred reduced motion using useSyncExternalStore
 */
export function usePrefersReducedMotion() {
  const subscribe = useCallback((callback: () => void) => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    mql.addEventListener('change', callback);
    return () => mql.removeEventListener('change', callback);
  }, []);

  const getSnapshot = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default useSwipeActions;
