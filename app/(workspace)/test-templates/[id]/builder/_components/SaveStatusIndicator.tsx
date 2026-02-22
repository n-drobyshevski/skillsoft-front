'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Loader2, Cloud, CloudOff, RefreshCw, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { SaveStatus } from '@/hooks/useAutoSave';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  /** Compact mode for mobile */
  compact?: boolean;
  /** Current retry attempt (for 'retrying' status) */
  retryAttempt?: number;
  className?: string;
}

function formatTimeAgo(date: Date, t: ReturnType<typeof useTranslations>): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 5) return t('timeAgo.justNow');
  if (seconds < 60) return t('timeAgo.secondsAgo', { seconds });
  if (seconds < 3600) return t('timeAgo.minutesAgo', { minutes: Math.floor(seconds / 60) });
  if (seconds < 86400) return t('timeAgo.hoursAgo', { hours: Math.floor(seconds / 3600) });
  return date.toLocaleDateString();
}

const statusIconConfig: Record<
  SaveStatus,
  {
    icon: React.ElementType;
    color: string;
    animate?: boolean;
  }
> = {
  idle: {
    icon: Cloud,
    color: 'text-muted-foreground',
  },
  pending: {
    icon: Cloud,
    color: 'text-amber-500',
  },
  saving: {
    icon: Loader2,
    color: 'text-primary',
    animate: true,
  },
  saved: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
  },
  error: {
    icon: AlertCircle,
    color: 'text-destructive',
  },
  offline: {
    icon: WifiOff,
    color: 'text-amber-600',
  },
  retrying: {
    icon: RefreshCw,
    color: 'text-primary',
    animate: true,
  },
};

function useStatusLabels() {
  const t = useTranslations('builder.saveStatus');
  return {
    idle: t('allChangesSaved'),
    pending: t('unsavedChanges'),
    saving: t('saving'),
    saved: t('saved'),
    error: t('saveFailed'),
    offline: t('offline'),
    retrying: t('retrying'),
  } as Record<SaveStatus, string>;
}

export function SaveStatusIndicator({
  status,
  lastSaved,
  hasUnsavedChanges,
  compact = false,
  retryAttempt = 0,
  className,
}: SaveStatusIndicatorProps) {
  const t = useTranslations('builder.saveStatus');
  const statusLabels = useStatusLabels();

  // Determine effective status for display
  const effectiveStatus = hasUnsavedChanges && status === 'idle' ? 'pending' : status;
  const effectiveConfig = statusIconConfig[effectiveStatus];
  const EffectiveIcon = effectiveConfig.icon;

  // Generate label based on status
  const getLabel = () => {
    if (effectiveStatus === 'saved' && lastSaved) {
      return t('savedAgo', { time: formatTimeAgo(lastSaved, t) });
    }
    if (effectiveStatus === 'pending') {
      return t('unsaved');
    }
    if (effectiveStatus === 'retrying' && retryAttempt > 0) {
      return t('retryingProgress', { attempt: retryAttempt });
    }
    if (effectiveStatus === 'offline') {
      return t('offlineShort');
    }
    return statusLabels[effectiveStatus];
  };

  const content = (
    <div
      className={cn(
        'flex items-center gap-1.5 transition-all duration-200',
        className
      )}
    >
      <EffectiveIcon
        className={cn(
          'h-4 w-4',
          effectiveConfig.color,
          effectiveConfig.animate && 'animate-spin'
        )}
      />
      {compact ? (
        <span className={cn('text-[10px]', effectiveConfig.color)}>
          {statusLabels[effectiveStatus]}
        </span>
      ) : (
        <span className={cn('text-xs', effectiveConfig.color)}>
          {getLabel()}
        </span>
      )}
    </div>
  );

  // On mobile (compact), wrap in tooltip for more info
  if (compact) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">{content}</div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <div className="flex flex-col gap-1">
              <span className="font-medium">{getLabel()}</span>
              {lastSaved && (
                <span className="text-muted-foreground">
                  {t('lastSaved', { time: formatTimeAgo(lastSaved, t) })}
                </span>
              )}
              {effectiveStatus === 'offline' && (
                <span className="text-muted-foreground">
                  {t('changesWillSync')}
                </span>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

/**
 * Unsaved changes dot indicator for minimal UI
 */
export function UnsavedDot({
  hasUnsavedChanges,
  className,
}: {
  hasUnsavedChanges: boolean;
  className?: string;
}) {
  const t = useTranslations('builder.saveStatus');
  if (!hasUnsavedChanges) return null;

  return (
    <span
      className={cn(
        'absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-500',
        'animate-pulse',
        className
      )}
      aria-label={t('unsavedChangesLabel')}
    />
  );
}
