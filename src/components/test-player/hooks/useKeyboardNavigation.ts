import { useEffect, useCallback } from 'react';

/**
 * useKeyboardNavigation Hook
 *
 * Provides keyboard navigation for the ImmersivePlayer.
 * Handles arrow keys, Enter, Skip (S), and Escape for test navigation.
 */

export interface UseKeyboardNavigationProps {
  /** Whether an answer is valid and next navigation is allowed */
  canGoNext: boolean;

  /** Whether back navigation is allowed */
  canGoBack: boolean;

  /** Whether skip is allowed */
  canSkip: boolean;

  /** Whether currently submitting (disables navigation) */
  isSubmitting: boolean;

  /** Handler for next navigation */
  onNext: () => void;

  /** Handler for back navigation */
  onPrevious: () => void;

  /** Handler for skip */
  onSkip: () => void;

  /** Optional handler for escape key */
  onEscape?: () => void;

  /** Whether keyboard navigation is enabled */
  enabled?: boolean;
}

export interface UseKeyboardNavigationReturn {
  /** Currently active keyboard handler */
  isEnabled: boolean;
}

/**
 * Check if the event target is an input element
 */
function isInputElement(target: EventTarget | null): boolean {
  if (!target) return false;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

export function useKeyboardNavigation({
  canGoNext,
  canGoBack,
  canSkip,
  isSubmitting,
  onNext,
  onPrevious,
  onSkip,
  onEscape,
  enabled = true,
}: UseKeyboardNavigationProps): UseKeyboardNavigationReturn {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't handle keys if disabled or submitting
      if (!enabled || isSubmitting) return;

      // Ignore if typing in an input
      if (isInputElement(e.target)) {
        // Allow Enter to submit from text input (if not textarea with Shift+Enter)
        if (e.key === 'Enter' && !e.shiftKey && canGoNext) {
          if (!(e.target instanceof HTMLTextAreaElement)) {
            e.preventDefault();
            onNext();
          }
        }
        return;
      }

      switch (e.key) {
        case 'Enter':
          if (!e.shiftKey && canGoNext) {
            e.preventDefault();
            onNext();
          }
          break;

        case 'ArrowRight':
          if (canGoNext) {
            e.preventDefault();
            onNext();
          }
          break;

        case 'ArrowLeft':
          if (canGoBack) {
            e.preventDefault();
            onPrevious();
          }
          break;

        case 's':
        case 'S':
          // Skip question with 'S' key (when skip is allowed)
          if (canSkip) {
            e.preventDefault();
            onSkip();
          }
          break;

        case 'Escape':
          if (onEscape) {
            e.preventDefault();
            onEscape();
          }
          break;

        // Additional keyboard shortcuts for power users
        case 'Home':
          // Could navigate to first answered question
          break;

        case 'End':
          // Could navigate to last answered question
          break;

        case '?':
          // Could show keyboard shortcuts help
          break;
      }
    },
    [enabled, isSubmitting, canGoNext, canGoBack, canSkip, onNext, onPrevious, onSkip, onEscape]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  return {
    isEnabled: enabled && !isSubmitting,
  };
}

/**
 * Preset keyboard shortcut definitions for help modal
 */
export const TEST_PLAYER_KEYBOARD_SHORTCUTS = [
  {
    key: 'Enter',
    description: 'Следующий вопрос',
    category: 'Навигация',
  },
  {
    key: '→',
    description: 'Следующий вопрос',
    category: 'Навигация',
  },
  {
    key: '←',
    description: 'Предыдущий вопрос',
    category: 'Навигация',
  },
  {
    key: 'S',
    description: 'Пропустить вопрос',
    category: 'Действия',
  },
  {
    key: 'Esc',
    description: 'Выйти из теста',
    category: 'Действия',
  },
] as const;

export default useKeyboardNavigation;
