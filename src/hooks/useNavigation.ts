/**
 * useNavigation Hook
 *
 * Provides lens-filtered navigation data from the NavigationConfig.
 * Consumes the lens-store to filter groups and items based on the active lens.
 *
 * Part of UX Navigation Redesign - See docs/UX_STRATEGY.md
 */

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useLensStore, LensType } from "@/store/lens-store";
import {
  NavigationGroup,
  NavigationItem,
  BadgeCounts,
} from "@/config/navigation-config";
import { NAVIGATION_CONFIG } from "@/config/navigation-data";

/**
 * Hook return type
 */
export interface UseNavigationReturn {
  /** Filtered navigation groups based on active lens */
  groups: NavigationGroup[];
  /** Footer navigation items */
  footer: NavigationItem[];
  /** Current active lens */
  activeLens: LensType;
  /** Whether lens is ready (hydrated) */
  isReady: boolean;
}

/**
 * Filter navigation items based on lens visibility
 */
function filterItemsByLens(
  items: NavigationItem[],
  activeLens: LensType,
  groupLenses: LensType[]
): NavigationItem[] {
  return items.filter((item) => {
    // If item has its own lenses defined, use those
    const lenses = item.lenses ?? groupLenses;
    return lenses.includes(activeLens);
  });
}

/**
 * Filter navigation groups based on lens visibility
 */
function filterGroupsByLens(
  groups: NavigationGroup[],
  activeLens: LensType
): NavigationGroup[] {
  return groups
    .filter((group) => group.lenses.includes(activeLens))
    .map((group) => ({
      ...group,
      items: filterItemsByLens(group.items, activeLens, group.lenses),
    }))
    .filter((group) => group.items.length > 0);
}

/**
 * Main navigation hook
 *
 * Returns filtered navigation groups and items based on the active lens.
 *
 * @example
 * ```tsx
 * function Sidebar() {
 *   const { groups, footer, activeLens, isReady } = useNavigation();
 *
 *   if (!isReady) return <LoadingSkeleton />;
 *
 *   return (
 *     <nav>
 *       {groups.map(group => (
 *         <NavigationGroup key={group.id} group={group} />
 *       ))}
 *     </nav>
 *   );
 * }
 * ```
 */
export function useNavigation(): UseNavigationReturn {
  const activeLens = useLensStore((state) => state.activeLens);
  const isHydrated = useLensStore((state) => state.isHydrated);
  const isInitialized = useLensStore((state) => state.isInitialized);

  const isReady = isHydrated && isInitialized;

  const filteredGroups = isReady
    ? filterGroupsByLens(NAVIGATION_CONFIG.groups, activeLens)
    : [];

  const footer = NAVIGATION_CONFIG.footer ?? [];

  return {
    groups: filteredGroups,
    footer,
    activeLens,
    isReady,
  };
}

/**
 * Hook to get badge counts for navigation items
 *
 * This hook should be connected to your data layer to provide
 * real-time badge counts for navigation items.
 *
 * @example
 * ```tsx
 * function NavigationBadge({ badgeConfig }: Props) {
 *   const counts = useNavigationBadgeCounts();
 *
 *   if (typeof badgeConfig.content === 'string') {
 *     return <Badge>{badgeConfig.content}</Badge>;
 *   }
 *
 *   const count = counts[badgeConfig.content.key];
 *   if (badgeConfig.hideWhenZero && !count) return null;
 *
 *   return <Badge variant={badgeConfig.variant}>{count}</Badge>;
 * }
 * ```
 */
export function useNavigationBadgeCounts(): BadgeCounts {
  const { userId } = useAuth();
  const [counts, setCounts] = useState<BadgeCounts>({});

  useEffect(() => {
    if (!userId) return;

    const fetchCounts = async () => {
      try {
        const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const baseUrl = apiUrl
          ? `${apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1') ? 'http' : 'https'}://${apiUrl}/api/${apiVersion}`
          : `http://localhost:8080/api/${apiVersion}`;

        const response = await fetch(
          `${baseUrl}/stats/navigation-badges?clerkUserId=${encodeURIComponent(userId)}`,
          { headers: { 'X-User-Id': userId }, mode: 'cors', credentials: 'include' }
        );

        if (response.ok) {
          const data = await response.json() as BadgeCounts;
          setCounts(data);
        }
      } catch {
        // Silently fail — return default empty counts
      }
    };

    void fetchCounts();
    const interval = setInterval(() => { void fetchCounts(); }, 60_000);
    return () => clearInterval(interval);
  }, [userId]);

  return counts;
}

/**
 * Check if a navigation item is active based on current pathname
 */
export function isNavigationItemActive(
  itemPath: string,
  currentPath: string
): boolean {
  // Exact match
  if (currentPath === itemPath) return true;

  // Child route match (e.g., /hr/competencies/123 matches /hr/competencies)
  if (currentPath.startsWith(itemPath + "/")) return true;

  return false;
}

/**
 * Get all paths from navigation config for route matching
 */
export function getAllNavigationPaths(): string[] {
  const paths: string[] = [];

  NAVIGATION_CONFIG.groups.forEach((group) => {
    group.items.forEach((item) => {
      paths.push(item.path);
      if (item.children) {
        item.children.forEach((child) => {
          paths.push(child.path);
        });
      }
    });
  });

  if (NAVIGATION_CONFIG.footer) {
    NAVIGATION_CONFIG.footer.forEach((item) => {
      paths.push(item.path);
    });
  }

  return [...new Set(paths)]; // Remove duplicates
}
