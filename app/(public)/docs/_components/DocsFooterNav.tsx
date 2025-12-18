"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { getAdjacentPages, type NavItem } from "@/lib/docs/navigation";

interface DocsFooterNavProps {
  className?: string;
}

/**
 * Documentation Footer Navigation
 *
 * Shows Previous/Next page links at the bottom of documentation pages.
 * Automatically determines adjacent pages based on the navigation config.
 */
export function DocsFooterNav({ className }: DocsFooterNavProps) {
  const pathname = usePathname();
  const { prev, next } = getAdjacentPages(pathname);

  if (!prev && !next) {
    return null;
  }

  return (
    <nav
      className={cn(
        "mt-12 flex items-center justify-between gap-4 border-t pt-6",
        className
      )}
      aria-label="Pagination"
    >
      {/* Previous Page */}
      <div className="flex-1">
        {prev && <FooterNavLink item={prev} direction="prev" />}
      </div>

      {/* Next Page */}
      <div className="flex-1 text-right">
        {next && <FooterNavLink item={next} direction="next" />}
      </div>
    </nav>
  );
}

interface FooterNavLinkProps {
  item: NavItem;
  direction: "prev" | "next";
}

function FooterNavLink({ item, direction }: FooterNavLinkProps) {
  const isPrev = direction === "prev";

  return (
    <Link
      href={item.href}
      className={cn(
        "group inline-flex flex-col gap-1 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50",
        isPrev ? "items-start" : "items-end"
      )}
    >
      <span
        className={cn(
          "flex items-center gap-1 text-xs font-medium text-muted-foreground",
          isPrev ? "flex-row" : "flex-row-reverse"
        )}
      >
        {isPrev ? (
          <ChevronLeft className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {isPrev ? "Предыдущая" : "Следующая"}
      </span>
      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
        {item.title}
      </span>
    </Link>
  );
}
