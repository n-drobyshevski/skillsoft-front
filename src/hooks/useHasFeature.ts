import { useLensStore } from "@/store/lens-store";
import { selectHasFeature, selectActiveLens } from "@/store/lens-selectors";
import { useMemo, useRef } from "react";
import { getLensConfig } from "@/config/lens-configs";

/**
 * Hook to check if a feature is enabled in the current lens
 *
 * Replaces the old useHasFeature() from LensContext.
 * Uses a curried selector for optimal performance.
 *
 * Usage:
 * ```tsx
 * const canEdit = useHasFeature("edit-competencies");
 * const canDelete = useHasFeature("delete-competencies");
 * ```
 *
 * @param feature - Feature key to check (e.g., "edit-competencies")
 * @returns Boolean indicating if feature is enabled
 */
export function useHasFeature(feature: string): boolean {
  // Create a memoized selector for this specific feature
  // This prevents creating a new function on every render
  const selector = useMemo(() => selectHasFeature(feature), [feature]);

  return useLensStore(selector);
}

/**
 * Hook to check multiple features at once
 * Returns an object with feature keys as properties
 *
 * Usage:
 * ```tsx
 * const features = useHasFeatures([
 *   "edit-competencies",
 *   "delete-competencies",
 *   "create-competencies"
 * ]);
 * // features = { "edit-competencies": true, "delete-competencies": false, ... }
 * ```
 *
 * CRITICAL: This hook must return stable references to prevent infinite loops.
 * Uses manual caching with a ref instead of calling hooks in a loop (Rules of Hooks violation).
 *
 * @param features - Array of feature keys to check
 * @returns Object mapping feature keys to boolean values
 */
export function useHasFeatures(features: string[]): Record<string, boolean> {
  // Subscribe only to activeLens - this is a primitive value (stable)
  const activeLens = useLensStore(selectActiveLens);

  // Cache ref to store previous result and compare
  const cacheRef = useRef<{
    lens: string;
    features: string;
    result: Record<string, boolean>;
  } | null>(null);

  // Serialize features for comparison
  const featuresKey = features.join("|");

  // Return cached result if lens and features haven't changed
  if (cacheRef.current &&
      cacheRef.current.lens === activeLens &&
      cacheRef.current.features === featuresKey) {
    return cacheRef.current.result;
  }

  // Compute new result
  const state = useLensStore.getState();
  const featureMap: Record<string, boolean> = {};
  features.forEach((feature) => {
    const featureSelector = selectHasFeature(feature);
    featureMap[feature] = featureSelector(state);
  });

  // Cache the result
  cacheRef.current = {
    lens: activeLens,
    features: featuresKey,
    result: featureMap,
  };

  return featureMap;
}

/**
 * Hook to get all enabled features for the current lens
 * Use sparingly as it causes re-renders on any lens change
 *
 * Usage:
 * ```tsx
 * const allFeatures = useAllFeatures();
 * console.log("Enabled features:", allFeatures);
 * ```
 */
export function useAllFeatures(): string[] {
  const activeLens = useLensStore(selectActiveLens);

  // Return the features array from the lens config
  // This is a stable reference from LENS_CONFIGS
  return useMemo(() => {
    const config = getLensConfig(activeLens);
    return config.features;
  }, [activeLens]);
}
