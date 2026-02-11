"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TOCItem {
  /**
   * Heading ID for anchor link
   */
  id: string;

  /**
   * Heading text
   */
  text: string;

  /**
   * Heading level (2, 3, or 4)
   */
  level: 2 | 3 | 4;
}

interface DocsTOCProps {
  /**
   * Array of headings to display
   */
  headings: TOCItem[];

  /**
   * Title of the TOC section
   * @default "On this page"
   */
  title?: string;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * DocsTOC Component
 *
 * A sticky table of contents that tracks the current visible section.
 *
 * @example
 * ```tsx
 * <DocsTOC
 *   headings={[
 *     { id: "intro", text: "Introduction", level: 2 },
 *     { id: "setup", text: "Setup", level: 2 },
 *     { id: "config", text: "Configuration", level: 3 },
 *   ]}
 * />
 * ```
 */
export function DocsTOC({
  headings,
  title = "On this page",
  className,
}: DocsTOCProps) {
  const [activeId, setActiveId] = React.useState<string>("");

  // Set up intersection observer to track visible headings
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first heading that is currently visible
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          setActiveId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0,
      }
    );

    // Observe all headings
    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  // Handle click to scroll to heading
  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      // Update URL hash without triggering scroll
      window.history.pushState(null, "", `#${id}`);
      setActiveId(id);
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <aside className={cn("docs-toc", className)} aria-label={title}>
      <div className="docs-toc-title">{title}</div>
      <nav className="docs-toc-list">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            onClick={(e) => handleClick(e, heading.id)}
            className="docs-toc-item"
            data-level={heading.level}
            data-active={activeId === heading.id}
            aria-current={activeId === heading.id ? "location" : undefined}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </aside>
  );
}

/**
 * Mobile TOC Component
 *
 * An inline table of contents for mobile devices.
 */
interface DocsTOCMobileProps extends DocsTOCProps {
  /**
   * Whether the TOC is initially expanded
   * @default false
   */
  defaultExpanded?: boolean;
}

export function DocsTOCMobile({
  headings,
  title = "On this page",
  defaultExpanded = false,
  className,
}: DocsTOCMobileProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className={cn("docs-toc-mobile", className)}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between py-2"
        aria-expanded={isExpanded}
      >
        <span className="docs-toc-title">{title}</span>
        <svg
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isExpanded && "rotate-180"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <nav className="docs-toc-list mt-2">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className="docs-toc-item"
              data-level={heading.level}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}

/**
 * Hook to extract headings from a container element
 */
export function useHeadings(
  containerRef: React.RefObject<HTMLElement | null>,
  selector = "h2, h3, h4"
): TOCItem[] {
  const [headings, setHeadings] = React.useState<TOCItem[]>([]);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const elements = containerRef.current.querySelectorAll(selector);
    const items: TOCItem[] = Array.from(elements).map((el) => ({
      id: el.id || "",
      text: el.textContent || "",
      level: parseInt(el.tagName[1], 10) as 2 | 3 | 4,
    }));

    setHeadings(items.filter((item) => item.id && item.text));
  }, [containerRef, selector]);

  return headings;
}
