import { create } from "zustand";
import { persist, subscribeWithSelector, devtools } from "zustand/middleware";
import { UserRole } from "@/types/user";

/**
 * Lens types representing different role-based views
 */
export type LensType = "user" | "editor" | "admin";

/** Cookie name for server-side lens detection */
export const LENS_COOKIE_NAME = "SKILLSOFT_ACTIVE_LENS";

/** Maps lens type to the corresponding UserRole for permission enforcement */
export const LENS_TO_ROLE: Record<LensType, UserRole> = {
  user: UserRole.USER,
  editor: UserRole.EDITOR,
  admin: UserRole.ADMIN,
};

/** Sync active lens to a cookie so server components and API calls can read it */
function syncLensCookie(lens: LensType) {
  if (typeof document !== "undefined") {
    document.cookie = `${LENS_COOKIE_NAME}=${lens}; path=/; max-age=31536000; SameSite=Lax`;
  }
}

/** Clear the lens cookie (used on reset/sign-out) */
function clearLensCookie() {
  if (typeof document !== "undefined") {
    document.cookie = `${LENS_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}

/**
 * Read the active lens from the cookie (client-side).
 *
 * This is the value the server used to render the current page. Returns null
 * when the cookie is absent (e.g. just after sign-out cleared it), which the
 * caller treats as "server has no lens" — distinct from any concrete lens.
 */
export function readLensCookie(): LensType | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LENS_COOKIE_NAME}=([^;]*)`)
  );
  const value = match?.[1];
  return value === "user" || value === "editor" || value === "admin"
    ? value
    : null;
}

/**
 * Lens store state
 */
interface LensState {
  /** Currently active lens */
  activeLens: LensType;
  /** User's actual role from Clerk */
  userRole: UserRole;
  /** Whether the store has been initialized from Clerk */
  isInitialized: boolean;
  /** Whether the persisted state has been hydrated */
  isHydrated: boolean;
}

/**
 * Lens store actions
 */
interface LensActions {
  /** Set the active lens (with permission check) */
  setLens: (lens: LensType) => void;
  /**
   * Initialize store from Clerk user data.
   *
   * Pass `force` to re-resolve even when already initialized — used by
   * LensInitializer on each login mount, because the store is a module
   * singleton that survives client-side sign-out → sign-in (no page reload),
   * leaving `isInitialized` stale-true from the previous session.
   */
  initializeFromClerk: (role: UserRole, hasStoredLens: boolean, force?: boolean) => void;
  /** Reset store to default state */
  reset: () => void;
  /** Mark store as hydrated (called by persist middleware) */
  setHydrated: () => void;
}

/**
 * Combined lens store type
 */
export type LensStore = LensState & LensActions;

/**
 * Default lens for each role
 */
const ROLE_DEFAULT_LENS: Record<UserRole, LensType> = {
  [UserRole.ADMIN]: "admin",
  [UserRole.EDITOR]: "editor",
  [UserRole.USER]: "user",
};

/**
 * Available lenses for each role
 */
const ROLE_AVAILABLE_LENSES: Record<UserRole, LensType[]> = {
  [UserRole.ADMIN]: ["user", "editor", "admin"],
  [UserRole.EDITOR]: ["user", "editor"],
  [UserRole.USER]: ["user"],
};

/**
 * Get default lens for a role
 */
function getDefaultLens(role: UserRole): LensType {
  switch (role) {
    case UserRole.ADMIN:
      return ROLE_DEFAULT_LENS[UserRole.ADMIN];
    case UserRole.EDITOR:
      return ROLE_DEFAULT_LENS[UserRole.EDITOR];
    case UserRole.USER:
    default:
      return ROLE_DEFAULT_LENS[UserRole.USER];
  }
}

/**
 * Get available lenses for a role
 */
function getAvailableLenses(role: UserRole): LensType[] {
  switch (role) {
    case UserRole.ADMIN:
      return ROLE_AVAILABLE_LENSES[UserRole.ADMIN];
    case UserRole.EDITOR:
      return ROLE_AVAILABLE_LENSES[UserRole.EDITOR];
    case UserRole.USER:
    default:
      return ROLE_AVAILABLE_LENSES[UserRole.USER];
  }
}

/**
 * Check if a lens is available for a role
 */
function isLensAvailable(lens: LensType, role: UserRole): boolean {
  return getAvailableLenses(role).includes(lens);
}

/**
 * Lens Store
 *
 * Manages role-based view state with Zustand.
 * Features:
 * - Persistent lens selection (localStorage)
 * - Role-based lens availability
 * - Centralized Clerk initialization
 * - SSR-safe hydration
 * - Redux DevTools integration
 *
 * Migration from React Context:
 * - Eliminates re-render issues via selective subscriptions
 * - Removes complex ref tracking
 * - Built-in persistence with SSR safety
 * - Better debugging with DevTools
 */
export const useLensStore = create<LensStore>()(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        // State
        activeLens: "user",
        userRole: UserRole.USER,
        isInitialized: false,
        isHydrated: false,

        // Actions
        setLens: (lens: LensType) => {
          const { userRole, activeLens: currentLens } = get();

          // Validate lens is available for current role
          if (!isLensAvailable(lens, userRole)) {
            if (process.env.NODE_ENV === "development") {
              console.warn(
                `[LensStore] Attempted to set unavailable lens "${lens}" for role "${userRole}". Ignoring.`
              );
            }
            return;
          }

          // Only update if lens actually changed
          if (currentLens !== lens) {
            // Cookie MUST be set before state update because
            // subscribeWithSelector fires listeners synchronously on set().
            // LensRouterSync calls router.refresh() in its listener,
            // which needs the updated cookie for the server request.
            syncLensCookie(lens);
            set({ activeLens: lens }, false, "setLens");
          }
        },

        initializeFromClerk: (role: UserRole, hasStoredLens: boolean, force = false) => {
          const { activeLens, isInitialized } = get();

          // Only initialize once per session, unless the caller forces a
          // re-resolution (e.g. a new login mount reusing a surviving store).
          if (isInitialized && !force) {
            return;
          }

          // Determine the lens to use
          let targetLens: LensType;

          if (hasStoredLens && isLensAvailable(activeLens, role)) {
            // User has a stored lens preference and it's valid for their role
            targetLens = activeLens;
          } else {
            // First-time login or stored lens invalid for role - use role default
            targetLens = getDefaultLens(role);
          }

          // Cookie MUST be set before state update (same reason as setLens)
          syncLensCookie(targetLens);
          set(
            {
              userRole: role,
              activeLens: targetLens,
              isInitialized: true,
            },
            false,
            "initializeFromClerk"
          );
        },

        reset: () => {
          clearLensCookie();
          set(
            {
              activeLens: "user",
              userRole: UserRole.USER,
              isInitialized: false,
              isHydrated: false,
            },
            false,
            "reset"
          );
        },

        setHydrated: () => {
          set({ isHydrated: true }, false, "setHydrated");
        },
      })),
      {
        name: "skillsoft-lens-store",
        // Only persist activeLens (not derived state like userRole)
        partialize: (state) => ({ activeLens: state.activeLens }),
        // Handle hydration completion
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.setHydrated();
          }
        },
      }
    ),
    {
      name: "LensStore",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);

/**
 * Export helper functions for external use
 */
export const lensHelpers = {
  getDefaultLens,
  getAvailableLenses,
  isLensAvailable,
};
