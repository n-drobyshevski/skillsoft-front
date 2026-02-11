import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useTestTimer Hook
 *
 * Manages countdown timer for timed tests.
 * Handles timer state, pause/resume, and expiration callbacks.
 */

export interface UseTestTimerProps {
  /** Initial time remaining in seconds */
  initialSeconds: number | null;

  /** Callback when timer expires */
  onExpire: () => void;

  /** Whether timer is paused */
  isPaused?: boolean;

  /** Warning thresholds in seconds (triggers callbacks) */
  warningThresholds?: number[];

  /** Callback for warning thresholds */
  onWarning?: (secondsRemaining: number) => void;
}

export interface UseTestTimerReturn {
  /** Current time remaining in seconds */
  timeRemaining: number | null;

  /** Whether timer has expired */
  isExpired: boolean;

  /** Whether timer is in warning state */
  isWarning: boolean;

  /** Whether timer is critical (very low) */
  isCritical: boolean;

  /** Formatted time string (MM:SS or HH:MM:SS) */
  formattedTime: string;

  /** Pause the timer */
  pause: () => void;

  /** Resume the timer */
  resume: () => void;

  /** Reset timer with new initial value */
  reset: (newSeconds: number | null) => void;

  /** Update timer with server value */
  sync: (serverSeconds: number) => void;
}

/**
 * Format seconds to time string
 */
function formatTime(seconds: number): string {
  if (seconds < 0) return '00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Default warning thresholds (5 min, 2 min, 1 min, 30 sec)
const DEFAULT_WARNING_THRESHOLDS = [300, 120, 60, 30];

// Critical threshold (under 1 minute)
const CRITICAL_THRESHOLD = 60;

// Warning threshold (under 5 minutes)
const WARNING_THRESHOLD = 300;

export function useTestTimer({
  initialSeconds,
  onExpire,
  isPaused = false,
  warningThresholds = DEFAULT_WARNING_THRESHOLDS,
  onWarning,
}: UseTestTimerProps): UseTestTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(initialSeconds);
  const [isExpired, setIsExpired] = useState(false);
  const [isInternalPaused, setIsInternalPaused] = useState(isPaused);

  // Track triggered warnings to prevent duplicates
  const triggeredWarnings = useRef<Set<number>>(new Set());

  // Handle timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || isInternalPaused) {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          onExpire();
          return 0;
        }

        const newValue = prev - 1;

        // Check warning thresholds
        if (onWarning && warningThresholds.includes(newValue)) {
          if (!triggeredWarnings.current.has(newValue)) {
            triggeredWarnings.current.add(newValue);
            onWarning(newValue);
          }
        }

        return newValue;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isInternalPaused, onExpire, onWarning, warningThresholds]);

  // Sync with external isPaused prop
  useEffect(() => {
    setIsInternalPaused(isPaused);
  }, [isPaused]);

  const pause = useCallback(() => {
    setIsInternalPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsInternalPaused(false);
  }, []);

  const reset = useCallback((newSeconds: number | null) => {
    setTimeRemaining(newSeconds);
    setIsExpired(false);
    triggeredWarnings.current.clear();
  }, []);

  const sync = useCallback((serverSeconds: number) => {
    // Only sync if difference is significant (> 2 seconds)
    setTimeRemaining((prev) => {
      if (prev === null) return serverSeconds;
      if (Math.abs(prev - serverSeconds) > 2) {
        return serverSeconds;
      }
      return prev;
    });
  }, []);

  const isWarning = timeRemaining !== null && timeRemaining <= WARNING_THRESHOLD && timeRemaining > 0;
  const isCritical = timeRemaining !== null && timeRemaining <= CRITICAL_THRESHOLD && timeRemaining > 0;
  const formattedTime = timeRemaining !== null ? formatTime(timeRemaining) : '--:--';

  return {
    timeRemaining,
    isExpired,
    isWarning,
    isCritical,
    formattedTime,
    pause,
    resume,
    reset,
    sync,
  };
}

/**
 * Format time remaining for display with context
 */
export function formatTimeWithContext(seconds: number | null): {
  text: string;
  urgency: 'normal' | 'warning' | 'critical';
} {
  if (seconds === null) {
    return { text: 'Без ограничения', urgency: 'normal' };
  }

  if (seconds <= 0) {
    return { text: 'Время истекло', urgency: 'critical' };
  }

  const formatted = formatTime(seconds);

  if (seconds <= CRITICAL_THRESHOLD) {
    return { text: formatted, urgency: 'critical' };
  }

  if (seconds <= WARNING_THRESHOLD) {
    return { text: formatted, urgency: 'warning' };
  }

  return { text: formatted, urgency: 'normal' };
}

export default useTestTimer;
