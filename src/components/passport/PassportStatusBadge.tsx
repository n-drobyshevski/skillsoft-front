'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CheckCircle2, Clock, FileX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

// ============================================================================
// Types
// ============================================================================

export type PassportStatus = 'valid' | 'expired' | 'none';

export interface PassportStatusBadgeProps {
  /** Current passport status */
  status: PassportStatus;
  /** When the passport expires */
  expiresAt?: string | null;
  /** When the passport was last updated */
  lastUpdated?: string | null;
  /** Number of competencies in passport */
  competencyCount?: number;
  /** Badge size */
  size?: 'sm' | 'md';
  /** Whether to show tooltip with details */
  showTooltip?: boolean;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// Status Configuration
// ============================================================================

const STATUS_CONFIG = {
  valid: {
    Icon: CheckCircle2,
    label: 'Паспорт активен',
    shortLabel: 'Активен',
    className: cn(
      'bg-emerald-100 dark:bg-emerald-950/40',
      'border-emerald-300 dark:border-emerald-800',
      'text-emerald-700 dark:text-emerald-300'
    ),
  },
  expired: {
    Icon: Clock,
    label: 'Паспорт истёк',
    shortLabel: 'Истёк',
    className: cn(
      'bg-amber-100 dark:bg-amber-950/40',
      'border-amber-300 dark:border-amber-800',
      'text-amber-700 dark:text-amber-300'
    ),
  },
  none: {
    Icon: FileX,
    label: 'Нет паспорта',
    shortLabel: 'Нет',
    className: cn(
      'bg-neutral-100 dark:bg-neutral-800/40',
      'border-neutral-300 dark:border-neutral-700',
      'text-neutral-600 dark:text-neutral-400'
    ),
  },
} as const;

const SIZE_CONFIG = {
  sm: {
    badge: 'h-5 px-1.5 text-[10px] gap-1',
    icon: 'h-3 w-3',
  },
  md: {
    badge: 'h-6 px-2 text-xs gap-1.5',
    icon: 'h-3.5 w-3.5',
  },
} as const;

// ============================================================================
// Component
// ============================================================================

export function PassportStatusBadge({
  status,
  expiresAt,
  lastUpdated,
  competencyCount,
  size = 'md',
  showTooltip = true,
  className,
}: PassportStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.Icon;

  const badge = (
    <Badge
      variant="outline"
      role="status"
      aria-label={`${config.label}${competencyCount ? `. ${competencyCount} компетенций измерено` : ''}`}
      className={cn(
        'inline-flex items-center font-medium border',
        config.className,
        sizeConfig.badge,
        className
      )}
    >
      <Icon className={cn(sizeConfig.icon, 'shrink-0')} />
      <span>{size === 'sm' ? config.shortLabel : config.label}</span>
      {competencyCount !== undefined && competencyCount > 0 && size === 'md' && (
        <>
          <span className="text-current/50">|</span>
          <span className="tabular-nums">{competencyCount}</span>
        </>
      )}
    </Badge>
  );

  if (!showTooltip || status === 'none') {
    return badge;
  }

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent className="text-sm">
        <div className="space-y-1">
          <p className="font-medium">{config.label}</p>
          {lastUpdated && (
            <p className="text-muted-foreground">
              Обновлён:{' '}
              {formatDistanceToNow(new Date(lastUpdated), {
                addSuffix: true,
                locale: ru,
              })}
            </p>
          )}
          {expiresAt && status === 'valid' && (
            <p className="text-muted-foreground">
              Истекает:{' '}
              {formatDistanceToNow(new Date(expiresAt), {
                addSuffix: true,
                locale: ru,
              })}
            </p>
          )}
          {competencyCount !== undefined && competencyCount > 0 && (
            <p className="text-muted-foreground">
              Компетенций: {competencyCount}
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// ============================================================================
// Helper to derive status from passport data
// ============================================================================

export function getPassportStatus(
  passport: { isValid?: boolean; expiresAt?: string | null } | null
): PassportStatus {
  if (!passport) return 'none';
  if (!passport.isValid) return 'expired';

  // Check if expiring soon (within 7 days)
  if (passport.expiresAt) {
    const expiresAt = new Date(passport.expiresAt);
    const now = new Date();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    if (expiresAt.getTime() - now.getTime() < sevenDaysMs) {
      // Still valid but expiring soon - could add 'expiring' status
    }
  }

  return 'valid';
}

export default PassportStatusBadge;
