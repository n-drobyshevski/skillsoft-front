import { create } from "zustand";
import { persist, subscribeWithSelector, devtools } from "zustand/middleware";
import { UserRole } from "@/types/user";

/**
 * Lens types representing different role-based views
 */
export type LensType = "user" | "editor" | "admin";

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
  /** Initialize store from Clerk user data */
  initializeFromClerk: (role: UserRole, hasStoredLens: boolean) => void;
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
            set({ activeLens: lens }, false, "setLens");
          }
        },

        initializeFromClerk: (role: UserRole, hasStoredLens: boolean) => {
          const { activeLens, isInitialized } = get();

          // Only initialize once
          if (isInitialized) {
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
