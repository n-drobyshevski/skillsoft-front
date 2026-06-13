import { useEffect, type MutableRefObject } from 'react';

/**
 * usePersistOnExit Hook
 *
 * Safety net for accidental exits during a test. The player autosaves each
 * answer on navigation, but the answer typed/selected on the CURRENT question
 * (before pressing next) would otherwise be lost on tab close, refresh, or
 * in-app navigation. This hook flushes that in-flight answer (and the timer)
 * using a keepalive request that survives the page being torn down, and warns
 * the user via the browser's native "Leave site?" prompt when there are
 * unsaved changes.
 *
 * The flush and "has unsaved changes" signal are passed as refs so the
 * once-registered listeners always read the latest player state without
 * re-binding on every render.
 */

export interface UsePersistOnExitProps {
  /** When false, no listeners are registered (e.g. untimed/anonymous edge cases). */
  enabled: boolean;
  /**
   * Latest best-effort flush. Saves the current dirty answer and timer via
   * keepalive requests. Must be safe to call repeatedly and must not throw.
   */
  flushRef: MutableRefObject<() => void>;
  /**
   * Latest "there is an unsaved in-flight answer" flag. Drives the
   * beforeunload confirmation prompt.
   */
  unsavedRef: MutableRefObject<boolean>;
}

export function usePersistOnExit({
  enabled,
  flushRef,
  unsavedRef,
}: UsePersistOnExitProps): void {
  useEffect(() => {
    if (!enabled) return;

    // Primary path: visibilitychange -> hidden fires before the document is
    // frozen on tab close / app switch / navigation, and tolerates the async
    // header signing needed for the keepalive request.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushRef.current();
      }
    };

    // Backup path for the unload sequence.
    const handlePageHide = () => {
      flushRef.current();
    };

    // Native "Leave site?" warning when an answer is unsaved.
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (unsavedRef.current) {
        // Best-effort flush in case visibilitychange did not fire first.
        flushRef.current();
        event.preventDefault();
        // Legacy Chrome/Firefox require returnValue to be set.
        event.returnValue = '';
        return '';
      }
      return undefined;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, flushRef, unsavedRef]);
}

export default usePersistOnExit;
