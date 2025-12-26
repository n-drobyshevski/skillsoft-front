import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { useEffect, useState } from 'react';
import { BigFiveTrait, ReliabilityStatus } from '@/types/psychometrics';

/**
 * View modes for the Big Five page
 */
type ViewMode = 'overview' | 'trait-focus' | 'compare';

/**
 * Filter options for traits
 */
type TraitFilter = 'all' | 'needs-attention' | 'reliable';

/**
 * State interface for the Big Five page
 */
interface BigFivePageState {
  // View state
  viewMode: ViewMode;

  // Carousel state (lifted from component for persistence)
  carouselIndex: number;

  // Selected trait for drawer/detail view
  selectedTrait: BigFiveTrait | null;
  isDrawerOpen: boolean;

  // Accordion state - which traits are expanded
  expandedAccordionItems: BigFiveTrait[];

  // Filter state
  traitFilter: TraitFilter;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setCarouselIndex: (index: number) => void;
  navigateCarousel: (direction: 'prev' | 'next', totalItems: number) => void;

  selectTrait: (trait: BigFiveTrait | null) => void;
  openDrawer: (trait: BigFiveTrait) => void;
  closeDrawer: () => void;

  toggleAccordionItem: (trait: BigFiveTrait) => void;
  expandAccordionItem: (trait: BigFiveTrait) => void;
  collapseAccordionItem: (trait: BigFiveTrait) => void;
  expandProblematicTraits: (
    traits: { trait: BigFiveTrait; status: ReliabilityStatus }[]
  ) => void;
  collapseAllAccordions: () => void;

  setTraitFilter: (filter: TraitFilter) => void;

  // Reset
  reset: () => void;
}

/**
 * Initial state values
 */
const initialState = {
  viewMode: 'overview' as ViewMode,
  carouselIndex: 0,
  selectedTrait: null,
  isDrawerOpen: false,
  expandedAccordionItems: [] as BigFiveTrait[],
  traitFilter: 'all' as TraitFilter,
};

/**
 * Zustand store for Big Five page state management.
 *
 * Features:
 * - Carousel position persistence
 * - Drawer state management
 * - Accordion expansion state
 * - Auto-expand for problematic traits
 * - Session persistence via sessionStorage
 *
 * Usage:
 * ```tsx
 * const { carouselIndex, setCarouselIndex } = useBigFivePageStore();
 * ```
 */
export const useBigFivePageStore = create<BigFivePageState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // View mode actions
      setViewMode: (mode) => set({ viewMode: mode }),

      // Carousel actions
      setCarouselIndex: (index) => set({ carouselIndex: index }),

      navigateCarousel: (direction, totalItems) => {
        const { carouselIndex } = get();
        if (direction === 'prev') {
          set({ carouselIndex: Math.max(0, carouselIndex - 1) });
        } else {
          set({ carouselIndex: Math.min(totalItems - 1, carouselIndex + 1) });
        }
      },

      // Trait selection and drawer actions
      selectTrait: (trait) => set({ selectedTrait: trait }),

      openDrawer: (trait) => set({
        selectedTrait: trait,
        isDrawerOpen: true
      }),

      closeDrawer: () => set({
        isDrawerOpen: false,
        // Keep selectedTrait for animation purposes, clear after close
      }),

      // Accordion actions
      toggleAccordionItem: (trait) => {
        const { expandedAccordionItems } = get();
        const isExpanded = expandedAccordionItems.includes(trait);

        if (isExpanded) {
          set({
            expandedAccordionItems: expandedAccordionItems.filter(t => t !== trait)
          });
        } else {
          set({
            expandedAccordionItems: [...expandedAccordionItems, trait]
          });
        }
      },

      expandAccordionItem: (trait) => {
        const { expandedAccordionItems } = get();
        if (!expandedAccordionItems.includes(trait)) {
          set({
            expandedAccordionItems: [...expandedAccordionItems, trait]
          });
        }
      },

      collapseAccordionItem: (trait) => {
        const { expandedAccordionItems } = get();
        set({
          expandedAccordionItems: expandedAccordionItems.filter(t => t !== trait)
        });
      },

      /**
       * Auto-expand accordion items for traits that need attention.
       * Called on page load to highlight problematic traits.
       */
      expandProblematicTraits: (traits) => {
        const problematicTraits = traits
          .filter(t =>
            t.status === ReliabilityStatus.UNRELIABLE ||
            t.status === ReliabilityStatus.ACCEPTABLE
          )
          .map(t => t.trait);

        if (problematicTraits.length > 0) {
          set({ expandedAccordionItems: problematicTraits });
        }
      },

      collapseAllAccordions: () => set({ expandedAccordionItems: [] }),

      // Filter actions
      setTraitFilter: (filter) => set({ traitFilter: filter }),

      // Reset to initial state
      reset: () => set(initialState),
    }),
    {
      name: 'big-five-page-state',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist certain fields
      partialize: (state) => ({
        carouselIndex: state.carouselIndex,
        expandedAccordionItems: state.expandedAccordionItems,
        traitFilter: state.traitFilter,
      }),
      // Skip automatic hydration to prevent SSR mismatch
      skipHydration: true,
    }
  )
);

/**
 * Hook to handle store hydration on client side.
 * Must be called once in a root client component.
 */
export function useBigFiveStoreHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Rehydrate the store on client mount
    useBigFivePageStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  return hydrated;
}

/**
 * Selector hooks for common use cases.
 * Using useShallow to prevent infinite re-renders from object selectors.
 */
export const useCarouselIndex = () => useBigFivePageStore(state => state.carouselIndex);
export const useSetCarouselIndex = () => useBigFivePageStore(state => state.setCarouselIndex);

export const useDrawerState = () => useBigFivePageStore(
  useShallow(state => ({
    selectedTrait: state.selectedTrait,
    isOpen: state.isDrawerOpen,
    open: state.openDrawer,
    close: state.closeDrawer,
  }))
);

export const useAccordionState = () => useBigFivePageStore(
  useShallow(state => ({
    expandedItems: state.expandedAccordionItems,
    toggle: state.toggleAccordionItem,
    expand: state.expandAccordionItem,
    collapse: state.collapseAccordionItem,
    expandProblematic: state.expandProblematicTraits,
    collapseAll: state.collapseAllAccordions,
  }))
);
