import { useActionState, useTransition, useCallback, useOptimistic } from 'react';
import { toast } from 'sonner';

/**
 * useServerAction - React 19 Server Action Utilities
 *
 * Provides hooks for working with Server Actions in React 19,
 * including useActionState for form actions and optimistic updates.
 */

// Action result type
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Action state type
export interface ActionState<T = unknown> {
  status: 'idle' | 'pending' | 'success' | 'error';
  data?: T;
  error?: string;
  timestamp?: number;
}

/**
 * useServerAction - Wrapper for server actions with toast notifications
 *
 * @example
 * ```tsx
 * const [execute, isPending] = useServerAction(
 *   deleteCompetencyAction,
 *   {
 *     onSuccess: () => toast.success('Deleted!'),
 *     onError: (error) => toast.error(error),
 *   }
 * );
 * ```
 */
export function useServerAction<TInput, TOutput>(
  action: (input: TInput) => Promise<ActionResult<TOutput>>,
  options?: {
    onSuccess?: (data: TOutput | undefined) => void;
    onError?: (error: string) => void;
    successMessage?: string;
    errorMessage?: string;
  }
): [execute: (input: TInput) => Promise<ActionResult<TOutput>>, isPending: boolean] {
  const [isPending, startTransition] = useTransition();

  const execute = useCallback(
    async (input: TInput): Promise<ActionResult<TOutput>> => {
      return new Promise((resolve) => {
        startTransition(async () => {
          try {
            const result = await action(input);

            if (result.success) {
              if (options?.successMessage) {
                toast.success(options.successMessage);
              }
              options?.onSuccess?.(result.data);
            } else {
              const errorMsg = result.error || result.message || options?.errorMessage || 'Action failed';
              toast.error(errorMsg);
              options?.onError?.(errorMsg);
            }

            resolve(result);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
            toast.error(options?.errorMessage || errorMsg);
            options?.onError?.(errorMsg);
            resolve({ success: false, error: errorMsg });
          }
        });
      });
    },
    [action, options]
  );

  return [execute, isPending];
}

/**
 * useFormAction - React 19 useActionState wrapper for forms
 *
 * @example
 * ```tsx
 * const [state, formAction, isPending] = useFormAction(
 *   createCompetencyAction,
 *   { status: 'idle' }
 * );
 *
 * return (
 *   <form action={formAction}>
 *     ...
 *   </form>
 * );
 * ```
 */
export function useFormAction<TOutput>(
  action: (prevState: ActionState<TOutput>, formData: FormData) => Promise<ActionState<TOutput>>,
  initialState: ActionState<TOutput> = { status: 'idle' }
): [state: ActionState<TOutput>, formAction: (payload: FormData) => void, isPending: boolean] {
  const [state, formAction, isPending] = useActionState(action, initialState);
  return [state, formAction, isPending];
}

/**
 * useOptimisticAction - Optimistic update wrapper for server actions
 *
 * @example
 * ```tsx
 * const [items, addOptimistic] = useOptimisticAction(
 *   serverItems,
 *   (items, newItem) => [...items, { ...newItem, pending: true }]
 * );
 * ```
 */
export function useOptimisticAction<TData, TUpdate>(
  data: TData,
  updateFn: (currentData: TData, update: TUpdate) => TData
): [optimisticData: TData, addOptimistic: (update: TUpdate) => void] {
  const [optimisticData, addOptimistic] = useOptimistic(data, updateFn);
  return [optimisticData, addOptimistic];
}

/**
 * createServerActionHandler - Creates a bound action handler for buttons
 *
 * @example
 * ```tsx
 * const handleDelete = createServerActionHandler(
 *   () => deleteItemAction(itemId),
 *   {
 *     successMessage: 'Item deleted',
 *     onSuccess: () => router.refresh(),
 *   }
 * );
 *
 * <Button onClick={handleDelete}>Delete</Button>
 * ```
 */
export function createServerActionHandler<T>(
  action: () => Promise<ActionResult<T>>,
  options?: {
    onSuccess?: (data: T | undefined) => void;
    onError?: (error: string) => void;
    successMessage?: string;
    errorMessage?: string;
    confirm?: {
      title: string;
      description?: string;
    };
  }
): () => Promise<ActionResult<T>> {
  return async () => {
    try {
      const result = await action();

      if (result.success) {
        if (options?.successMessage) {
          toast.success(options.successMessage);
        }
        options?.onSuccess?.(result.data);
      } else {
        const errorMsg = result.error || result.message || options?.errorMessage || 'Action failed';
        toast.error(errorMsg);
        options?.onError?.(errorMsg);
      }

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(options?.errorMessage || errorMsg);
      options?.onError?.(errorMsg);
      return { success: false, error: errorMsg };
    }
  };
}

/**
 * useOptimisticMutation - Hook for mutations with optimistic updates
 *
 * Combines useOptimistic with useTransition for smooth UX.
 *
 * @example
 * ```tsx
 * const { mutate, isPending, optimisticItems } = useOptimisticMutation({
 *   items: serverItems,
 *   action: updateItemAction,
 *   getOptimisticValue: (items, input) => items.map(i =>
 *     i.id === input.id ? { ...i, ...input, pending: true } : i
 *   ),
 * });
 * ```
 */
export function useOptimisticMutation<TData, TInput, TOutput>({
  data,
  action,
  getOptimisticValue,
  onSuccess,
  onError,
}: {
  data: TData;
  action: (input: TInput) => Promise<ActionResult<TOutput>>;
  getOptimisticValue: (current: TData, input: TInput) => TData;
  onSuccess?: (result: TOutput | undefined) => void;
  onError?: (error: string) => void;
}): {
  mutate: (input: TInput) => Promise<ActionResult<TOutput>>;
  isPending: boolean;
  optimisticData: TData;
} {
  const [isPending, startTransition] = useTransition();
  const [optimisticData, addOptimistic] = useOptimistic(data, getOptimisticValue);

  const mutate = useCallback(
    async (input: TInput): Promise<ActionResult<TOutput>> => {
      return new Promise((resolve) => {
        startTransition(async () => {
          // Apply optimistic update
          addOptimistic(input);

          try {
            const result = await action(input);

            if (result.success) {
              onSuccess?.(result.data);
            } else {
              onError?.(result.error || 'Mutation failed');
            }

            resolve(result);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Mutation failed';
            onError?.(errorMsg);
            resolve({ success: false, error: errorMsg });
          }
        });
      });
    },
    [action, addOptimistic, onSuccess, onError]
  );

  return {
    mutate,
    isPending,
    optimisticData,
  };
}

export default useServerAction;
