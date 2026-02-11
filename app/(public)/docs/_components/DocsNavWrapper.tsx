"use client";

import dynamic from "next/dynamic";

/**
 * Mobile navigation wrapper with dynamic import.
 *
 * Uses dynamic import with ssr: false to prevent hydration mismatches
 * from Radix UI Sheet component ID generation.
 *
 * Desktop navigation now uses DocsNavServer (server component)
 * directly in the layout for SSR support.
 */
const MobileDocsNavDynamic = dynamic(
  () => import("./MobileDocsNav").then((mod) => mod.MobileDocsNav),
  { ssr: false }
);

/**
 * Client-side wrapper for MobileDocsNav with dynamic import.
 * Only used for mobile FAB navigation.
 */
export function MobileDocsNavWrapper() {
  return <MobileDocsNavDynamic />;
}
