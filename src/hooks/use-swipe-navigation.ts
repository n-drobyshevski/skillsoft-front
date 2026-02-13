import { useRef, useEffect, useState } from 'react';

interface SwipeConfig {
  /** Minimum horizontal distance (px) to trigger swipe. Default: 50 */
  minSwipeDistance?: number;
  /** Maximum vertical distance (px) allowed during swipe. Default: 100 */
  maxVerticalDistance?: number;
  /** Minimum velocity (px/ms) required for swipe. Default: 0.3 */
  minVelocity?: number;
  /** Whether swipe navigation is enabled. Default: true */
  enabled?: boolean;
  /** Callback when swiping left (next). */
  onSwipeLeft?: () => void;
  /** Callback when swiping right (previous). */
  onSwipeRight?: () => void;
  /** Whether to prevent default touch behavior. Default: false */
  preventDefault?: boolean;
}

interface SwipeState {
  /** Whether a swipe is currently in progress */
  isSwiping: boolean;
  /** Current swipe direction indicator (-1 = left, 0 = none, 1 = right) */
  direction: -1 | 0 | 1;
  /** Current horizontal offset during swipe (for visual feedback) */
  offsetX: number;
}

interface TouchPosition {
  x: number;
  y: number;
  time: number;
}

/**
 * useSwipeNavigation - Touch swipe gesture hook for navigation
 *
 * Features:
 * - Horizontal swipe detection with configurable thresholds
 * - Velocity-based swipe recognition for quick flicks
 * - Vertical scroll protection (won't trigger during vertical scroll)
 * - Visual feedback state for UI indicators
 * - SSR-safe (no window access on server)
 *
 * Usage:
 * ```tsx
 * const { swipeState, handlers } = useSwipeNavigation({
 *   onSwipeLeft: () => goToNext(),
 *   onSwipeRight: () => goToPrevious(),
 *   enabled: canNavigate,
 * });
 *
 * return (
 *   <div {...handlers} className="swipe-container">
 *     {swipeState.isSwiping && <SwipeIndicator direction={swipeState.direction} />}
 *     {content}
 *   </div>
 * );
 * ```
 */
export function useSwipeNavigation(config: SwipeConfig = {}) {
  const {
    minSwipeDistance = 50,
    maxVerticalDistance = 100,
    minVelocity = 0.3,
    enabled = true,
    onSwipeLeft,
    onSwipeRight,
    preventDefault = false,
  } = config;

  const touchStartRef = useRef<TouchPosition | null>(null);
  const touchEndRef = useRef<TouchPosition | null>(null);
  const isSwipingRef = useRef(false);

  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwiping: false,
    direction: 0,
    offsetX: 0,
  });

  /**
   * Calculate swipe metrics
   */
  const calculateSwipe = () => {
    if (!touchStartRef.current || !touchEndRef.current) {
      return null;
    }

    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = touchEndRef.current.y - touchStartRef.current.y;
    const deltaTime = touchEndRef.current.time - touchStartRef.current.time;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const velocity = deltaTime > 0 ? absX / deltaTime : 0;

    return {
      deltaX,
      deltaY,
      absX,
      absY,
      velocity,
      isHorizontal: absX > absY,
      isValidSwipe: absX >= minSwipeDistance && absY <= maxVerticalDistance,
      isQuickFlick: velocity >= minVelocity && absX >= minSwipeDistance / 2,
    };
  };

  /**
   * Handle touch start
   */
  const handleTouchStart = (e: React.TouchEvent | TouchEvent) => {
    if (!enabled) return;

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    touchEndRef.current = null;
    isSwipingRef.current = false;

    setSwipeState({
      isSwiping: false,
      direction: 0,
      offsetX: 0,
    });
  };

  /**
   * Handle touch move
   */
  const handleTouchMove = (e: React.TouchEvent | TouchEvent) => {
    if (!enabled || !touchStartRef.current) return;

    const touch = e.touches[0];
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Only track as swipe if more horizontal than vertical
    if (absX > absY && absX > 10) {
      isSwipingRef.current = true;

      // Prevent default scrolling during horizontal swipe
      if (preventDefault && absX > minSwipeDistance / 2) {
        e.preventDefault();
      }

      // Calculate direction indicator (-1 for left, 1 for right)
      const direction: -1 | 0 | 1 = deltaX > 0 ? 1 : deltaX < 0 ? -1 : 0;

      setSwipeState({
        isSwiping: true,
        direction,
        offsetX: deltaX,
      });
    } else if (absY > absX) {
      // Vertical scroll detected, cancel swipe tracking
      isSwipingRef.current = false;
      setSwipeState({
        isSwiping: false,
        direction: 0,
        offsetX: 0,
      });
    }
  };

  /**
   * Handle touch end
   */
  const handleTouchEnd = (e: React.TouchEvent | TouchEvent) => {
    if (!enabled || !touchStartRef.current) return;

    // Use last known touch position if touchEnd wasn't captured
    if (!touchEndRef.current && e.changedTouches?.[0]) {
      const touch = e.changedTouches[0];
      touchEndRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    }

    const swipe = calculateSwipe();

    if (swipe && isSwipingRef.current) {
      const isValidSwipe = swipe.isValidSwipe || swipe.isQuickFlick;

      if (isValidSwipe && swipe.isHorizontal) {
        if (swipe.deltaX < 0 && onSwipeLeft) {
          // Swiped left -> go to next
          onSwipeLeft();
        } else if (swipe.deltaX > 0 && onSwipeRight) {
          // Swiped right -> go to previous
          onSwipeRight();
        }
      }
    }

    // Reset state
    touchStartRef.current = null;
    touchEndRef.current = null;
    isSwipingRef.current = false;

    setSwipeState({
      isSwiping: false,
      direction: 0,
      offsetX: 0,
    });
  };

  /**
   * Handle touch cancel (e.g., interrupted by system gesture)
   */
  const handleTouchCancel = () => {
    touchStartRef.current = null;
    touchEndRef.current = null;
    isSwipingRef.current = false;

    setSwipeState({
      isSwiping: false,
      direction: 0,
      offsetX: 0,
    });
  };

  /**
   * Event handlers object for spreading onto elements
   */
  const handlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
  };

  /**
   * Ref callback for attaching to native elements
   */
  const attachToRef = (element: HTMLElement | null) => {
    if (!element || !enabled) return;

    const touchStartHandler = (e: TouchEvent) => handleTouchStart(e);
    const touchMoveHandler = (e: TouchEvent) => handleTouchMove(e);
    const touchEndHandler = (e: TouchEvent) => handleTouchEnd(e);
    const touchCancelHandler = () => handleTouchCancel();

    element.addEventListener('touchstart', touchStartHandler, { passive: true });
    element.addEventListener('touchmove', touchMoveHandler, { passive: !preventDefault });
    element.addEventListener('touchend', touchEndHandler, { passive: true });
    element.addEventListener('touchcancel', touchCancelHandler, { passive: true });

    return () => {
      element.removeEventListener('touchstart', touchStartHandler);
      element.removeEventListener('touchmove', touchMoveHandler);
      element.removeEventListener('touchend', touchEndHandler);
      element.removeEventListener('touchcancel', touchCancelHandler);
    };
  };

  return {
    /** Current swipe state for visual feedback */
    swipeState,
    /** React event handlers for JSX elements */
    handlers,
    /** Ref callback for native element attachment */
    attachToRef,
    /** Whether swipe is currently in progress */
    isSwiping: swipeState.isSwiping,
  };
}

/**
 * useReducedMotion - Check if user prefers reduced motion
 *
 * Returns true if the user has enabled reduced motion in their OS settings.
 * Useful for conditionally disabling animations.
 */
export function useReducedMotion(): boolean {
  // Initialize with SSR-safe default, then sync with media query on mount
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // Check if we're in a browser environment during initial render
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

export type { SwipeConfig, SwipeState };
