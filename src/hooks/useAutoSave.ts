'use client';

import { useRef, useCallback, useEffect, useState } from 'react';

export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error' | 'offline' | 'retrying';

interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number;
  /** Base delay in ms for exponential backoff (default: 1000) */
  baseDelayMs?: number;
  /** Multiplier for exponential backoff (default: 2) */
  multiplier?: number;
  /** Maximum delay cap in ms (default: 30000) */
  maxDelayMs?: number;
}

interface AutoSaveConfig<T> {
  /** Data to save */
  data: T;
  /** Save function - should return true on success */
  onSave: (data: T) => Promise<boolean>;
  /** Debounce delay in ms (default: 2000) */
  debounceMs?: number;
  /** Max wait before forced save in ms (default: 10000) */
  maxWaitMs?: number;
  /** Enable/disable auto-save (default: true) */
  enabled?: boolean;
  /** Function to generate comparison key (default: JSON.stringify) */
  compareKey?: (data: T) => string;
  /** Callback on save success */
  onSuccess?: () => void;
  /** Callback on save error */
  onError?: (error: unknown) => void;
  /** Retry configuration for failed saves */
  retry?: RetryConfig;
  /** Show browser warning when leaving with unsaved changes (default: true) */
  warnOnLeave?: boolean;
}

interface AutoSaveReturn {
  /** Current save status */
  status: SaveStatus;
  /** Timestamp of last successful save */
  lastSaved: Date | null;
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;
  /** Trigger immediate save */
  saveNow: () => Promise<boolean>;
  /** Cancel pending save */
  cancel: () => void;
  /** Whether a save operation is in progress */
  isSaving: boolean;
  /** Current retry attempt (0 if not retrying) */
  retryAttempt: number;
  /** Whether the browser is offline */
  isOffline: boolean;
}

export function useAutoSave<T>({
  data,
  onSave,
  debounceMs = 2000,
  maxWaitMs = 10000,
  enabled = true,
  compareKey = (d) => JSON.stringify(d),
  onSuccess,
  onError,
  retry = {},
  warnOnLeave = true,
}: AutoSaveConfig<T>): AutoSaveReturn {
  // Destructure retry config with defaults
  const {
    maxAttempts = 3,
    baseDelayMs = 1000,
    multiplier = 2,
    maxDelayMs = 30000,
  } = retry;

  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  // Refs for stable values across renders
  const lastSavedKeyRef = useRef<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxWaitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<T>(data);
  const isMountedRef = useRef(true);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // When coming back online, trigger a save if there are unsaved changes
      if (hasUnsavedChanges && isMountedRef.current) {
        setStatus('pending');
        // Schedule save after a short delay to let connection stabilize
        debounceTimerRef.current = setTimeout(() => {
          void executeSave();
        }, 500);
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUnsavedChanges]);

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    if (!warnOnLeave) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        // Modern browsers ignore custom messages, but this is still required
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, warnOnLeave]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (maxWaitTimerRef.current) clearTimeout(maxWaitTimerRef.current);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  // Initialize last saved key on mount
  useEffect(() => {
    if (!lastSavedKeyRef.current) {
      lastSavedKeyRef.current = compareKey(data);
    }
  }, [data, compareKey]);

  const clearTimers = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (maxWaitTimerRef.current) {
      clearTimeout(maxWaitTimerRef.current);
      maxWaitTimerRef.current = null;
    }
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  };

  // Calculate delay for exponential backoff
  const calculateRetryDelay = (attempt: number) => {
    const delay = baseDelayMs * Math.pow(multiplier, attempt);
    return Math.min(delay, maxDelayMs);
  };

  const executeSave = useCallback(
    async (attemptNumber = 0): Promise<boolean> => {
      // Don't save while offline
      if (isOffline) {
        setStatus('offline');
        return false;
      }

      // Only clear timers on first attempt
      if (attemptNumber === 0) {
        clearTimers();
      }

      const currentKey = compareKey(pendingDataRef.current);

      // Skip if no changes
      if (currentKey === lastSavedKeyRef.current) {
        if (isMountedRef.current) {
          setStatus('idle');
          setHasUnsavedChanges(false);
          setRetryAttempt(0);
        }
        return true;
      }

      if (isMountedRef.current) {
        setStatus(attemptNumber > 0 ? 'retrying' : 'saving');
        setRetryAttempt(attemptNumber);
      }

      try {
        const success = await onSave(pendingDataRef.current);

        if (!isMountedRef.current) return success;

        if (success) {
          lastSavedKeyRef.current = currentKey;
          setStatus('saved');
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
          setRetryAttempt(0);
          onSuccess?.();

          // Reset to idle after showing "saved" briefly
          setTimeout(() => {
            if (isMountedRef.current) {
              setStatus('idle');
            }
          }, 2000);

          return true;
        } else {
          // Save returned false - attempt retry if we have attempts left
          if (attemptNumber < maxAttempts - 1) {
            const delay = calculateRetryDelay(attemptNumber);
            if (isMountedRef.current) {
              setStatus('retrying');
              setRetryAttempt(attemptNumber + 1);
            }

            return new Promise((resolve) => {
              retryTimerRef.current = setTimeout(async () => {
                const result = await executeSave(attemptNumber + 1);
                resolve(result);
              }, delay);
            });
          }

          // Max retries exceeded
          setStatus('error');
          setRetryAttempt(0);
          onError?.(new Error('Save failed after multiple attempts'));
          return false;
        }
      } catch (error) {
        if (!isMountedRef.current) return false;

        // Network or unexpected error - attempt retry
        if (attemptNumber < maxAttempts - 1) {
          const delay = calculateRetryDelay(attemptNumber);
          setStatus('retrying');
          setRetryAttempt(attemptNumber + 1);

          return new Promise((resolve) => {
            retryTimerRef.current = setTimeout(async () => {
              const result = await executeSave(attemptNumber + 1);
              resolve(result);
            }, delay);
          });
        }

        // Max retries exceeded
        setStatus('error');
        setRetryAttempt(0);
        onError?.(error);
        return false;
      }
    },
    [
      isOffline,
      compareKey,
      onSave,
      onSuccess,
      onError,
      clearTimers,
      maxAttempts,
      calculateRetryDelay,
    ]
  );

  const scheduleAutoSave = useCallback(() => {
    if (!enabled) return;

    // If offline, just mark as having unsaved changes
    if (isOffline) {
      setStatus('offline');
      setHasUnsavedChanges(true);
      return;
    }

    setStatus('pending');
    setHasUnsavedChanges(true);

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      void executeSave();
    }, debounceMs);

    // Set max wait timer if not already set
    if (!maxWaitTimerRef.current) {
      maxWaitTimerRef.current = setTimeout(() => {
        void executeSave();
      }, maxWaitMs);
    }
  }, [enabled, isOffline, debounceMs, maxWaitMs, executeSave]);

  // Track data changes
  useEffect(() => {
    pendingDataRef.current = data;
    const currentKey = compareKey(data);

    if (currentKey !== lastSavedKeyRef.current) {
      scheduleAutoSave();
    }
  }, [data, compareKey, scheduleAutoSave]);

  const saveNow = async () => {
    return executeSave();
  };

  const cancel = useCallback(() => {
    clearTimers();
    setStatus('idle');
  }, [clearTimers]);

  return {
    status,
    lastSaved,
    hasUnsavedChanges,
    saveNow,
    cancel,
    isSaving: status === 'saving' || status === 'retrying',
    retryAttempt,
    isOffline,
  };
}
