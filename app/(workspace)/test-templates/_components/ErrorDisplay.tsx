'use client';

import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, LogIn } from "lucide-react";
import Link from "next/link";
import { ErrorCategory } from "@/types/errors";

interface ErrorDisplayProps {
  message: string;
  category?: ErrorCategory;
  isRetryable?: boolean;
}

/**
 * Client component for displaying API errors with interactive retry functionality.
 * Used within server components that need to display errors with action buttons.
 */
export function ErrorDisplay({ message, category, isRetryable }: ErrorDisplayProps) {
  const t = useTranslations('template.errorDisplay');

  // Determine appropriate help text based on error category
  const getHelpText = () => {
    switch (category) {
      case ErrorCategory.NETWORK:
        return t('networkHelp');
      case ErrorCategory.AUTHENTICATION:
        return t('authHelp');
      case ErrorCategory.AUTHORIZATION:
        return t('authorizationHelp');
      case ErrorCategory.SERVER:
        return t('serverHelp');
      default:
        return t('defaultHelp');
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const showSignIn = category === ErrorCategory.AUTHENTICATION;

  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-destructive">{message}</p>
          <p className="text-xs text-destructive/80">
            {getHelpText()}
          </p>
          <div className="pt-2 flex flex-wrap gap-2">
            {isRetryable && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                {t('refreshPage')}
              </Button>
            )}
            {showSignIn && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link href="/sign-in">
                  <LogIn className="h-3.5 w-3.5 mr-1.5" />
                  {t('signIn')}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorDisplay;
