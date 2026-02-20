import { useEffect } from 'react';
import { useUIStore } from '@/store/ui-store';
import { useNavigationState } from './useNavigationState';

/**
 * useImmersiveMode Hook
 *
 * Manages the immersive mode lifecycle for the test player.
 * Handles:
 * 1. Entering immersive mode on mount (hides header/footer)
 * 2. Exiting immersive mode on unmount
 * 3. Initializing and cleaning up dirty tracking state
 */

export interface UseImmersiveModeProps {
  /** The initial question ID for dirty tracking initialization */
  initialQuestionId: string | undefined;
  /** The initial answer value for dirty tracking */
  initialAnswerValue: string | number | string[] | undefined;
}

export function useImmersiveMode({
  initialQuestionId,
  initialAnswerValue,
}: UseImmersiveModeProps): void {
  const enterImmersiveMode = useUIStore((s) => s.enterImmersiveMode);
  const exitImmersiveMode = useUIStore((s) => s.exitImmersiveMode);

  // Enter immersive mode on mount
  useEffect(() => {
    enterImmersiveMode();
    return () => exitImmersiveMode();
  }, [enterImmersiveMode, exitImmersiveMode]);

  // Initialize dirty tracking on mount
  useEffect(() => {
    if (initialQuestionId) {
      useNavigationState.getState().setOriginalAnswer(initialQuestionId, initialAnswerValue);
    }

    // Cleanup on unmount
    return () => {
      useNavigationState.getState().clearAllDirty();
      useNavigationState.getState().clearAllOriginalAnswers();
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export default useImmersiveMode;
