'use client';

import { useState, createContext, useContext } from 'react';

/**
 * Onboarding Tour Hook - Phase 5.1 First-Time Experience
 *
 * Provides an interactive onboarding tour with:
 * - Coach marks (spotlight + tooltip)
 * - Step-by-step progression
 * - LocalStorage persistence for completion tracking
 * - Skip/dismiss functionality
 */

// ============================================
// TYPES
// ============================================

export interface TourStep {
  /** Unique step ID */
  id: string;
  /** CSS selector for the target element */
  target: string;
  /** Title shown in the coach mark */
  title: string;
  /** Description/content for the step */
  content: string;
  /** Position of tooltip relative to target */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  /** Optional action button label */
  actionLabel?: string;
  /** Optional callback when action is clicked */
  onAction?: () => void;
  /** Whether to highlight the target with a spotlight */
  spotlight?: boolean;
  /** Optional delay before showing this step (ms) */
  delay?: number;
}

export interface TourDefinition {
  /** Unique tour ID for persistence */
  id: string;
  /** Steps in the tour */
  steps: TourStep[];
  /** Called when tour completes */
  onComplete?: () => void;
  /** Called when tour is skipped */
  onSkip?: () => void;
}

interface TourState {
  isActive: boolean;
  currentStepIndex: number;
  tourId: string | null;
}

interface UseTourReturn {
  // State
  isActive: boolean;
  currentStep: TourStep | null;
  currentStepIndex: number;
  totalSteps: number;
  progress: number;

  // Actions
  startTour: (tour: TourDefinition) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  skipTour: () => void;
  completeTour: () => void;

  // Persistence
  hasCompletedTour: (tourId: string) => boolean;
  resetTourProgress: (tourId: string) => void;
}

// ============================================
// STORAGE HELPERS
// ============================================

const STORAGE_KEY = 'skillsoft-tours-completed';

function getCompletedTours(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
}

function markTourCompleted(tourId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const completed = getCompletedTours();
    completed.add(tourId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
  } catch {
    // Ignore storage errors
  }
}

function resetTourCompletion(tourId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const completed = getCompletedTours();
    completed.delete(tourId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
  } catch {
    // Ignore storage errors
  }
}

// ============================================
// HOOK
// ============================================

export function useOnboardingTour(): UseTourReturn {
  const [state, setState] = useState<TourState>({
    isActive: false,
    currentStepIndex: 0,
    tourId: null,
  });

  const [currentTour, setCurrentTour] = useState<TourDefinition | null>(null);

  // Start a tour
  const startTour = (tour: TourDefinition) => {
    // Check if already completed
    if (getCompletedTours().has(tour.id)) {
      return;
    }

    setCurrentTour(tour);
    setState({
      isActive: true,
      currentStepIndex: 0,
      tourId: tour.id,
    });
  };

  // Navigate to next step
  const nextStep = () => {
    if (!currentTour) return;

    setState((prev) => {
      const nextIndex = prev.currentStepIndex + 1;

      // Check if tour is complete
      if (nextIndex >= currentTour.steps.length) {
        markTourCompleted(currentTour.id);
        currentTour.onComplete?.();
        return { isActive: false, currentStepIndex: 0, tourId: null };
      }

      return { ...prev, currentStepIndex: nextIndex };
    });
  };

  // Navigate to previous step
  const prevStep = () => {
    setState((prev) => ({
      ...prev,
      currentStepIndex: Math.max(0, prev.currentStepIndex - 1),
    }));
  };

  // Go to specific step
  const goToStep = (index: number) => {
    if (!currentTour) return;

    setState((prev) => ({
      ...prev,
      currentStepIndex: Math.max(0, Math.min(index, currentTour.steps.length - 1)),
    }));
  };

  // Skip tour
  const skipTour = () => {
    if (currentTour) {
      markTourCompleted(currentTour.id);
      currentTour.onSkip?.();
    }
    setState({ isActive: false, currentStepIndex: 0, tourId: null });
    setCurrentTour(null);
  };

  // Complete tour
  const completeTour = () => {
    if (currentTour) {
      markTourCompleted(currentTour.id);
      currentTour.onComplete?.();
    }
    setState({ isActive: false, currentStepIndex: 0, tourId: null });
    setCurrentTour(null);
  };

  // Check if a tour has been completed
  const hasCompletedTour = (tourId: string): boolean => {
    return getCompletedTours().has(tourId);
  };

  // Reset tour progress
  const resetTourProgress = (tourId: string): void => {
    resetTourCompletion(tourId);
  };

  // Derived values
  const currentStep = currentTour?.steps[state.currentStepIndex] ?? null;
  const totalSteps = currentTour?.steps.length ?? 0;
  const progress = totalSteps > 0 ? ((state.currentStepIndex + 1) / totalSteps) * 100 : 0;

  return {
    isActive: state.isActive,
    currentStep,
    currentStepIndex: state.currentStepIndex,
    totalSteps,
    progress,
    startTour,
    nextStep,
    prevStep,
    goToStep,
    skipTour,
    completeTour,
    hasCompletedTour,
    resetTourProgress,
  };
}

// ============================================
// CONTEXT (for app-wide tour state)
// ============================================

type TourContextValue = UseTourReturn;

const TourContext = createContext<TourContextValue | null>(null);

export function useTourContext(): TourContextValue {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTourContext must be used within TourProvider');
  }
  return context;
}

export { TourContext };
