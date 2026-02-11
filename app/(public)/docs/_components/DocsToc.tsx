import { cn } from "@/lib/utils";
import { DocsTocClient, type TocItem } from "./DocsTocClient";

// Re-export TocItem type for use in pages
export type { TocItem };

interface DocsTocProps {
  /** List of TOC items to display */
  items: TocItem[];
  /** CSS class for styling */
  className?: string;
}

/**
 * Documentation Table of Contents (Server Component Wrapper)
 *
 * Renders the static TOC structure on the server with:
 * - Sticky positioning on scroll
 * - Static heading for the TOC
 *
 * Active section highlighting is handled by the DocsTocClient client component.
 */
export function DocsToc({ items, className }: DocsTocProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      className={cn("sticky top-20", className)}
      aria-label="Table of contents"
    >
      <p className="mb-3 text-sm font-semibold text-foreground">
        На этой странице
      </p>
      {/* Client component for active state tracking */}
      <DocsTocClient items={items} />
    </nav>
  );
}
