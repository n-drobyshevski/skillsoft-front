import { docsNavigation } from "@/lib/docs/navigation";
import { DocsNavItem } from "./DocsNavItem";
import { DocsSearchTrigger } from "./DocsSearchTrigger";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * Server component for documentation navigation sidebar.
 *
 * Renders the static navigation structure on the server.
 * Active state highlighting is handled by the DocsNavItem client component.
 *
 * Note: `use cache` is disabled due to Clerk compatibility issues (cacheComponents: false).
 * Static generation is achieved via route segment config (dynamic = 'force-static').
 */
export function DocsNavServer() {
  return (
    <div className="flex h-full flex-col">
      {/* Search Button - Client component for interactivity */}
      <div className="p-4 border-b">
        <DocsSearchTrigger />
      </div>

      {/* Navigation Sections */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-6">
          {docsNavigation.map((section) => (
            <DocsNavSection
              key={section.title}
              section={section}
            />
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}

/**
 * Server component for rendering a navigation section.
 * Uses stable index-based IDs to prevent hydration mismatches.
 */
function DocsNavSection({
  section,
}: {
  section: (typeof docsNavigation)[number];
}) {
  return (
    <div className="space-y-1">
      <h3 className="px-2 py-1.5 text-sm font-semibold text-foreground">
        {section.title}
      </h3>
      <ul className="space-y-1">
        {section.items.map((item) => (
          <DocsNavItem key={item.href} item={item} />
        ))}
      </ul>
    </div>
  );
}
