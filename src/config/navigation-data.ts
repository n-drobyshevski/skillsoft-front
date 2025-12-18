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
      label: "Мой кабинет",
      labelEn: "My Workspace",
      icon: "User",
      lenses: ["user"],
      collapsible: false,
      items: [
        {
          id: "my-hub",
          path: "/dashboard",
          label: "Обзор",
          labelEn: "Overview",
          icon: "LayoutDashboard",
        },
        {
          id: "my-tests",
          path: "/my-tests",
          label: "Мои тесты",
          labelEn: "My Tests",
          icon: "ClipboardCheck",
          badge: {
            content: { type: "count", key: "inProgressTests" },
            variant: "default",
            hideWhenZero: true,
          },
        },
        {
          id: "available-tests",
          path: "/test-templates",
          label: "Доступные тесты",
          labelEn: "Available Tests",
          icon: "FileStack",
        },
      ],
      hasSeparator: false,
    },

    // ============================================
    // TESTING GROUP - Editor/Admin Lenses
    // ============================================
    {
      id: "testing",
      label: "Тестирование",
      labelEn: "Testing",
      icon: "ClipboardList",
      lenses: ["editor", "admin"],
      collapsible: false,
      items: [
        {
          id: "overview",
          path: "/dashboard",
          label: "Обзор найма",
          labelEn: "Hiring Overview",
          icon: "BarChart3",
        },
        {
          id: "studio",
          path: "/test-templates",
          label: "Студия",
          labelEn: "Studio",
          icon: "Layers",
          children: [
            {
              id: "all-templates",
              path: "/test-templates",
              label: "Все шаблоны",
              labelEn: "All Templates",
            },
            {
              id: "new-template",
              path: "/test-templates/new",
              label: "Создать тест",
              labelEn: "Create Test",
            },
            {
              id: "test-history",
              path: "/test-templates/history",
              label: "История сессий",
              labelEn: "Session History",
            },
          ],
        },
      ],
      hasSeparator: true,
    },

    // ============================================
    // LIBRARY GROUP - Editor/Admin Lenses
    // ============================================
    {
      id: "library",
      label: "Библиотека",
      labelEn: "Library",
      icon: "Library",
      lenses: ["editor", "admin"],
      collapsible: true,
      defaultCollapsed: false,
      items: [
        {
          id: "competencies",
          path: "/hr/competencies",
          label: "Компетенции",
          labelEn: "Competencies",
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
          label: "Индикаторы",
          labelEn: "Indicators",
          icon: "Lightbulb",
        },
        {
          id: "questions",
          path: "/hr/assessment-questions",
          label: "Вопросы",
          labelEn: "Questions",
          icon: "FileQuestion",
        },
        {
          id: "skill-mapper",
          path: "/skill-mapper",
          label: "Skill Mapper",
          labelEn: "Skill Mapper",
          icon: "Network",
          isNew: true,
        },
      ],
      hasSeparator: true,
    },

    // ============================================
    // ANALYTICS GROUP - Admin Only
    // ============================================
    {
      id: "analytics",
      label: "Аналитика",
      labelEn: "Analytics",
      icon: "LineChart",
      lenses: ["admin"],
      collapsible: true,
      defaultCollapsed: false,
      items: [
        {
          id: "psychometrics",
          path: "/psychometrics",
          label: "Психометрика",
          labelEn: "Psychometrics",
          icon: "Activity",
          badge: {
            content: { type: "count", key: "flaggedItems" },
            variant: "destructive",
            hideWhenZero: true,
          },
          children: [
            {
              id: "psych-dashboard",
              path: "/psychometrics",
              label: "Дашборд",
              labelEn: "Dashboard",
            },
            {
              id: "psych-items",
              path: "/psychometrics/items",
              label: "Статистика вопросов",
              labelEn: "Item Statistics",
            },
            {
              id: "psych-flagged",
              path: "/psychometrics/flagged",
              label: "Отмеченные",
              labelEn: "Flagged Items",
            },
          ],
        },
      ],
      hasSeparator: true,
    },

    // ============================================
    // SYSTEM GROUP - Admin Only
    // ============================================
    {
      id: "system",
      label: "Система",
      labelEn: "System",
      icon: "Shield",
      lenses: ["admin"],
      collapsible: true,
      defaultCollapsed: false,
      items: [
        {
          id: "users",
          path: "/admin/users",
          label: "Пользователи",
          labelEn: "Users",
          icon: "UsersRound",
          badge: {
            content: { type: "count", key: "newUsers" },
            variant: "secondary",
            hideWhenZero: true,
          },
        },
        {
          id: "settings",
          path: "/settings",
          label: "Настройки",
          labelEn: "Settings",
          icon: "Settings",
        },
      ],
      hasSeparator: false,
    },
  ],

  footer: [
    {
      id: "help",
      path: "/help",
      label: "Помощь",
      labelEn: "Help",
      icon: "HelpCircle",
    },
  ],
};
