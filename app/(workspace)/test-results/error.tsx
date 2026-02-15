'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertCircle,
  Home,
  RefreshCw,
  FileText,
  LogIn,
  ArrowLeft,
  Server,
  Wifi,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import {
  ErrorCategory,
  ErrorAction,
  isApiError,
  getErrorTitle,
  getUserFriendlyMessage,
  getErrorCategory,
  getSuggestedAction,
  isRetryableError,
} from '@/types/errors';

/**
 * Error icon component based on error category.
 */
function ErrorIcon({ category }: { category: ErrorCategory }) {
  const iconClass = 'h-6 w-6 text-destructive';

  switch (category) {
    case ErrorCategory.AUTHENTICATION:
      return <LogIn className={iconClass} />;
    case ErrorCategory.AUTHORIZATION:
      return <ShieldAlert className={iconClass} />;
    case ErrorCategory.NETWORK:
      return <Wifi className={iconClass} />;
    case ErrorCategory.SERVER:
      return <Server className={iconClass} />;
    default:
      return <AlertCircle className={iconClass} />;
  }
}

/**
 * Error Boundary for Test Results Section.
 *
 * Catches unhandled errors in test results pages and provides
 * context-aware recovery options based on error type.
 *
 * Features:
 * - Category-specific error messages and icons
 * - Smart recovery actions based on error type
 * - Development-mode error details
 * - Correlation ID display for support requests
 */
export default function TestResultsError({
  error,
  reset,
}: {
  error: Error & {
    digest?: string;
    status?: number;
    category?: ErrorCategory;
    code?: string;
    correlationId?: string;
    isRetryable?: boolean;
    suggestedAction?: ErrorAction;
    details?: string;
  };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  // Log error for debugging and monitoring
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Test results page error:', {
      name: error.name,
      message: error.message,
      status: error.status,
      category: error.category,
      code: error.code,
      correlationId: error.correlationId,
      digest: error.digest,
    });

    // Dispatch custom event for error monitoring integration
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-error', { detail: error }));
    }
  }, [error]);

  // Determine error category and appropriate handling
  const errorInfo = useMemo(() => {
    // If error already has category (ApiError), use it
    if (isApiError(error)) {
      return {
        category: error.category,
        title: getErrorTitle(error.category),
        message: error.message || getUserFriendlyMessage(error.category, error.details),
        isRetryable: error.isRetryable,
        suggestedAction: error.suggestedAction,
      };
    }

    // Determine category from status code if available
    const category = error.status ? getErrorCategory(error.status) : ErrorCategory.UNKNOWN;

    // Check for specific error patterns in the message
    const lowerMessage = error.message?.toLowerCase() || '';

    if (lowerMessage.includes('database')) {
      return {
        category: ErrorCategory.SERVER,
        title: t('serverError'),
        message: t('server'),
        isRetryable: true,
        suggestedAction: ErrorAction.RETRY,
      };
    }

    if (lowerMessage.includes('network') || lowerMessage.includes('connection') || lowerMessage.includes('fetch')) {
      return {
        category: ErrorCategory.NETWORK,
        title: t('networkError'),
        message: t('network'),
        isRetryable: true,
        suggestedAction: ErrorAction.RETRY,
      };
    }

    if (lowerMessage.includes('result') || lowerMessage.includes('результат')) {
      return {
        category: ErrorCategory.NOT_FOUND,
        title: t('notFound'),
        message: t('loadingFailed'),
        isRetryable: false,
        suggestedAction: ErrorAction.GO_BACK,
      };
    }

    // Default error info
    return {
      category,
      title: getErrorTitle(category),
      message: error.message || getUserFriendlyMessage(category),
      isRetryable: isRetryableError(category),
      suggestedAction: getSuggestedAction(category),
    };
  }, [error, t]);

  // Determine which action buttons to show
  const showRetryButton = errorInfo.isRetryable;
  const showSignInButton = errorInfo.category === ErrorCategory.AUTHENTICATION;
  const showBackButton = errorInfo.suggestedAction === ErrorAction.GO_BACK;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6 items-center justify-center min-h-[400px]">
      <Card className="max-w-md w-full border-destructive/50">
        <CardHeader className="text-center">
          {/* Error Icon */}
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <ErrorIcon category={errorInfo.category} />
          </div>

          {/* Error Title */}
          <CardTitle className="text-destructive">{errorInfo.title}</CardTitle>

          {/* Error Description */}
          <CardDescription className="text-base">
            {errorInfo.message}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Correlation ID for support */}
          {error.correlationId && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono">
              <span className="font-medium">{t('requestId')}:</span> {error.correlationId}
            </div>
          )}

          {/* Error digest (Next.js error ID) */}
          {error.digest && !error.correlationId && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono">
              <span className="font-medium">{t('errorId')}:</span> {error.digest}
            </div>
          )}

          {/* Development mode details */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded overflow-auto max-h-40 space-y-2">
              <p className="font-medium text-foreground">{t('devInfo')}:</p>
              <div className="space-y-1">
                {error.status && (
                  <p><span className="font-medium">Status:</span> {error.status}</p>
                )}
                {error.code && (
                  <p><span className="font-medium">Code:</span> {error.code}</p>
                )}
                <p><span className="font-medium">Category:</span> {errorInfo.category}</p>
                <pre className="whitespace-pre-wrap text-xs mt-2 pt-2 border-t border-border/50">
                  {error.message}
                </pre>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          {/* Retry Button */}
          {showRetryButton && (
            <Button onClick={reset} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('tryAgain')}
            </Button>
          )}

          {/* Sign In Button */}
          {showSignInButton && (
            <Button asChild className="w-full">
              <Link href="/sign-in">
                <LogIn className="w-4 h-4 mr-2" />
                {t('loginRequired')}
              </Link>
            </Button>
          )}

          {/* Back Button */}
          {showBackButton && (
            <Button variant="outline" onClick={() => window.history.back()} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('goHome')}
            </Button>
          )}

          {/* Section Link */}
          <Button variant="outline" asChild className="w-full">
            <Link href="/test-templates">
              <FileText className="w-4 h-4 mr-2" />
              {t('backToHome')}
            </Link>
          </Button>

          {/* Home Link */}
          <Button variant="ghost" asChild className="w-full">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              {t('goHome')}
            </Link>
          </Button>

          {/* Support hint */}
          {errorInfo.suggestedAction === ErrorAction.CONTACT_SUPPORT && (
            <p className="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
              <HelpCircle className="w-3 h-3" />
              {t('somethingWentWrong')}
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
