import { cn } from '@/lib/utils';

/**
 * Grid span configuration for responsive layouts
 */
export interface GridSpan {
  /** Columns on mobile (2-column grid) */
  mobile: 1 | 2;
  /** Columns on tablet (8-column grid) */
  tablet: 1 | 2 | 3 | 4;
  /** Columns on desktop (12-column grid) */
  desktop: 2 | 3 | 4 | 6 | 8 | 12;
}

interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * DashboardGrid - Bento grid container for dashboard widgets.
 *
 * Responsive grid system:
 * - Mobile: 2 columns
 * - Tablet (md): 8 columns
 * - Desktop (lg): 12 columns
 *
 * @example
 * ```tsx
 * <DashboardGrid>
 *   <div className={getGridSpanClass({ mobile: 2, tablet: 4, desktop: 4 })}>
 *     <StatsWidget />
 *   </div>
 * </DashboardGrid>
 * ```
 */
export function DashboardGrid({ children, className }: DashboardGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4 sm:gap-6',
        'grid-cols-2', // Mobile: 2 columns
        'md:grid-cols-8', // Tablet: 8 columns
        'lg:grid-cols-12', // Desktop: 12 columns
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Get Tailwind grid span classes from GridSpan configuration.
 *
 * Maps GridSpan values to responsive Tailwind classes:
 * - mobile: col-span-{1|2}
 * - tablet: md:col-span-{1-4}
 * - desktop: lg:col-span-{2-12}
 *
 * @example
 * ```tsx
 * const span = getGridSpanClass({ mobile: 2, tablet: 4, desktop: 4 });
 * // Returns: "col-span-2 md:col-span-4 lg:col-span-4"
 * ```
 */
export function getGridSpanClass(gridSpan: GridSpan): string {
  return cn(
    // Mobile: 2-column grid
    gridSpan.mobile === 2 ? 'col-span-2' : 'col-span-1',

    // Tablet: 8-column grid
    gridSpan.tablet === 4
      ? 'md:col-span-4'
      : gridSpan.tablet === 3
        ? 'md:col-span-3'
        : gridSpan.tablet === 2
          ? 'md:col-span-2'
          : 'md:col-span-1',

    // Desktop: 12-column grid
    gridSpan.desktop === 12
      ? 'lg:col-span-12'
      : gridSpan.desktop === 8
        ? 'lg:col-span-8'
        : gridSpan.desktop === 6
          ? 'lg:col-span-6'
          : gridSpan.desktop === 4
            ? 'lg:col-span-4'
            : gridSpan.desktop === 3
              ? 'lg:col-span-3'
              : 'lg:col-span-2'
  );
}

/**
 * Preset grid spans for common widget sizes
 */
export const GRID_SPANS = {
  /** Full width on all breakpoints */
  full: { mobile: 2, tablet: 4, desktop: 12 } as GridSpan,

  /** Stats row - full width for stats cards container */
  statsRow: { mobile: 2, tablet: 4, desktop: 12 } as GridSpan,

  /** Single stat card */
  statCard: { mobile: 1, tablet: 2, desktop: 3 } as GridSpan,

  /** Small widget (1/4 desktop width) */
  small: { mobile: 2, tablet: 2, desktop: 3 } as GridSpan,

  /** Medium widget (1/3 desktop width) */
  medium: { mobile: 2, tablet: 4, desktop: 4 } as GridSpan,

  /** Large widget (1/2 desktop width) */
  large: { mobile: 2, tablet: 4, desktop: 6 } as GridSpan,

  /** Extra large widget (2/3 desktop width) */
  xlarge: { mobile: 2, tablet: 4, desktop: 8 } as GridSpan,

  /** Chart widget - large but not full */
  chart: { mobile: 2, tablet: 4, desktop: 8 } as GridSpan,

  /** Sidebar widget */
  sidebar: { mobile: 2, tablet: 4, desktop: 4 } as GridSpan,
} as const;
