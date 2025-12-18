import { DocsNavServer } from "./_components/DocsNavServer";
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
 * Three-column layout for the documentation hub:
 * - Left: Sidebar navigation (server-rendered, hidden on mobile)
 * - Center: Main content (max-w-3xl for optimal reading)
 * - Right: Table of contents (hidden on tablet and below)
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
    <div className="relative flex min-h-[calc(100vh-3.5rem)]">
      {/* Left Sidebar - Server-rendered navigation */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-muted/30">
        <DocsNavServer />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-8">
              {/* Content Column */}
              <div className="min-w-0">{children}</div>

              {/* Right TOC Column - Hidden on tablet and below */}
              {/* TOC is rendered by individual pages using DocsToc component */}
              <div className="hidden lg:block" id="docs-toc-container" />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Navigation FAB - Client-side only */}
      <MobileDocsNavWrapper />
    </div>
  );
}
