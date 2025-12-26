import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';

/**
 * Psychometrics Mobile Navigation Store
 *
 * Manages navigation state for the mobile-first psychometrics dashboard with:
 * - State machine for navigation phases
 * - Breadcrumb history with scroll position restoration
 * - Transition animations support
 * - Session persistence for navigation state
 */

// ============================================
// NAVIGATION PHASE TYPES
// ============================================

/**
 * Navigation phases for mobile psychometrics workflow.
 *
 * State transitions:
 * - DASHBOARD → COMPETENCIES (view competency list)
 * - DASHBOARD → ITEMS (view items list)
 * - DASHBOARD → BIG_FIVE (view Big Five overview)
 * - COMPETENCIES → COMPETENCY_DETAIL (click competency)
 * - COMPETENCY_DETAIL → INDICATOR_DRILL (drill into indicators)
 * - ITEMS → ITEM_DETAIL (click item)
 * - BIG_FIVE → TRAIT_DETAIL (view trait details)
 * - Any → DASHBOARD (back to overview)
 */
export type NavigationPhase =
  | 'DASHBOARD'
  | 'COMPETENCIES'
  | 'COMPETENCY_DETAIL'
  | 'INDICATOR_DRILL'
  | 'ITEMS'
  | 'ITEM_DETAIL'
  | 'BIG_FIVE'
  | 'TRAIT_DETAIL'
  | 'FLAGGED'
  | 'FLAGGED_DETAIL';

/**
 * Breadcrumb entry for navigation history
 */
export interface BreadcrumbEntry {
  phase: NavigationPhase;
  id?: string;
  label: string;
  path: string;
  scrollY?: number;
}

/**
 * Entity IDs currently selected in navigation
 */
interface SelectedEntities {
  competencyId: string | null;
  itemId: string | null;
  traitId: string | null;
  indicatorId: string | null;
}

// ============================================
// STORE STATE & ACTIONS
// ============================================

interface PsychometricsNavigationState {
  /** Current navigation phase */
  currentPhase: NavigationPhase;

  /** Navigation history stack for breadcrumbs and back navigation */
  history: BreadcrumbEntry[];

  /** Currently selected entity IDs */
  selected: SelectedEntities;

  /** Scroll position restoration map (phase -> scrollY) */
  scrollPositions: Record<string, number>;

  /** Whether transition animation is active */
  isTransitioning: boolean;

  /** Direction of transition for animation */
  transitionDirection: 'forward' | 'backward' | null;

  /** Whether the navigation drawer is open (mobile) */
  isDrawerOpen: boolean;

  /** Expanded accordion sections in detail views */
  expandedSections: Set<string>;

  /** Last visited path for session restoration */
  lastPath: string | null;
}

interface PsychometricsNavigationActions {
  /** Navigate to a new phase with optional entity selection */
  navigateTo: (
    phase: NavigationPhase,
    options?: {
      id?: string;
      label?: string;
      path?: string;
      replace?: boolean;
    }
  ) => void;

  /** Go back to previous phase */
  goBack: () => void;

  /** Go to specific history entry by index */
  goToHistoryEntry: (index: number) => void;

  /** Save scroll position for current phase */
  saveScrollPosition: (scrollY: number) => void;

  /** Get scroll position for a phase */
  getScrollPosition: (phase: NavigationPhase) => number;

  /** Set transitioning state */
  setTransitioning: (isTransitioning: boolean) => void;

  /** Toggle navigation drawer */
  toggleDrawer: () => void;

  /** Set drawer state */
  setDrawerOpen: (open: boolean) => void;

  /** Toggle accordion section expansion */
  toggleSection: (sectionId: string) => void;

  /** Expand a section (for auto-expand of problematic items) */
  expandSection: (sectionId: string) => void;

  /** Collapse a section */
  collapseSection: (sectionId: string) => void;

  /** Set selected entity */
  setSelectedEntity: (
    type: keyof SelectedEntities,
    id: string | null
  ) => void;

  /** Clear all selected entities */
  clearSelectedEntities: () => void;

  /** Reset navigation state */
  reset: () => void;

  /** Get current breadcrumb trail */
  getBreadcrumbs: () => BreadcrumbEntry[];

  /** Check if can go back */
  canGoBack: () => boolean;
}

type PsychometricsNavigationStore = PsychometricsNavigationState &
  PsychometricsNavigationActions;

// ============================================
// PHASE LABEL MAPPING
// ============================================

const phaseLabels: Record<NavigationPhase, string> = {
  DASHBOARD: 'Психометрика',
  COMPETENCIES: 'Компетенции',
  COMPETENCY_DETAIL: 'Детали компетенции',
  INDICATOR_DRILL: 'Индикатор',
  ITEMS: 'Вопросы',
  ITEM_DETAIL: 'Детали вопроса',
  BIG_FIVE: 'Big Five',
  TRAIT_DETAIL: 'Черта личности',
  FLAGGED: 'На проверке',
  FLAGGED_DETAIL: 'Детали проверки',
};

const phasePaths: Record<NavigationPhase, string> = {
  DASHBOARD: '/psychometrics',
  COMPETENCIES: '/psychometrics/competencies',
  COMPETENCY_DETAIL: '/psychometrics/competencies/',
  INDICATOR_DRILL: '/psychometrics/competencies/',
  ITEMS: '/psychometrics/items',
  ITEM_DETAIL: '/psychometrics/items/',
  BIG_FIVE: '/psychometrics/big-five',
  TRAIT_DETAIL: '/psychometrics/big-five/',
  FLAGGED: '/psychometrics/flagged',
  FLAGGED_DETAIL: '/psychometrics/flagged/',
};

// ============================================
// INITIAL STATE
// ============================================

const initialState: PsychometricsNavigationState = {
  currentPhase: 'DASHBOARD',
  history: [
    {
      phase: 'DASHBOARD',
      label: phaseLabels.DASHBOARD,
      path: phasePaths.DASHBOARD,
    },
  ],
  selected: {
    competencyId: null,
    itemId: null,
    traitId: null,
    indicatorId: null,
  },
  scrollPositions: {},
  isTransitioning: false,
  transitionDirection: null,
  isDrawerOpen: false,
  expandedSections: new Set(['reliability-metrics']),
  lastPath: null,
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const usePsychometricsNavigationStore =
  create<PsychometricsNavigationStore>()(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          // Initial state
          ...initialState,

          // ============================================
          // NAVIGATION ACTIONS
          // ============================================

          navigateTo: (phase, options = {}) => {
            const { history, currentPhase, scrollPositions } = get();

            // Save current scroll position before navigating
            const currentScrollY =
              typeof window !== 'undefined' ? window.scrollY : 0;

            const label = options.label ?? phaseLabels[phase];
            const path =
              options.path ?? phasePaths[phase] + (options.id ?? '');

            const newEntry: BreadcrumbEntry = {
              phase,
              id: options.id,
              label,
              path,
              scrollY: currentScrollY,
            };

            // Update selected entities based on phase
            const selected = { ...get().selected };
            if (options.id) {
              switch (phase) {
                case 'COMPETENCY_DETAIL':
                case 'INDICATOR_DRILL':
                  selected.competencyId = options.id;
                  break;
                case 'ITEM_DETAIL':
                  selected.itemId = options.id;
                  break;
                case 'TRAIT_DETAIL':
                  selected.traitId = options.id;
                  break;
                case 'FLAGGED_DETAIL':
                  selected.itemId = options.id;
                  break;
              }
            }

            const newHistory = options.replace
              ? [...history.slice(0, -1), newEntry]
              : [...history, newEntry];

            set({
              currentPhase: phase,
              history: newHistory,
              selected,
              isTransitioning: true,
              transitionDirection: 'forward',
              scrollPositions: {
                ...scrollPositions,
                [currentPhase]: currentScrollY,
              },
              lastPath: path,
            });

            // Reset transitioning after animation
            setTimeout(() => set({ isTransitioning: false }), 300);

            // Scroll to top on navigation
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          },

          goBack: () => {
            const { history, scrollPositions } = get();
            if (history.length <= 1) return;

            const newHistory = history.slice(0, -1);
            const previousEntry = newHistory[newHistory.length - 1];

            set({
              currentPhase: previousEntry.phase,
              history: newHistory,
              isTransitioning: true,
              transitionDirection: 'backward',
              lastPath: previousEntry.path,
            });

            // Restore scroll position
            const savedScrollY = scrollPositions[previousEntry.phase] ?? 0;
            setTimeout(() => {
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: savedScrollY, behavior: 'smooth' });
              }
              set({ isTransitioning: false });
            }, 300);
          },

          goToHistoryEntry: (index) => {
            const { history, scrollPositions } = get();
            if (index < 0 || index >= history.length) return;

            const newHistory = history.slice(0, index + 1);
            const targetEntry = newHistory[index];

            set({
              currentPhase: targetEntry.phase,
              history: newHistory,
              isTransitioning: true,
              transitionDirection: 'backward',
              lastPath: targetEntry.path,
            });

            const savedScrollY = scrollPositions[targetEntry.phase] ?? 0;
            setTimeout(() => {
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: savedScrollY, behavior: 'smooth' });
              }
              set({ isTransitioning: false });
            }, 300);
          },

          saveScrollPosition: (scrollY) => {
            const { currentPhase } = get();
            set({
              scrollPositions: {
                ...get().scrollPositions,
                [currentPhase]: scrollY,
              },
            });
          },

          getScrollPosition: (phase) => {
            return get().scrollPositions[phase] ?? 0;
          },

          setTransitioning: (isTransitioning) => {
            set({ isTransitioning });
          },

          // ============================================
          // DRAWER ACTIONS
          // ============================================

          toggleDrawer: () => {
            set((state) => ({ isDrawerOpen: !state.isDrawerOpen }));
          },

          setDrawerOpen: (open) => {
            set({ isDrawerOpen: open });
          },

          // ============================================
          // ACCORDION SECTION ACTIONS
          // ============================================

          toggleSection: (sectionId) => {
            set((state) => {
              const newSections = new Set(state.expandedSections);
              if (newSections.has(sectionId)) {
                newSections.delete(sectionId);
              } else {
                newSections.add(sectionId);
              }
              return { expandedSections: newSections };
            });
          },

          expandSection: (sectionId) => {
            set((state) => {
              if (state.expandedSections.has(sectionId)) return state;
              return {
                expandedSections: new Set([
                  ...state.expandedSections,
                  sectionId,
                ]),
              };
            });
          },

          collapseSection: (sectionId) => {
            set((state) => {
              const newSections = new Set(state.expandedSections);
              newSections.delete(sectionId);
              return { expandedSections: newSections };
            });
          },

          // ============================================
          // ENTITY SELECTION
          // ============================================

          setSelectedEntity: (type, id) => {
            set((state) => ({
              selected: { ...state.selected, [type]: id },
            }));
          },

          clearSelectedEntities: () => {
            set({
              selected: {
                competencyId: null,
                itemId: null,
                traitId: null,
                indicatorId: null,
              },
            });
          },

          // ============================================
          // UTILITY ACTIONS
          // ============================================

          reset: () => {
            set({
              ...initialState,
              expandedSections: new Set(['reliability-metrics']),
            });
          },

          getBreadcrumbs: () => {
            return get().history;
          },

          canGoBack: () => {
            return get().history.length > 1;
          },
        }),
        {
          name: 'psychometrics-navigation',
          partialize: (state) => ({
            currentPhase: state.currentPhase,
            selected: state.selected,
            scrollPositions: state.scrollPositions,
            expandedSections: Array.from(state.expandedSections),
            lastPath: state.lastPath,
          }),
          merge: (persisted, current) => {
            const persistedState = persisted as {
              currentPhase?: NavigationPhase;
              selected?: SelectedEntities;
              scrollPositions?: Record<string, number>;
              expandedSections?: string[];
              lastPath?: string | null;
            };
            return {
              ...current,
              currentPhase: persistedState?.currentPhase ?? current.currentPhase,
              selected: persistedState?.selected ?? current.selected,
              scrollPositions:
                persistedState?.scrollPositions ?? current.scrollPositions,
              expandedSections: new Set(
                persistedState?.expandedSections ?? ['reliability-metrics']
              ),
              lastPath: persistedState?.lastPath ?? current.lastPath,
            };
          },
        }
      )
    )
  );

// ============================================
// SELECTOR HOOKS
// ============================================

/** Get current navigation phase */
export const useCurrentPhase = () =>
  usePsychometricsNavigationStore((state) => state.currentPhase);

/** Get navigation history (breadcrumbs) */
export const useNavigationHistory = () =>
  usePsychometricsNavigationStore((state) => state.history);

/** Check if navigation is transitioning */
export const useIsTransitioning = () =>
  usePsychometricsNavigationStore((state) => state.isTransitioning);

/** Get transition direction */
export const useTransitionDirection = () =>
  usePsychometricsNavigationStore((state) => state.transitionDirection);

/** Get selected entities */
export const useSelectedEntities = () =>
  usePsychometricsNavigationStore((state) => state.selected);

/** Get selected competency ID */
export const useSelectedCompetencyId = () =>
  usePsychometricsNavigationStore((state) => state.selected.competencyId);

/** Get selected item ID */
export const useSelectedItemId = () =>
  usePsychometricsNavigationStore((state) => state.selected.itemId);

/** Get drawer open state */
export const useIsDrawerOpen = () =>
  usePsychometricsNavigationStore((state) => state.isDrawerOpen);

/** Get expanded sections */
export const useExpandedSections = () =>
  usePsychometricsNavigationStore((state) => state.expandedSections);

/** Check if can go back */
export const useCanGoBack = () =>
  usePsychometricsNavigationStore((state) => state.history.length > 1);

/** Get breadcrumb trail for current location */
export const useBreadcrumbs = () =>
  usePsychometricsNavigationStore((state) => state.history);

// ============================================
// ACTION SHORTCUTS
// ============================================

/** Navigate to competencies list */
export const navigateToCompetencies = () => {
  usePsychometricsNavigationStore.getState().navigateTo('COMPETENCIES');
};

/** Navigate to competency detail */
export const navigateToCompetencyDetail = (
  competencyId: string,
  competencyName?: string
) => {
  usePsychometricsNavigationStore.getState().navigateTo('COMPETENCY_DETAIL', {
    id: competencyId,
    label: competencyName ?? 'Детали компетенции',
    path: `/psychometrics/competencies/${competencyId}`,
  });
};

/** Navigate to items list */
export const navigateToItems = () => {
  usePsychometricsNavigationStore.getState().navigateTo('ITEMS');
};

/** Navigate to item detail */
export const navigateToItemDetail = (
  itemId: string,
  itemText?: string
) => {
  usePsychometricsNavigationStore.getState().navigateTo('ITEM_DETAIL', {
    id: itemId,
    label: itemText?.substring(0, 30) ?? 'Детали вопроса',
    path: `/psychometrics/items/${itemId}`,
  });
};

/** Navigate to Big Five overview */
export const navigateToBigFive = () => {
  usePsychometricsNavigationStore.getState().navigateTo('BIG_FIVE');
};

/** Navigate to flagged items */
export const navigateToFlagged = () => {
  usePsychometricsNavigationStore.getState().navigateTo('FLAGGED');
};

/** Navigate back */
export const navigateBack = () => {
  usePsychometricsNavigationStore.getState().goBack();
};

export default usePsychometricsNavigationStore;
