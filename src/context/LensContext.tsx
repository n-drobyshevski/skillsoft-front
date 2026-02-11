/**
 * @deprecated This file is deprecated and will be removed in a future version.
 *
 * Migration Guide:
 * ================
 *
 * The lens system has been migrated from React Context to Zustand for better performance
 * and simpler state management.
 *
 * OLD (Context-based):
 * ```tsx
 * import { useLens, useHasFeature, useIsRouteVisible } from "@/context/LensContext";
 *
 * const { activeLens, lensConfig, setLens, availableLenses } = useLens();
 * const canEdit = useHasFeature("edit-competencies");
 * const canAccessHR = useIsRouteVisible("/hr/competencies");
 * ```
 *
 * NEW (Zustand-based):
 * ```tsx
 * import { useLens, useActiveLens, useLensConfig } from "@/hooks/useLens";
 * import { useHasFeature } from "@/hooks/useHasFeature";
 * import { useIsRouteVisible } from "@/hooks/useIsRouteVisible";
 *
 * // Full API (same as before)
 * const { activeLens, lensConfig, setLens, availableLenses } = useLens();
 *
 * // Or use granular hooks for better performance
 * const activeLens = useActiveLens();
 * const lensConfig = useLensConfig();
 * const canEdit = useHasFeature("edit-competencies");
 * const canAccessHR = useIsRouteVisible("/hr/competencies");
 * ```
 *
 * Benefits of new system:
 * - Selective subscriptions (fewer re-renders)
 * - Built-in localStorage persistence
 * - Redux DevTools integration
 * - Simpler codebase (no complex refs)
 * - SSR-safe by default
 *
 * Configuration Files:
 * - Lens configs: @/config/lens-configs
 * - Role mappings: @/config/role-mappings
 * - Store: @/store/lens-store
 * - Selectors: @/store/lens-selectors
 *
 * Components:
 * - LensInitializer: @/components/providers/LensInitializer
 *
 * This file now only exports LENS_CONFIGS and types for backward compatibility.
 * Use the new imports from @/config/lens-configs instead.
 */

// Re-export from new location for backward compatibility
export {
  LENS_CONFIGS,
  getLensConfig,
  type LensConfig,
} from "@/config/lens-configs";

export { type LensType } from "@/store/lens-store";

// Deprecated exports (do not use)
/**
 * @deprecated Use LensInitializer component instead
 */
export const LensProvider = ({ children }: { children: React.ReactNode }) => {
  console.warn(
    "[LensProvider] DEPRECATED: LensProvider is no longer needed. " +
    "Remove it from your component tree and use LensInitializer instead."
  );
  return <>{children}</>;
};

/**
 * @deprecated Import from @/hooks/useLens instead
 */
export { useLens } from "@/hooks/useLens";

/**
 * @deprecated Import from @/hooks/useHasFeature instead
 */
export { useHasFeature } from "@/hooks/useHasFeature";

/**
 * @deprecated Import from @/hooks/useIsRouteVisible instead
 */
export { useIsRouteVisible } from "@/hooks/useIsRouteVisible";
