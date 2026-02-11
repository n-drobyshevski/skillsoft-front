"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { NavItem } from "@/lib/docs/navigation";

interface DocsNavItemProps {
  item: NavItem;
  onLinkClick?: () => void;
}

/**
 * Client component for navigation item with active state highlighting.
 *
 * Minimal client-side logic - only pathname comparison for active state.
 * The static structure is rendered by the server component (DocsNavServer).
 */
export function DocsNavItem({ item, onLinkClick }: DocsNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <li>
      <Link
        href={item.href}
        onClick={onLinkClick}
        prefetch={true}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        <span className="truncate">{item.title}</span>
        {item.badge && (
          <Badge variant="secondary" className="text-xs px-1.5 py-0">
            {item.badge}
          </Badge>
        )}
      </Link>
    </li>
  );
}
