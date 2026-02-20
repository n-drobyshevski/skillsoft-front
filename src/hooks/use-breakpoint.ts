import * as React from "react";

/**
 * Breakpoint values matching Tailwind CSS defaults
 */
export const BREAKPOINTS = {
  xs: 320,   // Small phones
  sm: 640,   // Large phones / small tablets
  md: 768,   // Tablets (sidebar threshold) — canonical mobile/desktop boundary
  lg: 1024,  // Small laptops
  xl: 1280,  // Desktops
  '2xl': 1536, // Large monitors
} as const;

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Device type categories.
 *
 * Canonical boundary definitions:
 * - phone:   < 640px  (xs only)
 * - mobile:  < 768px  (xs + sm) — matches Tailwind `md` breakpoint, standard mobile boundary
 * - tablet:  768px – 1023px (md)
 * - desktop: >= 1024px (lg, xl, 2xl)
 */
export type DeviceType = 'phone' | 'tablet' | 'desktop';

/**
 * Enhanced breakpoint hook with granular device detection.
 *
 * Returns both the current breakpoint name and device type category.
 * SSR-safe with hydration handling to prevent mismatch errors.
 *
 * Canonical mobile boundary is 768px (Tailwind `md`), which is what
 * `useIsMobile()` in use-mobile.ts uses. All flags below are derived
 * from this single source of truth.
 *
 * Device flags:
 * - isPhone:          < 640px  (xs — very small phones)
 * - isMobile:         < 768px  (xs + sm — standard mobile, matches `useIsMobile()`)
 * - isTablet:         768px – 1023px (md — tablet-sized viewports)
 * - isDesktop:        >= 1024px (lg, xl, 2xl)
 * - isMobileOrTablet: < 1024px (phone + tablet combined; useful for sidebar decisions)
 *
 * @example
 * ```tsx
 * const { breakpoint, isMobile, isTablet, isDesktop } = useBreakpoint();
 *
 * if (isMobile) {
 *   return <MobileLayout />;
 * }
 * ```
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>('lg');
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);

    const getBreakpoint = (width: number): Breakpoint => {
      if (width < BREAKPOINTS.sm) return 'xs';
      if (width < BREAKPOINTS.md) return 'sm';
      if (width < BREAKPOINTS.lg) return 'md';
      if (width < BREAKPOINTS.xl) return 'lg';
      if (width < BREAKPOINTS['2xl']) return 'xl';
      return '2xl';
    };

    const update = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    update();

    // Use matchMedia for efficient breakpoint detection
    const mediaQueries = [
      window.matchMedia(`(max-width: ${BREAKPOINTS.sm - 1}px)`),
      window.matchMedia(`(min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.md - 1}px)`),
      window.matchMedia(`(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`),
      window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px) and (max-width: ${BREAKPOINTS.xl - 1}px)`),
      window.matchMedia(`(min-width: ${BREAKPOINTS.xl}px) and (max-width: ${BREAKPOINTS['2xl'] - 1}px)`),
      window.matchMedia(`(min-width: ${BREAKPOINTS['2xl']}px)`),
    ];

    mediaQueries.forEach((mq) => {
      mq.addEventListener('change', update);
    });

    return () => {
      mediaQueries.forEach((mq) => {
        mq.removeEventListener('change', update);
      });
    };
  }, []);

  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);

  // Derive device type from breakpoint using canonical 768px mobile boundary
  const deviceType: DeviceType = React.useMemo(() => {
    if (breakpoint === 'xs' || breakpoint === 'sm') return 'phone';
    if (breakpoint === 'md') return 'tablet';
    return 'desktop';
  }, [breakpoint]);

  return {
    /** Current breakpoint name (xs, sm, md, lg, xl, 2xl) */
    breakpoint,
    /** Device category (phone, tablet, desktop) */
    deviceType,
    /**
     * True if viewport is phone size (< 640px).
     * Use this for layouts targeting only very small screens.
     */
    isPhone: breakpoint === 'xs',
    /**
     * True if viewport is mobile size (< 768px).
     * This matches the canonical Tailwind `md` breakpoint and is
     * equivalent to `useIsMobile()`. This is the standard flag to
     * use for mobile-vs-desktop layout decisions.
     */
    isMobile: currentIndex < breakpointOrder.indexOf('md'),
    /**
     * True if viewport is tablet size (768px – 1023px).
     */
    isTablet: breakpoint === 'md',
    /**
     * True if viewport is desktop size (>= 1024px).
     */
    isDesktop: currentIndex >= breakpointOrder.indexOf('lg'),
    /** True if client has hydrated (safe to use window APIs) */
    isHydrated,
    /**
     * True if viewport is mobile or tablet (< 1024px).
     * Useful for sidebar collapse and navigation decisions.
     */
    isMobileOrTablet: currentIndex < breakpointOrder.indexOf('lg'),
    /** Viewport width in pixels (only accurate after hydration) */
    width: isHydrated ? (typeof window !== 'undefined' ? window.innerWidth : 0) : 0,
  };
}

/**
 * Hook that returns true if the current viewport matches or exceeds a breakpoint.
 *
 * @param minBreakpoint - Minimum breakpoint to match
 * @returns boolean indicating if viewport is at or above the breakpoint
 *
 * @example
 * ```tsx
 * const isLargeScreen = useMinBreakpoint('lg');
 * ```
 */
export function useMinBreakpoint(minBreakpoint: Breakpoint): boolean {
  const { breakpoint, isHydrated } = useBreakpoint();

  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);
  const minIndex = breakpointOrder.indexOf(minBreakpoint);

  // Default to true for SSR (desktop-first for SEO)
  if (!isHydrated) return true;

  return currentIndex >= minIndex;
}

/**
 * Hook that returns true if the current viewport is below a breakpoint.
 *
 * @param maxBreakpoint - Maximum breakpoint (exclusive)
 * @returns boolean indicating if viewport is below the breakpoint
 *
 * @example
 * ```tsx
 * const showMobileNav = useMaxBreakpoint('md');
 * ```
 */
export function useMaxBreakpoint(maxBreakpoint: Breakpoint): boolean {
  const { breakpoint, isHydrated } = useBreakpoint();

  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);
  const maxIndex = breakpointOrder.indexOf(maxBreakpoint);

  // Default to false for SSR (desktop-first for SEO)
  if (!isHydrated) return false;

  return currentIndex < maxIndex;
}
