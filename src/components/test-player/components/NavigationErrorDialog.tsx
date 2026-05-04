'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, RefreshCw, Loader2, XCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NavigationError } from '../hooks/useNavigationState';

/**
 * NavigationErrorDialog
 *
 * Modal dialog shown when navigation (back/forward) fails during auto-save.
 * Provides options to retry, continue without saving, or dismiss.
 *
 * Features:
 * - Displays error message with context
 * - Retry button with loading state
 * - Option to continue without saving (discards changes)
 * - Dismiss button to stay on current question
 * - Accessible with proper ARIA attributes
 */

export interface NavigationErrorDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Error details from navigation state */
  error: NavigationError | null;
  /** Callback to retry the failed operation */
  onRetry: () => Promise<void>;
  /** Callback to dismiss and stay on current question */
  onDismiss: () => void;
  /** Callback to continue navigation without saving */
  onContinueWithoutSaving?: () => void;
  /** Whether a retry is in progress */
  isRetrying: boolean;
  /** Whether there are unsaved changes that would be lost */
  hasUnsavedChanges?: boolean;
}

export function NavigationErrorDialog({
  open,
  onOpenChange,
  error,
  onRetry,
  onDismiss,
  onContinueWithoutSaving,
  isRetrying,
  hasUnsavedChanges = false,
}: NavigationErrorDialogProps) {
  const t = useTranslations('assessment');

  // Determine if the error is retryable
  const canRetry = error?.isRetryable !== false;

  // Handle retry click
  const handleRetry = async () => {
    await onRetry();
  };

  // Handle dismiss - close dialog and stay on current question
  const handleDismiss = () => {
    onDismiss();
    onOpenChange(false);
  };

  // Handle continue without saving - proceed with navigation but lose changes
  const handleContinueWithoutSaving = () => {
    if (onContinueWithoutSaving) {
      onContinueWithoutSaving();
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[var(--zen-surface)] border-[var(--zen-border)] text-[var(--zen-text)] backdrop-blur-xl max-w-md">
        <AlertDialogHeader>
          {/* Error Icon */}
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-red-500/20">
              <XCircle className="w-8 h-8 text-[var(--zen-danger)]" />
            </div>
          </div>

          <AlertDialogTitle className="text-center text-xl text-[var(--zen-text)]">
            {t('navigationError.title')}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center space-y-4 text-[var(--zen-text-secondary)]" asChild>
            <div>
              {/* Error message */}
              <p className="text-[var(--zen-text-secondary)]">
                {error?.message || t('navigationError.defaultMessage')}
              </p>

              {/* Unsaved changes warning */}
              {hasUnsavedChanges && (
                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-sm text-[var(--zen-warning)] flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {t('navigationError.unsavedChangesWarning')}
                  </p>
                </div>
              )}

              {/* Technical details (development only) */}
              {process.env.NODE_ENV === 'development' && error?.originalError !== undefined && (
                <details className="mt-3 text-left">
                  <summary className="text-xs text-[var(--zen-text-muted)] cursor-pointer hover:text-[var(--zen-text-secondary)]">
                    Technical Details
                  </summary>
                  <pre className="mt-2 p-2 bg-[var(--zen-track)] rounded text-xs text-[var(--zen-text-secondary)] overflow-auto max-h-32">
                    {String(typeof error.originalError === 'object'
                      ? JSON.stringify(error.originalError, null, 2)
                      : error.originalError)}
                  </pre>
                </details>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          {/* Dismiss button - stay on current question */}
          <AlertDialogCancel
            onClick={handleDismiss}
            className="bg-[var(--zen-track)] border-[var(--zen-muted)] text-[var(--zen-text)] hover:bg-[var(--zen-muted)] hover:text-[var(--zen-text)]"
            disabled={isRetrying}
          >
            {t('navigationError.stayOnQuestion')}
          </AlertDialogCancel>

          {/* Continue without saving - only if handler provided and there are changes */}
          {onContinueWithoutSaving && hasUnsavedChanges && (
            <Button
              variant="outline"
              onClick={handleContinueWithoutSaving}
              disabled={isRetrying}
              className="border-amber-500/30 text-[var(--zen-warning)] hover:bg-amber-500/10 hover:text-[var(--zen-warning)]"
            >
              {t('navigationError.continueWithoutSaving')}
            </Button>
          )}

          {/* Retry button - only shown if error is retryable */}
          {canRetry && (
            <AlertDialogAction
              onClick={handleRetry}
              disabled={isRetrying}
              className={cn(
                "font-semibold",
                "bg-emerald-600 hover:bg-emerald-500"
              )}
            >
              {isRetrying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('navigationError.retrying')}
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('navigationError.retry')}
                </>
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default NavigationErrorDialog;
