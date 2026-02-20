import { useState, useCallback } from 'react';
import { useTestTimer } from './useTestTimer';

/**
 * useTimerManagement Hook
 *
 * Wraps useTestTimer with timeout dialog state management.
 * Provides the complete timer experience including the
 * "time expired" dialog trigger for the ImmersivePlayer.
 */

export interface UseTimerManagementProps {
  /** Initial time remaining in seconds (null = untimed) */
  initialSeconds: number | null;
}

export interface UseTimerManagementReturn {
  /** Current time remaining in seconds */
  timeRemaining: number | null;
  /** Total time the timer was started with (for percentage calculations) */
  totalSeconds: number | null;
  /** Whether the timeout dialog should be shown */
  showTimeoutDialog: boolean;
  /** Control the timeout dialog visibility */
  setShowTimeoutDialog: (show: boolean) => void;
  /** Formatted time string (MM:SS or HH:MM:SS) */
  formattedTime: string;
  /** Compact formatted time string (M:SS — no leading zero on minutes) */
  compactFormattedTime: string;
  /** Whether timer is in warning state (<3 min) */
  isWarning: boolean;
  /** Whether timer is in critical state (<1 min) */
  isCritical: boolean;
  /** Whether timer has expired */
  isExpired: boolean;
  /** Sync timer with server value (from question load) */
  syncTimer: (serverSeconds: number) => void;
  /** Reset timer (e.g., on question load with new time) */
  resetTimer: (newSeconds: number | null) => void;
}

export function useTimerManagement({
  initialSeconds,
}: UseTimerManagementProps): UseTimerManagementReturn {
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);

  const handleTimeExpired = useCallback(() => {
    setShowTimeoutDialog(true);
  }, []);

  const timer = useTestTimer({
    initialSeconds,
    onExpire: handleTimeExpired,
  });

  return {
    timeRemaining: timer.timeRemaining,
    totalSeconds: timer.totalSeconds,
    showTimeoutDialog,
    setShowTimeoutDialog,
    formattedTime: timer.formattedTime,
    compactFormattedTime: timer.compactFormattedTime,
    isWarning: timer.isWarning,
    isCritical: timer.isCritical,
    isExpired: timer.isExpired,
    syncTimer: timer.sync,
    resetTimer: timer.reset,
  };
}

export default useTimerManagement;
