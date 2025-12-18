'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { WidgetPriority } from '@/types/dashboard';

/**
 * Base props for all widget cards.
 * Provides consistent styling and behavior across dashboard widgets.
 */
export interface WidgetCardProps {
  /** Widget title displayed in header */
  title: string;
  /** Optional subtitle below title */
  subtitle?: string;
  /** Optional icon component to display */
  icon?: React.ElementType;
  /** Link destination for the "View All" button */
  href?: string;
  /** Widget content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Custom actions to display in header */
  headerActions?: React.ReactNode;
  /** Priority for mobile ordering */
  priority?: WidgetPriority;
  /** Whether the widget is loading */
  loading?: boolean;
  /** Last updated timestamp */
  lastUpdated?: Date | string;
  /** Whether to show the timestamp */
  showTimestamp?: boolean;
}

/**
 * WidgetCard - Base widget wrapper for dashboard components.
 *
 * Provides consistent styling with:
 * - Icon + title header
 * - Optional subtitle
 * - "View All" navigation link
 * - Custom header actions
 * - Hover shadow effect
 * - Priority-based mobile ordering
 *
 * @example
 * ```tsx
 * <WidgetCard
 *   title="Recent Activity"
 *   icon={Activity}
 *   href="/activity"
 *   priority="medium"
 * >
 *   <ActivityFeed />
 * </WidgetCard>
 * ```
 */
export function WidgetCard({
  title,
  subtitle,
  icon: Icon,
  href,
  children,
  className,
  headerActions,
  priority = 'medium',
  loading = false,
  lastUpdated,
  showTimestamp = false,
}: WidgetCardProps) {
  return (
    <Card
      className={cn(
        'transition-shadow hover:shadow-md h-full',
        // Priority-based ordering (applies on mobile, reset on desktop)
        priority === 'high' && 'order-first md:order-none',
        priority === 'low' && 'order-last md:order-none',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            </div>
          )}
          <div>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showTimestamp && lastUpdated && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {formatTimeAgo(new Date(lastUpdated))}
            </span>
          )}
          {headerActions}
          {href && (
            <Link href={href}>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                aria-label={`View all ${title}`}
              >
                <ChevronRight className="w-4 h-4" />
                <span className="sr-only">View all {title}</span>
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn(loading && 'opacity-50 pointer-events-none')}>
        {children}
      </CardContent>
    </Card>
  );
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString();
}
