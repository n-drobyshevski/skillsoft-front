'use client';

import { Badge } from '@/components/ui/badge';
import { ItemValidityStatus } from '@/types/psychometrics';
import { cn } from '@/lib/utils';
import { useEnumTranslation } from '@/hooks/useEnumTranslation';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';

interface ValidityStatusBadgeProps {
  status: ItemValidityStatus | string;
  className?: string;
  /** Show the text label alongside the icon */
  showLabel?: boolean;
  /** Show the icon */
  showIcon?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

// Default fallback for unknown statuses
const DEFAULT_STATUS_CONFIG = {
  color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800',
  icon: HelpCircle,
};

// Color mapping for each status with accessible contrast
const statusColorMap: Record<string, string> = {
  [ItemValidityStatus.ACTIVE]: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  [ItemValidityStatus.PROBATION]: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  [ItemValidityStatus.FLAGGED_FOR_REVIEW]: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  [ItemValidityStatus.RETIRED]: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  // Additional status mappings that might come from the backend
  'VALID': 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  'PENDING': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  'NEEDS_REVIEW': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  'FLAGGED': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
};

// Icon mapping for colorblind accessibility (shape + color)
const statusIconMap: Record<string, LucideIcon> = {
  [ItemValidityStatus.ACTIVE]: CheckCircle2,
  [ItemValidityStatus.PROBATION]: Clock,
  [ItemValidityStatus.FLAGGED_FOR_REVIEW]: AlertTriangle,
  [ItemValidityStatus.RETIRED]: XCircle,
  // Additional status mappings
  'VALID': CheckCircle2,
  'PENDING': Clock,
  'NEEDS_REVIEW': AlertTriangle,
  'FLAGGED': AlertTriangle,
};


// Size configuration
const sizeConfig = {
  sm: {
    badge: 'text-xs px-1.5 py-0.5',
    icon: 'h-3 w-3',
    gap: 'gap-1',
  },
  md: {
    badge: 'text-xs px-2 py-0.5',
    icon: 'h-3.5 w-3.5',
    gap: 'gap-1.5',
  },
  lg: {
    badge: 'text-sm px-2.5 py-1',
    icon: 'h-4 w-4',
    gap: 'gap-2',
  },
};

/**
 * ValidityStatusBadge - Accessible status indicator for psychometric items
 *
 * Features:
 * - Icons for each status (supports colorblind users with shape + color)
 * - Proper aria-labels for screen readers
 * - Responsive sizing
 * - Tooltip with full description
 * - Graceful fallback for unknown statuses
 * - i18n support via useEnumTranslation
 */
export function ValidityStatusBadge({
  status,
  className,
  showLabel = true,
  showIcon = true,
  size = 'md',
}: ValidityStatusBadgeProps) {
  const { translateWithDescription } = useEnumTranslation<ItemValidityStatus>('itemValidityStatus');

  // Get config with fallbacks for unknown statuses
  const statusKey = String(status);
  const { label, description } = translateWithDescription(statusKey as ItemValidityStatus);
  const Icon = statusIconMap[statusKey] || DEFAULT_STATUS_CONFIG.icon;
  const colorClasses = statusColorMap[statusKey] || DEFAULT_STATUS_CONFIG.color;
  const sizeStyles = sizeConfig[size];

  return (
    <Badge
      variant="outline"
      className={cn(
        colorClasses,
        sizeStyles.badge,
        showIcon && showLabel && sizeStyles.gap,
        'inline-flex items-center',
        className
      )}
      title={description}
      aria-label={`${label}${description ? `: ${description}` : ''}`}
      role="status"
    >
      {showIcon && (
        <Icon
          className={cn(sizeStyles.icon, 'shrink-0')}
          aria-hidden="true"
        />
      )}
      {showLabel && <span>{label}</span>}
    </Badge>
  );
}

/**
 * ValidityStatusIcon - Icon-only variant for compact displays
 */
export function ValidityStatusIcon({
  status,
  className,
  size = 'md',
}: Omit<ValidityStatusBadgeProps, 'showLabel' | 'showIcon'>) {
  const { translateWithDescription } = useEnumTranslation<ItemValidityStatus>('itemValidityStatus');

  const statusKey = String(status);
  const { label, description } = translateWithDescription(statusKey as ItemValidityStatus);
  const Icon = statusIconMap[statusKey] || DEFAULT_STATUS_CONFIG.icon;
  const sizeStyles = sizeConfig[size];

  // Icon color classes (without background)
  const iconColorMap: Record<string, string> = {
    [ItemValidityStatus.ACTIVE]: 'text-emerald-600 dark:text-emerald-400',
    [ItemValidityStatus.PROBATION]: 'text-amber-600 dark:text-amber-400',
    [ItemValidityStatus.FLAGGED_FOR_REVIEW]: 'text-orange-600 dark:text-orange-400',
    [ItemValidityStatus.RETIRED]: 'text-red-600 dark:text-red-400',
    'VALID': 'text-emerald-600 dark:text-emerald-400',
    'PENDING': 'text-amber-600 dark:text-amber-400',
    'NEEDS_REVIEW': 'text-orange-600 dark:text-orange-400',
    'FLAGGED': 'text-orange-600 dark:text-orange-400',
  };

  const iconColor = iconColorMap[statusKey] || 'text-slate-600 dark:text-slate-400';

  return (
    <span
      title={description}
      aria-label={`${label}${description ? `: ${description}` : ''}`}
      role="img"
    >
      <Icon
        className={cn(sizeStyles.icon, iconColor, className)}
        aria-hidden="true"
      />
    </span>
  );
}
