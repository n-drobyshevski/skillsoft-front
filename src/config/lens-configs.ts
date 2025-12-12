/**
 * Lens Configuration
 *
 * Centralized lens definitions with visual styling and permissions.
 * Each lens represents a role-based view that filters UI and features.
 *
 * Inspired by Wiz Lens - "Role-based views for every team"
 */

import { LensType } from "@/store/lens-store";

/**
 * Lens configuration interface
 */
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
const ROUTE_MY_TESTS = "/my-tests";
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
      ROUTE_MY_TESTS,
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

/**
 * Helper: Get lens configuration by lens type
 * Uses exhaustive switch for type safety
 */
export function getLensConfig(lens: LensType): LensConfig {
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
