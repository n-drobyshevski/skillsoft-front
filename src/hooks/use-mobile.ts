/**
 * use-mobile.ts — Thin compatibility wrapper around use-breakpoint.ts
 *
 * This file exists for backward compatibility. All breakpoint logic lives
 * in use-breakpoint.ts as the single source of truth.
 *
 * The canonical mobile boundary is 768px (Tailwind `md` breakpoint).
 * `useIsMobile()` returns true for any viewport narrower than 768px.
 */
import * as React from "react";
import { useBreakpoint } from "./use-breakpoint";

/**
 * Returns true when the viewport is narrower than 768px (Tailwind `md`).
 *
 * This is a thin wrapper around `useBreakpoint().isMobile` and exists for
 * backward compatibility. New code should prefer `useBreakpoint()` directly
 * for access to additional flags such as `isPhone`, `isTablet`, `isDesktop`,
 * and `isMobileOrTablet`.
 *
 * SSR-safe: returns false on the server and during hydration to prevent
 * React hydration mismatches. The value updates after the first client render.
 */
export function useIsMobile(): boolean {
  const { isMobile } = useBreakpoint();
  return isMobile;
}

/**
 * Returns whether the component has been hydrated on the client.
 * Useful for components that need to know if they can safely use browser APIs.
 */
export function useIsHydrated(): boolean {
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}
