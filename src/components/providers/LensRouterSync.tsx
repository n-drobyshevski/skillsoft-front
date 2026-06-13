"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLensStore } from "@/store/lens-store";
import { selectIsRouteVisible } from "@/store/lens-selectors";

/** Safe fallback when the current route isn't available in the new lens. */
const LENS_FALLBACK_ROUTE = "/dashboard";

/**
 * LensRouterSync
 *
 * Listens for activeLens changes in the Zustand store and re-renders Server
 * Components so they pick up the updated SKILLSOFT_ACTIVE_LENS cookie value.
 *
 * Two cases on a lens change:
 *  - The current route is still visible in the new lens → router.refresh()
 *    re-renders it in place with the new lens perspective.
 *  - The current route is NOT visible in the new lens (e.g. switching admin →
 *    user while on /admin/teams/[id]) → navigate to a safe route instead.
 *    Refreshing in place would re-render the current Server Components with the
 *    lens-downgraded X-Effective-Role, and role-guarded endpoints would (
 *    correctly) return 403. The server-side guard in the admin layout is the
 *    authoritative backstop; this redirect makes the intentional switch smooth.
 *
 * This ensures that no matter where setLens() is called (lens switcher,
 * command palette, etc.), the view reflects the new lens perspective.
 */
export function LensRouterSync() {
  const router = useRouter();
  const pathname = usePathname();
  const prevLensRef = useRef<string | null>(null);

  // Keep the latest pathname available to the (stable) store subscription
  // without resubscribing on every navigation.
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const unsubscribe = useLensStore.subscribe(
      (state) => state.activeLens,
      (activeLens) => {
        // Skip the initial subscription fire (before any user interaction)
        if (prevLensRef.current === null) {
          prevLensRef.current = activeLens;
          return;
        }

        // Only react when the lens actually changed
        if (prevLensRef.current === activeLens) {
          return;
        }
        prevLensRef.current = activeLens;

        // Is the current route still accessible under the new lens?
        const routeVisible = selectIsRouteVisible(pathnameRef.current)(
          useLensStore.getState()
        );

        if (routeVisible) {
          router.refresh();
        } else {
          router.replace(LENS_FALLBACK_ROUTE);
        }
      },
      { fireImmediately: true }
    );

    return unsubscribe;
  }, [router]);

  return null;
}
