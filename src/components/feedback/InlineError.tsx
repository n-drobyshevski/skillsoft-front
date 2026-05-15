'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
  Wifi,
  Server,
  LogIn,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import { ErrorCategory, ErrorAction } from '@/types/errors';
import type { ServerFetchError } from '@/lib/server-fetch';

// TYPES

export interface InlineErrorProps {
  /** Error object from serverFetchWithRetry */
  error: ServerFetchError | {
    message: string;
    correlationId?: string;
    isRetryable?: boolean;
    category?: ErrorCategory;
    suggestedAction?: ErrorAction;
    status?: number;
    code?: string;
  };
  /** Visual variant */
  variant?: 'card' | 'banner' | 'inline' | 'minimal';
  /** Custom title override */
  title?: string;
  /** Callback when retry is clicked (if not provided, page will refresh) */
  onRetry?: () => void;
  /** Additional class names */
  className?: string;
  /** Show expand/collapse for details */
  collapsible?: boolean;
  /** Show action buttons */
  showActions?: boolean;
}

// HELPER FUNCTIONS

function getErrorIcon(category: ErrorCategory | undefined) {
  switch (category) {
    case ErrorCategory.NETWORK:
      return Wifi;
    case ErrorCategory.SERVER:
      return Server;
    case ErrorCategory.AUTHENTICATION:
      return LogIn;
    case ErrorCategory.AUTHORIZATION:
      return ShieldAlert;
    case ErrorCategory.NOT_FOUND:
      return XCircle;
    default:
      return AlertCircle;
  }
}

function getDefaultTitleKey(category: ErrorCategory | undefined): string {
  switch (category) {
    case ErrorCategory.NETWORK:
      return 'networkError';
    case ErrorCategory.SERVER:
      return 'serverError';
    case ErrorCategory.AUTHENTICATION:
      return 'loginRequired';
    case ErrorCategory.AUTHORIZATION:
      return 'accessDenied';
    case ErrorCategory.NOT_FOUND:
      return 'notFound';
    case ErrorCategory.VALIDATION:
      return 'validationError';
    case ErrorCategory.RATE_LIMIT:
      return 'rateLimitExceeded';
    default:
      return 'loadingDataError';
  }
}

function getColorClasses(category: ErrorCategory | undefined, variant: InlineErrorProps['variant']) {
  // For minimal variant, use subtle colors
  if (variant === 'minimal') {
    return {
      container: 'text-muted-foreground',
      icon: 'text-muted-foreground',
      title: 'text-foreground',
    };
  }

  // Default destructive colors for most errors
  switch (category) {
    case ErrorCategory.NETWORK:
    case ErrorCategory.SERVER:
      return {
        container: 'border-amber-500/50 bg-amber-50 dark:bg-amber-950/20',
        icon: 'text-amber-600 dark:text-amber-400',
        title: 'text-amber-800 dark:text-amber-200',
      };
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
      return {
        container: 'border-blue-500/50 bg-blue-50 dark:bg-blue-950/20',
        icon: 'text-blue-600 dark:text-blue-400',
        title: 'text-blue-800 dark:text-blue-200',
      };
    default:
      return {
        container: 'border-destructive/50 bg-destructive/10',
        icon: 'text-destructive',
        title: 'text-destructive',
      };
  }
}

// MAIN COMPONENT

/**
 * InlineError - Displays error messages inline within page content.
 *
 * Features:
 * - Multiple visual variants (card, banner, inline, minimal)
 * - Category-specific icons and colors
 * - Retry button with automatic page refresh
 * - Collapsible details with correlation ID
 * - Copy to clipboard for support requests
 *
 * @example
 * ```tsx
 * // Basic usage
 * {error && <InlineError error={error} />}
 *
 * // With retry callback
 * {error && (
 *   <InlineError
 *     error={error}
 *     variant="card"
 *     onRetry={() => refetch()}
 *   />
 * )}
 *
 * // Minimal for table cells
 * {error && <InlineError error={error} variant="minimal" />}
 * ```
 */
export function InlineError({
  error,
  variant = 'card',
  title,
  onRetry,
  className,
  collapsible = true,
  showActions = true,
}: InlineErrorProps) {
  const router = useRouter();
  const t = useTranslations('errors');
  const tCommon = useTranslations('common');
  const tAuth = useTranslations('auth');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const category = error.category ?? ErrorCategory.UNKNOWN;
  const isRetryable = error.isRetryable ?? false;
  const correlationId = error.correlationId;

  const Icon = getErrorIcon(category);
  const displayTitle = title ?? t(getDefaultTitleKey(category));
  const colors = getColorClasses(category, variant);

  const handleRetry = async () => {
    setIsRetrying(true);
    if (onRetry) {
      await onRetry();
    } else {
      router.refresh();
    }
    // Keep spinning for a moment for feedback
    setTimeout(() => setIsRetrying(false), 500);
  };

  const handleCopy = async () => {
    const text = [
      `Error: ${error.message}`,
      correlationId ? `Correlation ID: ${correlationId}` : null,
      error.status ? `Status: ${error.status}` : null,
      error.code ? `Code: ${error.code}` : null,
    ].filter(Boolean).join('\n');

    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Minimal variant - just icon and message
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-2 text-sm', colors.container, className)}>
        <Icon className={cn('h-4 w-4 shrink-0', colors.icon)} />
        <span className="truncate">{error.message}</span>
      </div>
    );
  }

  // Inline variant - horizontal layout
  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-md border',
          colors.container,
          className
        )}
      >
        <Icon className={cn('h-4 w-4 shrink-0', colors.icon)} />
        <span className={cn('flex-1 text-sm', colors.title)}>{error.message}</span>
        {showActions && isRetryable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            disabled={isRetrying}
            className="h-7 px-2"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isRetrying && 'animate-spin')} />
          </Button>
        )}
      </div>
    );
  }

  // Banner variant - full-width alert style
  if (variant === 'banner') {
    return (
      <div
        role="alert"
        className={cn(
          'flex items-start gap-3 px-4 py-3 rounded-lg border',
          colors.container,
          className
        )}
      >
        <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', colors.icon)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={cn('font-medium', colors.title)}>{displayTitle}</p>
            {error.status && error.status > 0 && (
              <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                HTTP {error.status}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{error.message}</p>
          {correlationId && (
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              ID: {correlationId}
            </p>
          )}
        </div>
        {showActions && isRetryable && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={isRetrying}
          >
            <RefreshCw className={cn('h-4 w-4 mr-1.5', isRetrying && 'animate-spin')} />
            {tCommon('retry')}
          </Button>
        )}
      </div>
    );
  }

  // Card variant - full card with expandable details
  return (
    <Card className={cn(colors.container, className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-full bg-background/50', colors.icon)}>
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className={cn('font-medium', colors.title)}>{displayTitle}</h4>
                {error.status && error.status > 0 && (
                  <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                    HTTP {error.status}
                  </span>
                )}
              </div>
              {collapsible && (correlationId || error.code) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-7 px-2"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>

            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>

            {/* Always show correlation ID if available */}
            {correlationId && !isExpanded && (
              <p className="text-xs text-muted-foreground mt-2 font-mono flex items-center gap-1">
                <span className="opacity-60">ID:</span> {correlationId}
              </p>
            )}

            {/* Expanded details */}
            {isExpanded && (
              <div className="mt-3 p-2 bg-muted/50 rounded text-xs space-y-1">
                {correlationId && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      <span className="font-medium">{t('requestId')}:</span>{' '}
                      <span className="font-mono">{correlationId}</span>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="h-6 px-1.5"
                    >
                      {isCopied ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                )}
                {error.status && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">Status:</span> {error.status}
                  </p>
                )}
                {error.code && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">Code:</span> {error.code}
                  </p>
                )}
              </div>
            )}

            {/* Action buttons */}
            {showActions && (
              <div className="flex items-center gap-2 mt-3">
                {isRetryable && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={isRetrying}
                  >
                    <RefreshCw className={cn('h-4 w-4 mr-1.5', isRetrying && 'animate-spin')} />
                    {t('tryAgain')}
                  </Button>
                )}
                {error.suggestedAction === ErrorAction.SIGN_IN && (
                  <Button variant="outline" size="sm" asChild>
                    <a href="/sign-in">
                      <LogIn className="h-4 w-4 mr-1.5" />
                      {tAuth('signIn')}
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * InlineErrorMinimal - Simplified error display for tight spaces.
 */
export function InlineErrorMinimal({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <span className={cn('text-sm text-destructive flex items-center gap-1.5', className)}>
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </span>
  );
}

export default InlineError;
