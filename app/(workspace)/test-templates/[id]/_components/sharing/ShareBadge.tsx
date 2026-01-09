/* eslint-disable security/detect-object-injection -- Safe: accessing typed Record with enum keys */
'use client';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Users, Share2, Eye, Edit, Settings2, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SharePermission,
  TemplateVisibility,
  getPermissionDisplayText,
  getVisibilityDisplayText,
} from '@/types/domain';

// ============================================
// ShareBadge - Compact indicator for shared items
// ============================================

interface ShareBadgeProps {
  /** Type of share indicator to show */
  variant?: 'shared' | 'permission' | 'visibility' | 'count';
  /** Permission level (for 'permission' variant) */
  permission?: SharePermission;
  /** Visibility status (for 'visibility' variant) */
  visibility?: TemplateVisibility;
  /** Share count (for 'count' variant) */
  count?: number;
  /** Size variant */
  size?: 'sm' | 'default';
  /** Show tooltip with details */
  showTooltip?: boolean;
  /** Additional className */
  className?: string;
}

const permissionConfig: Record<
  SharePermission,
  { icon: typeof Eye; color: string; bgColor: string }
> = {
  [SharePermission.VIEW]: {
    icon: Eye,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-950/50',
  },
  [SharePermission.EDIT]: {
    icon: Edit,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-950/50',
  },
  [SharePermission.MANAGE]: {
    icon: Settings2,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-950/50',
  },
};

const visibilityConfig: Record<
  TemplateVisibility,
  { icon: typeof Share2; color: string; bgColor: string }
> = {
  [TemplateVisibility.PRIVATE]: {
    icon: Users,
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-950/50',
  },
  [TemplateVisibility.PUBLIC]: {
    icon: Share2,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-950/50',
  },
  [TemplateVisibility.LINK]: {
    icon: Link2,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-950/50',
  },
};

/**
 * ShareBadge - Visual indicator for shared items
 *
 * Variants:
 * - 'shared': Simple "Shared with you" indicator
 * - 'permission': Shows permission level (VIEW/EDIT/MANAGE)
 * - 'visibility': Shows visibility status (PRIVATE/PUBLIC/LINK)
 * - 'count': Shows number of shares
 *
 * @example
 * ```tsx
 * <ShareBadge variant="shared" />
 * <ShareBadge variant="permission" permission={SharePermission.VIEW} />
 * <ShareBadge variant="count" count={5} />
 * ```
 */
export function ShareBadge({
  variant = 'shared',
  permission,
  visibility,
  count,
  size = 'default',
  showTooltip = true,
  className,
}: ShareBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-xs px-1.5 py-0' : 'text-xs px-2 py-0.5';

  // Render based on variant
  let badgeContent: React.ReactNode;
  let tooltipContent: string;
  let bgColor = 'bg-muted';
  let textColor = 'text-muted-foreground';

  switch (variant) {
    case 'permission': {
      if (!permission) return null;
      const config = permissionConfig[permission];
      const Icon = config.icon;
      bgColor = config.bgColor;
      textColor = config.color;
      tooltipContent = `You have ${getPermissionDisplayText(permission).toLowerCase()} access`;
      badgeContent = (
        <>
          <Icon className={cn('h-3 w-3', config.color)} />
          <span className={config.color}>{getPermissionDisplayText(permission)}</span>
        </>
      );
      break;
    }

    case 'visibility': {
      if (!visibility) return null;
      const config = visibilityConfig[visibility];
      const Icon = config.icon;
      bgColor = config.bgColor;
      textColor = config.color;
      tooltipContent = getVisibilityDisplayText(visibility);
      badgeContent = (
        <>
          <Icon className={cn('h-3 w-3', config.color)} />
          <span className={config.color}>{getVisibilityDisplayText(visibility)}</span>
        </>
      );
      break;
    }

    case 'count': {
      if (count === undefined || count === 0) return null;
      bgColor = 'bg-violet-100 dark:bg-violet-950/50';
      textColor = 'text-violet-600 dark:text-violet-400';
      tooltipContent = `Shared with ${count} ${count === 1 ? 'person' : 'people'}`;
      badgeContent = (
        <>
          <Users className="h-3 w-3" />
          <span>{count}</span>
        </>
      );
      break;
    }

    case 'shared':
    default: {
      bgColor = 'bg-indigo-100 dark:bg-indigo-950/50';
      textColor = 'text-indigo-600 dark:text-indigo-400';
      tooltipContent = 'This template has been shared with you';
      badgeContent = (
        <>
          <Share2 className="h-3 w-3" />
          <span>Shared</span>
        </>
      );
      break;
    }
  }

  const badge = (
    <Badge
      variant="secondary"
      className={cn(
        'gap-1 font-normal',
        bgColor,
        textColor,
        sizeClasses,
        className
      )}
    >
      {badgeContent}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================
// SharedByBadge - Shows who shared an item
// ============================================

interface SharedByBadgeProps {
  /** Name of the person who shared */
  sharedBy: string;
  /** Avatar URL */
  avatarUrl?: string;
  /** Date shared */
  sharedAt?: string;
  /** Size variant */
  size?: 'sm' | 'default';
  /** Additional className */
  className?: string;
}

/**
 * SharedByBadge - Shows attribution for shared item
 *
 * @example
 * ```tsx
 * <SharedByBadge sharedBy="John Doe" sharedAt="2024-01-15" />
 * ```
 */
export function SharedByBadge({
  sharedBy,
  sharedAt,
  size = 'default',
  className,
}: SharedByBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className={cn('flex items-center gap-1.5', sizeClasses, className)}>
      <span className="text-muted-foreground">Shared by</span>
      <span className="font-medium text-foreground">{sharedBy}</span>
      {sharedAt && (
        <span className="text-muted-foreground">
          · {new Date(sharedAt).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}

// ============================================
// ShareIndicator - Minimal icon-only indicator
// ============================================

interface ShareIndicatorProps {
  /** Whether the item is shared */
  isShared?: boolean;
  /** Permission level */
  permission?: SharePermission;
  /** Size of icon */
  size?: 'sm' | 'default' | 'lg';
  /** Additional className */
  className?: string;
}

/**
 * ShareIndicator - Minimal icon for shared status
 *
 * Use this when space is limited (e.g., in table cells)
 *
 * @example
 * ```tsx
 * <ShareIndicator isShared />
 * <ShareIndicator permission={SharePermission.EDIT} />
 * ```
 */
export function ShareIndicator({
  isShared = true,
  permission,
  size = 'default',
  className,
}: ShareIndicatorProps) {
  if (!isShared && !permission) return null;

  const sizeClasses = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  if (permission) {
    const config = permissionConfig[permission];
    const Icon = config.icon;
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Icon className={cn(sizeClasses[size], config.color, className)} />
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {getPermissionDisplayText(permission)} access
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Share2
            className={cn(
              sizeClasses[size],
              'text-indigo-500',
              className
            )}
          />
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          Shared with you
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
