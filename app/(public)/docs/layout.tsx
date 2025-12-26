import { Suspense } from "react";
import { DocsNavServer } from "./_components/DocsNavServer";
import { DocsNavSkeleton } from "./_components/DocsNavSkeleton";
import { MobileDocsNavWrapper } from "./_components/DocsNavWrapper";

// Route segment configuration for ISR
// Note: dynamic = "force-static" removed from layout to avoid conflicts with client components
// Individual pages use force-static; layout uses ISR revalidation
export const revalidate = 3600;

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
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] max-w-[100vw] overflow-x-hidden">
      {/* Left Sidebar - Server-rendered navigation with streaming */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-muted/30">
        <Suspense fallback={<DocsNavSkeleton />}>
          <DocsNavServer />
        </Suspense>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 overflow-x-hidden pb-20 lg:pb-6">
            {/* Content - TOC is managed by individual pages */}
            {/* pb-20 on mobile accounts for sticky MobileTocDrawer bottom bar */}
            <div className="min-w-0 overflow-x-hidden">{children}</div>
          </div>
        </main>
      </div>

      {/* Mobile Navigation FAB - Client-side only */}
      <MobileDocsNavWrapper />
    </div>
  );
}
