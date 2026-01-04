'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Swipe navigation direction
 */
export type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null;

/**
 * Swipe navigation state
 */
export interface SwipeState {
  /** Whether a swipe is currently in progress */
  isSwiping: boolean;
  /** Current swipe direction */
  direction: SwipeDirection;
  /** Current swipe distance (pixels) */
  distance: number;
  /** Swipe progress (0-1) based on threshold */
  progress: number;
  /** Whether threshold has been met */
  thresholdMet: boolean;
}

/**
 * Swipe navigation options
 */
export interface SwipeNavigationOptions {
  /** Minimum distance to trigger navigation (default: 80) */
  threshold?: number;
  /** Minimum velocity to trigger navigation (default: 0.5 px/ms) */
  velocityThreshold?: number;
  /** Whether to enable horizontal swipes (default: true) */
  horizontal?: boolean;
  /** Whether to enable vertical swipes (default: false) */
  vertical?: boolean;
  /** Callback when swipe is confirmed in a direction */
  onSwipe?: (direction: SwipeDirection) => void;
  /** Callback when swipe starts */
  onSwipeStart?: () => void;
  /** Callback when swipe ends (even if not confirmed) */
  onSwipeEnd?: (direction: SwipeDirection, confirmed: boolean) => void;
  /** Callback during swipe with progress */
  onSwipeProgress?: (state: SwipeState) => void;
  /** Edge detection zone in pixels from screen edge (default: 0 = disabled) */
  edgeZone?: number;
  /** Enable haptic feedback on confirmed swipe */
  enableHaptics?: boolean;
  /** Disable swipe (useful for conditional enabling) */
  disabled?: boolean;
}

/**
 * Touch point tracking
 */
interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

/**
 * Trigger haptic feedback if available
 */
type HapticStyle = 'light' | 'medium' | 'heavy';
const HAPTIC_PATTERNS: Readonly<Record<HapticStyle, number>> = {
  light: 10,
  medium: 25,
  heavy: 50,
} as const;

function triggerHaptic(style: HapticStyle = 'medium') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    // Type-safe access: style is constrained to HapticStyle type
    const pattern = HAPTIC_PATTERNS[style];
    navigator.vibrate(pattern);
  }
}

/**
 * useSwipeNavigation - Lightweight hook for swipe-based navigation
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { ref, state } = useSwipeNavigation({
 *     onSwipe: (direction) => {
 *       if (direction === 'left') navigateNext();
 *       if (direction === 'right') navigatePrev();
 *     },
 *     threshold: 100,
 *   });
 *
 *   return (
 *     <div ref={ref} className="touch-pan-y">
 *       <MyContent />
 *       {state.isSwiping && (
 *         <SwipeIndicator progress={state.progress} />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useSwipeNavigation<T extends HTMLElement = HTMLDivElement>(
  options: SwipeNavigationOptions = {}
) {
  const {
    threshold = 80,
    velocityThreshold = 0.5,
    horizontal = true,
    vertical = false,
    onSwipe,
    onSwipeStart,
    onSwipeEnd,
    onSwipeProgress,
    edgeZone = 0,
    enableHaptics = true,
    disabled = false,
  } = options;

  const ref = useRef<T>(null);
  const startPoint = useRef<TouchPoint | null>(null);
  const lastPoint = useRef<TouchPoint | null>(null);
  const isEdgeSwipe = useRef(false);

  const [state, setState] = useState<SwipeState>({
    isSwiping: false,
    direction: null,
    distance: 0,
    progress: 0,
    thresholdMet: false,
  });

  /**
   * Calculate swipe direction from delta
   */
  const getDirection = useCallback(
    (deltaX: number, deltaY: number): SwipeDirection => {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (horizontal && absX > absY && absX > 10) {
        return deltaX > 0 ? 'right' : 'left';
      }
      if (vertical && absY > absX && absY > 10) {
        return deltaY > 0 ? 'down' : 'up';
      }
      return null;
    },
    [horizontal, vertical]
  );

  /**
   * Handle touch start
   */
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled) return;

      const touch = e.touches[0];
      const point: TouchPoint = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      // Check if starting from edge
      if (edgeZone > 0) {
        const isLeftEdge = touch.clientX < edgeZone;
        const isRightEdge = touch.clientX > window.innerWidth - edgeZone;
        isEdgeSwipe.current = isLeftEdge || isRightEdge;
      } else {
        isEdgeSwipe.current = true; // No edge detection, all swipes valid
      }

      startPoint.current = point;
      lastPoint.current = point;
    },
    [disabled, edgeZone]
  );

  /**
   * Handle touch move
   */
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || !startPoint.current) return;

      // Only proceed if edge swipe requirement is met
      if (edgeZone > 0 && !isEdgeSwipe.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - startPoint.current.x;
      const deltaY = touch.clientY - startPoint.current.y;
      const direction = getDirection(deltaX, deltaY);

      // Calculate distance based on direction
      const distance = horizontal
        ? Math.abs(deltaX)
        : vertical
          ? Math.abs(deltaY)
          : 0;

      const progress = Math.min(distance / threshold, 1);
      const thresholdMet = distance >= threshold;

      // Update state
      const newState: SwipeState = {
        isSwiping: direction !== null,
        direction,
        distance,
        progress,
        thresholdMet,
      };

      setState(newState);

      // Callbacks
      if (!state.isSwiping && direction) {
        onSwipeStart?.();
      }
      onSwipeProgress?.(newState);

      // Update last point for velocity calculation
      lastPoint.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    },
    [
      disabled,
      edgeZone,
      getDirection,
      horizontal,
      vertical,
      threshold,
      state.isSwiping,
      onSwipeStart,
      onSwipeProgress,
    ]
  );

  /**
   * Handle touch end
   */
  const handleTouchEnd = useCallback(
    (_e: TouchEvent) => {
      if (disabled || !startPoint.current || !lastPoint.current) {
        setState({
          isSwiping: false,
          direction: null,
          distance: 0,
          progress: 0,
          thresholdMet: false,
        });
        return;
      }

      const deltaX = lastPoint.current.x - startPoint.current.x;
      const deltaY = lastPoint.current.y - startPoint.current.y;
      const deltaTime = lastPoint.current.time - startPoint.current.time;
      const direction = getDirection(deltaX, deltaY);

      // Calculate velocity (px/ms)
      const velocity = horizontal
        ? Math.abs(deltaX) / Math.max(deltaTime, 1)
        : Math.abs(deltaY) / Math.max(deltaTime, 1);

      const distance = horizontal ? Math.abs(deltaX) : Math.abs(deltaY);
      const confirmed =
        (distance >= threshold || velocity >= velocityThreshold) &&
        direction !== null;

      // Trigger callbacks
      if (confirmed && direction) {
        if (enableHaptics) triggerHaptic('medium');
        onSwipe?.(direction);
      }
      onSwipeEnd?.(direction, confirmed);

      // Reset state
      startPoint.current = null;
      lastPoint.current = null;
      isEdgeSwipe.current = false;

      setState({
        isSwiping: false,
        direction: null,
        distance: 0,
        progress: 0,
        thresholdMet: false,
      });
    },
    [
      disabled,
      getDirection,
      horizontal,
      threshold,
      velocityThreshold,
      enableHaptics,
      onSwipe,
      onSwipeEnd,
    ]
  );

  /**
   * Attach touch event listeners
   */
  useEffect(() => {
    const element = ref.current;
    if (!element || disabled) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [disabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  /**
   * Manual reset function
   */
  const reset = useCallback(() => {
    startPoint.current = null;
    lastPoint.current = null;
    isEdgeSwipe.current = false;
    setState({
      isSwiping: false,
      direction: null,
      distance: 0,
      progress: 0,
      thresholdMet: false,
    });
  }, []);

  return {
    /** Ref to attach to swipeable element */
    ref,
    /** Current swipe state */
    state,
    /** Manual reset function */
    reset,
    /** Whether swipe is disabled */
    disabled,
  };
}

/**
 * useSwipeToNavigate - Simplified hook for prev/next navigation
 *
 * @example
 * ```tsx
 * function ItemDetail({ itemId, prevId, nextId }) {
 *   const router = useRouter();
 *   const { ref } = useSwipeToNavigate({
 *     prevId,
 *     nextId,
 *     basePath: '/psychometrics/items',
 *     onNavigate: (id) => router.push(`/psychometrics/items/${id}`),
 *   });
 *
 *   return <div ref={ref}>...</div>;
 * }
 * ```
 */
export interface SwipeToNavigateOptions {
  /** Previous item ID (null if first) */
  prevId: string | null;
  /** Next item ID (null if last) */
  nextId: string | null;
  /** Callback when navigation is triggered */
  onNavigate: (targetId: string, direction: 'prev' | 'next') => void;
  /** Swipe threshold (default: 100) */
  threshold?: number;
  /** Enable haptic feedback (default: true) */
  enableHaptics?: boolean;
  /** Disable swipe (default: false) */
  disabled?: boolean;
}

export function useSwipeToNavigate<T extends HTMLElement = HTMLDivElement>(
  options: SwipeToNavigateOptions
) {
  const {
    prevId,
    nextId,
    onNavigate,
    threshold = 100,
    enableHaptics = true,
    disabled = false,
  } = options;

  return useSwipeNavigation<T>({
    threshold,
    enableHaptics,
    disabled: disabled || (!prevId && !nextId),
    onSwipe: (direction) => {
      if (direction === 'right' && prevId) {
        onNavigate(prevId, 'prev');
      } else if (direction === 'left' && nextId) {
        onNavigate(nextId, 'next');
      }
    },
  });
}

export default useSwipeNavigation;
