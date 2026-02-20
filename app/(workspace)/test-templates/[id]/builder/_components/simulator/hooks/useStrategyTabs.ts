/**
 * useStrategyTabs Hook
 *
 * Dynamically orders and filters tabs based on the current assessment strategy.
 * Uses the priority system defined in strategy-context.ts to ensure the most
 * relevant tabs appear first for each strategy type.
 */

import { useMemo } from 'react';
import {
  Strategy,
  StrategySection,
  STRATEGY_CONFIG,
  type StrategyContextData,
} from '../strategy-context';

export interface TabConfig {
  id: string;
  /** Hardcoded English fallback title */
  title: string;
  /** Translation key under builder.simulator.sections.* — use this for i18n rendering */
  titleKey: string;
  icon: string;
  defaultOpen: boolean;
  priority: number;
  isAvailable: boolean;
  requiresData?: 'onetSocCode' | 'teamId';
}

interface UseStrategyTabsOptions {
  strategy: Strategy;
  onetSocCode?: string;
  teamId?: string;
}

/**
 * Returns ordered tabs based on strategy priorities and data availability.
 *
 * For each strategy:
 * - UNIVERSAL_BASELINE: Timeline first, then Competency Balance, Analytics
 * - TARGETED_FIT: Job Alignment first (if O*NET set), then Timeline
 * - DYNAMIC_GAP_ANALYSIS: Team Comparison first (if team set), then Gap Analysis
 */
export function useStrategyTabs({
  strategy,
  onetSocCode,
  teamId,
}: UseStrategyTabsOptions): TabConfig[] {
  return useMemo(() => {
    const config = STRATEGY_CONFIG[strategy];
    if (!config) {
      return STRATEGY_CONFIG.UNIVERSAL_BASELINE.sections.map(sectionToTab);
    }

    const contextData: StrategyContextData = { onetSocCode, teamId };

    return config.sections
      .map((section) => ({
        ...sectionToTab(section),
        isAvailable: isSectionAvailable(section, contextData),
      }))
      .sort((a, b) => {
        // Available sections come first
        if (a.isAvailable !== b.isAvailable) {
          return a.isAvailable ? -1 : 1;
        }
        // Then sort by priority
        return a.priority - b.priority;
      });
  }, [strategy, onetSocCode, teamId]);
}

/**
 * Returns only the available (data requirements met) tabs in priority order.
 */
export function useAvailableStrategyTabs(
  options: UseStrategyTabsOptions
): TabConfig[] {
  const allTabs = useStrategyTabs(options);
  return useMemo(() => allTabs.filter((tab) => tab.isAvailable), [allTabs]);
}

/**
 * Returns the default tab ID for a strategy (the first available tab).
 */
export function useDefaultTab(options: UseStrategyTabsOptions): string {
  const availableTabs = useAvailableStrategyTabs(options);
  return availableTabs[0]?.id ?? 'timeline';
}

/**
 * Returns primary and secondary tabs split for mobile priority stack UI.
 * Primary = first available tab (always expanded)
 * Secondary = remaining tabs (collapsed accordion)
 */
export function useStrategyTabsSplit(options: UseStrategyTabsOptions) {
  const availableTabs = useAvailableStrategyTabs(options);

  return useMemo(() => {
    if (availableTabs.length === 0) {
      return { primary: null, secondary: [] };
    }

    const [primary, ...secondary] = availableTabs;
    return { primary, secondary };
  }, [availableTabs]);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function sectionToTab(section: StrategySection): TabConfig {
  return {
    id: section.id,
    title: section.title,
    titleKey: section.titleKey,
    icon: section.icon,
    defaultOpen: section.defaultOpen,
    priority: section.priority,
    requiresData: section.requiresData,
    isAvailable: true,
  };
}

function isSectionAvailable(
  section: StrategySection,
  contextData: StrategyContextData
): boolean {
  if (!section.requiresData) return true;

  switch (section.requiresData) {
    case 'onetSocCode':
      return !!contextData.onetSocCode;
    case 'teamId':
      return !!contextData.teamId;
    default:
      return true;
  }
}

/**
 * Map tab IDs to their corresponding lazy component names.
 * Used for dynamic component rendering.
 */
export const TAB_COMPONENT_MAP: Record<string, string> = {
  timeline: 'TimelineTab',
  insights: 'StrategyInsightsTab',
  analytics: 'AnalyticsTab',
  'job-alignment': 'StrategyInsightsTab', // Reuses insights with TARGETED_FIT
  'team-comparison': 'StrategyInsightsTab', // Reuses insights with DYNAMIC_GAP_ANALYSIS
  'gap-analysis': 'StrategyInsightsTab',
  'simulated-results': 'SimulatedResultsTab',
  finetune: 'FineTuneTab',
  fine: 'FineTuneTab',
};

/**
 * Returns the actual component type for a tab ID.
 * Handles aliases (e.g., 'job-alignment' -> 'insights' component)
 */
export function getTabComponentType(tabId: string): string {
  return TAB_COMPONENT_MAP[tabId] ?? 'TimelineTab';
}
