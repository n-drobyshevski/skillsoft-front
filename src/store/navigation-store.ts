import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

/**
 * Navigation scroll direction type
 */
type ScrollDirection = 'up' | 'down' | null;

/**
 * Bottom sheet snap point positions
 * - peek: 25% of viewport height
 * - half: 55% of viewport height
 * - full: 92% of viewport height
 */
type SnapPoint = 'peek' | 'half' | 'full' | null;

/**
 * Navigation state interface
 * Manages mobile navigation visibility, scroll direction tracking,
 * and bottom sheet snap point state.
 */
interface NavigationState {
  /** Whether the bottom navigation is visible */
  isNavVisible: boolean;
  /** Current scroll direction (up/down/null) */
  scrollDirection: ScrollDirection;
  /** Last recorded scroll Y position */
  lastScrollY: number;
  /** Current active snap point for bottom sheets */
  activeSnapPoint: SnapPoint;
  /** Whether header is in collapsed state */
  isHeaderCollapsed: boolean;
  /** Accumulated scroll delta for threshold detection */
  scrollDelta: number;
}

/**
 * Navigation actions interface
 */
interface NavigationActions {
  /** Set navigation visibility directly */
  setNavVisibility: (visible: boolean) => void;
  /** Update scroll tracking state */
  updateScroll: (scrollY: number) => void;
  /** Set the active snap point for bottom sheets */
  setSnapPoint: (point: SnapPoint) => void;
  /** Set header collapsed state */
  setHeaderCollapsed: (collapsed: boolean) => void;
  /** Reset navigation state to defaults */
  reset: () => void;
}

type NavigationStore = NavigationState & NavigationActions;

/**
 * Initial state for navigation store
 */
const initialState: NavigationState = {
  isNavVisible: true,
  scrollDirection: null,
  lastScrollY: 0,
  activeSnapPoint: null,
  isHeaderCollapsed: false,
  scrollDelta: 0,
};

/**
 * Scroll threshold before triggering hide (in pixels)
 * Navigation hides after scrolling down 50px
 */
const SCROLL_THRESHOLD = 50;

/**
 * Scroll position considered "at top" of page
 * Navigation always visible when within this range
 */
const AT_TOP_THRESHOLD = 100;

/**
 * Navigation Store
 *
 * Zustand store for managing mobile navigation state including:
 * - Scroll-based visibility (hide on scroll down, show on scroll up)
 * - Bottom sheet snap point tracking
 * - Header collapse state
 *
 * Uses subscribeWithSelector for optimized re-renders.
 *
 * @example
 * ```tsx
 * const isNavVisible = useNavigationStore((state) => state.isNavVisible);
 * const updateScroll = useNavigationStore((state) => state.updateScroll);
 *
 * useEffect(() => {
 *   const handleScroll = () => updateScroll(window.scrollY);
 *   window.addEventListener('scroll', handleScroll, { passive: true });
 *   return () => window.removeEventListener('scroll', handleScroll);
 * }, [updateScroll]);
 * ```
 */
export const useNavigationStore = create<NavigationStore>()(
  subscribeWithSelector((set, get) => ({
    // State
    ...initialState,

    // Actions
    setNavVisibility: (visible: boolean) => {
      set({ isNavVisible: visible });
    },

    updateScroll: (scrollY: number) => {
      const { lastScrollY, scrollDirection: prevDirection, scrollDelta } = get();

      // Ignore tiny movements (less than 5px) to prevent jitter
      const delta = scrollY - lastScrollY;
      if (Math.abs(delta) < 5) return;

      // Determine scroll direction
      const currentDirection: ScrollDirection = delta > 0 ? 'down' : 'up';

      // Always visible at top of page
      if (scrollY < AT_TOP_THRESHOLD) {
        set({
          isNavVisible: true,
          scrollDirection: null,
          lastScrollY: scrollY,
          scrollDelta: 0,
          isHeaderCollapsed: false,
        });
        return;
      }

      // Scrolling up - show immediately
      if (currentDirection === 'up') {
        set({
          isNavVisible: true,
          scrollDirection: 'up',
          lastScrollY: scrollY,
          scrollDelta: 0,
          isHeaderCollapsed: false,
        });
        return;
      }

      // Scrolling down - use simple threshold from reference point
      // If direction changed from up to down, start fresh
      const newDelta = prevDirection === 'down' ? scrollDelta + delta : delta;

      if (newDelta >= SCROLL_THRESHOLD) {
        // Threshold reached, hide nav
        set({
          isNavVisible: false,
          scrollDirection: 'down',
          lastScrollY: scrollY,
          scrollDelta: newDelta,
          isHeaderCollapsed: true,
        });
      } else {
        // Still accumulating, update delta
        set({
          scrollDirection: 'down',
          lastScrollY: scrollY,
          scrollDelta: newDelta,
        });
      }
    },

    setSnapPoint: (point: SnapPoint) => {
      set({ activeSnapPoint: point });
    },

    setHeaderCollapsed: (collapsed: boolean) => {
      set({ isHeaderCollapsed: collapsed });
    },

    reset: () => {
      set(initialState);
    },
  }))
);

/**
 * Selector hooks for optimized component subscriptions
 */

/** Get navigation visibility state */
export const useNavVisibility = () =>
  useNavigationStore((state) => state.isNavVisible);

/** Get scroll direction */
export const useScrollDirection = () =>
  useNavigationStore((state) => state.scrollDirection);

/** Get active snap point */
export const useActiveSnapPoint = () =>
  useNavigationStore((state) => state.activeSnapPoint);

/** Get header collapsed state */
export const useIsHeaderCollapsed = () =>
  useNavigationStore((state) => state.isHeaderCollapsed);

/** Get updateScroll action */
export const useUpdateScroll = () =>
  useNavigationStore((state) => state.updateScroll);

/** Get setNavVisibility action */
export const useSetNavVisibility = () =>
  useNavigationStore((state) => state.setNavVisibility);

/** Get setSnapPoint action */
export const useSetSnapPoint = () =>
  useNavigationStore((state) => state.setSnapPoint);
