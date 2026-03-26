'use cache';

import { Suspense } from "react";
import { cacheLife } from "next/cache";
import { DocsNavServer } from "./_components/DocsNavServer";
import { DocsNavSkeleton } from "./_components/DocsNavSkeleton";
import { MobileDocsNavWrapper } from "./_components/DocsNavWrapper";

export const metadata = {
  title: "Документация | SkillSoft",
  description:
    "Внутренняя документация платформы оценки soft skills для HR-администраторов",
};

/**
 * Documentation Layout
 *
 * Two-column base layout for the documentation hub:
 * - Left: Sidebar navigation (server-rendered, hidden on mobile)
 * - Center: Main content area (max-w-6xl container)
 *
 * Individual pages manage their own TOC layout using a grid structure
 * with DocsToc component for desktop and MobileTocDrawer for mobile.
 *
 * Mobile: FAB for navigation drawer (client-side only)
 *
 * Uses server component navigation (DocsNavServer) for SSR support
 * with client-side active state highlighting.
 */
export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  cacheLife('max');
  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] max-w-[100vw] overflow-x-clip">
      {/* Left Sidebar - Server-rendered navigation with streaming */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-muted/30">
        <Suspense fallback={<DocsNavSkeleton />}>
          <DocsNavServer />
        </Suspense>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-x-clip">
        <main className="flex-1 overflow-x-clip">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 overflow-x-clip pb-20 lg:pb-6">
            {/* Content - TOC is managed by individual pages */}
            {/* pb-20 on mobile accounts for sticky MobileTocDrawer bottom bar */}
            <div className="min-w-0 overflow-x-clip">{children}</div>
          </div>
        </main>
      </div>

      {/* Mobile Navigation FAB - Client-side only */}
      <MobileDocsNavWrapper />
    </div>
  );
}
