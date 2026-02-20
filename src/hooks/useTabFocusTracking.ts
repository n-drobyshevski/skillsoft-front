import { useEffect, useRef, useCallback } from 'react';

/**
 * Tracks tab focus changes using the visibilitychange event.
 *
 * Increments an internal counter each time the document becomes hidden,
 * which corresponds to the user switching away from the test tab.
 * The count is stored in a ref to avoid causing re-renders.
 *
 * This hook is advisory only — the count is surfaced to template owners
 * as metadata and does NOT trigger any automatic disqualification.
 *
 * @param enabled - Set to false to disable tracking (e.g. when test is complete).
 * @returns getTabSwitchCount - Stable callback that returns the current count.
 */
export function useTabFocusTracking(enabled: boolean = true) {
  const countRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const handler = () => {
      if (document.visibilityState === 'hidden') {
        countRef.current += 1;
      }
    };

    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [enabled]);

  const getTabSwitchCount = useCallback(() => countRef.current, []);

  return { getTabSwitchCount };
}
