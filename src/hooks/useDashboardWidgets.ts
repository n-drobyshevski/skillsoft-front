/**
 * useDashboardWidgets - Hook for role-based widget filtering.
 *
 * Filters and sorts widgets based on:
 * - Current active lens (admin/editor/user)
 * - User's role (permission check)
 * - Data availability (hide widgets without data)
 * - Priority ordering
 */

import { useMemo } from 'react';
import { useActiveLens, useUserRole } from '@/hooks/useLens';
import {
  WIDGET_REGISTRY,
  type WidgetConfig,
} from '@/components/dashboard/widgets/widget-registry';
import { UserRole } from '@/types/user';
import type { DashboardSummary } from '@/types/dashboard';

/**
 * Role hierarchy for permission checks.
 * Higher number = more permissions.
 */
const ROLE_HIERARCHY: Record<string, number> = {
  USER: 0,
  EDITOR: 1,
  ADMIN: 2,
};

/**
 * Hook to get filtered and sorted widgets for the current lens/role.
 *
 * @param data - Dashboard data object for filtering widgets by data availability
 * @returns Array of WidgetConfig objects sorted by priority
 *
 * @example
 * ```tsx
 * const widgets = useDashboardWidgets(dashboardData);
 *
 * return (
 *   <DashboardGrid>
 *     {widgets.map((config) => (
 *       <WidgetRenderer key={config.id} config={config} data={dashboardData} />
 *     ))}
 *   </DashboardGrid>
 * );
 * ```
 */
export function useDashboardWidgets(data: DashboardSummary | null): WidgetConfig[] {
  const activeLens = useActiveLens();
  const userRole = useUserRole();

  return useMemo(() => {
    return Object.values(WIDGET_REGISTRY)
      // Filter by lens visibility
      .filter((config) => config.lenses.includes(activeLens))

      // Filter by minimum role requirement
      .filter((config) => {
        if (!config.minRole) return true;
        const minRoleLevel = ROLE_HIERARCHY[config.minRole] ?? 0;
        const userRoleLevel = ROLE_HIERARCHY[userRole] ?? 0;
        return userRoleLevel >= minRoleLevel;
      })

      // Filter by data availability
      .filter((config) => {
        if (!config.requiresData || !config.dataKey || !data) return true;
        const value = data[config.dataKey];

        // Check if data exists and is not empty
        if (value === null || value === undefined) return false;
        if (Array.isArray(value) && value.length === 0) return false;

        return true;
      })

      // Sort by priority (lower = higher priority)
      .sort((a, b) => a.priority - b.priority);
  }, [activeLens, userRole, data]);
}

/**
 * Hook to get just the widget IDs for the current lens/role.
 * Useful for simpler rendering scenarios.
 */
export function useDashboardWidgetIds(data: DashboardSummary | null): string[] {
  const widgets = useDashboardWidgets(data);
  return useMemo(() => widgets.map((w) => w.id), [widgets]);
}

/**
 * Hook to check if a specific widget should be visible.
 */
export function useWidgetVisible(
  widgetId: string,
  data: DashboardSummary | null
): boolean {
  const widgets = useDashboardWidgets(data);
  return useMemo(
    () => widgets.some((w) => w.id === widgetId),
    [widgets, widgetId]
  );
}

/**
 * Hook to get high-priority widgets for mobile display.
 * Returns widgets that should always be visible on mobile.
 */
export function useMobileHighPriorityWidgets(
  data: DashboardSummary | null
): WidgetConfig[] {
  const widgets = useDashboardWidgets(data);

  return useMemo(
    () => widgets.filter((w) => w.mobilePriority === 'high'),
    [widgets]
  );
}

/**
 * Hook to get widgets that should be collapsed by default on mobile.
 */
export function useMobileCollapsedWidgets(
  data: DashboardSummary | null
): WidgetConfig[] {
  const widgets = useDashboardWidgets(data);

  return useMemo(
    () =>
      widgets.filter(
        (w) => w.collapsedByDefault || w.mobilePriority === 'low'
      ),
    [widgets]
  );
}

/**
 * Utility to get widget data from DashboardSummary by widget config.
 */
export function getWidgetData<K extends keyof DashboardSummary>(
  config: WidgetConfig,
  data: DashboardSummary | null
): DashboardSummary[K] | undefined {
  if (!config.dataKey || !data) return undefined;
  return data[config.dataKey as K] as DashboardSummary[K];
}
