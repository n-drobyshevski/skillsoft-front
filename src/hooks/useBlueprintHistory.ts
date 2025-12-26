'use client';

import { useEffect, useCallback, useRef, useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { BlueprintCompetency } from '@/app/(workspace)/test-templates/[id]/builder/actions';

/**
 * Blueprint History Hook - Phase 4.1 Workflow Formalization
 *
 * Provides undo/redo functionality for blueprint competencies with:
 * - SessionStorage persistence for crash recovery
 * - Configurable history limits
 * - Explicit action types for debugging
 * - Debounced state tracking to avoid excessive snapshots
 */

// ============================================
// TYPES
// ============================================

export type HistoryActionType =
  | 'ADD_COMPETENCY'
  | 'REMOVE_COMPETENCY'
  | 'REORDER'
  | 'UPDATE_WEIGHT'
  | 'UPDATE_DIFFICULTY'
  | 'BATCH_UPDATE'
  | 'INITIAL';

interface HistoryEntry {
  competencies: BlueprintCompetency[];
  actionType: HistoryActionType;
  timestamp: number;
  description?: string;
}

interface HistoryState {
  // Stack state
  past: HistoryEntry[];
  present: HistoryEntry | null;
  future: HistoryEntry[];

  // Config
  scope: string;
  maxHistory: number;

  // Actions
  initialize: (competencies: BlueprintCompetency[], scope: string, maxHistory?: number) => void;
  push: (competencies: BlueprintCompetency[], actionType: HistoryActionType, description?: string) => void;
  undo: () => BlueprintCompetency[] | null;
  redo: () => BlueprintCompetency[] | null;
  clear: () => void;
}

// ============================================
// ZUSTAND STORE
// ============================================

const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      past: [],
      present: null,
      future: [],
      scope: '',
      maxHistory: 50,

      initialize: (competencies, scope, maxHistory = 50) => {
        const { scope: currentScope, present } = get();

        // Skip if already initialized for this scope
        if (currentScope === scope && present !== null) {
          return;
        }

        set({
          past: [],
          present: {
            competencies: competencies.map((c) => ({ ...c })),
            actionType: 'INITIAL',
            timestamp: Date.now(),
            description: 'Initial state',
          },
          future: [],
          scope,
          maxHistory,
        });
      },

      push: (competencies, actionType, description) => {
        const { past, present, maxHistory } = get();

        // Skip if no present state (not initialized)
        if (!present) {
          set({
            present: {
              competencies: competencies.map((c) => ({ ...c })),
              actionType,
              timestamp: Date.now(),
              description,
            },
          });
          return;
        }

        // Skip if competencies haven't actually changed
        const currentJson = JSON.stringify(present.competencies);
        const newJson = JSON.stringify(competencies);
        if (currentJson === newJson) {
          return;
        }

        // Push current to past, set new as present
        const newPast = [...past, present].slice(-maxHistory);

        set({
          past: newPast,
          present: {
            competencies: competencies.map((c) => ({ ...c })),
            actionType,
            timestamp: Date.now(),
            description,
          },
          future: [], // Clear redo on new action
        });
      },

      undo: () => {
        const { past, present, future } = get();

        if (past.length === 0 || !present) {
          return null;
        }

        const previous = past[past.length - 1];
        const newPast = past.slice(0, -1);

        set({
          past: newPast,
          present: previous,
          future: [present, ...future],
        });

        return previous.competencies.map((c) => ({ ...c }));
      },

      redo: () => {
        const { past, present, future } = get();

        if (future.length === 0 || !present) {
          return null;
        }

        const next = future[0];
        const newFuture = future.slice(1);

        set({
          past: [...past, present],
          present: next,
          future: newFuture,
        });

        return next.competencies.map((c) => ({ ...c }));
      },

      clear: () => {
        const { present } = get();
        set({
          past: [],
          future: [],
          // Keep present
        });
      },
    }),
    {
      name: 'blueprint-history-v1',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        past: state.past.slice(-10),
        present: state.present,
        future: state.future.slice(0, 5),
        scope: state.scope,
        maxHistory: state.maxHistory,
      }),
    }
  )
);

// ============================================
// REACT HOOK
// ============================================

interface UseBlueprintHistoryOptions {
  templateId: string;
  maxHistory?: number;
}

interface UseBlueprintHistoryReturn {
  // Actions
  trackChange: (competencies: BlueprintCompetency[], actionType: HistoryActionType, description?: string) => void;
  undo: () => BlueprintCompetency[] | null;
  redo: () => BlueprintCompetency[] | null;
  clear: () => void;

  // State
  canUndo: boolean;
  canRedo: boolean;
  historyLength: number;
  lastAction: HistoryActionType | null;
}

/**
 * Hook for managing blueprint history with undo/redo
 *
 * @example
 * const { trackChange, undo, redo, canUndo, canRedo } = useBlueprintHistory({
 *   templateId: 'abc-123',
 * });
 *
 * // Track a change
 * trackChange(newCompetencies, 'ADD_COMPETENCY', 'Added Leadership');
 *
 * // Undo
 * const previousState = undo();
 * if (previousState) setCompetencies(previousState);
 */
export function useBlueprintHistory({
  templateId,
  maxHistory = 50,
}: UseBlueprintHistoryOptions): UseBlueprintHistoryReturn {
  const store = useHistoryStore;
  const initializedRef = useRef(false);

  // Subscribe to store state reactively
  const past = store((s) => s.past);
  const present = store((s) => s.present);
  const future = store((s) => s.future);
  const scope = store((s) => s.scope);

  // Reinitialize if scope changes (different template)
  useEffect(() => {
    if (scope !== templateId) {
      initializedRef.current = false;
    }
  }, [scope, templateId]);

  // Initialize on first call (must be called with initial competencies)
  const initializeHistory = useCallback(
    (competencies: BlueprintCompetency[]) => {
      if (!initializedRef.current) {
        store.getState().initialize(competencies, templateId, maxHistory);
        initializedRef.current = true;
      }
    },
    [templateId, maxHistory]
  );

  // Track a change
  const trackChange = useCallback(
    (competencies: BlueprintCompetency[], actionType: HistoryActionType, description?: string) => {
      // Auto-initialize if needed
      if (!initializedRef.current) {
        initializeHistory(competencies);
        return;
      }
      store.getState().push(competencies, actionType, description);
    },
    [initializeHistory]
  );

  // Undo action
  const undo = useCallback(() => {
    return store.getState().undo();
  }, []);

  // Redo action
  const redo = useCallback(() => {
    return store.getState().redo();
  }, []);

  // Clear history
  const clear = useCallback(() => {
    store.getState().clear();
  }, []);

  return {
    trackChange,
    undo,
    redo,
    clear,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    historyLength: past.length + (present ? 1 : 0) + future.length,
    lastAction: present?.actionType ?? null,
  };
}

// Export store for direct access if needed
export { useHistoryStore };
