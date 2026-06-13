"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useLensStore, readLensCookie } from "@/store/lens-store";
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
  const router = useRouter();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const isStoreInitialized = useLensStore(selectIsInitialized);
  const isStoreHydrated = useLensStore(selectIsHydrated);
  const initializeFromClerk = useLensStore((state) => state.initializeFromClerk);

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

    // Check if user has a stored lens preference via localStorage key
    // (not by comparing activeLens value — "user" is a valid stored choice)
    const hasStoredLens =
      typeof window !== "undefined" &&
      localStorage.getItem("skillsoft-lens-store") !== null;

    // The lens the SERVER used to render the current page lives in the cookie.
    // Capture it BEFORE initialization overwrites it. Null = cookie absent
    // (e.g. cleared on sign-out), which is the common first-load-after-login case.
    const serverLens = readLensCookie();

    // Initialize the store (resolves the persisted lens + re-syncs the cookie).
    initializeFromClerk(userRole, hasStoredLens);
    hasInitializedRef.current = true;

    // Reconcile server ↔ client. The dashboard (and other server components)
    // rendered from `serverLens`; the client just resolved its real lens from
    // localStorage. If they differ — the cookie was stale/absent on first load —
    // force one router.refresh() so server components re-render with the correct
    // lens cookie. Without this the sidebar shows the persisted lens while the
    // dashboard stays on the role-default view until a manual switch.
    const resolvedLens = useLensStore.getState().activeLens;
    if (serverLens !== resolvedLens) {
      router.refresh();
    }
  }, [
    router,
    isClerkLoaded,
    isStoreHydrated,
    isStoreInitialized,
    clerkUserId,
    clerkUserRole,
    initializeFromClerk,
  ]);

  // This component doesn't render anything - it's just for initialization
  return null;
}
