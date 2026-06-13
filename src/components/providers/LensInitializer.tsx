"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useLensStore, readLensCookie } from "@/store/lens-store";
import { selectIsHydrated } from "@/store/lens-selectors";
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
  const isStoreHydrated = useLensStore(selectIsHydrated);
  const initializeFromClerk = useLensStore((state) => state.initializeFromClerk);

  // Extract stable values for dependencies
  const clerkUserId = clerkUser?.id;
  const clerkUserRole = clerkUser?.publicMetadata?.role as string | undefined;

  // Track which Clerk user this instance already initialized for. Keyed by id
  // (not a boolean) so a new login mount — or an account switch — re-initializes
  // even when the module-singleton store survived from a previous session with
  // isInitialized stale-true.
  const initializedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Guard: Wait for Clerk to load
    if (!isClerkLoaded) {
      return;
    }

    // Guard: Wait for store to hydrate from localStorage
    if (!isStoreHydrated) {
      return;
    }

    // Guard: No user (shouldn't happen in workspace layout, but check anyway)
    if (!clerkUserId) {
      return;
    }

    // Guard: Already initialized for THIS user on this mount. We intentionally
    // do NOT short-circuit on the store's isInitialized flag — it can be stale
    // from a prior session that the surviving singleton carried across login.
    if (initializedUserIdRef.current === clerkUserId) {
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
    // Force re-resolution: the store may be a surviving singleton whose
    // isInitialized is still true from the previous session, which would
    // otherwise make this a no-op and leave the cookie unsynced.
    initializeFromClerk(userRole, hasStoredLens, true);
    initializedUserIdRef.current = clerkUserId;

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
    clerkUserId,
    clerkUserRole,
    initializeFromClerk,
  ]);

  // This component doesn't render anything - it's just for initialization
  return null;
}
