'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * History Store - Phase 4.1 Workflow Formalization
 *
 * A dedicated Zustand store for undo/redo history management with:
 * - Explicit state transitions with action types
 * - SessionStorage persistence for crash recovery
 * - Configurable history limits
 * - Multi-instance support via scope parameter
 */

// TYPES

export type HistoryActionType =
  | 'ADD_COMPETENCY'
  | 'REMOVE_COMPETENCY'
  | 'REORDER_COMPETENCIES'
  | 'UPDATE_WEIGHT'
  | 'UPDATE_SETTINGS'
  | 'BATCH_UPDATE'
  | 'RESTORE';

export interface HistoryEntry<T> {
  state: T;
  actionType: HistoryActionType;
  timestamp: number;
  description?: string;
}

export interface HistoryStoreState<T> {
  // State
  past: HistoryEntry<T>[];
  present: HistoryEntry<T> | null;
  future: HistoryEntry<T>[];

  // Config
  maxHistory: number;
  scope: string;

  // Derived
  canUndo: boolean;
  canRedo: boolean;
  historyLength: number;

  // Actions
  initialize: (state: T, scope?: string, maxHistory?: number) => void;
  pushState: (state: T, actionType: HistoryActionType, description?: string) => void;
  undo: () => T | null;
  redo: () => T | null;
  clear: () => void;
  getCurrentState: () => T | null;
  getHistoryLog: () => Array<{ actionType: HistoryActionType; timestamp: number; description?: string }>;
}

// STORE FACTORY

/**
 * Creates a scoped history store instance
 * Each scope (e.g., template ID) gets its own persisted history
 */
export function createHistoryStore<T>() {
  return create<HistoryStoreState<T>>()(
    persist(
      (set, get) => ({
        // Initial state
        past: [],
        present: null,
        future: [],
        maxHistory: 50,
        scope: 'default',
        canUndo: false,
        canRedo: false,
        historyLength: 0,

        // Initialize with a state snapshot
        initialize: (state: T, scope = 'default', maxHistory = 50) => {
          const existingState = get();

          // If same scope and already has present, don't reinitialize
          if (existingState.scope === scope && existingState.present !== null) {
            return;
          }

          set({
            past: [],
            present: {
              state,
              actionType: 'RESTORE',
              timestamp: Date.now(),
              description: 'Initial state',
            },
            future: [],
            maxHistory,
            scope,
            canUndo: false,
            canRedo: false,
            historyLength: 1,
          });
        },

        // Push a new state (called on every action)
        pushState: (state: T, actionType: HistoryActionType, description?: string) => {
          const { past, present, maxHistory } = get();

          if (!present) {
            // First state
            set({
              present: {
                state,
                actionType,
                timestamp: Date.now(),
                description,
              },
              canUndo: false,
              canRedo: false,
              historyLength: 1,
            });
            return;
          }

          // Check if state actually changed (prevent duplicates)
          const presentJson = JSON.stringify(present.state);
          const newJson = JSON.stringify(state);
          if (presentJson === newJson) {
            return;
          }

          // Move current to past, set new as present
          const newPast = [...past, present].slice(-maxHistory);

          set({
            past: newPast,
            present: {
              state,
              actionType,
              timestamp: Date.now(),
              description,
            },
            future: [], // Clear redo stack on new action
            canUndo: true,
            canRedo: false,
            historyLength: newPast.length + 1,
          });
        },

        // Undo - return previous state
        undo: () => {
          const { past, present, future } = get();

          if (past.length === 0 || !present) {
            return null;
          }

          const previous = past[past.length - 1];
          const newPast = past.slice(0, -1);
          const newFuture = [present, ...future];

          set({
            past: newPast,
            present: previous,
            future: newFuture,
            canUndo: newPast.length > 0,
            canRedo: true,
            historyLength: newPast.length + 1 + newFuture.length,
          });

          return previous.state;
        },

        // Redo - return next state
        redo: () => {
          const { past, present, future } = get();

          if (future.length === 0 || !present) {
            return null;
          }

          const next = future[0];
          const newFuture = future.slice(1);
          const newPast = [...past, present];

          set({
            past: newPast,
            present: next,
            future: newFuture,
            canUndo: true,
            canRedo: newFuture.length > 0,
            historyLength: newPast.length + 1 + newFuture.length,
          });

          return next.state;
        },

        // Clear history
        clear: () => {
          const { present } = get();
          set({
            past: [],
            future: [],
            canUndo: false,
            canRedo: false,
            historyLength: present ? 1 : 0,
          });
        },

        // Get current state
        getCurrentState: () => {
          const { present } = get();
          return present?.state ?? null;
        },

        // Get history log for debugging
        getHistoryLog: () => {
          const { past, present, future } = get();
          const all = [
            ...past.map((e) => ({ ...e, position: 'past' as const })),
            ...(present ? [{ ...present, position: 'present' as const }] : []),
            ...future.map((e) => ({ ...e, position: 'future' as const })),
          ];
          return all.map(({ actionType, timestamp, description }) => ({
            actionType,
            timestamp,
            description,
          }));
        },
      }),
      {
        name: 'blueprint-history',
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({
          past: state.past.slice(-10), // Only persist last 10 for storage limits
          present: state.present,
          future: state.future.slice(0, 5), // Only persist next 5
          scope: state.scope,
          maxHistory: state.maxHistory,
        }),
      }
    )
  );
}

// DEFAULT INSTANCE

/**
 * Default history store for blueprint competencies
 * Type is generic - actual type applied at usage
 */
export const useBlueprintHistoryStore = createHistoryStore<unknown>();

// HOOK FOR TYPED USAGE

/**
 * Hook for using history store with proper typing
 *
 * @example
 * const { pushState, undo, redo, canUndo, canRedo } = useHistory<BlueprintCompetency[]>();
 *
 * // On state change:
 * pushState(newCompetencies, 'ADD_COMPETENCY', 'Added Leadership');
 *
 * // On undo:
 * const previousState = undo();
 * if (previousState) setCompetencies(previousState);
 */
export function useHistory<T>() {
  const store = useBlueprintHistoryStore as unknown as ReturnType<typeof createHistoryStore<T>>;

  return {
    initialize: store.getState().initialize,
    pushState: store.getState().pushState,
    undo: store.getState().undo,
    redo: store.getState().redo,
    clear: store.getState().clear,
    getCurrentState: store.getState().getCurrentState,
    getHistoryLog: store.getState().getHistoryLog,
    // Subscribe to reactive state
    canUndo: store((s) => s.canUndo),
    canRedo: store((s) => s.canRedo),
    historyLength: store((s) => s.historyLength),
  };
}
