'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Loader2, Cloud, CloudOff, RefreshCw, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
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

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return date.toLocaleDateString();
}

const statusConfig: Record<
  SaveStatus,
  {
    icon: React.ElementType;
    label: string;
    color: string;
    animate?: boolean;
  }
> = {
  idle: {
    icon: Cloud,
    label: 'All changes saved',
    color: 'text-muted-foreground',
  },
  pending: {
    icon: Cloud,
    label: 'Unsaved changes',
    color: 'text-amber-500',
  },
  saving: {
    icon: Loader2,
    label: 'Saving...',
    color: 'text-primary',
    animate: true,
  },
  saved: {
    icon: CheckCircle2,
    label: 'Saved',
    color: 'text-emerald-500',
  },
  error: {
    icon: AlertCircle,
    label: 'Save failed',
    color: 'text-destructive',
  },
  offline: {
    icon: WifiOff,
    label: 'Offline - changes saved locally',
    color: 'text-amber-600',
  },
  retrying: {
    icon: RefreshCw,
    label: 'Retrying...',
    color: 'text-primary',
    animate: true,
  },
};

export function SaveStatusIndicator({
  status,
  lastSaved,
  hasUnsavedChanges,
  compact = false,
  retryAttempt = 0,
  className,
}: SaveStatusIndicatorProps) {
  // Determine effective status for display
  const effectiveStatus = hasUnsavedChanges && status === 'idle' ? 'pending' : status;
  const effectiveConfig = statusConfig[effectiveStatus];
  const EffectiveIcon = effectiveConfig.icon;

  // Generate label based on status
  const getLabel = () => {
    if (effectiveStatus === 'saved' && lastSaved) {
      return `Saved ${formatTimeAgo(lastSaved)}`;
    }
    if (effectiveStatus === 'pending') {
      return 'Unsaved';
    }
    if (effectiveStatus === 'retrying' && retryAttempt > 0) {
      return `Retrying (${retryAttempt}/3)...`;
    }
    if (effectiveStatus === 'offline') {
      return 'Offline';
    }
    return effectiveConfig.label;
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
      {!compact && (
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
                  Last saved: {formatTimeAgo(lastSaved)}
                </span>
              )}
              {effectiveStatus === 'offline' && (
                <span className="text-muted-foreground">
                  Changes will sync when back online
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
  if (!hasUnsavedChanges) return null;

  return (
    <span
      className={cn(
        'absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-500',
        'animate-pulse',
        className
      )}
      aria-label="Unsaved changes"
    />
  );
}
