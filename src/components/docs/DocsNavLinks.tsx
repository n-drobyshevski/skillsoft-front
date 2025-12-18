"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavLinkItem {
  /**
   * Link URL
   */
  href: string;

  /**
   * Article title
   */
  title: string;
}

interface DocsNavLinksProps {
  /**
   * Previous article link
   */
  prev?: NavLinkItem | null;

  /**
   * Next article link
   */
  next?: NavLinkItem | null;

  /**
   * Labels for prev/next (for i18n)
   */
  labels?: {
    prev?: string;
    next?: string;
  };

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * DocsNavLinks Component
 *
 * Navigation links for previous and next documentation pages.
 *
 * @example
 * ```tsx
 * <DocsNavLinks
 *   prev={{ href: "/docs/intro", title: "Introduction" }}
 *   next={{ href: "/docs/advanced", title: "Advanced Topics" }}
 * />
 * ```
 */
export function DocsNavLinks({
  prev,
  next,
  labels = { prev: "Previous", next: "Next" },
  className,
}: DocsNavLinksProps) {
  // Don't render if neither link exists
  if (!prev && !next) {
    return null;
  }

  return (
    <nav
      className={cn("docs-nav-links", className)}
      aria-label="Documentation navigation"
    >
      {prev ? (
        <Link
          href={prev.href}
          className="docs-nav-link"
          data-direction="prev"
        >
          <span className="docs-nav-label">
            <ChevronLeft className="docs-nav-arrow" aria-hidden="true" />
            {labels.prev}
          </span>
          <span className="docs-nav-title">{prev.title}</span>
        </Link>
      ) : (
        <div /> // Empty placeholder to maintain grid layout
      )}

      {next ? (
        <Link
          href={next.href}
          className="docs-nav-link"
          data-direction="next"
        >
          <span className="docs-nav-label">
            {labels.next}
            <ChevronRight className="docs-nav-arrow" aria-hidden="true" />
          </span>
          <span className="docs-nav-title">{next.title}</span>
        </Link>
      ) : (
        <div /> // Empty placeholder to maintain grid layout
      )}
    </nav>
  );
}
