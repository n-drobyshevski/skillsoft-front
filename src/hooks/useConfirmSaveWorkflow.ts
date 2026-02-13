'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * State machine states for the confirmation save workflow
 */
export type SaveWorkflowState =
  | 'idle'           // Form is being edited, no dialog open
  | 'confirm_dialog' // User clicked save, awaiting confirmation
  | 'saving'         // API call in progress
  | 'success'        // Save completed successfully
  | 'error';         // Save failed

/**
 * Context containing all workflow state information
 */
export interface SaveWorkflowContext<TData> {
  /** Current state of the workflow */
  state: SaveWorkflowState;
  /** Data to be saved (captured when dialog opens) */
  pendingData: TData | null;
  /** Error from last failed save attempt */
  error: Error | null;
  /** Number of retry attempts made */
  retryCount: number;
  /** ID of successfully created entity */
  createdId: string | null;
}

/**
 * Configuration options for the confirmation save workflow
 */
export interface UseConfirmSaveWorkflowOptions<TData, TResult> {
  /** Async function to save the data */
  saveFn: (data: TData) => Promise<TResult>;
  /** Extract ID from result for redirect */
  getResultId: (result: TResult) => string;
  /** Callback on successful save */
  onSuccess?: (result: TResult) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Maximum retry attempts (default: 3) */
  maxRetries?: number;
  /** Auto-redirect delay in ms (default: 1500) */
  successDelay?: number;
  /** Redirect path template, use {id} placeholder */
  redirectPath?: string;
  /** Whether to auto-redirect on success (default: true) */
  autoRedirect?: boolean;
}

/**
 * Return value from the useConfirmSaveWorkflow hook
 */
export interface UseConfirmSaveWorkflowReturn<TData> {
  /** Current workflow context */
  context: SaveWorkflowContext<TData>;
  /** Open confirmation dialog with data */
  requestSave: (data: TData) => void;
  /** Confirm and execute save */
  confirmSave: () => Promise<void>;
  /** Cancel and close dialog */
  cancelSave: () => void;
  /** Retry failed save */
  retrySave: () => Promise<void>;
  /** Dismiss error and return to idle (keeps form data) */
  dismissError: () => void;
  /** Whether dialog should be open */
  isDialogOpen: boolean;
  /** Whether currently saving */
  isSaving: boolean;
  /** Whether in success state */
  isSuccess: boolean;
  /** Whether in error state */
  isError: boolean;
  /** Whether retry is available */
  canRetry: boolean;
}

/**
 * A hook that manages a confirmation workflow for save operations.
 *
 * Flow: IDLE → CONFIRM_DIALOG → SAVING → SUCCESS/ERROR
 *
 * @example
 * ```tsx
 * const workflow = useConfirmSaveWorkflow({
 *   saveFn: async (data) => await api.create(data),
 *   getResultId: (result) => result.id,
 *   redirectPath: '/items/{id}',
 *   onSuccess: () => toast.success('Created!'),
 * });
 *
 * // In form submit handler:
 * const onSubmit = (values) => workflow.requestSave(values);
 *
 * // In dialog:
 * <ConfirmDialog
 *   open={workflow.isDialogOpen}
 *   onConfirm={workflow.confirmSave}
 *   onCancel={workflow.cancelSave}
 *   isSaving={workflow.isSaving}
 * />
 * ```
 */
export function useConfirmSaveWorkflow<TData, TResult>(
  options: UseConfirmSaveWorkflowOptions<TData, TResult>
): UseConfirmSaveWorkflowReturn<TData> {
  const router = useRouter();
  const {
    saveFn,
    getResultId,
    onSuccess,
    onError,
    maxRetries = 3,
    successDelay = 1500,
    redirectPath,
    autoRedirect = true,
  } = options;

  const [context, setContext] = useState<SaveWorkflowContext<TData>>({
    state: 'idle',
    pendingData: null,
    error: null,
    retryCount: 0,
    createdId: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  const cleanup = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Transition: IDLE → CONFIRM_DIALOG
  const requestSave = (data: TData) => {
    cleanup();
    setContext({
      state: 'confirm_dialog',
      pendingData: data,
      error: null,
      retryCount: 0,
      createdId: null,
    });
  };

  // Execute the save operation
  const executeSave = async () => {
    const pendingData = context.pendingData;
    if (!pendingData) return;

    setContext((prev) => ({ ...prev, state: 'saving', error: null }));

    try {
      const result = await saveFn(pendingData);
      const id = getResultId(result);

      if (!isMountedRef.current) return;

      setContext((prev) => ({
        ...prev,
        state: 'success',
        createdId: id,
      }));

      onSuccess?.(result);

      // Auto-redirect after success
      if (autoRedirect && redirectPath) {
        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            router.push(redirectPath.replace('{id}', id));
          }
        }, successDelay);
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      const error = err instanceof Error ? err : new Error(String(err));
      setContext((prev) => ({
        ...prev,
        state: 'error',
        error,
        retryCount: prev.retryCount + 1,
      }));
      onError?.(error);
    }
  };

  // Transition: CONFIRM_DIALOG → SAVING
  const confirmSave = async () => {
    await executeSave();
  };

  // Transition: ERROR → SAVING (retry)
  const retrySave = async () => {
    if (context.retryCount >= maxRetries) return;
    await executeSave();
  };

  // Transition: CONFIRM_DIALOG/ERROR → IDLE
  const cancelSave = () => {
    cleanup();
    setContext({
      state: 'idle',
      pendingData: null,
      error: null,
      retryCount: 0,
      createdId: null,
    });
  };

  // Transition: ERROR → IDLE (keeps pendingData for form recovery)
  const dismissError = () => {
    cleanup();
    setContext((prev) => ({
      ...prev,
      state: 'idle',
      error: null,
    }));
  };

  // Computed values
  const isDialogOpen = context.state !== 'idle';
  const isSaving = context.state === 'saving';
  const isSuccess = context.state === 'success';
  const isError = context.state === 'error';
  const canRetry = isError && context.retryCount < maxRetries;

  return {
    context,
    requestSave,
    confirmSave,
    cancelSave,
    retrySave,
    dismissError,
    isDialogOpen,
    isSaving,
    isSuccess,
    isError,
    canRetry,
  };
}
