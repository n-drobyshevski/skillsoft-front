'use client';

import React, {
  createContext,
  use,
  useContext,
  useCallback,
  useEffect,
  useRef,
  Suspense,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useAutoSave, type SaveStatus } from '@/hooks/useAutoSave';
import { useMultiTabSync } from '@/hooks/useMultiTabSync';
import {
  BlueprintState,
  BlueprintCompetency,
  LibraryCompetency,
  SimulationResult,
  updateBlueprint,
  simulateTest,
  fetchInventoryHealth,
  SimulationProfile,
} from '../actions';
import { ConflictResolutionDialog } from './ConflictResolutionDialog';

// Zustand stores (STATE-1)
import { useBlueprintStore } from '@/store/blueprint-store';
import { useSimulationStore } from '@/store/simulation-store';
import { useSaveStatusStore } from '@/store/save-status-store';

// ============================================
// TYPES
// ============================================

interface BlueprintWorkspaceContextValue {
  // State
  state: BlueprintState;
  serverState: BlueprintState;
  libraryCompetencies: LibraryCompetency[];
  templateId: string;
  templateName: string;
  isReadOnly: boolean;

  // UI State
  isPending: boolean;
  isSaving: boolean;
  isSimulating: boolean;
  simulationResult: SimulationResult | null;

  // Auto-save state
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  retryAttempt: number;
  isOffline: boolean;

  // Actions
  addCompetency: (competency: LibraryCompetency) => void;
  /** Insert competency at specific index (used by drag-and-drop) */
  insertCompetencyAtIndex: (competency: LibraryCompetency, index: number) => void;
  removeCompetency: (competencyId: string) => void;
  reorderCompetencies: (fromIndex: number, toIndex: number) => void;
  updateCompetency: (
    competencyId: string,
    updates: Partial<BlueprintCompetency>
  ) => void;
  setCompetencies: (competencies: BlueprintCompetency[]) => void;
  updateSettings: (settings: Partial<BlueprintState>) => void;
  runSimulation: (profile: SimulationProfile) => Promise<void>;
  saveBlueprint: () => Promise<boolean>;
}

// ============================================
// CONTEXT (kept for backward compatibility)
// ============================================

const BlueprintWorkspaceContext = createContext<BlueprintWorkspaceContextValue | null>(null);

/**
 * Legacy compatibility hook - reads from context which delegates to Zustand stores.
 *
 * For new code, prefer using the individual store hooks directly:
 * - useBlueprintStore() for blueprint state and mutations
 * - useSimulationStore() for simulation state
 * - useSaveStatusStore() for save status
 *
 * These provide better re-render optimization via selective subscriptions.
 */
export function useBlueprintWorkspace() {
  const ctx = useContext(BlueprintWorkspaceContext);
  if (!ctx) {
    throw new Error(
      'useBlueprintWorkspace must be used within BlueprintWorkspaceProvider'
    );
  }
  return ctx;
}

// ============================================
// PROVIDER
// ============================================

interface BlueprintWorkspaceProviderProps {
  children: ReactNode;
  initialState: BlueprintState;
  libraryCompetencies: LibraryCompetency[];
  /** R19-1: Streamed competencies promise from server component */
  competenciesPromise?: Promise<import('@/types/domain').Competency[]>;
  templateId: string;
  templateName: string;
  isReadOnly?: boolean;
}

/**
 * BlueprintWorkspaceProvider
 *
 * Initializes the Zustand stores (BlueprintStore, SimulationStore, SaveStatusStore)
 * from server props and wires up the auto-save hook. Provides a context wrapper
 * for backward compatibility with existing consumer components.
 *
 * STATE-1 Migration:
 * - Stores own the canonical state; context delegates to stores.
 * - Auto-save hook reads from BlueprintStore and syncs status to SaveStatusStore.
 * - Consumers can gradually migrate from useBlueprintWorkspace() to individual store hooks.
 */
export function BlueprintWorkspaceProvider({
  children,
  initialState,
  libraryCompetencies: initialLibrary,
  competenciesPromise,
  templateId,
  templateName,
  isReadOnly = false,
}: BlueprintWorkspaceProviderProps) {
  const t = useTranslations('builder.simulator');

  // ============================================
  // STORE INITIALIZATION
  // ============================================

  const blueprintInitialize = useBlueprintStore((s) => s.initialize);
  const initRef = useRef(false);

  // Initialize blueprint store on mount (once per provider instance)
  useEffect(() => {
    if (!initRef.current) {
      blueprintInitialize({
        initialState,
        libraryCompetencies: initialLibrary,
        templateId,
        templateName,
        isReadOnly,
      });
      initRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================
  // READ FROM STORES
  // ============================================

  // Blueprint store state
  const localState = useBlueprintStore((s) => s.state);
  const serverState = useBlueprintStore((s) => s.serverState);
  const libraryCompetencies = useBlueprintStore((s) => s.libraryCompetencies);

  // Blueprint store actions (stable references from Zustand)
  const storeAddCompetency = useBlueprintStore((s) => s.addCompetency);
  const storeInsertCompetencyAtIndex = useBlueprintStore((s) => s.insertCompetencyAtIndex);
  const storeRemoveCompetency = useBlueprintStore((s) => s.removeCompetency);
  const storeReorderCompetencies = useBlueprintStore((s) => s.reorderCompetencies);
  const storeUpdateCompetency = useBlueprintStore((s) => s.updateCompetency);
  const storeSetCompetencies = useBlueprintStore((s) => s.setCompetencies);
  const storeUpdateSettings = useBlueprintStore((s) => s.updateSettings);
  const storeSetServerState = useBlueprintStore((s) => s.setServerState);
  const storeRollback = useBlueprintStore((s) => s.rollbackToServerState);
  const storeUpdateLibraryHealth = useBlueprintStore((s) => s.updateLibraryHealth);

  // Simulation store state and actions
  const isSimulating = useSimulationStore((s) => s.isSimulating);
  const simulationResult = useSimulationStore((s) => s.simulationResult);
  const storeSetSimulating = useSimulationStore((s) => s.setSimulating);
  const storeSetSimulationResult = useSimulationStore((s) => s.setSimulationResult);

  // Save status store sync
  const syncSaveStatus = useSaveStatusStore((s) => s.syncFromAutoSave);

  // ============================================
  // AUTO-SAVE INTEGRATION
  // ============================================

  // Keep a ref to serverState for the onError rollback closure
  const serverStateRef = useRef(serverState);
  serverStateRef.current = serverState;

  const {
    status: saveStatus,
    lastSaved,
    hasUnsavedChanges,
    saveNow,
    isSaving,
    retryAttempt,
    isOffline,
  } = useAutoSave({
    data: localState,
    onSave: async (state) => {
      const result = await updateBlueprint(state);
      if (result.success) {
        storeSetServerState(result.data);
        return true;
      }
      return false;
    },
    onError: (error) => {
      // Rollback to last server-confirmed state after all retries exhausted
      storeRollback();
      const message = error instanceof Error ? error.message : 'Failed to save';
      toast.error(`${message} ${t('toasts.changesReverted')}`);
    },
    debounceMs: 2000,
    maxWaitMs: 10000,
    enabled: !isReadOnly,
    compareKey: (s) => JSON.stringify({ competencies: s.competencies, settings: s }),
    retry: {
      maxAttempts: 3,
      baseDelayMs: 1000,
      multiplier: 2,
      maxDelayMs: 8000,
    },
    warnOnLeave: true,
  });

  // Sync auto-save hook state into SaveStatusStore on every change
  useEffect(() => {
    syncSaveStatus({
      status: saveStatus,
      lastSaved,
      hasUnsavedChanges,
      isSaving,
      retryAttempt,
      isOffline,
    });
  }, [saveStatus, lastSaved, hasUnsavedChanges, isSaving, retryAttempt, isOffline, syncSaveStatus]);

  // ============================================
  // ARCH-2: MULTI-TAB SYNC + CONFLICT RESOLUTION
  // ============================================

  const {
    hasConflict,
    conflictInfo,
    broadcastState: syncBroadcast,
    resolveConflict: syncResolve,
    clearConflict: syncClear,
  } = useMultiTabSync<BlueprintCompetency[]>({
    channelName: templateId,
    enabled: !isReadOnly,
    onRemoteUpdate: (remoteCompetencies) => {
      // When another tab updates without conflict, silently apply
      storeSetCompetencies(remoteCompetencies);
    },
  });

  // Broadcast competencies to other tabs after every successful save
  const prevSaveStatusRef = useRef(saveStatus);
  useEffect(() => {
    if (prevSaveStatusRef.current === 'saving' && saveStatus === 'saved') {
      syncBroadcast(localState.competencies);
    }
    prevSaveStatusRef.current = saveStatus;
  }, [saveStatus, localState.competencies, syncBroadcast]);

  // Handle conflict resolution from the dialog
  const handleConflictResolve = useCallback(
    (resolution: 'keep_local' | 'use_remote' | 'merge') => {
      const resolved = syncResolve(resolution);
      if (resolved) {
        storeSetCompetencies(resolved);
        toast.success(
          resolution === 'merge'
            ? t('toasts.changesMerged')
            : resolution === 'keep_local'
              ? t('toasts.keptYourChanges')
              : t('toasts.appliedOtherChanges')
        );
      }
    },
    [syncResolve, storeSetCompetencies]
  );

  // ============================================
  // FETCH INVENTORY HEALTH ON MOUNT
  // ============================================

  useEffect(() => {
    async function loadHealth() {
      const result = await fetchInventoryHealth();
      if (result.success) {
        storeUpdateLibraryHealth(result.data.competencyHealth);
      }
    }
    loadHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================
  // WRAPPED ACTIONS (bridge store actions to context API)
  // ============================================

  // runSimulation: orchestrates simulateTest server action + store updates
  const runSimulation = useCallback(
    async (profile: SimulationProfile) => {
      storeSetSimulating(true);
      try {
        const currentState = useBlueprintStore.getState().state;
        const result = await simulateTest(currentState, profile);
        if (result.success) {
          storeSetSimulationResult(result.data);
        } else {
          toast.error(result.error);
          storeSetSimulating(false);
        }
      } catch {
        toast.error(t('toasts.simulationFailed'));
        storeSetSimulating(false);
      }
    },
    [storeSetSimulating, storeSetSimulationResult]
  );

  // Manual save (explicit save button)
  const saveBlueprint = useCallback(async () => {
    const success = await saveNow();
    if (success) {
      toast.success(t('toasts.blueprintSaved'));
    }
    return success;
  }, [saveNow]);

  // Derive isPending from save status
  const isPending = saveStatus === 'saving';

  // ============================================
  // CONTEXT VALUE (delegates to stores)
  // ============================================

  const value: BlueprintWorkspaceContextValue = {
    // State (from BlueprintStore)
    state: localState,
    serverState,
    libraryCompetencies,
    templateId,
    templateName,
    isReadOnly,
    // UI State
    isPending,
    isSaving,
    isSimulating,
    simulationResult,
    // Auto-save state
    saveStatus,
    lastSaved,
    hasUnsavedChanges,
    retryAttempt,
    isOffline,
    // Actions (delegated to stores)
    addCompetency: storeAddCompetency,
    insertCompetencyAtIndex: storeInsertCompetencyAtIndex,
    removeCompetency: storeRemoveCompetency,
    reorderCompetencies: storeReorderCompetencies,
    updateCompetency: storeUpdateCompetency,
    setCompetencies: storeSetCompetencies,
    updateSettings: storeUpdateSettings,
    runSimulation,
    saveBlueprint,
  };

  return (
    <BlueprintWorkspaceContext.Provider value={value}>
      {/* R19-1: Stream competencies via Suspense + use() */}
      {competenciesPromise && (
        <Suspense fallback={null}>
          <CompetencyResolver competenciesPromise={competenciesPromise} />
        </Suspense>
      )}
      {children}
      {/* ARCH-2: Multi-tab conflict resolution dialog */}
      <ConflictResolutionDialog
        open={hasConflict}
        conflict={conflictInfo}
        onResolve={handleConflictResolve}
        onDismiss={syncClear}
      />
    </BlueprintWorkspaceContext.Provider>
  );
}

// ============================================
// R19-1: STREAMING COMPETENCY RESOLVER
// ============================================

/**
 * Invisible component that resolves the competencies promise via React 19 use().
 * Suspends until competencies are available, then hydrates the Zustand store
 * with library data and enriches canvas competency names.
 */
function CompetencyResolver({
  competenciesPromise,
}: {
  competenciesPromise: Promise<import('@/types/domain').Competency[]>;
}) {
  const competencies = use(competenciesPromise);
  const setLibrary = useBlueprintStore((s) => s.setLibraryCompetencies);
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;

    const library: LibraryCompetency[] = competencies.map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      description: c.description || '',
      questionCount:
        c.behavioralIndicators?.reduce(
          (sum, bi) => sum + (bi.isActive ? 1 : 0),
          0
        ) || 0,
      health: 'HEALTHY' as const,
    }));

    setLibrary(library);
  }, [competencies, setLibrary]);

  return null;
}
