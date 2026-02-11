/**
 * Zustand Testing Utilities
 * Provides helpers for testing Zustand stores with persistence
 */
import { act } from '@testing-library/react';
import { vi } from 'vitest';
import type { StoreApi } from 'zustand';

/**
 * Reset a Zustand store to its initial state
 */
export function resetStore<T extends object>(
  useStore: StoreApi<T> & {
    getInitialState?: () => T;
  }
) {
  const initialState = useStore.getInitialState?.();
  if (initialState) {
    act(() => {
      useStore.setState(initialState, true);
    });
  }
}

/**
 * Set store state within act() for React updates
 */
export function setStoreState<T extends object>(
  useStore: StoreApi<T>,
  partialState: Partial<T>
) {
  act(() => {
    useStore.setState(partialState);
  });
}

/**
 * Create a mock storage for persist middleware testing
 */
export function createMockStorage() {
  const storage = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => storage.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      storage.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      storage.delete(key);
    }),
    clear: vi.fn(() => storage.clear()),
    get length() {
      return storage.size;
    },
    key: vi.fn((index: number) => {
      const keys = Array.from(storage.keys());
      return keys[index] ?? null;
    }),
    // Access to underlying storage for assertions
    _storage: storage,
  };
}

/**
 * Wait for Zustand persist to hydrate
 */
export async function waitForHydration<T extends { isHydrated?: boolean }>(
  useStore: StoreApi<T>
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Hydration timeout'));
    }, 5000);

    const state = useStore.getState();
    if (state.isHydrated) {
      clearTimeout(timeout);
      resolve();
      return;
    }

    const unsubscribe = useStore.subscribe((state) => {
      if (state.isHydrated) {
        clearTimeout(timeout);
        unsubscribe();
        resolve();
      }
    });
  });
}

/**
 * Create a store snapshot for comparison
 */
export function snapshotStore<T>(useStore: StoreApi<T>): T {
  return JSON.parse(JSON.stringify(useStore.getState()));
}

/**
 * Assert store state matches expected partial state
 */
export function expectStoreState<T extends object>(
  useStore: StoreApi<T>,
  expectedPartial: Partial<T>
) {
  const state = useStore.getState();
  Object.entries(expectedPartial).forEach(([key, value]) => {
    expect((state as Record<string, unknown>)[key]).toEqual(value);
  });
}

/**
 * Create a store subscriber that captures state changes
 */
export function createStateRecorder<T>(useStore: StoreApi<T>) {
  const states: T[] = [];

  const unsubscribe = useStore.subscribe((state) => {
    states.push(JSON.parse(JSON.stringify(state)));
  });

  return {
    states,
    stop: unsubscribe,
    getLatest: () => states[states.length - 1],
    clear: () => {
      states.length = 0;
    },
  };
}
