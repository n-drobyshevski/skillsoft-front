import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

/**
 * View mode for the application layout
 * - 'default': Standard layout with sidebar and header
 * - 'immersive': Zen mode for focused activities (test taking)
 */
type ViewMode = 'default' | 'immersive';

interface UIState {
  viewMode: ViewMode;
  isTransitioning: boolean;
}

interface UIActions {
  setViewMode: (mode: ViewMode) => void;
  enterImmersiveMode: () => void;
  exitImmersiveMode: () => void;
}

type UIStore = UIState & UIActions;

/**
 * Global UI store using Zustand
 * Manages application-wide UI state like view modes
 * 
 * Uses subscribeWithSelector middleware for optimized re-renders
 */
export const useUIStore = create<UIStore>()(
  subscribeWithSelector((set, get) => ({
    // State
    viewMode: 'default',
    isTransitioning: false,

    // Actions
    setViewMode: (mode: ViewMode) => {
      const currentMode = get().viewMode;
      if (currentMode === mode) return;

      set({ isTransitioning: true });
      
      // Small delay to allow CSS transitions to complete smoothly
      requestAnimationFrame(() => {
        set({ viewMode: mode });
        // Reset transitioning state after animation
        setTimeout(() => set({ isTransitioning: false }), 300);
      });
    },

    enterImmersiveMode: () => {
      get().setViewMode('immersive');
    },

    exitImmersiveMode: () => {
      get().setViewMode('default');
    },
  }))
);

/**
 * Selector hooks for optimized component subscriptions
 */
export const useViewMode = () => useUIStore((state) => state.viewMode);
export const useIsImmersive = () => useUIStore((state) => state.viewMode === 'immersive');
export const useIsTransitioning = () => useUIStore((state) => state.isTransitioning);