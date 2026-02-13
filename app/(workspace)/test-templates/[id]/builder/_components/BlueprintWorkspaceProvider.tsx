'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';
import { useAutoSave, type SaveStatus } from '@/hooks/useAutoSave';
import {
  BlueprintState,
  BlueprintCompetency,
  LibraryCompetency,
  SimulationResult,
  HealthStatus,
  updateBlueprint,
  simulateTest,
  fetchInventoryHealth,
  SimulationProfile,
} from '../actions';

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
// CONTEXT
// ============================================

const BlueprintWorkspaceContext = createContext<BlueprintWorkspaceContextValue | null>(null);

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
  templateId: string;
  templateName: string;
  isReadOnly?: boolean;
}

export function BlueprintWorkspaceProvider({
  children,
  initialState,
  libraryCompetencies: initialLibrary,
  templateId,
  templateName,
  isReadOnly = false,
}: BlueprintWorkspaceProviderProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  // Local state - updates trigger auto-save
  const [localState, setLocalState] = useState(initialState);

  // Server-confirmed state for rollback on error
  const [serverState, setServerState] = useState(initialState);

  // Library with health status (updated from inventory)
  const [libraryCompetencies, setLibraryCompetencies] = useState(initialLibrary);

  // Auto-save with debounce and retry
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
        setServerState(result.data);
        return true;
      }
      // Don't toast on each retry - only final failure
      return false;
    },
    onError: (error) => {
      // Show error toast only after all retries exhausted
      const message = error instanceof Error ? error.message : 'Failed to save';
      toast.error(message);
    },
    debounceMs: 2000,  // Wait 2s after last change
    maxWaitMs: 10000,  // Force save every 10s max
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

  // Fetch inventory health on mount
  useEffect(() => {
    async function loadHealth() {
      const result = await fetchInventoryHealth();
      if (result.success) {
        setLibraryCompetencies((prev) =>
          prev.map((c) => ({
            ...c,
            health: (result.data.competencyHealth[c.id] || 'HEALTHY') as HealthStatus,
          }))
        );
      }
    }
    loadHealth();
  }, []);

  // Add competency from library to canvas (appends to end)
  const addCompetency = useCallback(
    (competency: LibraryCompetency) => {
      // Check if already added
      if (localState.competencies.some((c) => c.id === competency.id)) {
        toast.warning('Competency already added');
        return;
      }

      // Check if critical health (no questions)
      if (competency.health === 'CRITICAL') {
        toast.error(`${competency.name} has no questions available`);
        return;
      }

      const blueprintCompetency: BlueprintCompetency = {
        id: competency.id,
        name: competency.name,
        category: competency.category,
        questionCount: Math.min(competency.questionCount, 5),
        weight: 1.0,
        difficulty: 'INTERMEDIATE',
      };

      // Update local state (triggers auto-save)
      setLocalState((prev) => ({
        ...prev,
        competencies: [...prev.competencies, blueprintCompetency],
      }));

      toast.success(`Added ${competency.name}`);
    },
    [localState.competencies]
  );

  // Insert competency at specific index (used by drag-and-drop)
  const insertCompetencyAtIndex = useCallback(
    (competency: LibraryCompetency, index: number) => {
      // Check if already added
      if (localState.competencies.some((c) => c.id === competency.id)) {
        toast.warning('Competency already added');
        return;
      }

      // Check if critical health (no questions)
      if (competency.health === 'CRITICAL') {
        toast.error(`${competency.name} has no questions available`);
        return;
      }

      const blueprintCompetency: BlueprintCompetency = {
        id: competency.id,
        name: competency.name,
        category: competency.category,
        questionCount: Math.min(competency.questionCount, 5),
        weight: 1.0,
        difficulty: 'INTERMEDIATE',
      };

      // Update local state with insertion at specific index
      setLocalState((prev) => {
        const newCompetencies = [...prev.competencies];
        // Clamp index to valid range
        const safeIndex = Math.max(0, Math.min(index, newCompetencies.length));
        newCompetencies.splice(safeIndex, 0, blueprintCompetency);
        return { ...prev, competencies: newCompetencies };
      });

      toast.success(`Added ${competency.name}`);
    },
    [localState.competencies]
  );

  // Remove competency from canvas (auto-saved) with undo capability
  const removeCompetency = useCallback(
    (competencyId: string) => {
      const competencyIndex = localState.competencies.findIndex(
        (c) => c.id === competencyId
      );
      const competency = localState.competencies[competencyIndex];

      if (!competency) return;

      // Store the competency and its position for potential undo
      const removedCompetency = { ...competency };
      const originalPosition = competencyIndex;

      // Update local state (triggers auto-save)
      setLocalState((prev) => ({
        ...prev,
        competencies: prev.competencies.filter((c) => c.id !== competencyId),
      }));

      // Show toast with undo action
      toast.success(`Removed ${competency.name}`, {
        action: {
          label: 'Undo',
          onClick: () => {
            // Restore the competency at its original position
            setLocalState((prev) => {
              const newCompetencies = [...prev.competencies];
              // Insert at original position, or at end if position is now invalid
              const insertIndex = Math.min(originalPosition, newCompetencies.length);
              newCompetencies.splice(insertIndex, 0, removedCompetency);
              return { ...prev, competencies: newCompetencies };
            });
            toast.success(`Restored ${removedCompetency.name}`);
          },
        },
        duration: 5000, // Give user 5 seconds to undo
      });
    },
    [localState.competencies]
  );

  // Reorder competencies via drag-drop (auto-saved)
  const reorderCompetencies = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    setLocalState((prev) => {
      const newCompetencies = [...prev.competencies];
      const [moved] = newCompetencies.splice(fromIndex, 1);
      newCompetencies.splice(toIndex, 0, moved);
      return { ...prev, competencies: newCompetencies };
    });
  };

  // Update single competency properties (auto-saved)
  const updateCompetency = (competencyId: string, updates: Partial<BlueprintCompetency>) => {
    setLocalState((prev) => ({
      ...prev,
      competencies: prev.competencies.map((c) =>
        c.id === competencyId ? { ...c, ...updates } : c
      ),
    }));
  };

  // Replace full competency list - used for undo/redo (auto-saved)
  const setCompetencies = (competencies: BlueprintCompetency[]) => {
    setLocalState((prev) => ({ ...prev, competencies }));
  };

  // Update blueprint settings - strategy, time limit, etc. (auto-saved)
  const updateSettings = (settings: Partial<BlueprintState>) => {
    setLocalState((prev) => ({ ...prev, ...settings }));
  };

  // Run simulation with persona
  const runSimulation = useCallback(
    async (profile: SimulationProfile) => {
      setIsSimulating(true);
      try {
        const result = await simulateTest(localState, profile);
        if (result.success) {
          setSimulationResult(result.data);
        } else {
          toast.error(result.error);
        }
      } catch {
        toast.error('Simulation failed');
      } finally {
        setIsSimulating(false);
      }
    },
    [localState]
  );

  // Manual save (for explicit save button - uses the auto-save hook)
  const saveBlueprint = useCallback(async () => {
    const success = await saveNow();
    if (success) {
      toast.success('Blueprint saved');
    }
    return success;
  }, [saveNow]);

  // Derive isPending from save status (for UI disabled states)
  const isPending = saveStatus === 'saving';

  const value: BlueprintWorkspaceContextValue = {
    // State
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
    // Actions
    addCompetency,
    insertCompetencyAtIndex,
    removeCompetency,
    reorderCompetencies,
    updateCompetency,
    setCompetencies,
    updateSettings,
    runSimulation,
    saveBlueprint,
  };

  return (
    <BlueprintWorkspaceContext.Provider value={value}>
      {children}
    </BlueprintWorkspaceContext.Provider>
  );
}
