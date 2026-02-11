"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, ChevronDown, LucideIcon } from "lucide-react";
import { DocsProgress } from "./DocsProgress";

/* ===== NAVIGATION TYPES ===== */

interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  badge?: string;
  children?: NavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

/* ===== SIDEBAR COMPONENTS ===== */

interface DocsSidebarProps {
  sections: NavSection[];
  className?: string;
}

function DocsSidebarContent({
  sections,
  onNavigate,
}: {
  sections: NavSection[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
    new Set()
  );

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(href)) {
        next.delete(href);
      } else {
        next.add(href);
      }
      return next;
    });
  };

  const isActive = (href: string) => pathname === href;
  const hasActiveChild = (item: NavItem): boolean => {
    if (isActive(item.href)) return true;
    return item.children?.some((child) => hasActiveChild(child)) ?? false;
  };

  // Auto-expand sections with active children
  React.useEffect(() => {
    sections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children && hasActiveChild(item)) {
          setExpandedItems((prev) => new Set(prev).add(item.href));
        }
      });
    });
  }, [pathname, sections]);

  return (
    <>
      {/* Search */}
      <div className="p-4">
        <button
          type="button"
          className="docs-search-trigger"
          onClick={() => {
            // TODO: Open search modal
            console.log("Open search");
          }}
        >
          <Search className="docs-search-icon" />
          <span className="docs-search-placeholder">Search docs...</span>
          <kbd className="docs-search-shortcut">Ctrl K</kbd>
        </button>
      </div>

      {/* Navigation sections */}
      <ScrollArea className="flex-1 px-2">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-4">
            <div className="docs-sidebar-section">{section.title}</div>
            <nav className="space-y-1">
              {section.items.map((item) => (
                <div key={item.href}>
                  {/* Parent item */}
                  {item.children ? (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(item.href)}
                      className={cn(
                        "docs-sidebar-item w-full",
                        hasActiveChild(item) && "font-medium"
                      )}
                      aria-expanded={expandedItems.has(item.href)}
                    >
                      {item.icon && (
                        <item.icon className="docs-sidebar-icon" />
                      )}
                      <span className="flex-1 text-left">{item.title}</span>
                      {item.badge && (
                        <span className="docs-sidebar-badge">{item.badge}</span>
                      )}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          expandedItems.has(item.href) && "rotate-180"
                        )}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className="docs-sidebar-item"
                      data-active={isActive(item.href)}
                      aria-current={isActive(item.href) ? "page" : undefined}
                    >
                      {item.icon && (
                        <item.icon className="docs-sidebar-icon" />
                      )}
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <span className="docs-sidebar-badge">{item.badge}</span>
                      )}
                    </Link>
                  )}

                  {/* Nested items */}
                  {item.children && expandedItems.has(item.href) && (
                    <div className="docs-sidebar-nested">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onNavigate}
                          className="docs-sidebar-item"
                          data-active={isActive(child.href)}
                          aria-current={
                            isActive(child.href) ? "page" : undefined
                          }
                        >
                          <span className="flex-1">{child.title}</span>
                          {child.badge && (
                            <span className="docs-sidebar-badge">
                              {child.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        ))}
      </ScrollArea>
    </>
  );
}

function DocsSidebar({ sections, className }: DocsSidebarProps) {
  return (
    <aside className={cn("docs-sidebar hidden lg:flex flex-col", className)}>
      <DocsSidebarContent sections={sections} />
    </aside>
  );
}

/* ===== MOBILE SIDEBAR ===== */

interface DocsMobileSidebarProps {
  sections: NavSection[];
}

function DocsMobileSidebar({ sections }: DocsMobileSidebarProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0">
        <SheetTitle className="sr-only">Documentation Navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Navigate through the documentation sections
        </SheetDescription>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <span className="font-semibold">Documentation</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DocsSidebarContent
            sections={sections}
            onNavigate={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ===== MAIN LAYOUT ===== */

interface DocsLayoutProps {
  /**
   * Navigation sections for the sidebar
   */
  sections: NavSection[];

  /**
   * Page title
   */
  title?: string;

  /**
   * Page description
   */
  description?: string;

  /**
   * Show reading progress indicator
   * @default true
   */
  showProgress?: boolean;

  /**
   * Main content
   */
  children: React.ReactNode;
}

/**
 * DocsLayout Component
 *
 * The main layout component for documentation pages.
 * Includes responsive sidebar, mobile navigation, and reading progress.
 *
 * @example
 * ```tsx
 * <DocsLayout
 *   sections={docsSections}
 *   title="Getting Started"
 *   description="Learn how to use SkillSoft"
 * >
 *   <article>Your content here</article>
 * </DocsLayout>
 * ```
 */
export function DocsLayout({
  sections,
  title,
  description,
  showProgress = true,
  children,
}: DocsLayoutProps) {
  return (
    <div className="docs-layout">
      {/* Reading progress */}
      {showProgress && <DocsProgress />}

      {/* Skip link for accessibility */}
      <a href="#docs-content" className="skip-link">
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <DocsSidebar sections={sections} />

      {/* Main content area */}
      <main className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden">
          <DocsMobileSidebar sections={sections} />
          <span className="font-semibold truncate">{title || "Docs"}</span>
        </header>

        {/* Content */}
        <div id="docs-content" className="docs-content">
          {/* Page header */}
          {(title || description) && (
            <header className="mb-8">
              {title && <h1 className="doc-title">{title}</h1>}
              {description && (
                <p className="doc-body text-muted-foreground">{description}</p>
              )}
            </header>
          )}

          {/* Article content */}
          <article className="docs-article" lang="ru">
            {children}
          </article>
        </div>
      </main>
    </div>
  );
}

export type { NavItem, NavSection, DocsLayoutProps };
