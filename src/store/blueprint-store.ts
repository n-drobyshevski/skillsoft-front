import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { toast } from 'sonner';
import type {
  BlueprintState,
  BlueprintCompetency,
  LibraryCompetency,
  HealthStatus,
} from '@/types/blueprint';

// ============================================
// TYPES
// ============================================

/**
 * Blueprint store state - manages the core blueprint data
 * including competencies, settings, library, and server state.
 */
interface BlueprintStoreState {
  /** Current local state (optimistic, triggers auto-save) */
  state: BlueprintState;
  /** Last server-confirmed state for rollback on save failure */
  serverState: BlueprintState;
  /** Library competencies with health status */
  libraryCompetencies: LibraryCompetency[];
  /** Template identifier */
  templateId: string;
  /** Template display name */
  templateName: string;
  /** Whether the workspace is read-only */
  isReadOnly: boolean;
  /** Whether the store has been initialized */
  _initialized: boolean;
}

interface BlueprintStoreActions {
  /**
   * Initialize the store from server data (called by provider on mount).
   * Resets all state to the provided initial values.
   */
  initialize: (params: {
    initialState: BlueprintState;
    libraryCompetencies: LibraryCompetency[];
    templateId: string;
    templateName: string;
    isReadOnly: boolean;
  }) => void;

  /**
   * Add a competency from the library to the end of the canvas.
   * Shows toast on duplicate or CRITICAL health.
   */
  addCompetency: (competency: LibraryCompetency) => void;

  /**
   * Insert a competency at a specific index (used by drag-and-drop).
   * Shows toast on duplicate or CRITICAL health.
   */
  insertCompetencyAtIndex: (competency: LibraryCompetency, index: number) => void;

  /**
   * Remove a competency from the canvas by ID.
   * Shows undo toast with 5-second window.
   */
  removeCompetency: (competencyId: string) => void;

  /**
   * Reorder competencies via drag-drop.
   * No-op if fromIndex === toIndex.
   */
  reorderCompetencies: (fromIndex: number, toIndex: number) => void;

  /**
   * Update a single competency's properties by ID.
   */
  updateCompetency: (
    competencyId: string,
    updates: Partial<BlueprintCompetency>
  ) => void;

  /**
   * Replace the full competency list (used by undo/redo).
   */
  setCompetencies: (competencies: BlueprintCompetency[]) => void;

  /**
   * Update blueprint settings (strategy, time limit, etc.).
   * Merges with existing state.
   */
  updateSettings: (settings: Partial<BlueprintState>) => void;

  /**
   * Update the server-confirmed state after a successful save.
   */
  setServerState: (serverState: BlueprintState) => void;

  /**
   * Rollback local state to the last server-confirmed state.
   */
  rollbackToServerState: () => void;

  /**
   * Update library competencies with health status from inventory.
   */
  updateLibraryHealth: (healthMap: Record<string, HealthStatus>) => void;

  /**
   * Set library competencies list (used by streaming data resolver).
   * Also enriches canvas competency names/categories from the library data.
   */
  setLibraryCompetencies: (competencies: LibraryCompetency[]) => void;
}

export type BlueprintStore = BlueprintStoreState & BlueprintStoreActions;

// ============================================
// DEFAULT STATE
// ============================================

const defaultBlueprintState: BlueprintState = {
  templateId: '',
  templateName: '',
  strategy: 'UNIVERSAL_BASELINE',
  competencies: [],
  adaptivity: { mode: 'LINEAR', allowBacktracking: true },
  timeLimitMinutes: 60,
  passingScore: 70,
};

const defaultState: BlueprintStoreState = {
  state: defaultBlueprintState,
  serverState: defaultBlueprintState,
  libraryCompetencies: [],
  templateId: '',
  templateName: '',
  isReadOnly: false,
  _initialized: false,
};

// ============================================
// HELPERS
// ============================================

/**
 * Create a BlueprintCompetency from a LibraryCompetency with default values.
 */
function toBlueprintCompetency(competency: LibraryCompetency): BlueprintCompetency {
  return {
    id: competency.id,
    name: competency.name,
    category: competency.category,
    questionCount: Math.min(competency.questionCount, 5),
    weight: 1.0,
    difficulty: 'INTERMEDIATE',
  };
}

/**
 * Validate whether a library competency can be added.
 * Returns null if valid, or a reason string if invalid.
 */
function validateAdd(
  competency: LibraryCompetency,
  currentCompetencies: BlueprintCompetency[]
): string | null {
  if (currentCompetencies.some((c) => c.id === competency.id)) {
    return 'duplicate';
  }
  if (competency.health === 'CRITICAL') {
    return 'critical';
  }
  return null;
}

// ============================================
// STORE
// ============================================

/**
 * Blueprint Store
 *
 * Manages the core blueprint workspace state. This is the primary data store
 * for the test template builder, handling competencies, settings, and library.
 *
 * Designed for use alongside SimulationStore and SaveStatusStore as part of
 * the STATE-1 migration from BlueprintWorkspaceProvider context.
 *
 * Uses subscribeWithSelector for granular re-render optimization.
 * Components should use useShallow selectors for multi-field subscriptions.
 */
export const useBlueprintStore = create<BlueprintStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      ...defaultState,

      // ============================================
      // ACTIONS
      // ============================================

      initialize: ({
        initialState,
        libraryCompetencies,
        templateId,
        templateName,
        isReadOnly,
      }) => {
        set(
          (prev) => {
            // Preserve library if already populated (defense against effect ordering race)
            const effectiveLibrary =
              prev.libraryCompetencies.length > 0
                ? prev.libraryCompetencies
                : libraryCompetencies;

            // If library was already populated, enrich initial "Unknown" competency names
            let enrichedState = initialState;
            if (effectiveLibrary.length > 0) {
              const lookup = new Map(
                effectiveLibrary.map((c) => [c.id, { name: c.name, category: c.category }])
              );
              enrichedState = {
                ...initialState,
                competencies: initialState.competencies.map((c) => {
                  const enriched = lookup.get(c.id);
                  if (enriched && (c.name === 'Unknown' || c.category === 'UNKNOWN')) {
                    return {
                      ...c,
                      name: enriched.name || c.name,
                      category: enriched.category || c.category,
                    };
                  }
                  return c;
                }),
              };
            }

            return {
              state: enrichedState,
              serverState: enrichedState,
              libraryCompetencies: effectiveLibrary,
              templateId,
              templateName,
              isReadOnly,
              _initialized: true,
            };
          },
          false,
          'initialize'
        );
      },

      addCompetency: (competency) => {
        const { state: currentState } = get();
        const reason = validateAdd(competency, currentState.competencies);

        if (reason === 'duplicate') {
          toast.warning('Competency already added');
          return;
        }
        if (reason === 'critical') {
          toast.error(`${competency.name} has no questions available`);
          return;
        }

        const blueprintCompetency = toBlueprintCompetency(competency);

        set(
          (prev) => ({
            state: {
              ...prev.state,
              competencies: [...prev.state.competencies, blueprintCompetency],
            },
          }),
          false,
          'addCompetency'
        );

        toast.success(`Added ${competency.name}`);
      },

      insertCompetencyAtIndex: (competency, index) => {
        const { state: currentState } = get();
        const reason = validateAdd(competency, currentState.competencies);

        if (reason === 'duplicate') {
          toast.warning('Competency already added');
          return;
        }
        if (reason === 'critical') {
          toast.error(`${competency.name} has no questions available`);
          return;
        }

        const blueprintCompetency = toBlueprintCompetency(competency);

        set(
          (prev) => {
            const newCompetencies = [...prev.state.competencies];
            const safeIndex = Math.max(0, Math.min(index, newCompetencies.length));
            newCompetencies.splice(safeIndex, 0, blueprintCompetency);
            return {
              state: { ...prev.state, competencies: newCompetencies },
            };
          },
          false,
          'insertCompetencyAtIndex'
        );

        toast.success(`Added ${competency.name}`);
      },

      removeCompetency: (competencyId) => {
        const { state: currentState } = get();
        const competencyIndex = currentState.competencies.findIndex(
          (c) => c.id === competencyId
        );
        const competency = currentState.competencies[competencyIndex];

        if (!competency) return;

        const removedCompetency = { ...competency };
        const originalPosition = competencyIndex;

        set(
          (prev) => ({
            state: {
              ...prev.state,
              competencies: prev.state.competencies.filter(
                (c) => c.id !== competencyId
              ),
            },
          }),
          false,
          'removeCompetency'
        );

        toast.success(`Removed ${competency.name}`, {
          action: {
            label: 'Undo',
            onClick: () => {
              set(
                (prev) => {
                  const newCompetencies = [...prev.state.competencies];
                  const insertIndex = Math.min(
                    originalPosition,
                    newCompetencies.length
                  );
                  newCompetencies.splice(insertIndex, 0, removedCompetency);
                  return {
                    state: { ...prev.state, competencies: newCompetencies },
                  };
                },
                false,
                'undoRemoveCompetency'
              );
              toast.success(`Restored ${removedCompetency.name}`);
            },
          },
          duration: 5000,
        });
      },

      reorderCompetencies: (fromIndex, toIndex) => {
        if (fromIndex === toIndex) return;

        set(
          (prev) => {
            const newCompetencies = [...prev.state.competencies];
            const [moved] = newCompetencies.splice(fromIndex, 1);
            newCompetencies.splice(toIndex, 0, moved);
            return {
              state: { ...prev.state, competencies: newCompetencies },
            };
          },
          false,
          'reorderCompetencies'
        );
      },

      updateCompetency: (competencyId, updates) => {
        set(
          (prev) => ({
            state: {
              ...prev.state,
              competencies: prev.state.competencies.map((c) =>
                c.id === competencyId ? { ...c, ...updates } : c
              ),
            },
          }),
          false,
          'updateCompetency'
        );
      },

      setCompetencies: (competencies) => {
        set(
          (prev) => ({
            state: { ...prev.state, competencies },
          }),
          false,
          'setCompetencies'
        );
      },

      updateSettings: (settings) => {
        set(
          (prev) => ({
            state: { ...prev.state, ...settings },
          }),
          false,
          'updateSettings'
        );
      },

      setServerState: (serverState) => {
        set({ serverState }, false, 'setServerState');
      },

      rollbackToServerState: () => {
        set(
          (prev) => ({
            state: prev.serverState,
          }),
          false,
          'rollbackToServerState'
        );
      },

      updateLibraryHealth: (healthMap) => {
        set(
          (prev) => ({
            libraryCompetencies: prev.libraryCompetencies.map((c) => ({
              ...c,
              health: (healthMap[c.id] || 'HEALTHY') as HealthStatus,
            })),
          }),
          false,
          'updateLibraryHealth'
        );
      },

      setLibraryCompetencies: (competencies) => {
        // Build a name/category lookup from the incoming competencies
        const lookup = new Map(
          competencies.map((c) => [c.id, { name: c.name, category: c.category }])
        );

        set(
          (prev) => ({
            libraryCompetencies: competencies,
            // Enrich canvas competency names if they were placeholder "Unknown"
            state: {
              ...prev.state,
              competencies: prev.state.competencies.map((c) => {
                const enriched = lookup.get(c.id);
                if (enriched && (c.name === 'Unknown' || c.category === 'UNKNOWN')) {
                  return {
                    ...c,
                    name: enriched.name || c.name,
                    category: enriched.category || c.category,
                  };
                }
                return c;
              }),
            },
          }),
          false,
          'setLibraryCompetencies'
        );
      },
    })),
    {
      name: 'BlueprintStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// ============================================
// SELECTOR HOOKS
// ============================================

/**
 * Select the current blueprint state (competencies + settings).
 */
export const useBlueprintState = () =>
  useBlueprintStore((s) => s.state);

/**
 * Select only the competencies array.
 */
export const useBlueprintCompetencies = () =>
  useBlueprintStore((s) => s.state.competencies);

/**
 * Select the library competencies list.
 */
export const useLibraryCompetencies = () =>
  useBlueprintStore((s) => s.libraryCompetencies);

/**
 * Select the template identity fields.
 */
export const useTemplateIdentity = () =>
  useBlueprintStore(
    useShallow((s) => ({
      templateId: s.templateId,
      templateName: s.templateName,
      isReadOnly: s.isReadOnly,
    }))
  );

/**
 * Select all mutation actions (stable references from Zustand).
 */
export const useBlueprintActions = () =>
  useBlueprintStore(
    useShallow((s) => ({
      addCompetency: s.addCompetency,
      insertCompetencyAtIndex: s.insertCompetencyAtIndex,
      removeCompetency: s.removeCompetency,
      reorderCompetencies: s.reorderCompetencies,
      updateCompetency: s.updateCompetency,
      setCompetencies: s.setCompetencies,
      updateSettings: s.updateSettings,
    }))
  );
