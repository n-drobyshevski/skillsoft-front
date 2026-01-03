'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff, RefreshCw, AlertTriangle, Wifi, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OfflineIndicatorProps {
  /** Whether the current data is stale */
  isStale?: boolean;
  /** Callback when user requests refresh */
  onRefresh?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Position on screen */
  position?: 'bottom' | 'top';
  /** Whether to show in a dismissible toast format */
  dismissible?: boolean;
  /** Auto-hide after returning online (ms) */
  autoHideDelay?: number;
}

/**
 * OfflineIndicator - Network status indicator for mobile-first experience
 *
 * Displays current network status and provides refresh functionality:
 * - Offline: Shows offline message with cached data indication
 * - Slow connection: Shows warning about connection quality
 * - Stale data: Shows refresh button to update content
 *
 * @example
 * ```tsx
 * <OfflineIndicator isStale={dataIsStale} onRefresh={handleRefresh} />
 * ```
 */
export function OfflineIndicator({
  isStale = false,
  onRefresh,
  className,
  position = 'bottom',
  dismissible = true,
  autoHideDelay = 3000,
}: OfflineIndicatorProps) {
  const t = useTranslations('feedback');
  const { isOnline, isSlowConnection, effectiveType } = useNetworkStatus();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showOnlineNotice, setShowOnlineNotice] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  // Track offline state for "back online" notification
  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setIsDismissed(false);
    } else if (wasOffline && isOnline) {
      // Coming back online
      setShowOnlineNotice(true);
      const timer = setTimeout(() => {
        setShowOnlineNotice(false);
        setWasOffline(false);
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, autoHideDelay]);

  // Handle refresh action
  const handleRefresh = useCallback(async () => {
    if (!onRefresh || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
  }, []);

  // Don't show if dismissed, online with fresh data, and not showing online notice
  if (isDismissed && isOnline && !isStale && !showOnlineNotice) {
    return null;
  }

  // Don't show if everything is normal
  if (isOnline && !isStale && !isSlowConnection && !showOnlineNotice) {
    return null;
  }

  // Determine indicator state and styling
  const getIndicatorContent = () => {
    // Just came back online
    if (showOnlineNotice) {
      return {
        icon: <Wifi className="h-4 w-4 text-emerald-500" />,
        message: t('connectionRestored'),
        bgClass: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
        textClass: 'text-emerald-700 dark:text-emerald-300',
        showRefresh: false,
      };
    }

    // Currently offline
    if (!isOnline) {
      return {
        icon: <WifiOff className="h-4 w-4 text-red-500" />,
        message: t('noConnection'),
        bgClass: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800',
        textClass: 'text-red-700 dark:text-red-300',
        showRefresh: false,
      };
    }

    // Stale data
    if (isStale) {
      return {
        icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
        message: t('dataOutdated'),
        bgClass: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
        textClass: 'text-amber-700 dark:text-amber-300',
        showRefresh: true,
      };
    }

    // Slow connection
    if (isSlowConnection) {
      return {
        icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
        message: `${t('slowConnection')}${effectiveType ? ` (${effectiveType})` : ''}`,
        bgClass: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
        textClass: 'text-amber-700 dark:text-amber-300',
        showRefresh: false,
      };
    }

    return null;
  };

  const content = getIndicatorContent();
  if (!content) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed left-1/2 -translate-x-1/2 z-50',
        'px-4 py-2.5 rounded-full shadow-lg border',
        'flex items-center gap-2 text-sm',
        'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4',
        'max-w-[calc(100vw-2rem)]',
        content.bgClass,
        content.textClass,
        position === 'bottom' ? 'bottom-20 sm:bottom-6' : 'top-20 sm:top-6',
        className
      )}
    >
      {/* Status icon */}
      {content.icon}

      {/* Message */}
      <span className="text-xs sm:text-sm font-medium truncate">
        {content.message}
      </span>

      {/* Refresh button */}
      {content.showRefresh && onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 ml-1 hover:bg-white/50 dark:hover:bg-black/20"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={cn('h-3.5 w-3.5 mr-1', isRefreshing && 'animate-spin')}
          />
          <span className="hidden sm:inline">
            {isRefreshing ? t('updating') : t('update')}
          </span>
        </Button>
      )}

      {/* Dismiss button */}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className={cn(
            'p-1 ml-1 rounded-full hover:bg-white/50 dark:hover:bg-black/20',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'transition-colors'
          )}
          aria-label={t('hideNotification')}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/**
 * Compact inline network status indicator
 * For use in headers or toolbars
 */
interface CompactNetworkStatusProps {
  className?: string;
  showLabel?: boolean;
}

export function CompactNetworkStatus({
  className,
  showLabel = false,
}: CompactNetworkStatusProps) {
  const t = useTranslations('feedback');
  const { isOnline, isSlowConnection, effectiveType } = useNetworkStatus();

  if (isOnline && !isSlowConnection) {
    return null;
  }

  return (
    <div
      role="status"
      aria-label={
        !isOnline
          ? t('noConnection')
          : `${t('slowConnection')}: ${effectiveType}`
      }
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
        !isOnline
          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
        className
      )}
    >
      {!isOnline ? (
        <WifiOff className="h-3 w-3" />
      ) : (
        <AlertTriangle className="h-3 w-3" />
      )}
      {showLabel && (
        <span>{!isOnline ? t('offline') : effectiveType?.toUpperCase()}</span>
      )}
    </div>
  );
}

export default OfflineIndicator;
