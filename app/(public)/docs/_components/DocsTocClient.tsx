"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface DocsTocClientProps {
  items: TocItem[];
}

/**
 * Client component for Table of Contents with active section highlighting.
 *
 * Uses IntersectionObserver to track which section is currently visible
 * and highlight the corresponding TOC item.
 */
export function DocsTocClient({ items }: DocsTocClientProps) {
  const [activeId, setActiveId] = useState<string>("");

  // Set up IntersectionObserver for active section highlighting
  useEffect(() => {
    if (items.length === 0) return;

    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Find the first heading that is intersecting
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);

      if (visibleEntries.length > 0) {
        // Get the topmost visible heading
        const topEntry = visibleEntries.reduce((prev, curr) => {
          return prev.boundingClientRect.top < curr.boundingClientRect.top
            ? prev
            : curr;
        });
        setActiveId(topEntry.target.id);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: "-80px 0px -80% 0px",
      threshold: 0,
    });

    // Observe all headings
    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [items]);

  // Handle click to scroll to section
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        // Scroll with offset for sticky header
        const offset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        // Update URL hash
        window.history.pushState(null, "", `#${id}`);
        setActiveId(id);
      }
    },
    []
  );

  return (
    <ul className="space-y-2 text-sm">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            onClick={(e) => handleClick(e, item.id)}
            className={cn(
              "block py-1 transition-colors hover:text-foreground",
              item.level === 3 && "pl-3",
              activeId === item.id
                ? "text-primary font-medium border-l-2 border-primary pl-3 -ml-[2px]"
                : "text-muted-foreground"
            )}
          >
            {item.title}
          </a>
        </li>
      ))}
    </ul>
  );
}
