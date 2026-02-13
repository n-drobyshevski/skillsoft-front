'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

interface OptimisticMutationOptions<T, TInput = Partial<T>> {
  // The mutation function to call
  mutationFn: (input: TInput) => Promise<T>;
  // Called when mutation succeeds
  onSuccess?: (data: T) => void;
  // Called when mutation fails
  onError?: (error: Error) => void;
  // Success message to show
  successMessage?: string;
  // Error message prefix
  errorMessage?: string;
}

interface OptimisticListOptions<T> {
  // Current list items
  items: T[];
  // Key to identify items
  getKey: (item: T) => string;
  // Update the list optimistically
  setItems: (items: T[]) => void;
}

/**
 * Hook for optimistic mutations with automatic rollback on failure
 */
export function useOptimisticMutation<T, TInput = Partial<T>>(
  options: OptimisticMutationOptions<T, TInput>
) {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (input: TInput) => {
    setIsLoading(true);
    try {
      const result = await options.mutationFn(input);

      if (options.successMessage) {
        toast.success(options.successMessage);
      }

      options.onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An error occurred';
      toast.error(options.errorMessage ? `${options.errorMessage}: ${errorMsg}` : errorMsg);
      options.onError?.(error instanceof Error ? error : new Error(errorMsg));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate,
    isLoading,
    isPending,
  };
}

/**
 * Hook for optimistic list operations (add, update, remove)
 * with automatic rollback on failure
 */
export function useOptimisticList<T>(
  listOptions: OptimisticListOptions<T>
) {
  const { items, getKey, setItems } = listOptions;

  // Optimistically add an item
  const optimisticAdd = async <TInput>(
    input: TInput,
    mutation: (input: TInput) => Promise<T>,
    options?: {
      tempItem?: T;
      successMessage?: string;
      errorMessage?: string;
    }
  ) => {
    const previousItems = [...items];

    // If a temp item is provided, add it optimistically
    if (options?.tempItem) {
      setItems([...items, options.tempItem]);
    }

    try {
      const result = await mutation(input);

      // Replace temp item with real item, or just add if no temp
      if (options?.tempItem) {
        setItems([...previousItems, result]);
      } else {
        setItems([...items, result]);
      }

      if (options?.successMessage) {
        toast.success(options.successMessage);
      }

      return result;
    } catch (error) {
      // Rollback on failure
      setItems(previousItems);
      const errorMsg = error instanceof Error ? error.message : 'Failed to add item';
      toast.error(options?.errorMessage || errorMsg);
      throw error;
    }
  };

  // Optimistically update an item
  const optimisticUpdate = async <TInput>(
    id: string,
    input: TInput,
    mutation: (id: string, input: TInput) => Promise<T>,
    options?: {
      optimisticData?: Partial<T>;
      successMessage?: string;
      errorMessage?: string;
    }
  ) => {
    const previousItems = [...items];

    // Optimistically update the item
    if (options?.optimisticData) {
      setItems(
        items.map((item) =>
          getKey(item) === id ? { ...item, ...options.optimisticData } : item
        )
      );
    }

    try {
      const result = await mutation(id, input);

      // Replace with actual result
      setItems(
        previousItems.map((item) => (getKey(item) === id ? result : item))
      );

      if (options?.successMessage) {
        toast.success(options.successMessage);
      }

      return result;
    } catch (error) {
      // Rollback on failure
      setItems(previousItems);
      const errorMsg = error instanceof Error ? error.message : 'Failed to update item';
      toast.error(options?.errorMessage || errorMsg);
      throw error;
    }
  };

  // Optimistically remove an item
  const optimisticRemove = async (
    id: string,
    mutation: (id: string) => Promise<void>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
      undoAction?: () => Promise<void>;
    }
  ) => {
    const previousItems = [...items];
    const removedItem = items.find((item) => getKey(item) === id);

    // Optimistically remove the item
    setItems(items.filter((item) => getKey(item) !== id));

    try {
      await mutation(id);

      // Show success with optional undo
      if (options?.successMessage) {
        if (options.undoAction && removedItem) {
          toast.success(options.successMessage, {
            action: {
              label: 'Undo',
              onClick: async () => {
                try {
                  await options.undoAction!();
                  setItems(previousItems);
                  toast.success('Action undone');
                } catch {
                  toast.error('Failed to undo');
                }
              },
            },
            duration: 5000,
          });
        } else {
          toast.success(options.successMessage);
        }
      }
    } catch (error) {
      // Rollback on failure
      setItems(previousItems);
      const errorMsg = error instanceof Error ? error.message : 'Failed to remove item';
      toast.error(options?.errorMessage || errorMsg);
      throw error;
    }
  };

  // Optimistically toggle a boolean field
  const optimisticToggle = async <K extends keyof T>(
    id: string,
    field: K,
    mutation: (id: string, value: boolean) => Promise<T>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
    }
  ) => {
    const item = items.find((i) => getKey(i) === id);
    if (!item) return;

    const previousValue = item[field];
    const newValue = !previousValue;
    const previousItems = [...items];

    // Optimistically update
    setItems(
      items.map((i) =>
        getKey(i) === id ? { ...i, [field]: newValue } : i
      )
    );

    try {
      const result = await mutation(id, newValue as boolean);

      // Update with actual result
      setItems(
        previousItems.map((i) => (getKey(i) === id ? result : i))
      );

      if (options?.successMessage) {
        toast.success(options.successMessage);
      }

      return result;
    } catch (error) {
      // Rollback on failure
      setItems(previousItems);
      const errorMsg = error instanceof Error ? error.message : 'Failed to update';
      toast.error(options?.errorMessage || errorMsg);
      throw error;
    }
  };

  return {
    optimisticAdd,
    optimisticUpdate,
    optimisticRemove,
    optimisticToggle,
  };
}
