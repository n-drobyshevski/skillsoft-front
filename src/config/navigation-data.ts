/**
 * Navigation Data Configuration
 *
 * Defines the navigation structure for the SkillSoft application.
 * This configuration is consumed by the useNavigation hook and rendered by the sidebar.
 *
 * Part of UX Navigation Redesign - See docs/UX_STRATEGY.md
 */

import { NavigationConfig } from "./navigation-config";

export const NAVIGATION_CONFIG: NavigationConfig = {
  version: "1.0.0",
  groups: [
    // ============================================
    // PERSONAL GROUP - User Lens Only
    // ============================================
    {
      id: "personal",
      labelKey: "groups.personal",
      icon: "User",
      lenses: ["user"],
      collapsible: false,
      items: [
        {
          id: "my-hub",
          path: "/dashboard",
          labelKey: "items.overview",
          icon: "LayoutDashboard",
        },
        {
          id: "my-tests",
          path: "/my-tests",
          labelKey: "items.myActivity",
          icon: "ClipboardCheck",
          badge: {
            content: { type: "count", key: "inProgressTests" },
            variant: "default",
            hideWhenZero: true,
          },
        },
        {
          id: "test-catalog",
          path: "/test-templates",
          labelKey: "items.testCatalog",
          icon: "FileStack",
          badge: {
            content: { type: "count", key: "sharedTemplates" },
            variant: "secondary",
            hideWhenZero: true,
          },
        },
      ],
      hasSeparator: false,
    },

    // ============================================
    // TESTING GROUP - Editor/Admin Lenses
    // ============================================
    {
      id: "testing",
      labelKey: "groups.testing",
      icon: "ClipboardList",
      lenses: ["editor", "admin"],
      collapsible: false,
      items: [
        {
          id: "overview",
          path: "/dashboard",
          labelKey: "items.hiringOverview",
          icon: "BarChart3",
        },
        {
          id: "studio",
          path: "/test-templates",
          labelKey: "items.studio",
          icon: "Layers",
        },
      ],
      hasSeparator: true,
    },

    // ============================================
    // LIBRARY GROUP - Editor/Admin Lenses
    // ============================================
    {
      id: "library",
      labelKey: "groups.library",
      icon: "Library",
      lenses: ["editor", "admin"],
      collapsible: true,
      defaultCollapsed: false,
      items: [
        {
          id: "competencies",
          path: "/hr/competencies",
          labelKey: "competencies",
          icon: "Target",
          badge: {
            content: { type: "count", key: "pendingCompetencies" },
            variant: "warning",
            hideWhenZero: true,
          },
        },
        {
          id: "indicators",
          path: "/hr/behavioral-indicators",
          labelKey: "indicators",
          icon: "Lightbulb",
        },
        {
          id: "questions",
          path: "/hr/assessment-questions",
          labelKey: "questions",
          icon: "FileQuestion",
        },
        {
          id: "skill-mapper",
          path: "/skill-mapper",
          labelKey: "skillMapper",
          icon: "Network",
        },
      ],
      hasSeparator: true,
    },

    // ============================================
    // ANALYTICS GROUP - Admin Only
    // ============================================
    {
      id: "analytics",
      labelKey: "groups.analytics",
      icon: "LineChart",
      lenses: ["admin"],
      collapsible: true,
      defaultCollapsed: false,
      items: [
        {
          id: "psychometrics",
          path: "/psychometrics",
          labelKey: "items.psychometrics",
          icon: "Activity",
          badge: {
            content: { type: "count", key: "flaggedItems" },
            variant: "destructive",
            hideWhenZero: true,
          },
        },
      ],
      hasSeparator: true,
    },

    // ============================================
    // SYSTEM GROUP - Admin Only
    // ============================================
    {
      id: "system",
      labelKey: "groups.system",
      icon: "Shield",
      lenses: ["admin"],
      collapsible: true,
      defaultCollapsed: false,
      items: [
        {
          id: "users",
          path: "/admin/users",
          labelKey: "users",
          icon: "UsersRound",
          badge: {
            content: { type: "count", key: "newUsers" },
            variant: "secondary",
            hideWhenZero: true,
          },
        },
        {
          id: "teams",
          path: "/admin/teams",
          labelKey: "teams",
          icon: "Users",
          isNew: true,
        },
        {
          id: "settings",
          path: "/settings",
          labelKey: "settings",
          icon: "Settings",
        },
      ],
      hasSeparator: false,
    },
  ],

  footer: [
    {
      id: "docs",
      path: "https://skillsoft.app/docs",
      labelKey: "documentation",
      icon: "BookOpen",
      isExternal: true,
    },
  ],
};
