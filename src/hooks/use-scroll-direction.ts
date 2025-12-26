import { useEffect, useCallback, useRef } from 'react';
import {
  useNavigationStore,
  useNavVisibility,
  useScrollDirection as useScrollDirectionState,
} from '@/store/navigation-store';

/**
 * Scroll threshold before triggering navigation hide (in pixels)
 * Navigation hides after scrolling down 50px from the point where
 * scrolling started.
 */
const SCROLL_THRESHOLD = 50;

/**
 * Scroll position considered "at top" of page (in pixels)
 * Navigation is always visible when scroll position is less than this value.
 */
const AT_TOP_THRESHOLD = 100;

/**
 * Throttle interval for scroll event processing (in milliseconds)
 * Limits how often scroll updates are processed for performance.
 */
const THROTTLE_MS = 16; // ~60fps

/**
 * Return type for useScrollDirection hook
 */
interface UseScrollDirectionReturn {
  /** Current scroll direction ('up' | 'down' | null) */
  scrollDirection: 'up' | 'down' | null;
  /** Whether the user is at the top of the page (<100px) */
  isAtTop: boolean;
  /** Whether navigation should be visible based on scroll behavior */
  shouldShowNav: boolean;
  /** Current scroll Y position */
  scrollY: number;
}

/**
 * useScrollDirection - Hook for scroll-based navigation visibility
 *
 * Implements scroll direction detection with the following behavior:
 * - Tracks scroll direction (up/down)
 * - 50px threshold before triggering hide on scroll down
 * - Shows immediately on scroll up
 * - Always visible at page top (<100px)
 *
 * Uses a throttled scroll listener for optimal performance and
 * integrates with the navigation Zustand store for global state.
 *
 * @example
 * ```tsx
 * function MobileNav() {
 *   const { scrollDirection, isAtTop, shouldShowNav } = useScrollDirection();
 *
 *   return (
 *     <nav className={cn(
 *       'fixed bottom-0 transition-transform duration-300',
 *       shouldShowNav ? 'translate-y-0' : 'translate-y-full'
 *     )}>
 *       Navigation content
 *     </nav>
 *   );
 * }
 * ```
 *
 * @returns {UseScrollDirectionReturn} Object containing scroll state and visibility
 */
export function useScrollDirection(): UseScrollDirectionReturn {
  const updateScroll = useNavigationStore((state) => state.updateScroll);
  const scrollDirection = useScrollDirectionState();
  const shouldShowNav = useNavVisibility();
  const lastScrollY = useNavigationStore((state) => state.lastScrollY);

  // Refs for throttling
  const lastUpdateTime = useRef(0);
  const rafId = useRef<number | null>(null);

  // Throttled scroll handler
  const handleScroll = useCallback(() => {
    const now = performance.now();

    // Throttle updates
    if (now - lastUpdateTime.current < THROTTLE_MS) {
      // Schedule update for next frame if not already scheduled
      if (!rafId.current) {
        rafId.current = requestAnimationFrame(() => {
          rafId.current = null;
          handleScroll();
        });
      }
      return;
    }

    lastUpdateTime.current = now;
    const currentScrollY = window.scrollY;
    updateScroll(currentScrollY);
  }, [updateScroll]);

  useEffect(() => {
    // Initial scroll position
    updateScroll(window.scrollY);

    // Add scroll listener with passive option for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [handleScroll, updateScroll]);

  const isAtTop = lastScrollY < AT_TOP_THRESHOLD;

  return {
    scrollDirection,
    isAtTop,
    shouldShowNav,
    scrollY: lastScrollY,
  };
}

/**
 * useScrollDirectionLite - Lightweight version without store integration
 *
 * For components that need scroll direction without affecting global state.
 * Uses local state instead of Zustand store.
 *
 * @example
 * ```tsx
 * function LocalScrollComponent() {
 *   const { scrollDirection, isAtTop } = useScrollDirectionLite();
 *   // Use scroll info locally
 * }
 * ```
 */
export function useScrollDirectionLite(): Omit<UseScrollDirectionReturn, 'shouldShowNav'> {
  const scrollYRef = useRef(0);
  const scrollDeltaRef = useRef(0);
  const directionRef = useRef<'up' | 'down' | null>(null);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const now = performance.now();
      if (now - lastUpdateRef.current < THROTTLE_MS) return;
      lastUpdateRef.current = now;

      const currentScrollY = window.scrollY;
      const delta = currentScrollY - scrollYRef.current;

      if (currentScrollY < AT_TOP_THRESHOLD) {
        directionRef.current = null;
        scrollDeltaRef.current = 0;
      } else if (delta < 0) {
        directionRef.current = 'up';
        scrollDeltaRef.current = 0;
      } else if (delta > 0) {
        scrollDeltaRef.current += delta;
        if (scrollDeltaRef.current >= SCROLL_THRESHOLD) {
          directionRef.current = 'down';
        }
      }

      scrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    scrollDirection: directionRef.current,
    isAtTop: scrollYRef.current < AT_TOP_THRESHOLD,
    scrollY: scrollYRef.current,
  };
}

export default useScrollDirection;
