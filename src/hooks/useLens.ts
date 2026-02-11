import { useMemo } from "react";
import { useLensStore } from "@/store/lens-store";
import { useShallow } from "zustand/react/shallow";
import {
  selectActiveLens,
  selectLensConfig,
  selectAvailableLenses,
  selectUserRole,
  selectIsInitialized,
  selectIsHydrated,
  selectIsReady,
} from "@/store/lens-selectors";

/**
 * Combined selector for useLens hook
 * CRITICAL: Uses useShallow for proper equality comparison
 * to prevent infinite loops when returning objects
 */
const selectLensState = (state: ReturnType<typeof useLensStore.getState>) => ({
  activeLens: selectActiveLens(state),
  lensConfig: selectLensConfig(state),
  availableLenses: selectAvailableLenses(state),
  userRole: selectUserRole(state),
  isInitialized: selectIsInitialized(state),
  isHydrated: selectIsHydrated(state),
  isReady: selectIsReady(state),
});

/**
 * Stable action selectors - these functions are stable in Zustand
 * and don't change between renders
 */
const selectSetLens = (state: ReturnType<typeof useLensStore.getState>) => state.setLens;
const selectInitializeFromClerk = (state: ReturnType<typeof useLensStore.getState>) => state.initializeFromClerk;
const selectReset = (state: ReturnType<typeof useLensStore.getState>) => state.reset;

/**
 * Main lens hook - facade for all lens-related functionality
 *
 * Replaces the old useLens() from LensContext.
 * Provides the same API for backward compatibility during migration.
 *
 * CRITICAL: Uses useShallow to prevent infinite loops caused by
 * returning new object references on every render.
 *
 * Usage:
 * ```tsx
 * const { activeLens, lensConfig, setLens, availableLenses } = useLens();
 * ```
 */
export function useLens() {
  // Subscribe to all lens state with shallow comparison
  // This prevents infinite loops when the returned object would otherwise
  // be a new reference on every render
  const lensState = useLensStore(useShallow(selectLensState));

  // Get actions (these don't cause re-renders when called)
  // Actions in Zustand are stable references
  const setLens = useLensStore(selectSetLens);
  const initializeFromClerk = useLensStore(selectInitializeFromClerk);
  const reset = useLensStore(selectReset);

  // Memoize the return object to prevent unnecessary re-renders in consumers
  return useMemo(() => ({
    // State (from shallow-compared subscription)
    ...lensState,

    // Actions (stable references)
    setLens,
    initializeFromClerk,
    reset,
  }), [lensState, setLens, initializeFromClerk, reset]);
}

/**
 * Hook to get just the active lens
 * Use when you only need the lens type
 */
export function useActiveLens() {
  return useLensStore(selectActiveLens);
}

/**
 * Hook to get just the lens config
 * Use when you only need config properties (colors, icons, etc.)
 */
export function useLensConfig() {
  return useLensStore(selectLensConfig);
}

/**
 * Hook to get available lenses
 * Use in lens switcher dropdown
 */
export function useAvailableLenses() {
  return useLensStore(selectAvailableLenses);
}

/**
 * Hook to get user role
 * Use when you need to check permissions
 */
export function useUserRole() {
  return useLensStore(selectUserRole);
}

/**
 * Hook to check if lens system is ready
 * Use to gate rendering until both Clerk and localStorage are loaded
 */
export function useLensReady() {
  return useLensStore(selectIsReady);
}
