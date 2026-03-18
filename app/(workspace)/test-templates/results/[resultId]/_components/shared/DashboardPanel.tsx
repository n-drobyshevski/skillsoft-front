'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DashboardPanelProps } from './types';

// ============================================================================
// Icon variant class maps
// ============================================================================

const ICON_BG_CLASSES = {
  default: 'bg-muted',
  success: 'bg-emerald-100 dark:bg-emerald-900/30',
  warning: 'bg-amber-100 dark:bg-amber-900/30',
  info: 'bg-blue-100 dark:bg-blue-900/30',
} as const;

const ICON_TEXT_CLASSES = {
  default: 'text-muted-foreground',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-blue-600 dark:text-blue-400',
} as const;

// ============================================================================
// DashboardPanel — card wrapper applying dashboard design tokens
// ============================================================================

export function DashboardPanel({
  title,
  subtitle,
  icon: Icon,
  iconVariant = 'default',
  children,
  className,
  id,
}: DashboardPanelProps) {
  const iconBgClass = ICON_BG_CLASSES[iconVariant];
  const iconTextClass = ICON_TEXT_CLASSES[iconVariant];

  return (
    <Card
      id={id}
      className={cn(
        'rounded-xl shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200',
        className,
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                iconBgClass,
              )}
            >
              <Icon className={cn('w-4 h-4', iconTextClass)} />
            </div>
          )}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm font-semibold text-foreground mt-1 tracking-tight">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
