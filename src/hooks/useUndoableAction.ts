import { useState, useEffect, useRef } from 'react';

/**
 * useUndoableAction Hook
 *
 * Provides a generic undo mechanism with configurable time window.
 * Used for destructive actions that should be reversible for a short period.
 *
 * Features:
 * - Configurable undo window (default 30 seconds)
 * - Countdown timer for UI display
 * - Automatic expiry of undo actions
 * - Stack-based multiple undo support
 *
 * @example
 * ```tsx
 * const { execute, undo, canUndo, countdown, lastAction } = useUndoableAction({
 *   windowMs: 30000,
 *   onExecute: async (action) => {
 *     await api.deleteItem(action.itemId);
 *   },
 *   onUndo: async (action) => {
 *     await api.restoreItem(action.itemId, action.previousState);
 *   },
 * });
 *
 * // Execute an action
 * await execute({
 *   type: 'DELETE',
 *   itemId: '123',
 *   previousState: { status: 'ACTIVE' },
 * });
 *
 * // Show undo button with countdown
 * {canUndo && (
 *   <button onClick={undo}>
 *     Undo ({countdown}s)
 *   </button>
 * )}
 * ```
 */

export interface UndoableActionConfig<TAction, TResult = void> {
  /** Time window for undo in milliseconds (default: 30000) */
  windowMs?: number;

  /** Maximum number of actions in the undo stack (default: 5) */
  maxStackSize?: number;

  /** Callback to execute the action */
  onExecute: (action: TAction) => Promise<TResult>;

  /** Callback to undo the action */
  onUndo: (action: TAction, result: TResult) => Promise<void>;

  /** Called when an action expires from the undo stack */
  onExpire?: (action: TAction) => void;

  /** Called when undo fails */
  onUndoError?: (error: Error, action: TAction) => void;
}

export interface UndoableActionEntry<TAction, TResult> {
  id: string;
  action: TAction;
  result: TResult;
  timestamp: number;
  expiresAt: number;
}

export interface UseUndoableActionReturn<TAction, TResult> {
  /** Execute an action that can be undone */
  execute: (action: TAction) => Promise<TResult>;

  /** Undo the last action */
  undo: () => Promise<boolean>;

  /** Whether undo is available */
  canUndo: boolean;

  /** Countdown in seconds until undo expires */
  countdown: number;

  /** The last undoable action */
  lastAction: UndoableActionEntry<TAction, TResult> | null;

  /** All undoable actions in the stack */
  undoStack: UndoableActionEntry<TAction, TResult>[];

  /** Clear all undo history */
  clearStack: () => void;

  /** Whether an operation is in progress */
  isExecuting: boolean;

  /** Whether an undo is in progress */
  isUndoing: boolean;
}

export function useUndoableAction<TAction, TResult = void>(
  config: UndoableActionConfig<TAction, TResult>
): UseUndoableActionReturn<TAction, TResult> {
  const {
    windowMs = 30_000,
    maxStackSize = 5,
    onExecute,
    onUndo,
    onExpire,
    onUndoError,
  } = config;

  const [undoStack, setUndoStack] = useState<UndoableActionEntry<TAction, TResult>[]>([]);
  const [countdown, setCountdown] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear expired actions
  const clearExpired = () => {
    const now = Date.now();
    setUndoStack((prev) => {
      const expired = prev.filter((entry) => entry.expiresAt <= now);
      const valid = prev.filter((entry) => entry.expiresAt > now);

      // Notify about expired actions
      expired.forEach((entry) => onExpire?.(entry.action));

      return valid;
    });
  };

  // Update countdown timer
  useEffect(() => {
    if (undoStack.length === 0) {
      setCountdown(0);
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const lastEntry = undoStack[0];

      if (!lastEntry || lastEntry.expiresAt <= now) {
        clearExpired();
        setCountdown(0);
        return;
      }

      const remaining = Math.ceil((lastEntry.expiresAt - now) / 1000);
      setCountdown(remaining);
    };

    // Initial update
    updateCountdown();

    // Set up interval
    intervalRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [undoStack, clearExpired]);

  // Execute an action
  const execute = async (action: TAction): Promise<TResult> => {
    setIsExecuting(true);

    try {
      const result = await onExecute(action);

      const entry: UndoableActionEntry<TAction, TResult> = {
        id: crypto.randomUUID(),
        action,
        result,
        timestamp: Date.now(),
        expiresAt: Date.now() + windowMs,
      };

      setUndoStack((prev) => {
        // Clear expired entries and add new one
        const now = Date.now();
        const valid = prev.filter((e) => e.expiresAt > now);
        return [entry, ...valid].slice(0, maxStackSize);
      });

      return result;
    } finally {
      setIsExecuting(false);
    }
  };

  // Undo the last action
  const undo = async (): Promise<boolean> => {
    clearExpired();

    if (undoStack.length === 0) {
      return false;
    }

    const lastEntry = undoStack[0];

    if (lastEntry.expiresAt <= Date.now()) {
      setUndoStack((prev) => prev.slice(1));
      return false;
    }

    setIsUndoing(true);

    try {
      await onUndo(lastEntry.action, lastEntry.result);
      setUndoStack((prev) => prev.slice(1));
      return true;
    } catch (error) {
      onUndoError?.(error instanceof Error ? error : new Error(String(error)), lastEntry.action);
      return false;
    } finally {
      setIsUndoing(false);
    }
  };

  // Clear all undo history
  const clearStack = () => {
    setUndoStack([]);
    setCountdown(0);
  };

  return {
    execute,
    undo,
    canUndo: undoStack.length > 0 && undoStack[0].expiresAt > Date.now(),
    countdown,
    lastAction: undoStack.length > 0 ? undoStack[0] : null,
    undoStack,
    clearStack,
    isExecuting,
    isUndoing,
  };
}

/**
 * Simplified hook for single-action undo
 * Used when you only need to track one undoable action at a time
 */
export function useSingleUndo<TAction>(config: {
  windowMs?: number;
  onUndo: (action: TAction) => Promise<void>;
}) {
  const [action, setAction] = useState<{
    data: TAction;
    expiresAt: number;
  } | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isUndoing, setIsUndoing] = useState(false);

  const windowMs = config.windowMs ?? 30_000;

  // Track the action
  const track = (actionData: TAction) => {
    setAction({
      data: actionData,
      expiresAt: Date.now() + windowMs,
    });
  };

  // Update countdown
  useEffect(() => {
    if (!action) {
      setCountdown(0);
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      if (action.expiresAt <= now) {
        setAction(null);
        setCountdown(0);
        return;
      }
      setCountdown(Math.ceil((action.expiresAt - now) / 1000));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [action]);

  // Undo
  const undo = async () => {
    if (!action || action.expiresAt <= Date.now()) {
      setAction(null);
      return false;
    }

    setIsUndoing(true);
    try {
      await config.onUndo(action.data);
      setAction(null);
      return true;
    } catch {
      return false;
    } finally {
      setIsUndoing(false);
    }
  };

  // Clear
  const clear = () => {
    setAction(null);
    setCountdown(0);
  };

  return {
    track,
    undo,
    clear,
    canUndo: action !== null && action.expiresAt > Date.now(),
    countdown,
    isUndoing,
    action: action?.data ?? null,
  };
}

export default useUndoableAction;
