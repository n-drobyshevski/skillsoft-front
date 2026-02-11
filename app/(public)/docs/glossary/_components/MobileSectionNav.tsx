"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { BookOpen, Brain, Wrench, Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { DocsNav } from "../../_components/DocsNav";

interface Section {
  id: string;
  label: string;
  count: number;
}

interface MobileSectionNavProps {
  sections: Section[];
}

/**
 * Section configuration with category-specific accent colors
 * Matches the GlossaryTermCard color scheme
 */
const sectionConfig: Record<
  string,
  {
    icon: React.ReactNode;
    activeColor: string;
    activeBg: string;
    activeBorder: string;
  }
> = {
  "domain-terms": {
    icon: <BookOpen className="size-4" />,
    activeColor: "text-emerald-700 dark:text-emerald-400",
    activeBg: "bg-emerald-100/90 dark:bg-emerald-900/50",
    activeBorder: "border-emerald-200/80 dark:border-emerald-700/50",
  },
  "psychometric-terms": {
    icon: <Brain className="size-4" />,
    activeColor: "text-violet-700 dark:text-violet-400",
    activeBg: "bg-violet-100/90 dark:bg-violet-900/50",
    activeBorder: "border-violet-200/80 dark:border-violet-700/50",
  },
  "technical-terms": {
    icon: <Wrench className="size-4" />,
    activeColor: "text-blue-700 dark:text-blue-400",
    activeBg: "bg-blue-100/90 dark:bg-blue-900/50",
    activeBorder: "border-blue-200/80 dark:border-blue-700/50",
  },
};

/**
 * Mobile Section Navigation - Modern Segment Control Style
 *
 * Design features:
 * - iOS-style segment control with sliding pill indicator
 * - Category-specific accent colors (emerald/violet/blue)
 * - Smooth animated transitions
 * - Glassmorphism background
 * - Touch-friendly 48px+ targets
 * - IntersectionObserver for scroll tracking
 *
 * UX compliance:
 * - WCAG 2.2 AAA touch targets (48px minimum)
 * - Apple Human Interface Guidelines
 * - Material Design 3 patterns
 */
export function MobileSectionNav({ sections }: MobileSectionNavProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "");
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Update indicator position when active section changes
  const updateIndicator = useCallback(() => {
    const button = buttonRefs.current.get(activeSection);
    const nav = navRef.current;

    if (button && nav) {
      const navRect = nav.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      setIndicatorStyle({
        left: buttonRect.left - navRect.left,
        width: buttonRect.width,
      });
    }
  }, [activeSection]);

  // Track scroll position to highlight active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  // Update indicator on active section change or resize
  useEffect(() => {
    updateIndicator();

    const handleResize = () => updateIndicator();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [updateIndicator]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const activeConfig = Object.hasOwn(sectionConfig, activeSection)
    ? sectionConfig[activeSection as keyof typeof sectionConfig]
    : sectionConfig["domain-terms"];

  return (
    <>
      <nav
        aria-label="Навигация по разделам глоссария"
        className={cn(
          // Container - centered with gap
          "flex items-center justify-center gap-2",
          // Compact sizing
          "h-[56px] px-3 py-1.5",
          // Safe area for iPhone home indicator
          "pb-safe"
        )}
      >
        {/* Segment control container - hugs content */}
        <div
          ref={navRef}
          className={cn(
            // Layout - hug content, don't stretch
            "relative inline-flex items-center gap-0.5",
            // Background - subtle pill shape
            "bg-muted/50 dark:bg-muted/30",
            "rounded-full p-1",
            // Border
            "border border-border/20"
          )}
        >
          {/* Animated sliding indicator */}
          <div
            className={cn(
              "absolute top-1 bottom-1 rounded-full",
              "transition-all duration-300 ease-out",
              // Active category color
              activeConfig.activeBg,
              activeConfig.activeBorder,
              "border"
            )}
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
            aria-hidden="true"
          />

          {/* Section buttons - compact, content-hugging */}
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            const config = sectionConfig[section.id] || sectionConfig["domain-terms"];

            return (
              <button
                key={section.id}
                ref={(el) => {
                  if (el) buttonRefs.current.set(section.id, el);
                }}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  // Layout - hug content
                  "relative inline-flex items-center gap-1.5",
                  // Compact padding, maintain touch target height
                  "h-[40px] px-3",
                  // Rounded pill
                  "rounded-full",
                  // Typography
                  "text-xs font-semibold",
                  // Transitions
                  "transition-colors duration-200",
                  // Interactive states
                  "touch-manipulation select-none",
                  "active:scale-[0.97]",
                  // Z-index to appear above indicator
                  "z-10",
                  // Colors
                  isActive ? config.activeColor : "text-muted-foreground"
                )}
                aria-current={isActive ? "true" : undefined}
              >
                {/* Icon */}
                <span className="shrink-0">{config.icon}</span>

                {/* Label */}
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Menu button - opens docs navigation */}
        <button
          onClick={() => setMenuOpen(true)}
          className={cn(
            // Layout
            "inline-flex items-center justify-center",
            // Size - square, touch-friendly
            "h-[40px] w-[40px]",
            // Rounded
            "rounded-full",
            // Background
            "bg-muted/50 dark:bg-muted/30",
            "border border-border/20",
            // Colors
            "text-muted-foreground",
            // Transitions
            "transition-all duration-200",
            // Hover/active states
            "hover:bg-muted hover:text-foreground",
            "active:scale-[0.95]",
            // Interactive
            "touch-manipulation select-none"
          )}
          aria-label="Открыть меню документации"
        >
          <Menu className="size-4" />
        </button>
      </nav>

      {/* Navigation Sheet */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Навигация по документации</SheetTitle>
            <SheetDescription>
              Выберите раздел документации для просмотра
            </SheetDescription>
          </SheetHeader>
          <DocsNav onLinkClick={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
