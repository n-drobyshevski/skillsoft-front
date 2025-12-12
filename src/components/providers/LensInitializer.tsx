"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useLensStore } from "@/store/lens-store";
import { selectIsInitialized, selectIsHydrated } from "@/store/lens-selectors";
import { UserRole } from "@/types/user";

/**
 * LensInitializer Component
 *
 * Centralized initialization of lens system from Clerk user data.
 * This component should render BEFORE the sidebar to prevent flash of wrong content.
 *
 * Initialization Flow:
 * 1. Wait for Clerk user to load
 * 2. Wait for Zustand to hydrate from localStorage
 * 3. Extract role from Clerk publicMetadata
 * 4. Determine if user has stored lens preference (via hydration)
 * 5. Initialize lens store with appropriate lens
 *
 * Scenarios:
 * - First login, no stored lens → Use role default
 * - Returning user, valid stored lens → Keep stored lens
 * - Returning user, invalid stored lens → Reset to role default
 * - Role changed → Adjust lens if needed
 *
 * Why this works:
 * - Initialization happens early in component tree
 * - Prevents race conditions between Clerk and lens state
 * - Single source of truth for role → lens mapping
 * - No flash of wrong content on page load
 */
export function LensInitializer() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const isStoreInitialized = useLensStore(selectIsInitialized);
  const isStoreHydrated = useLensStore(selectIsHydrated);
  const initializeFromClerk = useLensStore((state) => state.initializeFromClerk);
  const activeLens = useLensStore((state) => state.activeLens);

  // Extract stable values for dependencies
  const clerkUserId = clerkUser?.id;
  const clerkUserRole = clerkUser?.publicMetadata?.role as string | undefined;

  // Track if we've already initialized to prevent duplicate calls
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Guard: Wait for Clerk to load
    if (!isClerkLoaded) {
      return;
    }

    // Guard: Wait for store to hydrate from localStorage
    if (!isStoreHydrated) {
      return;
    }

    // Guard: Already initialized
    if (isStoreInitialized || hasInitializedRef.current) {
      return;
    }

    // Guard: No user (shouldn't happen in workspace layout, but check anyway)
    if (!clerkUserId) {
      return;
    }

    // Map Clerk role to UserRole enum
    let userRole: UserRole;
    switch (clerkUserRole) {
      case "ADMIN":
      case "admin":
        userRole = UserRole.ADMIN;
        break;
      case "EDITOR":
      case "editor":
        userRole = UserRole.EDITOR;
        break;
      case "USER":
      case "user":
      default:
        userRole = UserRole.USER;
        break;
    }

    // Check if user has a stored lens preference
    // Read activeLens at hydration time (not from dependency)
    const currentLens = activeLens;
    const hasStoredLens = currentLens !== "user";

    // Initialize the store
    initializeFromClerk(userRole, hasStoredLens);
    hasInitializedRef.current = true;
  }, [
    isClerkLoaded,
    isStoreHydrated,
    isStoreInitialized,
    clerkUserId,
    clerkUserRole,
    initializeFromClerk,
    // NOTE: activeLens intentionally excluded to prevent infinite loop
    // We read it once during initialization, not as a reactive dependency
  ]);

  // This component doesn't render anything - it's just for initialization
  return null;
}
