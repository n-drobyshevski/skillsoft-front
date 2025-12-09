'use client';

import React, {
  createContext,
  useContext,
  useOptimistic,
  useTransition,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';
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

type OptimisticAction =
  | { type: 'add'; competency: BlueprintCompetency }
  | { type: 'remove'; competencyId: string }
  | { type: 'reorder'; fromIndex: number; toIndex: number }
  | { type: 'update'; competencyId: string; updates: Partial<BlueprintCompetency> }
  | { type: 'updateSettings'; settings: Partial<BlueprintState> };

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

  // Actions
  addCompetency: (competency: LibraryCompetency) => void;
  removeCompetency: (competencyId: string) => void;
  reorderCompetencies: (fromIndex: number, toIndex: number) => void;
  updateCompetency: (
    competencyId: string,
    updates: Partial<BlueprintCompetency>
  ) => void;
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
// REDUCER
// ============================================

function blueprintReducer(
  state: BlueprintState,
  action: OptimisticAction
): BlueprintState {
  switch (action.type) {
    case 'add':
      // Prevent duplicates
      if (state.competencies.some((c) => c.id === action.competency.id)) {
        return state;
      }
      return {
        ...state,
        competencies: [...state.competencies, action.competency],
      };

    case 'remove':
      return {
        ...state,
        competencies: state.competencies.filter(
          (c) => c.id !== action.competencyId
        ),
      };

    case 'reorder': {
      const { fromIndex, toIndex } = action;
      const newCompetencies = [...state.competencies];
      const [moved] = newCompetencies.splice(fromIndex, 1);
      newCompetencies.splice(toIndex, 0, moved);
      return {
        ...state,
        competencies: newCompetencies,
      };
    }

    case 'update':
      return {
        ...state,
        competencies: state.competencies.map((c) =>
          c.id === action.competencyId ? { ...c, ...action.updates } : c
        ),
      };

    case 'updateSettings':
      return {
        ...state,
        ...action.settings,
      };

    default:
      return state;
  }
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
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  
  // Optimistic state for instant UI updates
  const [optimisticState, dispatchOptimistic] = useOptimistic(
    initialState,
    blueprintReducer
  );

  // Server-confirmed state for rollback
  const [serverState, setServerState] = useState(initialState);

  // Library with health status (updated from inventory)
  const [libraryCompetencies, setLibraryCompetencies] = useState(initialLibrary);

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

  // Add competency from library to canvas
  const addCompetency = useCallback(
    (competency: LibraryCompetency) => {
      // Check if already added
      if (optimisticState.competencies.some((c) => c.id === competency.id)) {
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

      startTransition(async () => {
        dispatchOptimistic({ type: 'add', competency: blueprintCompetency });

        const result = await updateBlueprint({
          ...optimisticState,
          competencies: [...optimisticState.competencies, blueprintCompetency],
        });

        if (result.success) {
          setServerState(result.data);
          toast.success(`Added ${competency.name}`);
        } else {
          toast.error(result.error);
          // State will rollback automatically with useOptimistic
        }
      });
    },
    [optimisticState, dispatchOptimistic]
  );

  // Remove competency from canvas
  const removeCompetency = useCallback(
    (competencyId: string) => {
      const competency = optimisticState.competencies.find(
        (c) => c.id === competencyId
      );

      startTransition(async () => {
        dispatchOptimistic({ type: 'remove', competencyId });

        const result = await updateBlueprint({
          ...optimisticState,
          competencies: optimisticState.competencies.filter(
            (c) => c.id !== competencyId
          ),
        });

        if (result.success) {
          setServerState(result.data);
          if (competency) {
            toast.success(`Removed ${competency.name}`);
          }
        } else {
          toast.error(result.error);
        }
      });
    },
    [optimisticState, dispatchOptimistic]
  );

  // Reorder competencies via drag-drop
  const reorderCompetencies = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;

      startTransition(async () => {
        dispatchOptimistic({ type: 'reorder', fromIndex, toIndex });

        const newCompetencies = [...optimisticState.competencies];
        const [moved] = newCompetencies.splice(fromIndex, 1);
        newCompetencies.splice(toIndex, 0, moved);

        const result = await updateBlueprint({
          ...optimisticState,
          competencies: newCompetencies,
        });

        if (result.success) {
          setServerState(result.data);
        } else {
          toast.error(result.error);
        }
      });
    },
    [optimisticState, dispatchOptimistic]
  );

  // Update single competency properties
  const updateCompetency = useCallback(
    (competencyId: string, updates: Partial<BlueprintCompetency>) => {
      startTransition(async () => {
        dispatchOptimistic({ type: 'update', competencyId, updates });

        const result = await updateBlueprint({
          ...optimisticState,
          competencies: optimisticState.competencies.map((c) =>
            c.id === competencyId ? { ...c, ...updates } : c
          ),
        });

        if (result.success) {
          setServerState(result.data);
        } else {
          toast.error(result.error);
        }
      });
    },
    [optimisticState, dispatchOptimistic]
  );

  // Update blueprint settings (strategy, time limit, etc.)
  const updateSettings = useCallback(
    (settings: Partial<BlueprintState>) => {
      startTransition(async () => {
        dispatchOptimistic({ type: 'updateSettings', settings });

        const result = await updateBlueprint({
          ...optimisticState,
          ...settings,
        });

        if (result.success) {
          setServerState(result.data);
        } else {
          toast.error(result.error);
        }
      });
    },
    [optimisticState, dispatchOptimistic]
  );

  // Run simulation with persona
  const runSimulation = useCallback(
    async (profile: SimulationProfile) => {
      setIsSimulating(true);
      try {
        const result = await simulateTest(optimisticState, profile);
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
    [optimisticState]
  );

  // Manual save (for explicit save button)
  const saveBlueprint = useCallback(async () => {
    setIsSaving(true);
    try {
      const result = await updateBlueprint(optimisticState);
      if (result.success) {
        setServerState(result.data);
        toast.success('Blueprint saved');
        return true;
      } else {
        toast.error(result.error);
        return false;
      }
    } finally {
      setIsSaving(false);
    }
  }, [optimisticState]);

  const value: BlueprintWorkspaceContextValue = {
    state: optimisticState,
    serverState,
    libraryCompetencies,
    templateId,
    templateName,
    isReadOnly,
    isPending,
    isSaving,
    isSimulating,
    simulationResult,
    addCompetency,
    removeCompetency,
    reorderCompetencies,
    updateCompetency,
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
