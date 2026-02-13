import { useLensStore } from "@/store/lens-store";
import { selectIsRouteVisible, selectActiveLens } from "@/store/lens-selectors";
import { useRef } from "react";

/**
 * Hook to check if a route is visible in the current lens
 *
 * Replaces the old useIsRouteVisible() from LensContext.
 * Uses a curried selector for optimal performance.
 *
 * Usage:
 * ```tsx
 * const canAccessHR = useIsRouteVisible("/hr/competencies");
 * const canAccessAdmin = useIsRouteVisible("/admin/users");
 * ```
 *
 * Route matching logic:
 * - Exact match: "/dashboard" matches "/dashboard"
 * - Child routes: "/hr/competencies" matches "/hr/competencies/123"
 * - Parent routes: "/hr/competencies/123" matches "/hr" (if "/hr" is visible)
 *
 * @param route - Route path to check (e.g., "/hr/competencies")
 * @returns Boolean indicating if route is visible
 */
export function useIsRouteVisible(route: string): boolean {
  // Create a selector for this specific route
  const selector = selectIsRouteVisible(route);

  return useLensStore(selector);
}

/**
 * Hook to check multiple routes at once
 * Returns an object with route paths as properties
 *
 * Usage:
 * ```tsx
 * const routes = useAreRoutesVisible([
 *   "/hr/competencies",
 *   "/hr/behavioral-indicators",
 *   "/admin/users"
 * ]);
 * // routes = { "/hr/competencies": true, "/hr/behavioral-indicators": true, "/admin/users": false }
 * ```
 *
 * CRITICAL: This hook must return stable references to prevent infinite loops.
 * Uses manual shallow comparison with a ref to cache results.
 *
 * @param routes - Array of route paths to check
 * @returns Object mapping route paths to boolean values
 */
export function useAreRoutesVisible(routes: string[]): Record<string, boolean> {
  // Subscribe only to activeLens - this is a primitive value (stable)
  const activeLens = useLensStore(selectActiveLens);

  // Cache ref to store previous result and compare
  const cacheRef = useRef<{
    lens: string;
    routes: string;
    result: Record<string, boolean>;
  } | null>(null);

  // Serialize routes for comparison
  const routesKey = routes.join("|");

  // Return cached result if lens and routes haven't changed
  if (cacheRef.current &&
      cacheRef.current.lens === activeLens &&
      cacheRef.current.routes === routesKey) {
    return cacheRef.current.result;
  }

  // Compute new result
  const state = useLensStore.getState();
  const routeMap: Record<string, boolean> = {};
  routes.forEach((route) => {
    const routeSelector = selectIsRouteVisible(route);
    // Safe assignment: route is from the controlled routes array parameter
    Object.defineProperty(routeMap, route, {
      value: routeSelector(state),
      writable: true,
      enumerable: true,
      configurable: true,
    });
  });

  // Cache the result
  cacheRef.current = {
    lens: activeLens,
    routes: routesKey,
    result: routeMap,
  };

  return routeMap;
}

/**
 * Hook to filter a list of navigation items by route visibility
 * Useful for rendering navigation menus
 *
 * Usage:
 * ```tsx
 * const navItems = [
 *   { title: "Competencies", url: "/hr/competencies" },
 *   { title: "Users", url: "/admin/users" }
 * ];
 * const visibleItems = useFilterVisibleRoutes(navItems, (item) => item.url);
 * ```
 *
 * @param items - Array of items with route properties
 * @param getRoute - Function to extract route from item
 * @returns Filtered array of visible items
 */
export function useFilterVisibleRoutes<T>(
  items: T[],
  getRoute: (item: T) => string
): T[] {
  // Get visibility for all routes
  const routes = items.map(getRoute);
  const visibility = useAreRoutesVisible(routes);

  // Filter items based on visibility
  return items.filter((item) => {
    const route = getRoute(item);
    // Safe access: route is derived from items via getRoute function
    return Object.hasOwn(visibility, route) ? visibility[route] : false;
  });
}
