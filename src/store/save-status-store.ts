import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type { SaveStatus } from '@/hooks/useAutoSave';

// TYPES

/**
 * Save status store state - manages auto-save and persistence status.
 *
 * Note: The actual auto-save logic (debounce, retry, network detection) remains
 * in the `useAutoSave` hook. This store mirrors that state to make it accessible
 * to any component via Zustand without prop drilling through context.
 */
interface SaveStatusStoreState {
  /** Current save status from the auto-save hook */
  saveStatus: SaveStatus;
  /** Whether there are unsaved local changes */
  hasUnsavedChanges: boolean;
  /** Timestamp of the last successful save */
  lastSavedAt: Date | null;
  /** Whether a save operation is currently in progress */
  isSaving: boolean;
  /** Current retry attempt number (0 if not retrying) */
  retryAttempt: number;
  /** Whether the browser is currently offline */
  isOffline: boolean;
  /** Derived: Whether the UI should show a "pending" (disabled) state */
  isPending: boolean;
}

interface SaveStatusStoreActions {
  /**
   * Synchronize the store with the auto-save hook's current state.
   * Called by the provider on every hook state change.
   */
  syncFromAutoSave: (params: {
    status: SaveStatus;
    lastSaved: Date | null;
    hasUnsavedChanges: boolean;
    isSaving: boolean;
    retryAttempt: number;
    isOffline: boolean;
  }) => void;

  /**
   * Mark the status as "saving" (manual trigger).
   */
  setSaving: () => void;

  /**
   * Mark the status as "saved" with a timestamp.
   */
  setSaved: (timestamp?: Date) => void;

  /**
   * Mark the status as "error".
   */
  setError: () => void;

  /**
   * Mark that there are unsaved changes.
   */
  markUnsaved: () => void;

  /**
   * Reset to idle with no unsaved changes.
   */
  reset: () => void;
}

export type SaveStatusStore = SaveStatusStoreState & SaveStatusStoreActions;

// DEFAULT STATE

const defaultState: SaveStatusStoreState = {
  saveStatus: 'idle',
  hasUnsavedChanges: false,
  lastSavedAt: null,
  isSaving: false,
  retryAttempt: 0,
  isOffline: false,
  isPending: false,
};

// STORE

/**
 * Save Status Store
 *
 * Provides a Zustand-based mirror of the useAutoSave hook state.
 * This enables any component in the tree to read save status without
 * context nesting or prop drilling.
 *
 * The canonical auto-save logic (debounce timers, retry, beforeunload)
 * remains in useAutoSave. This store is synchronized by the
 * BlueprintWorkspaceProvider on every hook state change.
 *
 * Uses subscribeWithSelector for granular subscriptions.
 */
export const useSaveStatusStore = create<SaveStatusStore>()(
  devtools(
    subscribeWithSelector((set) => ({
      // Initial state
      ...defaultState,

      // ACTIONS

      syncFromAutoSave: ({ status, lastSaved, hasUnsavedChanges, isSaving, retryAttempt, isOffline }) => {
        set(
          {
            saveStatus: status,
            lastSavedAt: lastSaved,
            hasUnsavedChanges,
            isSaving,
            retryAttempt,
            isOffline,
            isPending: status === 'saving',
          },
          false,
          'syncFromAutoSave'
        );
      },

      setSaving: () => {
        set(
          { saveStatus: 'saving', isSaving: true, isPending: true },
          false,
          'setSaving'
        );
      },

      setSaved: (timestamp) => {
        set(
          {
            saveStatus: 'saved',
            hasUnsavedChanges: false,
            lastSavedAt: timestamp ?? new Date(),
            isSaving: false,
            isPending: false,
            retryAttempt: 0,
          },
          false,
          'setSaved'
        );
      },

      setError: () => {
        set(
          { saveStatus: 'error', isSaving: false, isPending: false },
          false,
          'setError'
        );
      },

      markUnsaved: () => {
        set({ hasUnsavedChanges: true }, false, 'markUnsaved');
      },

      reset: () => {
        set(defaultState, false, 'reset');
      },
    })),
    {
      name: 'SaveStatusStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// SELECTOR HOOKS

/**
 * Select the current save status string.
 */
export const useSaveStatus = () =>
  useSaveStatusStore((s) => s.saveStatus);

/**
 * Select whether there are unsaved changes.
 */
export const useHasUnsavedChanges = () =>
  useSaveStatusStore((s) => s.hasUnsavedChanges);

/**
 * Select the last saved timestamp.
 */
export const useLastSavedAt = () =>
  useSaveStatusStore((s) => s.lastSavedAt);

/**
 * Select whether a save is in progress.
 */
export const useIsSaving = () =>
  useSaveStatusStore((s) => s.isSaving);

/**
 * Select the full save status state for the SaveStatusIndicator component.
 */
export const useSaveIndicatorState = () =>
  useSaveStatusStore(
    useShallow((s) => ({
      saveStatus: s.saveStatus,
      lastSavedAt: s.lastSavedAt,
      hasUnsavedChanges: s.hasUnsavedChanges,
      isSaving: s.isSaving,
      retryAttempt: s.retryAttempt,
      isOffline: s.isOffline,
      isPending: s.isPending,
    }))
  );
