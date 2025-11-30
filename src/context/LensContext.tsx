"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserRole } from "../../app/interfaces/user-interfaces";

/**
 * Lens represents a role-based view that filters the UI experience.
 * Inspired by Wiz Lens - "Role-based views for every team"
 * 
 * Each lens provides:
 * - Scoped navigation items
 * - Role-appropriate dashboards
 * - Filtered feature access
 */
export type LensType = "user" | "editor" | "admin";

export interface LensConfig {
  id: LensType;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  /** Navigation items visible in this lens */
  visibleRoutes: string[];
  /** Dashboard widgets shown for this lens */
  dashboardWidgets: string[];
  /** Features enabled for this lens */
  features: string[];
}

// Common routes - note: route groups (auth), (workspace) are not part of URL path
const ROUTE_DASHBOARD = "/dashboard";
const ROUTE_TESTS = "/test-templates";
// HR Library routes (under (workspace)/hr/ in file system, but /hr/ in URL)
const ROUTE_HR_COMPETENCIES = "/hr/competencies";
const ROUTE_HR_INDICATORS = "/hr/behavioral-indicators";
const ROUTE_HR_QUESTIONS = "/hr/assessment-questions";
// Admin routes (under (workspace)/admin/ in file system, but /admin/ in URL)
const ROUTE_ADMIN_USERS = "/admin/users";
// Tools
const ROUTE_SKILL_MAPPER = "/skill-mapper";

// Common features shared across multiple lenses
const FEATURE_VIEW_COMPETENCIES = "view-competencies";
const FEATURE_VIEW_INDICATORS = "view-indicators";
const FEATURE_VIEW_QUESTIONS = "view-questions";

// Base view features (all lenses have these)
const BASE_VIEW_FEATURES = [
  FEATURE_VIEW_COMPETENCIES,
  FEATURE_VIEW_INDICATORS,
  FEATURE_VIEW_QUESTIONS,
];

// HR routes (editor and admin lenses)
const HR_ROUTES: string[] = [
  ROUTE_HR_COMPETENCIES,
  ROUTE_HR_INDICATORS,
  ROUTE_HR_QUESTIONS,
];

/**
 * Lens configurations defining what each role-based view can access
 */
export const LENS_CONFIGS: Record<LensType, LensConfig> = {
  user: {
    id: "user",
    name: "Личное",
    description: "Ваш профиль и настройки",
    icon: "user",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    borderColor: "border-emerald-200/60 dark:border-emerald-800/60",
    visibleRoutes: [
      ROUTE_DASHBOARD,
      ROUTE_TESTS,
    ],
    dashboardWidgets: ["my-progress", "recent-activity"],
    features: ["view-profile", "take-tests"],
  },
  editor: {
    id: "editor",
    name: "Контент",
    description: "Управление компетенциями и содержимым",
    icon: "edit",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
    borderColor: "border-blue-200/60 dark:border-blue-800/60",
    visibleRoutes: [
      ROUTE_DASHBOARD,
      ROUTE_TESTS,
      ...HR_ROUTES,
      ROUTE_SKILL_MAPPER,
    ],
    dashboardWidgets: [
      "overview",
      "content-stats",
      "pending-reviews",
      "recent-edits",
    ],
    features: [
      ...BASE_VIEW_FEATURES,
      "edit-competencies",
      "create-competencies",
      "edit-indicators",
      "create-indicators",
      "edit-questions",
      "create-questions",
    ],
  },
  admin: {
    id: "admin",
    name: "Админ",
    description: "Полное управление системой",
    icon: "shield",
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-950/40",
    borderColor: "border-violet-200/60 dark:border-violet-800/60",
    visibleRoutes: [
      ROUTE_DASHBOARD,
      ROUTE_TESTS,
      ...HR_ROUTES,
      ROUTE_SKILL_MAPPER,
      ROUTE_ADMIN_USERS,
    ],
    dashboardWidgets: [
      "overview",
      "system-stats",
      "user-activity",
      "content-stats",
      "security-alerts",
    ],
    features: [
      "view-competencies",
      "edit-competencies",
      "create-competencies",
      "delete-competencies",
      "view-indicators",
      "edit-indicators",
      "create-indicators",
      "delete-indicators",
      "view-questions",
      "edit-questions",
      "create-questions",
      "delete-questions",
      "manage-users",
      "system-settings",
    ],
  },
};

interface LensContextProps {
  /** Currently active lens */
  activeLens: LensType;
  /** Current lens configuration */
  lensConfig: LensConfig;
  /** Set the active lens */
  setLens: (lens: LensType) => void;
  /** Check if a route is visible in current lens */
  isRouteVisible: (route: string) => boolean;
  /** Check if a feature is enabled in current lens */
  hasFeature: (feature: string) => boolean;
  /** Get all available lenses based on user's actual role */
  availableLenses: LensType[];
  /** User's actual role from Clerk/backend */
  userRole: UserRole;
  /** Set the user's actual role */
  setUserRole: (role: UserRole) => void;
}

const LensContext = createContext<LensContextProps | undefined>(undefined);

const LENS_STORAGE_KEY = "skillsoft-active-lens";

/**
 * Map UserRole to available lenses.
 * Users can only switch to lenses at or below their permission level.
 */
function getAvailableLenses(role: UserRole): LensType[] {
  switch (role) {
    case UserRole.ADMIN:
      return ["user", "editor", "admin"];
    case UserRole.EDITOR:
      return ["user", "editor"];
    case UserRole.USER:
    default:
      return ["user"];
  }
}

/**
 * Get the default lens for a user role
 */
function getDefaultLens(role: UserRole): LensType {
  switch (role) {
    case UserRole.ADMIN:
      return "admin";
    case UserRole.EDITOR:
      return "editor";
    case UserRole.USER:
    default:
      return "user";
  }
}

// Safe way to get lens config
function getLensConfig(lens: LensType): LensConfig {
  switch (lens) {
    case "admin":
      return LENS_CONFIGS.admin;
    case "editor":
      return LENS_CONFIGS.editor;
    case "user":
    default:
      return LENS_CONFIGS.user;
  }
}

export function LensProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userRoleState, setUserRoleState] = useState<UserRole>(UserRole.USER);
  const isMountedRef = useRef(false);
  // Track if user had a stored lens preference (to know if we should auto-set default)
  const hadStoredLensRef = useRef<boolean | null>(null); // null = not yet checked
  // Track if we've already applied the role-based default
  const appliedRoleDefaultRef = useRef(false);
  
  // Initialize lens from localStorage with lazy initializer (avoids setState in effect)
  const [activeLens, setActiveLens] = useState<LensType>(() => {
    if (typeof window === "undefined") return "user";
    const storedLens = localStorage.getItem(LENS_STORAGE_KEY) as LensType | null;
    if (storedLens) {
      const availableLenses = getAvailableLenses(UserRole.USER);
      if (availableLenses.includes(storedLens)) {
        return storedLens;
      }
    }
    return "user";
  });

  // Track mount state and check stored lens preference
  useEffect(() => {
    isMountedRef.current = true;
    // Check if there was a stored lens preference
    const storedLens = localStorage.getItem(LENS_STORAGE_KEY) as LensType | null;
    hadStoredLensRef.current = !!storedLens;
  }, []);

  // Wrapper for setUserRole that also handles auto-selecting the role-appropriate default lens
  const setUserRole = useCallback((role: UserRole) => {
    setUserRoleState(role);
    
    // Auto-select role-appropriate default lens when role is first set
    // Only applies if user didn't have a stored lens preference
    if (
      hadStoredLensRef.current === false && // Only if no stored preference (and checked)
      !appliedRoleDefaultRef.current &&
      role !== UserRole.USER // Only trigger when role is upgraded from default
    ) {
      appliedRoleDefaultRef.current = true;
      const defaultLens = getDefaultLens(role);
      setActiveLens(defaultLens);
    }
  }, []);

  // Compute effective lens - corrects invalid lens without setState in effect
  const effectiveLens = useMemo(() => {
    const availableLenses = getAvailableLenses(userRoleState);
    if (availableLenses.includes(activeLens)) {
      return activeLens;
    }
    return getDefaultLens(userRoleState);
  }, [userRoleState, activeLens]);

  // Persist lens selection (only after mount to avoid SSR issues)
  useEffect(() => {
    if (isMountedRef.current) {
      localStorage.setItem(LENS_STORAGE_KEY, effectiveLens);
    }
  }, [effectiveLens]);

  const setLens = useCallback((lens: LensType) => {
    const availableLenses = getAvailableLenses(userRoleState);
    if (availableLenses.includes(lens)) {
      setActiveLens(lens);
      
      // Check if current route is accessible in the new lens
      const newLensConfig = getLensConfig(lens);
      const normalizedPath = pathname.replace(/\/$/, "") || "/";
      const isRouteAccessible = newLensConfig.visibleRoutes.some(
        (route) => 
          normalizedPath === route || 
          normalizedPath.startsWith(route + "/") ||
          route.startsWith(normalizedPath + "/")
      );
      
      // Redirect to appropriate fallback page if current route is inaccessible
      if (!isRouteAccessible && isMountedRef.current) {
        // Personal view -> Profile page (or dashboard as fallback)
        // Content/Admin view -> Dashboard
        const fallbackRoute = lens === "user" ? "/dashboard" : "/dashboard";
        router.push(fallbackRoute);
      }
    }
  }, [userRoleState, pathname, router]);

  const lensConfig = getLensConfig(effectiveLens);
  const availableLenses = getAvailableLenses(userRoleState);

  const isRouteVisible = useCallback(
    (route: string) => {
      // Normalize route (remove trailing slash)
      const normalizedRoute = route.replace(/\/$/, "") || "/";
      return lensConfig.visibleRoutes.some(
        (visibleRoute) =>
          normalizedRoute === visibleRoute ||
          normalizedRoute.startsWith(visibleRoute + "/") ||
          visibleRoute.startsWith(normalizedRoute + "/")
      );
    },
    [lensConfig]
  );

  const hasFeature = useCallback(
    (feature: string) => {
      return lensConfig.features.includes(feature);
    },
    [lensConfig]
  );

  return (
    <LensContext.Provider
      value={{
        activeLens,
        lensConfig,
        setLens,
        isRouteVisible,
        hasFeature,
        availableLenses,
        userRole: userRoleState,
        setUserRole,
      }}
    >
      {children}
    </LensContext.Provider>
  );
}

export function useLens() {
  const context = useContext(LensContext);
  if (!context) {
    throw new Error("useLens must be used within a LensProvider");
  }
  return context;
}

/**
 * Hook to check if the current lens allows a specific action
 */
export function useHasFeature(feature: string): boolean {
  const { hasFeature } = useLens();
  return hasFeature(feature);
}

/**
 * Hook to check if a route is accessible in current lens
 */
export function useIsRouteVisible(route: string): boolean {
  const { isRouteVisible } = useLens();
  return isRouteVisible(route);
}
