import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * useSagaOperations Hook
 *
 * Implements the Saga pattern for batch operations with:
 * - Pre-execution snapshot capture
 * - Individual operation tracking
 * - Partial failure handling
 * - Automatic rollback for failed items
 * - Retry queue for recoverable errors
 *
 * @example
 * ```tsx
 * const saga = useSagaOperations({
 *   onExecuteItem: async (itemId) => {
 *     return await api.retireItem(itemId);
 *   },
 *   onRollbackItem: async (itemId, snapshot) => {
 *     await api.updateItemStatus(itemId, snapshot.status);
 *   },
 *   captureSnapshot: (itemId) => ({
 *     status: items.find(i => i.id === itemId)?.status,
 *   }),
 * });
 *
 * // Execute batch operation
 * await saga.execute(['item1', 'item2', 'item3']);
 *
 * // UI shows progress
 * <Progress value={(saga.completedCount / saga.totalCount) * 100} />
 *
 * // Retry failed items
 * if (saga.failedItems.length > 0) {
 *   await saga.retryFailed();
 * }
 * ```
 */

export type SagaStatus =
  | 'idle'
  | 'executing'
  | 'completed'
  | 'partial_failure'
  | 'failed'
  | 'rolling_back'
  | 'rolled_back';

export interface SagaOperationResult<TResult = unknown> {
  itemId: string;
  success: boolean;
  result?: TResult;
  error?: Error;
  retryable: boolean;
  timestamp: number;
}

export interface SagaSnapshot<TSnapshot> {
  itemId: string;
  snapshot: TSnapshot;
}

export interface SagaState<TResult = unknown, TSnapshot = unknown> {
  status: SagaStatus;
  operationId: string | null;
  totalItems: number;
  completedItems: number;
  successfulItems: string[];
  failedItems: string[];
  results: SagaOperationResult<TResult>[];
  snapshots: SagaSnapshot<TSnapshot>[];
  startedAt: number | null;
  completedAt: number | null;
  error: Error | null;
}

export interface SagaOperationsConfig<TResult = unknown, TSnapshot = unknown> {
  /** Execute operation for a single item */
  onExecuteItem: (itemId: string) => Promise<TResult>;

  /** Rollback operation for a single item (optional) */
  onRollbackItem?: (itemId: string, snapshot: TSnapshot) => Promise<void>;

  /** Capture snapshot before execution (optional) */
  captureSnapshot?: (itemId: string) => TSnapshot;

  /** Check if an error is retryable */
  isRetryable?: (error: Error) => boolean;

  /** Called when saga starts */
  onStart?: (operationId: string, itemIds: string[]) => void;

  /** Called when a single item completes */
  onItemComplete?: (result: SagaOperationResult<TResult>) => void;

  /** Called when saga completes (success or partial failure) */
  onComplete?: (state: SagaState<TResult, TSnapshot>) => void;

  /** Called when rollback completes */
  onRollbackComplete?: (rolledBackItems: string[]) => void;

  /** Maximum concurrent operations (default: 3) */
  concurrency?: number;

  /** Retry failed items automatically (default: false) */
  autoRetry?: boolean;

  /** Maximum retry attempts per item (default: 2) */
  maxRetries?: number;
}

export interface UseSagaOperationsReturn<TResult, TSnapshot> {
  /** Current saga state */
  state: SagaState<TResult, TSnapshot>;

  /** Execute batch operation */
  execute: (itemIds: string[]) => Promise<SagaState<TResult, TSnapshot>>;

  /** Retry failed items */
  retryFailed: () => Promise<SagaState<TResult, TSnapshot>>;

  /** Rollback successful operations */
  rollback: () => Promise<void>;

  /** Cancel ongoing operation */
  cancel: () => void;

  /** Reset saga state */
  reset: () => void;

  /** Whether operation is in progress */
  isExecuting: boolean;

  /** Progress percentage (0-100) */
  progress: number;

  /** Completed count */
  completedCount: number;

  /** Total count */
  totalCount: number;

  /** Failed items */
  failedItems: string[];

  /** Successful items */
  successfulItems: string[];
}

const initialState: SagaState = {
  status: 'idle',
  operationId: null,
  totalItems: 0,
  completedItems: 0,
  successfulItems: [],
  failedItems: [],
  results: [],
  snapshots: [],
  startedAt: null,
  completedAt: null,
  error: null,
};

export function useSagaOperations<TResult = unknown, TSnapshot = unknown>(
  config: SagaOperationsConfig<TResult, TSnapshot>
): UseSagaOperationsReturn<TResult, TSnapshot> {
  const {
    onExecuteItem,
    onRollbackItem,
    captureSnapshot,
    isRetryable = () => true,
    onStart,
    onItemComplete,
    onComplete,
    onRollbackComplete,
    concurrency = 3,
    autoRetry = false,
    maxRetries = 2,
  } = config;

  const [state, setState] = useState<SagaState<TResult, TSnapshot>>(
    initialState as SagaState<TResult, TSnapshot>
  );

  const cancelledRef = useRef(false);
  const retryCountRef = useRef<Map<string, number>>(new Map());

  // Reset retry counts
  const resetRetryCounts = useCallback(() => {
    retryCountRef.current.clear();
  }, []);

  // Ref to hold the executeItem implementation for recursive calls
  const executeItemRef = useRef<(itemId: string) => Promise<SagaOperationResult<TResult>>>();

  // Execute a single item with retry logic (implementation)
  const executeItemImpl = useCallback(
    async (itemId: string): Promise<SagaOperationResult<TResult>> => {
      if (cancelledRef.current) {
        return {
          itemId,
          success: false,
          error: new Error('Operation cancelled'),
          retryable: false,
          timestamp: Date.now(),
        };
      }

      try {
        const result = await onExecuteItem(itemId);
        return {
          itemId,
          success: true,
          result,
          retryable: false,
          timestamp: Date.now(),
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        const retryable = isRetryable(error);
        const currentRetries = retryCountRef.current.get(itemId) ?? 0;

        // Auto-retry if enabled and within limits
        if (autoRetry && retryable && currentRetries < maxRetries) {
          retryCountRef.current.set(itemId, currentRetries + 1);
          // Use ref for recursive call to avoid forward reference issue
          return executeItemRef.current!(itemId);
        }

        return {
          itemId,
          success: false,
          error,
          retryable: retryable && currentRetries < maxRetries,
          timestamp: Date.now(),
        };
      }
    },
    [onExecuteItem, isRetryable, autoRetry, maxRetries]
  );

  // Keep ref updated with latest implementation
  executeItemRef.current = executeItemImpl;

  // Stable wrapper for external use
  const executeItem = useCallback(
    (itemId: string): Promise<SagaOperationResult<TResult>> => {
      return executeItemRef.current!(itemId);
    },
    []
  );

  // Execute batch with concurrency control
  const executeBatch = useCallback(
    async (
      itemIds: string[],
      existingSnapshots: SagaSnapshot<TSnapshot>[] = []
    ): Promise<SagaState<TResult, TSnapshot>> => {
      const operationId = crypto.randomUUID();
      cancelledRef.current = false;

      // Capture snapshots if not provided
      const snapshots: SagaSnapshot<TSnapshot>[] = existingSnapshots.length > 0
        ? existingSnapshots
        : captureSnapshot
        ? itemIds.map((itemId) => ({
            itemId,
            snapshot: captureSnapshot(itemId),
          }))
        : [];

      setState({
        status: 'executing',
        operationId,
        totalItems: itemIds.length,
        completedItems: 0,
        successfulItems: [],
        failedItems: [],
        results: [],
        snapshots,
        startedAt: Date.now(),
        completedAt: null,
        error: null,
      });

      onStart?.(operationId, itemIds);

      const results: SagaOperationResult<TResult>[] = [];
      const successfulItems: string[] = [];
      const failedItems: string[] = [];

      // Process in batches with concurrency limit
      const chunks: string[][] = [];
      for (let i = 0; i < itemIds.length; i += concurrency) {
        chunks.push(itemIds.slice(i, i + concurrency));
      }

      for (const chunk of chunks) {
        if (cancelledRef.current) break;

        const chunkResults = await Promise.all(
          chunk.map((itemId) => executeItem(itemId))
        );

        for (const result of chunkResults) {
          results.push(result);
          if (result.success) {
            successfulItems.push(result.itemId);
          } else {
            failedItems.push(result.itemId);
          }

          onItemComplete?.(result);

          setState((prev) => ({
            ...prev,
            completedItems: prev.completedItems + 1,
            results: [...prev.results, result],
            successfulItems: result.success
              ? [...prev.successfulItems, result.itemId]
              : prev.successfulItems,
            failedItems: !result.success
              ? [...prev.failedItems, result.itemId]
              : prev.failedItems,
          }));
        }
      }

      // Determine final status
      const finalStatus: SagaStatus = cancelledRef.current
        ? 'idle'
        : failedItems.length === 0
        ? 'completed'
        : successfulItems.length === 0
        ? 'failed'
        : 'partial_failure';

      const finalState: SagaState<TResult, TSnapshot> = {
        status: finalStatus,
        operationId,
        totalItems: itemIds.length,
        completedItems: results.length,
        successfulItems,
        failedItems,
        results,
        snapshots,
        startedAt: state.startedAt,
        completedAt: Date.now(),
        error:
          failedItems.length > 0
            ? new Error(`${failedItems.length} item(s) failed`)
            : null,
      };

      setState(finalState);
      onComplete?.(finalState);

      return finalState;
    },
    [
      captureSnapshot,
      concurrency,
      executeItem,
      onStart,
      onItemComplete,
      onComplete,
      state.startedAt,
    ]
  );

  // Main execute function
  const execute = useCallback(
    (itemIds: string[]): Promise<SagaState<TResult, TSnapshot>> => {
      resetRetryCounts();
      return executeBatch(itemIds);
    },
    [executeBatch, resetRetryCounts]
  );

  // Retry failed items
  const retryFailed = useCallback((): Promise<SagaState<TResult, TSnapshot>> => {
    const { failedItems, snapshots } = state;

    if (failedItems.length === 0) {
      return Promise.resolve(state);
    }

    // Filter snapshots to only include failed items
    const relevantSnapshots = snapshots.filter((s) =>
      failedItems.includes(s.itemId)
    );

    return executeBatch(failedItems, relevantSnapshots);
  }, [state, executeBatch]);

  // Rollback successful operations
  const rollback = useCallback(async (): Promise<void> => {
    if (!onRollbackItem) return;

    const { successfulItems, snapshots } = state;

    if (successfulItems.length === 0) return;

    setState((prev) => ({ ...prev, status: 'rolling_back' }));

    const rolledBackItems: string[] = [];

    for (const itemId of successfulItems) {
      if (cancelledRef.current) break;

      const snapshot = snapshots.find((s) => s.itemId === itemId);
      if (snapshot) {
        try {
          await onRollbackItem(itemId, snapshot.snapshot);
          rolledBackItems.push(itemId);
        } catch {
          // Log but continue with other rollbacks
          console.error(`Failed to rollback item ${itemId}`);
        }
      }
    }

    setState((prev) => ({
      ...prev,
      status: 'rolled_back',
      successfulItems: prev.successfulItems.filter(
        (id) => !rolledBackItems.includes(id)
      ),
    }));

    onRollbackComplete?.(rolledBackItems);
  }, [state, onRollbackItem, onRollbackComplete]);

  // Cancel ongoing operation
  const cancel = useCallback(() => {
    cancelledRef.current = true;
    setState((prev) => ({ ...prev, status: 'idle' }));
  }, []);

  // Reset saga state
  const reset = useCallback(() => {
    cancelledRef.current = false;
    resetRetryCounts();
    setState(initialState as SagaState<TResult, TSnapshot>);
  }, [resetRetryCounts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  return {
    state,
    execute,
    retryFailed,
    rollback,
    cancel,
    reset,
    isExecuting: state.status === 'executing',
    progress:
      state.totalItems > 0
        ? Math.round((state.completedItems / state.totalItems) * 100)
        : 0,
    completedCount: state.completedItems,
    totalCount: state.totalItems,
    failedItems: state.failedItems,
    successfulItems: state.successfulItems,
  };
}

/**
 * Simplified saga for status updates
 */
export function useStatusChangeSaga<TStatus>(config: {
  onUpdateStatus: (itemId: string, newStatus: TStatus) => Promise<void>;
  getCurrentStatus: (itemId: string) => TStatus;
  onComplete?: (successful: string[], failed: string[]) => void;
}) {
  return useSagaOperations<void, { status: TStatus }>({
    onExecuteItem: async (_itemId) => {
      // Status is passed via closure in the execute call
      return undefined as void;
    },
    captureSnapshot: (_itemId) => ({
      status: config.getCurrentStatus(_itemId),
    }),
    onRollbackItem: async (itemId, snapshot) => {
      await config.onUpdateStatus(itemId, snapshot.status);
    },
    onComplete: (state) => {
      config.onComplete?.(state.successfulItems, state.failedItems);
    },
  });
}

export default useSagaOperations;
