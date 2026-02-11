'use client';

import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo2, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * UndoToast Component
 *
 * A floating toast that appears after a destructive action,
 * showing a countdown and allowing the user to undo.
 *
 * Features:
 * - Visual countdown timer (ring animation)
 * - Prominent undo button
 * - Success/failure states
 * - Smooth animations
 *
 * @example
 * ```tsx
 * const { showUndo, UndoToastComponent } = useUndoToast({
 *   onUndo: async () => {
 *     await api.undoRetire(itemIds);
 *   },
 * });
 *
 * // After a destructive action
 * showUndo({
 *   message: '3 items retired',
 *   itemCount: 3,
 * });
 *
 * // Render the toast
 * <UndoToastComponent />
 * ```
 */

export interface UndoToastProps {
  /** Whether the toast is visible */
  isVisible: boolean;

  /** Message to display */
  message: string;

  /** Countdown in seconds */
  countdown: number;

  /** Total duration in seconds (for progress ring) */
  totalDuration: number;

  /** Called when undo is clicked */
  onUndo: () => Promise<void>;

  /** Called when toast is dismissed */
  onDismiss: () => void;

  /** Whether undo is in progress */
  isUndoing?: boolean;

  /** Whether undo was successful */
  undoSuccess?: boolean;

  /** Position of the toast */
  position?: 'bottom-center' | 'bottom-left' | 'bottom-right';
}

export function UndoToast({
  isVisible,
  message,
  countdown,
  totalDuration,
  onUndo,
  onDismiss,
  isUndoing = false,
  undoSuccess,
  position = 'bottom-center',
}: UndoToastProps) {
  const t = useTranslations('feedback');
  const progress = (countdown / totalDuration) * 100;

  // Calculate position classes
  const positionClasses = {
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={cn(
            'fixed z-50 pointer-events-auto',
            positionClasses[position]
          )}
        >
          <div
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border',
              'bg-slate-900 dark:bg-slate-800 text-white',
              'min-w-[280px] max-w-[400px]'
            )}
          >
            {/* Countdown ring */}
            <div className="relative h-10 w-10 flex-shrink-0">
              <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                {/* Background ring */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-slate-700"
                />
                {/* Progress ring */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${progress}, 100`}
                  strokeLinecap="round"
                  className="text-amber-400 transition-all duration-1000 ease-linear"
                />
              </svg>
              {/* Countdown number */}
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {countdown}
              </span>
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message}</p>
              {undoSuccess === true && (
                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                  <CheckCircle className="h-3 w-3" />
                  {t('undoneSuccessfully')}
                </p>
              )}
              {undoSuccess === false && (
                <p className="text-xs text-red-400 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="h-3 w-3" />
                  {t('failedToUndo')}
                </p>
              )}
            </div>

            {/* Undo button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onUndo}
              disabled={isUndoing || undoSuccess !== undefined}
              className={cn(
                'border-amber-500/50 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300',
                'gap-1.5 font-semibold'
              )}
            >
              {isUndoing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Undo2 className="h-4 w-4" />
              )}
              {t('undo')}
            </Button>

            {/* Dismiss button */}
            <button
              onClick={onDismiss}
              className="p-1 rounded-full hover:bg-slate-700 transition-colors"
              aria-label={t('dismiss')}
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// Hook for managing undo toast state
// ============================================

export interface UseUndoToastConfig<TAction> {
  /** Duration of undo window in milliseconds */
  windowMs?: number;

  /** Called when user clicks undo */
  onUndo: (action: TAction) => Promise<void>;

  /** Called when undo expires without action */
  onExpire?: (action: TAction) => void;

  /** Position of the toast */
  position?: UndoToastProps['position'];
}

export interface UseUndoToastReturn<TAction> {
  /** Show the undo toast */
  showUndo: (action: TAction, message: string) => void;

  /** Hide the undo toast */
  hideUndo: () => void;

  /** The UndoToast component to render */
  UndoToastComponent: React.FC;

  /** Whether the toast is currently visible */
  isVisible: boolean;
}

export function useUndoToast<TAction>(
  config: UseUndoToastConfig<TAction>
): UseUndoToastReturn<TAction> {
  const { windowMs = 30_000, onUndo, onExpire, position } = config;
  const totalDuration = Math.ceil(windowMs / 1000);

  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isUndoing, setIsUndoing] = useState(false);
  const [undoSuccess, setUndoSuccess] = useState<boolean | undefined>();

  const actionRef = React.useRef<TAction | null>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const expiresAtRef = React.useRef<number>(0);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Show the toast
  const showUndo = useCallback(
    (action: TAction, msg: string) => {
      cleanup();

      actionRef.current = action;
      setMessage(msg);
      setIsVisible(true);
      setIsUndoing(false);
      setUndoSuccess(undefined);
      expiresAtRef.current = Date.now() + windowMs;
      setCountdown(totalDuration);

      // Start countdown
      intervalRef.current = setInterval(() => {
        const remaining = Math.ceil((expiresAtRef.current - Date.now()) / 1000);

        if (remaining <= 0) {
          cleanup();
          setIsVisible(false);
          if (actionRef.current) {
            onExpire?.(actionRef.current);
          }
          actionRef.current = null;
        } else {
          setCountdown(remaining);
        }
      }, 1000);
    },
    [windowMs, totalDuration, cleanup, onExpire]
  );

  // Hide the toast
  const hideUndo = useCallback(() => {
    cleanup();
    setIsVisible(false);
    actionRef.current = null;
  }, [cleanup]);

  // Handle undo click
  const handleUndo = useCallback(async () => {
    if (!actionRef.current || isUndoing) return;

    setIsUndoing(true);

    try {
      await onUndo(actionRef.current);
      setUndoSuccess(true);

      // Hide after success
      setTimeout(() => {
        hideUndo();
      }, 1500);
    } catch {
      setUndoSuccess(false);

      // Keep visible briefly to show error
      setTimeout(() => {
        hideUndo();
      }, 2000);
    }
  }, [onUndo, isUndoing, hideUndo]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // The toast component
  const UndoToastComponent: React.FC = useCallback(
    () => (
      <UndoToast
        isVisible={isVisible}
        message={message}
        countdown={countdown}
        totalDuration={totalDuration}
        onUndo={handleUndo}
        onDismiss={hideUndo}
        isUndoing={isUndoing}
        undoSuccess={undoSuccess}
        position={position}
      />
    ),
    [
      isVisible,
      message,
      countdown,
      totalDuration,
      handleUndo,
      hideUndo,
      isUndoing,
      undoSuccess,
      position,
    ]
  );

  return {
    showUndo,
    hideUndo,
    UndoToastComponent,
    isVisible,
  };
}

export default UndoToast;
