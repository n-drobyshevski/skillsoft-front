"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLensStore } from "@/store/lens-store";

/**
 * LensRouterSync
 *
 * Listens for activeLens changes in the Zustand store and triggers
 * router.refresh() so that Server Components re-render with the
 * updated SKILLSOFT_ACTIVE_LENS cookie value.
 *
 * This ensures that no matter where setLens() is called (lens switcher,
 * command palette, etc.), server-fetched page content reloads to reflect
 * the new lens perspective.
 */
export function LensRouterSync() {
  const router = useRouter();
  const prevLensRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = useLensStore.subscribe(
      (state) => state.activeLens,
      (activeLens) => {
        // Skip the initial subscription fire (before any user interaction)
        if (prevLensRef.current === null) {
          prevLensRef.current = activeLens;
          return;
        }

        // Only refresh when the lens actually changed
        if (prevLensRef.current !== activeLens) {
          prevLensRef.current = activeLens;
          router.refresh();
        }
      },
      { fireImmediately: true }
    );

    return unsubscribe;
  }, [router]);

  return null;
}
