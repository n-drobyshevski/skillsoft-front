"use client";

import * as React from "react";
import { ListIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface MobileTocDrawerProps {
  items: TocItem[];
  /** CSS class for styling */
  className?: string;
}

/**
 * Mobile Table of Contents Drawer
 *
 * A bottom bar TOC navigation for mobile devices that includes:
 * - Reading progress indicator
 * - Current section display
 * - TOC button (right side of bottom nav)
 * - Bottom sheet drawer with full TOC
 * - Active section highlighting
 * - Touch-friendly targets
 *
 * Visible only on mobile devices (< lg breakpoint).
 */
export function MobileTocDrawer({ items, className }: MobileTocDrawerProps) {
  const [open, setOpen] = React.useState(false);
  const [activeId, setActiveId] = React.useState<string>("");
  const [progress, setProgress] = React.useState(0);

  // Track scroll progress and active section
  React.useEffect(() => {
    const handleScroll = () => {
      // Calculate reading progress
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const newProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, newProgress)));

      // Find active section using Intersection Observer-like logic
      const sections = items
        .map((item) => document.getElementById(item.id))
        .filter(Boolean) as HTMLElement[];

      let currentActiveId = "";
      const scrollPosition = scrollTop + 100; // Offset for header

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.offsetTop <= scrollPosition) {
          currentActiveId = section.id;
          break;
        }
      }

      if (currentActiveId !== activeId) {
        setActiveId(currentActiveId);
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items, activeId]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setOpen(false);
    }
  };

  const currentSection = items.find((item) => item.id === activeId);

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      {/* Bottom sticky bar with current section + progress + action buttons */}
      <div className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-background/95 backdrop-blur border-t safe-area-bottom">
        {/* Reading progress bar */}
        <Progress value={progress} className="h-0.5 rounded-none" />

        <div className="flex items-center gap-2 px-4 py-2">
          {/* Current section indicator */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Читаете</p>
            <p className="text-sm font-medium truncate">
              {currentSection?.title || items[0]?.title || "Введение"}
            </p>
          </div>

          {/* TOC trigger button */}
          <Button
            size="icon"
            onClick={() => setOpen(true)}
            className="h-10 w-10 rounded-full touch-manipulation shrink-0"
            aria-label="Открыть оглавление"
          >
            <ListIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Bottom Sheet TOC Drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="h-[70dvh] px-0">
          <SheetHeader className="px-4 pb-4 border-b">
            <SheetTitle>На этой странице</SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(70dvh-80px)]">
            <nav className="p-4" aria-label="Table of contents">
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      className={cn(
                        "w-full text-left py-3 px-4 rounded-lg transition-colors",
                        "min-h-[44px] touch-manipulation",
                        "text-sm hover:bg-muted",
                        // Indent based on level
                        item.level === 2 && "font-semibold",
                        item.level === 3 && "pl-8 text-muted-foreground",
                        item.level >= 4 && "pl-12 text-muted-foreground text-xs",
                        // Active state
                        activeId === item.id &&
                          "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                      )}
                    >
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>

    </>
  );
}
