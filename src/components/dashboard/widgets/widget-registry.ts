/**
 * Widget Registry - Configuration for dashboard widgets.
 *
 * Defines which widgets appear for each lens/role combination,
 * their layout properties, and data dependencies.
 */

import type { LensType } from '@/store/lens-store';
import type { GridSpan } from '../layout/DashboardGrid';
import type { WidgetPriority } from '@/types/dashboard';
import type { DashboardSummary } from '@/types/dashboard';

/**
 * Widget configuration in the registry.
 */
export interface WidgetConfig {
  /** Unique widget identifier */
  id: string;

  /** Display title */
  title: string;

  // Visibility
  /** Which lenses can see this widget */
  lenses: LensType[];

  /** Minimum role required (optional) */
  minRole?: 'USER' | 'EDITOR' | 'ADMIN';

  // Layout
  /** Grid span configuration */
  gridSpan: GridSpan;

  /** Priority for display ordering (lower = higher priority) */
  priority: number;

  /** Mobile priority for collapsing */
  mobilePriority?: WidgetPriority;

  // Data
  /** Key in DashboardSummary for this widget's data */
  dataKey?: keyof DashboardSummary;

  /** Whether the widget requires data to be shown */
  requiresData?: boolean;

  /** Whether the widget should be collapsed by default on mobile */
  collapsedByDefault?: boolean;
}

/**
 * Widget Registry - All available dashboard widgets.
 *
 * Widgets are rendered in priority order within each lens view.
 * Priority 1-10: Critical widgets (stats, alerts)
 * Priority 11-20: Primary content widgets
 * Priority 21-30: Secondary widgets
 * Priority 31-40: Tertiary/support widgets
 * Priority 41+: Low priority widgets
 */
export const WIDGET_REGISTRY: Record<string, WidgetConfig> = {
  // ===== CORE WIDGETS (All Lenses) =====

  'stats-cards': {
    id: 'stats-cards',
    title: 'Overview Stats',
    lenses: ['admin', 'editor', 'user'],
    gridSpan: { mobile: 2, tablet: 4, desktop: 12 },
    priority: 1,
    mobilePriority: 'high',
  },

  'competency-chart': {
    id: 'competency-chart',
    title: 'Competency Distribution',
    lenses: ['admin', 'editor', 'user'],
    gridSpan: { mobile: 2, tablet: 4, desktop: 8 },
    priority: 5,
    mobilePriority: 'medium',
  },

  // ===== ADMIN/EDITOR WIDGETS =====

  'psychometric-insights': {
    id: 'psychometric-insights',
    title: 'Psychometric Health',
    lenses: ['admin', 'editor'],
    minRole: 'EDITOR',
    gridSpan: { mobile: 2, tablet: 4, desktop: 4 },
    priority: 10,
    mobilePriority: 'high',
    dataKey: 'psychometrics',
    requiresData: true,
  },

  'test-results-overview': {
    id: 'test-results-overview',
    title: 'Recent Completions',
    lenses: ['admin', 'editor'],
    minRole: 'EDITOR',
    gridSpan: { mobile: 2, tablet: 4, desktop: 4 },
    priority: 15,
    mobilePriority: 'medium',
    dataKey: 'recentCompletions',
    requiresData: true,
  },

  'user-stats': {
    id: 'user-stats',
    title: 'Users',
    lenses: ['admin'],
    minRole: 'ADMIN',
    gridSpan: { mobile: 2, tablet: 2, desktop: 3 },
    priority: 30,
    mobilePriority: 'low',
    dataKey: 'userStats',
    requiresData: true,
    collapsedByDefault: true,
  },

  'framework-progress': {
    id: 'framework-progress',
    title: 'Framework Progress',
    lenses: ['admin', 'editor'],
    gridSpan: { mobile: 2, tablet: 2, desktop: 4 },
    priority: 40,
    mobilePriority: 'low',
    collapsedByDefault: true,
  },

  'quick-actions': {
    id: 'quick-actions',
    title: 'Quick Actions',
    lenses: ['admin', 'editor'],
    gridSpan: { mobile: 2, tablet: 2, desktop: 4 },
    priority: 35,
    mobilePriority: 'medium',
  },

  'recent-activity': {
    id: 'recent-activity',
    title: 'Recent Activity',
    lenses: ['admin', 'editor'],
    gridSpan: { mobile: 2, tablet: 2, desktop: 4 },
    priority: 45,
    mobilePriority: 'low',
    collapsedByDefault: true,
  },

  'active-assessments': {
    id: 'active-assessments',
    title: 'Active Assessments',
    lenses: ['admin', 'editor', 'user'],
    gridSpan: { mobile: 2, tablet: 4, desktop: 8 },
    priority: 50,
    mobilePriority: 'medium',
    dataKey: 'activeTemplates',
    requiresData: true,
  },

  // ===== USER-SPECIFIC WIDGETS =====

  'pending-assessments': {
    id: 'pending-assessments',
    title: 'Pending Assessments',
    lenses: ['user'],
    gridSpan: { mobile: 2, tablet: 4, desktop: 12 },
    priority: 2, // Very high priority for users
    mobilePriority: 'high',
    dataKey: 'pendingSessions',
    requiresData: true,
  },

  'my-results': {
    id: 'my-results',
    title: 'My Results',
    lenses: ['user'],
    gridSpan: { mobile: 2, tablet: 4, desktop: 6 },
    priority: 3,
    mobilePriority: 'high',
  },

  // ===== FUTURE WIDGETS (Placeholder) =====

  'team-analytics': {
    id: 'team-analytics',
    title: 'Team Analytics',
    lenses: ['admin', 'editor'],
    minRole: 'EDITOR',
    gridSpan: { mobile: 2, tablet: 4, desktop: 4 },
    priority: 20,
    mobilePriority: 'medium',
    dataKey: 'teamAnalytics',
    requiresData: true,
    collapsedByDefault: true,
  },

  'job-fit-summary': {
    id: 'job-fit-summary',
    title: 'Job Fit Overview',
    lenses: ['admin', 'editor'],
    minRole: 'EDITOR',
    gridSpan: { mobile: 2, tablet: 4, desktop: 4 },
    priority: 25,
    mobilePriority: 'medium',
    dataKey: 'jobFitSummary',
    requiresData: true,
    collapsedByDefault: true,
  },
};

/**
 * Get all widget IDs for a specific lens
 */
export function getWidgetIdsForLens(lens: LensType): string[] {
  return Object.values(WIDGET_REGISTRY)
    .filter((config) => config.lenses.includes(lens))
    .sort((a, b) => a.priority - b.priority)
    .map((config) => config.id);
}

/**
 * Get widget config by ID
 */
export function getWidgetConfig(id: string): WidgetConfig | undefined {
  return WIDGET_REGISTRY[id];
}

/**
 * Mobile widget order (by priority for mobile display)
 */
export const MOBILE_WIDGET_ORDER: string[] = [
  'pending-assessments', // User: top priority
  'stats-cards', // Always visible
  'psychometric-insights', // Admin/Editor: critical metric
  'my-results', // User: personal results
  'competency-chart', // Visual summary
  'active-assessments', // Available tests
  'quick-actions', // Important actions
  'test-results-overview', // Completions overview
  'recent-activity', // Collapsed by default
  'user-stats', // Admin: collapsed
  'team-analytics', // Future: collapsed
  'job-fit-summary', // Future: collapsed
  'framework-progress', // Collapsed
];
