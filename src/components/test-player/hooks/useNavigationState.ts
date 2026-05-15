import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

/**
 * useNavigationState Hook
 *
 * Manages navigation state machine for the test player.
 * Handles forward/backward navigation with dirty tracking,
 * auto-save behavior, and error recovery.
 *
 * State Machine:
 * ```
 * IDLE → SAVING (if dirty) → NAVIGATING → LOADING → IDLE
 *   ↓ (not dirty)
 * IDLE → NAVIGATING → LOADING → IDLE
 *
 * Any state → ERROR (on failure) → IDLE (on reset/retry)
 * ```
 */

// Types & Interfaces

/** Navigation phases in the state machine */
export type NavigationPhase =
  | 'IDLE'        // Ready for user interaction
  | 'SAVING'      // Auto-saving current answer before navigation
  | 'NAVIGATING'  // Calling navigation API
  | 'LOADING'     // Loading new question data
  | 'ERROR';      // Navigation failed, awaiting user action

/** Direction of navigation */
export type NavigationDirection = 'forward' | 'backward';

/** Error context for recovery */
export interface NavigationError {
  /** Error code from API or internal */
  code: string;
  /** User-friendly error message */
  message: string;
  /** Whether this error can be retried */
  isRetryable: boolean;
  /** Context about what was being attempted */
  context: {
    fromIndex: number;
    toIndex: number;
    direction: NavigationDirection;
    questionId: string | null;
  };
  /** Original error for debugging */
  originalError?: unknown;
}

/** Pending navigation request */
export interface PendingNavigation {
  direction: NavigationDirection;
  targetIndex: number;
  sourceIndex: number;
  questionId: string;
}

// Store State & Actions

export interface NavigationState {
  // Current phase
  phase: NavigationPhase;

  // Pending navigation details
  pendingNavigation: PendingNavigation | null;

  // Error state
  error: NavigationError | null;

  // Dirty tracking - questions with unsaved changes
  dirtyQuestions: Set<string>;

  // Original answers - for comparison to detect changes
  originalAnswers: Map<string, string | number | string[] | undefined>;
}

export interface NavigationActions {
  // Phase transitions
  /**
   * Start saving before navigation (when dirty)
   */
  startSaving: (navigation: PendingNavigation) => void;

  /**
   * Saving completed successfully, proceed to navigate
   */
  savingComplete: () => void;

  /**
   * Start direct navigation (when not dirty)
   */
  startNavigating: (navigation: PendingNavigation) => void;

  /**
   * Navigation API call completed, now loading question
   */
  navigationComplete: () => void;

  /**
   * Question loaded, return to idle
   */
  loadingComplete: () => void;

  /**
   * Navigation failed with error
   */
  fail: (error: NavigationError) => void;

  /**
   * Reset from error state to idle
   */
  reset: () => void;

  /**
   * Retry failed navigation
   */
  retry: () => PendingNavigation | null;

  // Dirty tracking
  /**
   * Mark a question as having unsaved changes
   */
  markDirty: (questionId: string) => void;

  /**
   * Mark a question as saved/clean
   */
  markClean: (questionId: string) => void;

  /**
   * Check if a question has unsaved changes
   */
  isDirty: (questionId: string) => boolean;

  /**
   * Check if any question is dirty
   */
  hasAnyDirty: () => boolean;

  /**
   * Clear all dirty flags
   */
  clearAllDirty: () => void;

  // Original answer tracking
  /**
   * Store original answer when question loads (for dirty detection)
   */
  setOriginalAnswer: (
    questionId: string,
    value: string | number | string[] | undefined
  ) => void;

  /**
   * Get original answer for comparison
   */
  getOriginalAnswer: (
    questionId: string
  ) => string | number | string[] | undefined;

  /**
   * Clear original answer (e.g., on session end)
   */
  clearOriginalAnswer: (questionId: string) => void;

  /**
   * Clear all original answers
   */
  clearAllOriginalAnswers: () => void;
}

// Combined store type
export type NavigationStore = NavigationState & NavigationActions;

// Initial State

const initialState: NavigationState = {
  phase: 'IDLE',
  pendingNavigation: null,
  error: null,
  dirtyQuestions: new Set(),
  originalAnswers: new Map(),
};

// Store Implementation

export const useNavigationState = create<NavigationStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    ...initialState,

    // Phase Transitions

    startSaving: (navigation) => {
      const { phase } = get();
      if (phase !== 'IDLE') {
        console.warn(
          `[NavigationState] Cannot start saving from phase: ${phase}`
        );
        return;
      }
      set({
        phase: 'SAVING',
        pendingNavigation: navigation,
        error: null,
      });
    },

    savingComplete: () => {
      const { phase } = get();
      if (phase !== 'SAVING') {
        console.warn(
          `[NavigationState] Cannot complete saving from phase: ${phase}`
        );
        return;
      }
      set({ phase: 'NAVIGATING' });
    },

    startNavigating: (navigation) => {
      const { phase } = get();
      if (phase !== 'IDLE') {
        console.warn(
          `[NavigationState] Cannot start navigating from phase: ${phase}`
        );
        return;
      }
      set({
        phase: 'NAVIGATING',
        pendingNavigation: navigation,
        error: null,
      });
    },

    navigationComplete: () => {
      const { phase } = get();
      if (phase !== 'NAVIGATING') {
        console.warn(
          `[NavigationState] Cannot complete navigation from phase: ${phase}`
        );
        return;
      }
      set({ phase: 'LOADING' });
    },

    loadingComplete: () => {
      const { phase } = get();
      if (phase !== 'LOADING') {
        console.warn(
          `[NavigationState] Cannot complete loading from phase: ${phase}`
        );
        return;
      }
      set({
        phase: 'IDLE',
        pendingNavigation: null,
      });
    },

    fail: (error) => {
      set({
        phase: 'ERROR',
        error,
      });
    },

    reset: () => {
      set({
        phase: 'IDLE',
        pendingNavigation: null,
        error: null,
      });
    },

    retry: () => {
      const { phase, pendingNavigation } = get();
      if (phase !== 'ERROR' || !pendingNavigation) {
        console.warn(`[NavigationState] Cannot retry from phase: ${phase}`);
        return null;
      }

      // Reset to SAVING or NAVIGATING based on dirty state
      const isDirty = get().isDirty(pendingNavigation.questionId);
      set({
        phase: isDirty ? 'SAVING' : 'NAVIGATING',
        error: null,
      });

      return pendingNavigation;
    },

    // Dirty Tracking

    markDirty: (questionId) => {
      set((state) => {
        const newDirtyQuestions = new Set(state.dirtyQuestions);
        newDirtyQuestions.add(questionId);
        return { dirtyQuestions: newDirtyQuestions };
      });
    },

    markClean: (questionId) => {
      set((state) => {
        const newDirtyQuestions = new Set(state.dirtyQuestions);
        newDirtyQuestions.delete(questionId);
        return { dirtyQuestions: newDirtyQuestions };
      });
    },

    isDirty: (questionId) => {
      return get().dirtyQuestions.has(questionId);
    },

    hasAnyDirty: () => {
      return get().dirtyQuestions.size > 0;
    },

    clearAllDirty: () => {
      set({ dirtyQuestions: new Set() });
    },

    // Original Answer Tracking

    setOriginalAnswer: (questionId, value) => {
      set((state) => {
        const newOriginalAnswers = new Map(state.originalAnswers);
        newOriginalAnswers.set(questionId, value);
        return { originalAnswers: newOriginalAnswers };
      });
    },

    getOriginalAnswer: (questionId) => {
      return get().originalAnswers.get(questionId);
    },

    clearOriginalAnswer: (questionId) => {
      set((state) => {
        const newOriginalAnswers = new Map(state.originalAnswers);
        newOriginalAnswers.delete(questionId);
        return { originalAnswers: newOriginalAnswers };
      });
    },

    clearAllOriginalAnswers: () => {
      set({ originalAnswers: new Map() });
    },
  }))
);

// Selector Hooks (for optimized re-renders)

/**
 * Get current navigation phase
 */
export const useNavigationPhase = () =>
  useNavigationState((state) => state.phase);

/**
 * Check if navigation is in progress (any non-idle, non-error phase)
 */
export const useIsNavigating = () =>
  useNavigationState((state) =>
    state.phase === 'SAVING' ||
    state.phase === 'NAVIGATING' ||
    state.phase === 'LOADING'
  );

/**
 * Check if user can interact (idle state only)
 */
export const useCanInteract = () =>
  useNavigationState((state) => state.phase === 'IDLE');

/**
 * Get current error if any
 */
export const useNavigationError = () =>
  useNavigationState((state) => state.error);

/**
 * Check if current error is retryable
 */
export const useCanRetry = () =>
  useNavigationState((state) => state.error?.isRetryable ?? false);

/**
 * Get pending navigation details
 */
export const usePendingNavigation = () =>
  useNavigationState((state) => state.pendingNavigation);

/**
 * Get navigation direction (null if not navigating)
 */
export const useNavigationDirection = () =>
  useNavigationState((state) => state.pendingNavigation?.direction ?? null);

// Utility Functions

/**
 * Compare two answer values for equality
 * Handles arrays, primitives, and undefined
 */
export function areAnswersEqual(
  a: string | number | string[] | undefined,
  b: string | number | string[] | undefined
): boolean {
  // Both undefined or same primitive
  if (a === b) return true;

  // One undefined, other not
  if (a === undefined || b === undefined) return false;

  // Both arrays - compare contents
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
  }

  // Type mismatch (one array, one not)
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  // Primitive comparison (already handled by a === b)
  return false;
}

/**
 * Create a navigation error from an API error
 */
export function createNavigationError(
  error: unknown,
  context: NavigationError['context']
): NavigationError {
  const apiError = error as { status?: number; message?: string; code?: string };

  // Determine if retryable based on status code
  const isRetryable =
    apiError.status === undefined || // Network error
    apiError.status >= 500 || // Server error
    apiError.status === 408 || // Timeout
    apiError.status === 429; // Rate limited

  // Map common errors to user-friendly messages
  let message = 'Не удалось выполнить навигацию';
  let code = apiError.code || 'NAVIGATION_ERROR';

  if (apiError.status === 400) {
    message = 'Недопустимая операция навигации';
    code = 'INVALID_NAVIGATION';
  } else if (apiError.status === 403) {
    const errorMsg = apiError.message?.toLowerCase() || '';
    if (errorMsg.includes('abandon')) {
      message = 'Сессия была отменена';
      code = 'SESSION_ABANDONED';
    } else if (errorMsg.includes('complet')) {
      message = 'Тест уже завершён';
      code = 'SESSION_COMPLETED';
    } else if (errorMsg.includes('back')) {
      message = 'Навигация назад не разрешена';
      code = 'BACK_NAVIGATION_DISABLED';
    } else {
      message = 'Доступ запрещён';
      code = 'ACCESS_DENIED';
    }
  } else if (apiError.status === 404) {
    message = 'Вопрос не найден';
    code = 'QUESTION_NOT_FOUND';
  } else if (apiError.status === undefined) {
    message = 'Ошибка сети. Проверьте подключение';
    code = 'NETWORK_ERROR';
  } else if (apiError.status >= 500) {
    message = 'Ошибка сервера. Попробуйте снова';
    code = 'SERVER_ERROR';
  }

  return {
    code,
    message,
    isRetryable,
    context,
    originalError: error,
  };
}

/**
 * Check if navigation should auto-save based on dirty state
 */
export function shouldAutoSave(
  questionId: string | undefined,
  store: NavigationStore
): boolean {
  if (!questionId) return false;
  return store.isDirty(questionId);
}

export default useNavigationState;
