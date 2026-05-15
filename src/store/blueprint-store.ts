import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { toast } from 'sonner';
import type {
  BlueprintState,
  BlueprintCompetency,
  LibraryCompetency,
  ResolvedOnetCompetency,
  HealthStatus,
  Difficulty,
  IndicatorInventory,
} from '@/types/blueprint';

// TYPES

/**
 * Blueprint store state - manages the core blueprint data
 * including competencies, settings, library, and server state.
 */
/** Minimal indicator shape stored for the card's "Indicator priority" section. */
export interface StoredIndicator {
  id: string;
  title: string;
  weight: number;
}

interface BlueprintStoreState {
  /** Current local state (optimistic, triggers auto-save) */
  state: BlueprintState;
  /** Last server-confirmed state for rollback on save failure */
  serverState: BlueprintState;
  /** Library competencies with health status */
  libraryCompetencies: LibraryCompetency[];
  /** Behavioral indicators keyed by competency ID (populated from streamed domain data) */
  indicatorsByCompetency: Record<string, StoredIndicator[]>;
  /** Real question inventory per competency from heatmap (competencyId -> difficulty -> count) */
  inventoryByCompetency: Record<string, Record<Difficulty, number>>;
  /** Cached indicator-level inventory per competency (lazy-loaded on card expand) */
  indicatorInventories: Record<string, IndicatorInventory>;
  /** Allowed competency IDs for JOB_FIT restriction (null = unrestricted) */
  allowedCompetencyIds: string[] | null;
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

  /**
   * Set behavioral indicators map (used by streaming data resolver).
   */
  setIndicatorsByCompetency: (map: Record<string, StoredIndicator[]>) => void;

  /**
   * Set real question inventory data from heatmap.
   * Also enriches canvas competency questionCount with actual totals.
   */
  setInventoryByCompetency: (inventory: Record<string, Record<Difficulty, number>>) => void;

  /**
   * Cache indicator inventory for a competency.
   * Called by the component after fetching via server action.
   */
  setIndicatorInventory: (competencyId: string, data: IndicatorInventory) => void;

  /**
   * Set allowed competency IDs for JOB_FIT library restriction.
   * null = unrestricted (OVERVIEW mode).
   */
  setAllowedCompetencyIds: (ids: string[] | null) => void;

  /**
   * Apply O*NET restriction: set allowed IDs AND auto-add resolved O*NET
   * competencies to the canvas (marking them with onetRecommended).
   * Returns the number of ADDED competencies (for toast feedback).
   */
  applyOnetRestriction: (allowedIds: string[], resolvedCompetencies?: ResolvedOnetCompetency[]) => number;
}

export type BlueprintStore = BlueprintStoreState & BlueprintStoreActions;

// DEFAULT STATE

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
  indicatorsByCompetency: {},
  inventoryByCompetency: {},
  indicatorInventories: {},
  allowedCompetencyIds: null,
  templateId: '',
  templateName: '',
  isReadOnly: false,
  _initialized: false,
};

// HELPERS

/**
 * Create a BlueprintCompetency from a LibraryCompetency with default values.
 */
function toBlueprintCompetency(
  competency: LibraryCompetency,
  inventory?: Record<string, Record<Difficulty, number>>,
): BlueprintCompetency {
  // Use real inventory count if available, otherwise fall back to library data
  const counts = inventory?.[competency.id];
  const questionCount = counts
    ? Object.values(counts).reduce((sum, n) => sum + n, 0)
    : competency.questionCount;

  return {
    id: competency.id,
    name: competency.name,
    category: competency.category,
    questionCount,
    indicatorCount: competency.indicatorCount,
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

// STORE

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

      // ACTIONS

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
                effectiveLibrary.map((c) => [c.id, { name: c.name, category: c.category, indicatorCount: c.indicatorCount }])
              );
              enrichedState = {
                ...initialState,
                competencies: initialState.competencies.map((c) => {
                  const enriched = lookup.get(c.id);
                  if (enriched) {
                    return {
                      ...c,
                      name: (c.name === 'Unknown' ? enriched.name : c.name) || c.name,
                      category: (c.category === 'UNKNOWN' ? enriched.category : c.category) || c.category,
                      indicatorCount: c.indicatorCount ?? enriched.indicatorCount,
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
        const { state: currentState, inventoryByCompetency } = get();
        const reason = validateAdd(competency, currentState.competencies);

        if (reason === 'duplicate') {
          toast.warning('Competency already added');
          return;
        }
        if (reason === 'critical') {
          toast.error(`${competency.name} has no questions available`);
          return;
        }

        const blueprintCompetency = toBlueprintCompetency(competency, inventoryByCompetency);

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
        const { state: currentState, inventoryByCompetency } = get();
        const reason = validateAdd(competency, currentState.competencies);

        if (reason === 'duplicate') {
          toast.warning('Competency already added');
          return;
        }
        if (reason === 'critical') {
          toast.error(`${competency.name} has no questions available`);
          return;
        }

        const blueprintCompetency = toBlueprintCompetency(competency, inventoryByCompetency);

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
        // Build a name/category/indicatorCount lookup from the incoming competencies
        const lookup = new Map(
          competencies.map((c) => [c.id, { name: c.name, category: c.category, indicatorCount: c.indicatorCount }])
        );

        set(
          (prev) => ({
            libraryCompetencies: competencies,
            // Enrich canvas competency names and indicator counts
            state: {
              ...prev.state,
              competencies: prev.state.competencies.map((c) => {
                const enriched = lookup.get(c.id);
                if (enriched) {
                  return {
                    ...c,
                    name: (c.name === 'Unknown' ? enriched.name : c.name) || c.name,
                    category: (c.category === 'UNKNOWN' ? enriched.category : c.category) || c.category,
                    indicatorCount: c.indicatorCount ?? enriched.indicatorCount,
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

      setIndicatorsByCompetency: (map) => {
        set({ indicatorsByCompetency: map }, false, 'setIndicatorsByCompetency');
      },

      setInventoryByCompetency: (inventory) => {
        set(
          (prev) => ({
            inventoryByCompetency: inventory,
            // Enrich canvas competency questionCount with real totals
            state: {
              ...prev.state,
              competencies: prev.state.competencies.map((c) => {
                const counts = inventory[c.id];
                if (counts) {
                  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
                  return { ...c, questionCount: total };
                }
                return c;
              }),
            },
            // Also enrich library competency questionCount
            libraryCompetencies: prev.libraryCompetencies.map((c) => {
              const counts = inventory[c.id];
              if (counts) {
                const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
                return { ...c, questionCount: total };
              }
              return c;
            }),
          }),
          false,
          'setInventoryByCompetency'
        );
      },

      setIndicatorInventory: (competencyId, data) => {
        set(
          (prev) => ({
            indicatorInventories: {
              ...prev.indicatorInventories,
              [competencyId]: data,
            },
          }),
          false,
          'setIndicatorInventory'
        );
      },

      setAllowedCompetencyIds: (ids) => {
        set({ allowedCompetencyIds: ids }, false, 'setAllowedCompetencyIds');
      },

      applyOnetRestriction: (allowedIds, resolvedCompetencies) => {
        const allowedSet = new Set(allowedIds);
        const { state: currentState, inventoryByCompetency, libraryCompetencies } = get();
        const existingIds = new Set(currentState.competencies.map((c) => c.id));

        // Build library lookup for indicator counts
        const libraryLookup = new Map(
          libraryCompetencies.map((c) => [c.id, c])
        );

        // Determine which O*NET competencies need to be added
        const newCompetencies: BlueprintCompetency[] = [];
        if (resolvedCompetencies) {
          for (const rc of resolvedCompetencies) {
            if (!existingIds.has(rc.id)) {
              // Compute questionCount from inventory (same as toBlueprintCompetency)
              const counts = inventoryByCompetency[rc.id];
              const questionCount = counts
                ? Object.values(counts).reduce((sum, n) => sum + n, 0)
                : 0;
              const lib = libraryLookup.get(rc.id);
              newCompetencies.push({
                id: rc.id,
                name: rc.name,
                category: rc.category,
                questionCount,
                indicatorCount: lib?.indicatorCount,
                weight: 1.0,
                difficulty: 'INTERMEDIATE',
                onetRecommended: true,
              });
            }
          }
        }

        set(
          (prev) => ({
            allowedCompetencyIds: allowedIds,
            state: {
              ...prev.state,
              competencies: [
                // New O*NET competencies at the START
                ...newCompetencies,
                // Existing competencies — mark matching ones with onetRecommended
                ...prev.state.competencies.map((c) =>
                  allowedSet.has(c.id) ? { ...c, onetRecommended: true } : c
                ),
              ],
            },
          }),
          false,
          'applyOnetRestriction'
        );

        return newCompetencies.length;
      },
    })),
    {
      name: 'BlueprintStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// SELECTOR HOOKS

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

/**
 * Select cached indicator inventory for a specific competency.
 * Returns undefined if not yet loaded.
 */
export const useIndicatorInventory = (competencyId: string) =>
  useBlueprintStore((s) => s.indicatorInventories[competencyId]);
