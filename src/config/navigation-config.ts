/**
 * Navigation Configuration Types
 *
 * Defines the TypeScript interfaces for the NavigationConfig pattern.
 * This provides a type-safe, configuration-driven navigation system.
 *
 * Part of UX Navigation Redesign - See docs/UX_STRATEGY.md
 */

import { LensType } from "@/store/lens-store";

/**
 * Badge configuration for navigation items
 */
export interface BadgeConfig {
  /** Static text or dynamic key for count lookup */
  content: string | { type: "count"; key: string };
  /** Badge color variant */
  variant: "default" | "secondary" | "destructive" | "outline" | "warning";
  /** Only show badge when value > 0 */
  hideWhenZero?: boolean;
}

/**
 * Child navigation item (simplified)
 */
export interface NavigationChildItem {
  id: string;
  path: string;
  /** Translation key for the label (i18n) */
  labelKey: string;
  /** @deprecated Use labelKey instead - kept for migration */
  label?: string;
  /** @deprecated Use labelKey instead - kept for migration */
  labelEn?: string;
  icon?: string;
  badge?: BadgeConfig;
  lenses?: LensType[];
}

/**
 * Individual navigation item
 */
export interface NavigationItem {
  /** Unique identifier */
  id: string;
  /** URL path or external URL */
  path: string;
  /** Translation key for the label (i18n) */
  labelKey: string;
  /** @deprecated Use labelKey instead - kept for migration */
  label?: string;
  /** @deprecated Use labelKey instead - kept for migration */
  labelEn?: string;
  /** Lucide icon name */
  icon: string;
  /** Optional badge */
  badge?: BadgeConfig;
  /** Override group lens visibility */
  lenses?: LensType[];
  /** Nested child items (one level only) */
  children?: NavigationChildItem[];
  /** Whether item is new feature */
  isNew?: boolean;
  /** Keyboard shortcut hint */
  shortcut?: string;
  /** Whether link opens in new tab (external URL) */
  isExternal?: boolean;
}

/**
 * Navigation group containing related items
 */
export interface NavigationGroup {
  /** Unique identifier */
  id: string;
  /** Translation key for the label (i18n) */
  labelKey: string;
  /** @deprecated Use labelKey instead - kept for migration */
  label?: string;
  /** @deprecated Use labelKey instead - kept for migration */
  labelEn?: string;
  /** Optional icon for collapsed state */
  icon?: string;
  /** Which lenses see this group */
  lenses: LensType[];
  /** Navigation items */
  items: NavigationItem[];
  /** Whether group can be collapsed */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Separator after group */
  hasSeparator?: boolean;
}

/**
 * Complete navigation configuration
 */
export interface NavigationConfig {
  /** Configuration version */
  version: string;
  /** All navigation groups */
  groups: NavigationGroup[];
  /** Footer items (always visible) */
  footer?: NavigationItem[];
}

/**
 * Badge counts for dynamic badge content
 */
export interface BadgeCounts {
  inProgressTests?: number;
  sharedTemplates?: number;
  pendingCompetencies?: number;
  flaggedItems?: number;
  newUsers?: number;
}
