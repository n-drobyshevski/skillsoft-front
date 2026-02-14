import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import {
  FlaggedItemSummary,
  ItemValidityStatus,
  DiscriminationFlag,
  DifficultyFlag,
  UpdateItemStatusRequest,
} from '@/types/psychometrics';
import { psychometricsApi } from '@/services/api';

/**
 * Psychometrics Review Store
 *
 * Manages state for the psychometric item review workflow with:
 * - Full state machine for review phases
 * - Batch operation saga pattern with rollback
 * - 30-second undo window for destructive actions
 * - Smart review suggestions based on metrics
 * - Persistence of reviewed items progress
 */

// ============================================
// STATE MACHINE TYPES
// ============================================

/**
 * Review workflow phases following a state machine pattern.
 *
 * State transitions:
 * - TRIAGE → SELECT (enter selection mode)
 * - TRIAGE → DETAIL (click item details)
 * - SELECT → EXECUTING (batch action triggered)
 * - SELECT → TRIAGE (exit selection mode)
 * - DETAIL → TRIAGE (close details)
 * - DETAIL → EDITING (edit item)
 * - EDITING → DETAIL (save/cancel edit)
 * - EXECUTING → TRIAGE (operation complete)
 * - EXECUTING → SELECT (partial failure, retry available)
 */
export type ReviewPhase =
  | 'TRIAGE'     // Overview mode - viewing grouped items
  | 'SELECT'     // Selection mode - batch operations
  | 'DETAIL'     // Viewing a single item's details
  | 'EDITING'    // Editing an item
  | 'EXECUTING'; // Batch operation in progress

/**
 * Suggested action types based on psychometric analysis
 */
export type SuggestedAction = 'RETIRE' | 'FLAG_FOR_REVIEW' | 'MONITOR' | 'ACTIVATE';

/**
 * Smart review suggestion generated from item metrics
 */
export interface ReviewSuggestion {
  action: SuggestedAction;
  confidence: number;  // 0-1 scale
  reason: string;
  alternativeReason?: string;
}

/**
 * Undoable action for rollback support
 */
export interface UndoableAction {
  id: string;
  type: 'STATUS_CHANGE';
  itemIds: string[];
  previousStates: Record<string, ItemValidityStatus>;
  newStatus: ItemValidityStatus;
  reason: string;
  timestamp: number;
  expiresAt: number;
}

/**
 * Result of a single item operation in a batch
 */
export interface BatchOperationResult {
  itemId: string;
  success: boolean;
  error?: string;
}

/**
 * Saga state for batch operations
 */
export interface BatchSagaState {
  operationId: string;
  totalItems: number;
  completedItems: number;
  failedItems: string[];
  results: BatchOperationResult[];
  startedAt: number;
  status: 'pending' | 'executing' | 'completed' | 'partial_failure' | 'failed';
}

// ============================================
// STORE STATE & ACTIONS
// ============================================

interface PsychometricsReviewState {
  /** Current phase in the review workflow state machine */
  phase: ReviewPhase;

  /** All flagged items */
  items: FlaggedItemSummary[];

  /** Selected item IDs for batch operations */
  selectedIds: Set<string>;

  /** Reviewed item IDs (persisted for progress tracking) */
  reviewedIds: Set<string>;

  /** Item ID currently being viewed in detail */
  detailItemId: string | null;

  /** Item ID currently being edited */
  editingItemId: string | null;

  /** Undo stack with 30-second expiry window */
  undoStack: UndoableAction[];

  /** Current batch operation state */
  batchSaga: BatchSagaState | null;

  /** Generated suggestions for items */
  suggestions: Record<string, ReviewSuggestion>;

  /** Section expansion states */
  expandedSections: Set<string>;

  /** Last error message */
  lastError: string | null;

  /** Loading state for individual item operations */
  loadingItemId: string | null;
}

interface PsychometricsReviewActions {
  // Phase transitions
  /** Enter selection mode for batch operations */
  enterSelectMode: () => void;

  /** Exit selection mode */
  exitSelectMode: () => void;

  /** Open item details view */
  openDetail: (itemId: string) => void;

  /** Close item details view */
  closeDetail: () => void;

  /** Start editing an item */
  startEditing: (itemId: string) => void;

  /** Cancel editing */
  cancelEditing: () => void;

  // Item management
  /** Set the items list */
  setItems: (items: FlaggedItemSummary[]) => void;

  /** Remove items from the list */
  removeItems: (itemIds: string[]) => void;

  /** Update a single item */
  updateItem: (itemId: string, updates: Partial<FlaggedItemSummary>) => void;

  // Selection management
  /** Toggle selection for an item */
  toggleSelection: (itemId: string) => void;

  /** Select multiple items */
  selectMany: (itemIds: string[]) => void;

  /** Deselect multiple items */
  deselectMany: (itemIds: string[]) => void;

  /** Select all items */
  selectAll: () => void;

  /** Clear all selections */
  clearSelection: () => void;

  /** Select all items in a severity group */
  selectBySeverity: (severity: DiscriminationFlag) => void;

  // Review progress tracking
  /** Mark item as reviewed */
  markReviewed: (itemId: string) => void;

  /** Mark multiple items as reviewed */
  markManyReviewed: (itemIds: string[]) => void;

  /** Clear review progress */
  clearReviewProgress: () => void;

  // Batch operations with saga pattern
  /** Execute batch status change with saga pattern */
  executeBatchStatusChange: (
    newStatus: ItemValidityStatus,
    reason: string
  ) => Promise<void>;

  /** Retry failed items from last batch operation */
  retryFailedItems: () => Promise<void>;

  /** Cancel ongoing batch operation */
  cancelBatchOperation: () => void;

  // Undo functionality
  /** Undo the last action (within 30-second window) */
  undo: () => Promise<boolean>;

  /** Clear expired undo actions */
  clearExpiredUndoActions: () => void;

  /** Check if undo is available */
  canUndo: () => boolean;

  // Suggestions
  /** Generate suggestions for all items */
  generateSuggestions: () => void;

  /** Get suggestion for a specific item */
  getSuggestion: (itemId: string) => ReviewSuggestion | null;

  // UI state
  /** Toggle section expansion */
  toggleSection: (sectionId: string) => void;

  /** Set loading item */
  setLoadingItem: (itemId: string | null) => void;

  /** Set error message */
  setError: (error: string | null) => void;

  /** Reset store to initial state */
  reset: () => void;
}

type PsychometricsReviewStore = PsychometricsReviewState & PsychometricsReviewActions;

const initialState: PsychometricsReviewState = {
  phase: 'TRIAGE',
  items: [],
  selectedIds: new Set(),
  reviewedIds: new Set(),
  detailItemId: null,
  editingItemId: null,
  undoStack: [],
  batchSaga: null,
  suggestions: {},
  expandedSections: new Set(['negative', 'critical']), // Default expanded
  lastError: null,
  loadingItemId: null,
};

// ============================================
// SUGGESTION ALGORITHM
// ============================================

/**
 * Generate smart review suggestion based on item metrics
 */
function generateSuggestionForItem(item: FlaggedItemSummary): ReviewSuggestion {
  // Rule 1: Negative discrimination = immediate retire
  if (item.discriminationFlag === DiscriminationFlag.NEGATIVE) {
    return {
      action: 'RETIRE',
      confidence: 0.95,
      reason: 'Negative discrimination - high performers answer worse than low performers',
    };
  }

  // Rule 2: Critical + extreme difficulty = content issue
  if (
    item.discriminationFlag === DiscriminationFlag.CRITICAL &&
    item.difficultyIndex !== null &&
    (item.difficultyIndex < 0.2 || item.difficultyIndex > 0.9)
  ) {
    return {
      action: 'FLAG_FOR_REVIEW',
      confidence: 0.8,
      reason: 'Critical discrimination with extreme difficulty suggests content problems',
      alternativeReason: 'Consider retiring if no content improvement is possible',
    };
  }

  // Rule 3: Warning with sufficient responses = monitor
  if (
    item.discriminationFlag === DiscriminationFlag.WARNING &&
    item.responseCount >= 100
  ) {
    return {
      action: 'MONITOR',
      confidence: 0.7,
      reason: 'Warning-level with stable response count - may improve with more data',
    };
  }

  // Rule 4: Warning with few responses = needs more data
  if (
    item.discriminationFlag === DiscriminationFlag.WARNING &&
    item.responseCount < 50
  ) {
    return {
      action: 'MONITOR',
      confidence: 0.6,
      reason: 'Insufficient data for reliable decision - continue monitoring',
    };
  }

  // Rule 5: Difficulty-only flags with good discrimination
  if (
    item.discriminationFlag === DiscriminationFlag.NONE &&
    (item.difficultyFlag === DifficultyFlag.TOO_HARD ||
      item.difficultyFlag === DifficultyFlag.TOO_EASY)
  ) {
    return {
      action: 'FLAG_FOR_REVIEW',
      confidence: 0.65,
      reason: 'Good discrimination but extreme difficulty - review content difficulty',
    };
  }

  // Default: Flag for review
  return {
    action: 'FLAG_FOR_REVIEW',
    confidence: 0.5,
    reason: 'Requires manual review to determine appropriate action',
  };
}

// ============================================
// UNDO EXPIRY INTERVAL
// ============================================

const UNDO_WINDOW_MS = 30_000; // 30 seconds

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const usePsychometricsReviewStore = create<PsychometricsReviewStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        ...initialState,

        // ============================================
        // PHASE TRANSITIONS
        // ============================================

        enterSelectMode: () => {
          set({ phase: 'SELECT' });
        },

        exitSelectMode: () => {
          set({
            phase: 'TRIAGE',
            selectedIds: new Set(),
          });
        },

        openDetail: (itemId) => {
          set({
            phase: 'DETAIL',
            detailItemId: itemId,
          });
        },

        closeDetail: () => {
          set({
            phase: 'TRIAGE',
            detailItemId: null,
          });
        },

        startEditing: (itemId) => {
          set({
            phase: 'EDITING',
            editingItemId: itemId,
          });
        },

        cancelEditing: () => {
          const { detailItemId } = get();
          set({
            phase: detailItemId ? 'DETAIL' : 'TRIAGE',
            editingItemId: null,
          });
        },

        // ============================================
        // ITEM MANAGEMENT
        // ============================================

        setItems: (items) => {
          set({ items });
          // Auto-generate suggestions
          get().generateSuggestions();
        },

        removeItems: (itemIds) => {
          const idsSet = new Set(itemIds);
          set((state) => ({
            items: state.items.filter((item) => !idsSet.has(item.questionId)),
            selectedIds: new Set(
              Array.from(state.selectedIds).filter((id) => !idsSet.has(id))
            ),
          }));
        },

        updateItem: (itemId, updates) => {
          set((state) => ({
            items: state.items.map((item) =>
              item.questionId === itemId ? { ...item, ...updates } : item
            ),
          }));
        },

        // ============================================
        // SELECTION MANAGEMENT
        // ============================================

        toggleSelection: (itemId) => {
          set((state) => {
            const newSelected = new Set(state.selectedIds);
            if (newSelected.has(itemId)) {
              newSelected.delete(itemId);
            } else {
              newSelected.add(itemId);
            }
            return { selectedIds: newSelected };
          });
        },

        selectMany: (itemIds) => {
          set((state) => ({
            selectedIds: new Set([...state.selectedIds, ...itemIds]),
          }));
        },

        deselectMany: (itemIds) => {
          const idsSet = new Set(itemIds);
          set((state) => ({
            selectedIds: new Set(
              Array.from(state.selectedIds).filter((id) => !idsSet.has(id))
            ),
          }));
        },

        selectAll: () => {
          set((state) => ({
            selectedIds: new Set(state.items.map((item) => item.questionId)),
          }));
        },

        clearSelection: () => {
          set({ selectedIds: new Set() });
        },

        selectBySeverity: (severity) => {
          set((state) => ({
            selectedIds: new Set(
              state.items
                .filter((item) => item.discriminationFlag === severity)
                .map((item) => item.questionId)
            ),
          }));
        },

        // ============================================
        // REVIEW PROGRESS TRACKING
        // ============================================

        markReviewed: (itemId) => {
          set((state) => ({
            reviewedIds: new Set([...state.reviewedIds, itemId]),
          }));
        },

        markManyReviewed: (itemIds) => {
          set((state) => ({
            reviewedIds: new Set([...state.reviewedIds, ...itemIds]),
          }));
        },

        clearReviewProgress: () => {
          set({ reviewedIds: new Set() });
        },

        // ============================================
        // BATCH OPERATIONS WITH SAGA PATTERN
        // ============================================

        executeBatchStatusChange: async (newStatus, reason) => {
          const { selectedIds, items } = get();
          const itemIds = Array.from(selectedIds);

          if (itemIds.length === 0) return;

          // Capture pre-execution state for rollback
          const previousStates: Record<string, ItemValidityStatus> = {};
          items.forEach((item) => {
            if (selectedIds.has(item.questionId)) {
              previousStates[item.questionId] = item.validityStatus;
            }
          });

          // Initialize saga state
          const operationId = crypto.randomUUID();
          const sagaState: BatchSagaState = {
            operationId,
            totalItems: itemIds.length,
            completedItems: 0,
            failedItems: [],
            results: [],
            startedAt: Date.now(),
            status: 'executing',
          };

          set({
            phase: 'EXECUTING',
            batchSaga: sagaState,
            lastError: null,
          });

          const request: UpdateItemStatusRequest = {
            newStatus,
            reason,
          };

          // Execute operations with individual tracking
          const results: BatchOperationResult[] = [];

          for (const itemId of itemIds) {
            try {
              await psychometricsApi.updateItemStatus(itemId, request);
              results.push({ itemId, success: true });
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';
              results.push({ itemId, success: false, error: errorMessage });
            }

            // Update saga state
            set((state) => {
              if (!state.batchSaga) return state;
              const completedItems = results.length;
              const failedItems = results
                .filter((r) => !r.success)
                .map((r) => r.itemId);

              return {
                batchSaga: {
                  ...state.batchSaga,
                  completedItems,
                  failedItems,
                  results,
                  status:
                    completedItems === itemIds.length
                      ? failedItems.length > 0
                        ? 'partial_failure'
                        : 'completed'
                      : 'executing',
                },
              };
            });
          }

          // Finalize operation
          const successfulIds = results
            .filter((r) => r.success)
            .map((r) => r.itemId);
          const failedIds = results.filter((r) => !r.success).map((r) => r.itemId);

          // Remove successful items from list
          if (successfulIds.length > 0) {
            get().removeItems(successfulIds);
            get().markManyReviewed(successfulIds);

            // Add to undo stack
            const undoAction: UndoableAction = {
              id: operationId,
              type: 'STATUS_CHANGE',
              itemIds: successfulIds,
              previousStates: Object.fromEntries(
                Object.entries(previousStates).filter(([id]) =>
                  successfulIds.includes(id)
                )
              ),
              newStatus,
              reason,
              timestamp: Date.now(),
              expiresAt: Date.now() + UNDO_WINDOW_MS,
            };

            set((state) => ({
              undoStack: [undoAction, ...state.undoStack].slice(0, 10), // Keep last 10
            }));
          }

          // Final state update
          set((state) => ({
            phase: failedIds.length > 0 ? 'SELECT' : 'TRIAGE',
            selectedIds: new Set(failedIds), // Keep failed items selected for retry
            batchSaga: state.batchSaga
              ? {
                  ...state.batchSaga,
                  status: failedIds.length > 0 ? 'partial_failure' : 'completed',
                }
              : null,
            lastError:
              failedIds.length > 0
                ? `${failedIds.length} item(s) failed to update`
                : null,
          }));
        },

        retryFailedItems: async () => {
          const { batchSaga } = get();

          if (!batchSaga || batchSaga.failedItems.length === 0) return;

          // Re-execute with same parameters (would need to store these)
          // For now, just clear the saga state
          set({ batchSaga: null });
        },

        cancelBatchOperation: () => {
          set({
            phase: 'SELECT',
            batchSaga: null,
          });
        },

        // ============================================
        // UNDO FUNCTIONALITY
        // ============================================

        undo: async () => {
          const { undoStack } = get();

          // Clear expired actions first
          get().clearExpiredUndoActions();

          if (undoStack.length === 0) return false;

          const lastAction = undoStack[0];

          // Check if action is still valid
          if (lastAction.expiresAt < Date.now()) {
            set((state) => ({
              undoStack: state.undoStack.slice(1),
            }));
            return false;
          }

          set({ phase: 'EXECUTING', loadingItemId: 'undo' });

          try {
            // Revert each item to its previous state
            for (const [itemId, previousStatus] of Object.entries(
              lastAction.previousStates
            )) {
              await psychometricsApi.updateItemStatus(itemId, {
                newStatus: previousStatus,
                reason: `Undo: reverted from ${lastAction.newStatus}`,
              });
            }

            // Remove from undo stack
            set((state) => ({
              undoStack: state.undoStack.slice(1),
              phase: 'TRIAGE',
              loadingItemId: null,
            }));

            return true;
          } catch {
            set({
              phase: 'TRIAGE',
              loadingItemId: null,
              lastError: 'Failed to undo action',
            });
            return false;
          }
        },

        clearExpiredUndoActions: () => {
          const now = Date.now();
          set((state) => ({
            undoStack: state.undoStack.filter((action) => action.expiresAt > now),
          }));
        },

        canUndo: () => {
          const { undoStack } = get();
          if (undoStack.length === 0) return false;
          return undoStack[0].expiresAt > Date.now();
        },

        // ============================================
        // SUGGESTIONS
        // ============================================

        generateSuggestions: () => {
          const { items } = get();
          const suggestions: Record<string, ReviewSuggestion> = {};

          items.forEach((item) => {
            suggestions[item.questionId] = generateSuggestionForItem(item);
          });

          set({ suggestions });
        },

        getSuggestion: (itemId) => {
          const suggestions = get().suggestions;
          // Safe access for Record<string, ReviewSuggestion> with hasOwnProperty check
          return Object.prototype.hasOwnProperty.call(suggestions, itemId)
            ? suggestions[itemId as keyof typeof suggestions] ?? null
            : null;
        },

        // ============================================
        // UI STATE
        // ============================================

        toggleSection: (sectionId) => {
          set((state) => {
            const newExpanded = new Set(state.expandedSections);
            if (newExpanded.has(sectionId)) {
              newExpanded.delete(sectionId);
            } else {
              newExpanded.add(sectionId);
            }
            return { expandedSections: newExpanded };
          });
        },

        setLoadingItem: (itemId) => {
          set({ loadingItemId: itemId });
        },

        setError: (error) => {
          set({ lastError: error });
        },

        reset: () => {
          set({
            ...initialState,
            // Preserve reviewedIds across reset (persisted)
            reviewedIds: get().reviewedIds,
          });
        },
      }),
      {
        name: 'psychometrics-review-store',
        partialize: (state) => ({
          // Only persist reviewedIds for progress tracking
          reviewedIds: Array.from(state.reviewedIds),
        }),
        merge: (persisted, current) => {
          const persistedState = persisted as { reviewedIds?: string[] };
          return {
            ...current,
            reviewedIds: new Set(persistedState?.reviewedIds ?? []),
          };
        },
      }
    )
  )
);

// ============================================
// SELECTOR HOOKS
// ============================================

/** Get current review phase */
export const useReviewPhase = () =>
  usePsychometricsReviewStore((state) => state.phase);

/** Check if in selection mode */
export const useIsSelectMode = () =>
  usePsychometricsReviewStore((state) => state.phase === 'SELECT');

/** Check if batch operation is executing */
export const useIsExecuting = () =>
  usePsychometricsReviewStore((state) => state.phase === 'EXECUTING');

/** Get selected count */
export const useSelectedCount = () =>
  usePsychometricsReviewStore((state) => state.selectedIds.size);

/** Get items grouped by severity */
export const useItemsBySeverity = () =>
  usePsychometricsReviewStore(
    useShallow((state) => {
      const groups: Record<string, FlaggedItemSummary[]> = {
        negative: [],
        critical: [],
        warning: [],
        other: [],
      };

      state.items.forEach((item) => {
        switch (item.discriminationFlag) {
          case DiscriminationFlag.NEGATIVE:
            groups.negative.push(item);
            break;
          case DiscriminationFlag.CRITICAL:
            groups.critical.push(item);
            break;
          case DiscriminationFlag.WARNING:
            groups.warning.push(item);
            break;
          default:
            groups.other.push(item);
        }
      });

      return groups;
    })
  );

/** Get batch saga state */
export const useBatchSaga = () =>
  usePsychometricsReviewStore((state) => state.batchSaga);

/** Get undo availability */
export const useCanUndo = () =>
  usePsychometricsReviewStore((state) => {
    if (state.undoStack.length === 0) return false;
    return state.undoStack[0].expiresAt > Date.now();
  });

/** Get undo countdown (seconds remaining) */
export const useUndoCountdown = () =>
  usePsychometricsReviewStore((state) => {
    if (state.undoStack.length === 0) return 0;
    const remaining = state.undoStack[0].expiresAt - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  });

/** Get last undo action info */
export const useLastUndoAction = () =>
  usePsychometricsReviewStore((state) =>
    state.undoStack.length > 0 ? state.undoStack[0] : null
  );

/** Get review progress stats */
export const useReviewProgress = () =>
  usePsychometricsReviewStore(
    useShallow((state) => ({
      total: state.items.length,
      reviewed: state.reviewedIds.size,
      remaining: state.items.length - state.reviewedIds.size,
      percentage:
        state.items.length > 0
          ? Math.round((state.reviewedIds.size / state.items.length) * 100)
          : 0,
    }))
  );

/** Get item selection state */
export const useItemSelectionState = (itemId: string) =>
  usePsychometricsReviewStore((state) => ({
    isSelected: state.selectedIds.has(itemId),
    isReviewed: state.reviewedIds.has(itemId),
    isLoading: state.loadingItemId === itemId,
  }));

/** Get expanded sections */
export const useExpandedSections = () =>
  usePsychometricsReviewStore((state) => state.expandedSections);

/** Get last error */
export const useLastError = () =>
  usePsychometricsReviewStore((state) => state.lastError);

// ============================================
// ACTION SHORTCUTS
// ============================================

/** Quick action to retire all negative items */
export const retireAllNegativeItems = async () => {
  const store = usePsychometricsReviewStore.getState();
  const negativeItems = store.items.filter(
    (item) => item.discriminationFlag === DiscriminationFlag.NEGATIVE
  );

  if (negativeItems.length === 0) return;

  store.selectMany(negativeItems.map((item) => item.questionId));
  await store.executeBatchStatusChange(
    ItemValidityStatus.RETIRED,
    'Quick retired due to negative discrimination'
  );
};

/** Quick action to activate all selected items */
export const activateSelectedItems = async () => {
  const store = usePsychometricsReviewStore.getState();
  await store.executeBatchStatusChange(
    ItemValidityStatus.ACTIVE,
    'Batch activated after review'
  );
};

/** Quick action to retire all selected items */
export const retireSelectedItems = async () => {
  const store = usePsychometricsReviewStore.getState();
  await store.executeBatchStatusChange(
    ItemValidityStatus.RETIRED,
    'Batch retired due to poor psychometric properties'
  );
};

export default usePsychometricsReviewStore;
