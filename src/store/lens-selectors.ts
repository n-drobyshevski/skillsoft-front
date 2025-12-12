import { useLensStore, type LensType } from "./lens-store";
import { getLensConfig, LENS_CONFIGS } from "@/config/lens-configs";

/**
 * Lens Selectors
 *
 * Memoized selectors for computed values from lens store.
 * These enable granular subscriptions, preventing unnecessary re-renders.
 *
 * CRITICAL: Selectors MUST return stable references to prevent infinite loops.
 * - Arrays and objects must be cached/constant
 * - Use switch statements with pre-defined constants
 * - Never create new arrays/objects inline
 *
 * Usage:
 * - Components subscribe only to what they need
 * - Selectors automatically memoize results
 * - Changes trigger re-renders only for subscribed components
 */

// Pre-defined constant arrays for available lenses per role
// CRITICAL: These MUST be constant references - never create arrays inline in selectors
const ADMIN_LENSES: LensType[] = ["user", "editor", "admin"];
const EDITOR_LENSES: LensType[] = ["user", "editor"];
const USER_LENSES: LensType[] = ["user"];

/**
 * Select current lens configuration
 * Subscribe to this for lens-specific UI styling, labels, etc.
 *
 * IMPORTANT: Returns reference to LENS_CONFIGS object (stable reference)
 */
export const selectLensConfig = (state: ReturnType<typeof useLensStore.getState>) => {
  // Use switch to get constant reference from LENS_CONFIGS
  switch (state.activeLens) {
    case "admin":
      return LENS_CONFIGS.admin;
    case "editor":
      return LENS_CONFIGS.editor;
    case "user":
    default:
      return LENS_CONFIGS.user;
  }
};

/**
 * Select available lenses for current user role
 * Subscribe to this for lens switcher options
 *
 * CRITICAL: Returns constant array references to prevent "getSnapshot should be cached" error
 * in React 18+ useSyncExternalStore. Creating new arrays here causes infinite loops.
 */
export const selectAvailableLenses = (state: ReturnType<typeof useLensStore.getState>) => {
  switch (state.userRole) {
    case "ADMIN":
      return ADMIN_LENSES;
    case "EDITOR":
      return EDITOR_LENSES;
    case "USER":
    default:
      return USER_LENSES;
  }
};

/**
 * Create a selector to check if a specific route is visible
 * Curried function for route-specific checks
 *
 * @param route - The route to check (e.g., "/hr/competencies")
 * @returns Selector function
 */
export const selectIsRouteVisible = (route: string) => {
  return (state: ReturnType<typeof useLensStore.getState>) => {
    const config = getLensConfig(state.activeLens);
    const normalizedRoute = route.replace(/\/$/, "") || "/";

    return config.visibleRoutes.some(
      (visibleRoute) =>
        normalizedRoute === visibleRoute ||
        normalizedRoute.startsWith(visibleRoute + "/") ||
        visibleRoute.startsWith(normalizedRoute + "/")
    );
  };
};

/**
 * Create a selector to check if a specific feature is enabled
 * Curried function for feature-specific checks
 *
 * @param feature - The feature to check (e.g., "edit-competencies")
 * @returns Selector function
 */
export const selectHasFeature = (feature: string) => {
  return (state: ReturnType<typeof useLensStore.getState>) => {
    const config = getLensConfig(state.activeLens);
    return config.features.includes(feature);
  };
};

/**
 * Select the effective lens (current active lens)
 * Use this when you only need the lens type itself
 */
export const selectActiveLens = (state: ReturnType<typeof useLensStore.getState>) =>
  state.activeLens;

/**
 * Select the user role
 * Use this when you need to check user permissions
 */
export const selectUserRole = (state: ReturnType<typeof useLensStore.getState>) =>
  state.userRole;

/**
 * Select initialization status
 * Use this to check if Clerk has initialized the store
 */
export const selectIsInitialized = (state: ReturnType<typeof useLensStore.getState>) =>
  state.isInitialized;

/**
 * Select hydration status
 * Use this to check if localStorage has been loaded
 */
export const selectIsHydrated = (state: ReturnType<typeof useLensStore.getState>) =>
  state.isHydrated;

/**
 * Combined selector for initialization readiness
 * Use this to gate rendering until both Clerk and localStorage are ready
 */
export const selectIsReady = (state: ReturnType<typeof useLensStore.getState>) =>
  state.isInitialized && state.isHydrated;
