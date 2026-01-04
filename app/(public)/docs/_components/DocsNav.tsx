"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { docsNavigation, type NavSection } from "@/lib/docs/navigation";
import { DocsSearch } from "./DocsSearch";

interface DocsNavProps {
  className?: string;
  /** Called when a link is clicked - useful for closing mobile nav */
  onLinkClick?: () => void;
}

/**
 * Documentation Sidebar Navigation
 *
 * Features:
 * - Search button (triggers Cmd+K dialog)
 * - Collapsible sections
 * - Active link highlighting
 * - Scrollable area
 */
export function DocsNav({ className, onLinkClick }: DocsNavProps) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Search Button */}
      <div className="p-4 border-b">
        <DocsSearch />
      </div>

      {/* Navigation Sections */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-6">
          {docsNavigation.map((section) => (
            <NavSectionComponent
              key={section.title}
              section={section}
              currentPath={pathname}
              onLinkClick={onLinkClick}
            />
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}

interface NavSectionComponentProps {
  section: NavSection;
  currentPath: string;
  onLinkClick?: () => void;
}

function NavSectionComponent({
  section,
  currentPath,
  onLinkClick,
}: NavSectionComponentProps) {
  // Keep sections expanded by default
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-semibold text-foreground hover:bg-accent/50 transition-colors">
        <span>{section.title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1">
        <ul className="space-y-1">
          {section.items.map((item) => {
            const isItemActive = currentPath === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onLinkClick}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    isItemActive
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
          })}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
