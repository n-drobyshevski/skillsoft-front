import { useState, useEffect, useRef } from 'react';

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

  /** Total time the timer was started with (for percentage calculations) */
  totalSeconds: number | null;

  /** Whether timer has expired */
  isExpired: boolean;

  /** Whether timer is in warning state */
  isWarning: boolean;

  /** Whether timer is critical (very low) */
  isCritical: boolean;

  /** Formatted time string (MM:SS or HH:MM:SS) */
  formattedTime: string;

  /** Compact formatted time string (M:SS — no leading zero on minutes) */
  compactFormattedTime: string;

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
 * Format seconds to time string (zero-padded: MM:SS or HH:MM:SS)
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

/**
 * Format seconds to compact time string (no leading zero: M:SS)
 * Used for the countdown display when < 3 minutes remain.
 */
function formatTimeCompact(seconds: number): string {
  if (seconds < 0) return '0:00';

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Default warning thresholds (3 min, 2 min, 1 min, 30 sec)
const DEFAULT_WARNING_THRESHOLDS = [180, 120, 60, 30];

// Critical threshold (under 1 minute)
const CRITICAL_THRESHOLD = 60;

// Warning threshold (under 3 minutes)
const WARNING_THRESHOLD = 180;

// Numeric countdown visibility threshold (under 3 minutes)
export const NUMERIC_COUNTDOWN_THRESHOLD = 180;

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

  // Store the total seconds the timer was started with (for percentage calculation)
  const totalSecondsRef = useRef<number | null>(initialSeconds);

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

  const pause = () => {
    setIsInternalPaused(true);
  };

  const resume = () => {
    setIsInternalPaused(false);
  };

  const reset = (newSeconds: number | null) => {
    setTimeRemaining(newSeconds);
    totalSecondsRef.current = newSeconds;
    setIsExpired(false);
    triggeredWarnings.current.clear();
  };

  const sync = (serverSeconds: number) => {
    setTimeRemaining((prev) => {
      if (prev === null) return serverSeconds;
      // Never give time back: the running client countdown is authoritative
      // during an active session, so only accept a server value that is
      // meaningfully LOWER (e.g. the persisted value after a resume, or a value
      // advanced by another device). Accepting a higher (stale) server value
      // here would reset the timer upward on every navigation.
      if (serverSeconds < prev - 2) {
        return serverSeconds;
      }
      return prev;
    });
  };

  const isWarning = timeRemaining !== null && timeRemaining <= WARNING_THRESHOLD && timeRemaining > 0;
  const isCritical = timeRemaining !== null && timeRemaining <= CRITICAL_THRESHOLD && timeRemaining > 0;
  const formattedTime = timeRemaining !== null ? formatTime(timeRemaining) : '--:--';
  const compactFormattedTime = timeRemaining !== null ? formatTimeCompact(timeRemaining) : '--:--';

  return {
    timeRemaining,
    totalSeconds: totalSecondsRef.current,
    isExpired,
    isWarning,
    isCritical,
    formattedTime,
    compactFormattedTime,
    pause,
    resume,
    reset,
    sync,
  };
}

/**
 * Format time remaining for display with context.
 *
 * @param seconds - Time remaining in seconds (null = no limit).
 * @param labels  - Translated label strings for "no limit" and "expired" states.
 *                  When omitted, returns translation keys (`assessment.timer.noLimit`
 *                  and `assessment.timer.expired`) so the caller can translate them.
 */
export function formatTimeWithContext(
  seconds: number | null,
  labels?: { noLimit: string; expired: string },
): {
  text: string;
  urgency: 'normal' | 'warning' | 'critical';
} {
  if (seconds === null) {
    return { text: labels?.noLimit ?? 'No time limit', urgency: 'normal' };
  }

  if (seconds <= 0) {
    return { text: labels?.expired ?? 'Time expired', urgency: 'critical' };
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
