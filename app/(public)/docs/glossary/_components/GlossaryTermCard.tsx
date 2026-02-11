"use client";

import { useState } from "react";
import { ChevronDown, Lightbulb, ArrowRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

import type { GlossaryTerm, GlossaryCategory } from "./glossary-data";
import { TermActions } from "./TermActions";

interface GlossaryTermCardProps {
  terms: GlossaryTerm[];
  category: GlossaryCategory;
  defaultExpanded?: string[];
}

/**
 * Category-specific accent configuration
 * Uses oklch colors matching the app's design system
 */
const categoryAccents: Record<
  GlossaryCategory,
  {
    bg: string;
    bgHover: string;
    border: string;
    accent: string;
    accentBg: string;
    icon: string;
    ring: string;
  }
> = {
  domain: {
    bg: "bg-emerald-50/50 dark:bg-emerald-950/20",
    bgHover: "hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30",
    border: "border-emerald-200/60 dark:border-emerald-800/40",
    accent: "text-emerald-700 dark:text-emerald-400",
    accentBg: "bg-emerald-100/80 dark:bg-emerald-900/40",
    icon: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/20",
  },
  psychometric: {
    bg: "bg-violet-50/50 dark:bg-violet-950/20",
    bgHover: "hover:bg-violet-50/80 dark:hover:bg-violet-950/30",
    border: "border-violet-200/60 dark:border-violet-800/40",
    accent: "text-violet-700 dark:text-violet-400",
    accentBg: "bg-violet-100/80 dark:bg-violet-900/40",
    icon: "text-violet-600 dark:text-violet-400",
    ring: "ring-violet-500/20",
  },
  technical: {
    bg: "bg-blue-50/50 dark:bg-blue-950/20",
    bgHover: "hover:bg-blue-50/80 dark:hover:bg-blue-950/30",
    border: "border-blue-200/60 dark:border-blue-800/40",
    accent: "text-blue-700 dark:text-blue-400",
    accentBg: "bg-blue-100/80 dark:bg-blue-900/40",
    icon: "text-blue-600 dark:text-blue-400",
    ring: "ring-blue-500/20",
  },
};

/**
 * GlossaryTermCard - Modern card-based glossary terms
 *
 * Design features:
 * - Category-specific accent colors (emerald/violet/blue)
 * - Subtle glassmorphism with soft shadows
 * - Smooth spring-based animations
 * - 52px+ touch targets for accessibility
 * - Visual hierarchy with typography scale
 * - Interactive hover/focus states
 */
export function GlossaryTermCard({
  terms,
  category,
  defaultExpanded = [],
}: GlossaryTermCardProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(defaultExpanded)
  );

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const scrollToTerm = (termId: string) => {
    const element = document.querySelector(`[data-term-id="${termId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      // Expand the term
      setExpanded((prev) => new Set([...prev, termId]));
    }
  };

  const accent = categoryAccents[category as keyof typeof categoryAccents];

  return (
    <div className="space-y-3">
      {terms.map((item, index) => {
        const isExpanded = expanded.has(item.id);

        return (
          <article
            key={item.id}
            data-term-id={item.id}
            className={cn(
              // Modern card styling
              "group relative rounded-xl border transition-all duration-300",
              // Stagger animation
              "glossary-term-stagger animate-fade-in-up",
              // Base colors
              "bg-card/80 backdrop-blur-sm",
              accent.border,
              // Hover state
              "hover:shadow-modern hover:border-opacity-100",
              accent.bgHover,
              // Expanded state
              isExpanded && [accent.bg, "shadow-soft", accent.ring, "ring-1"]
            )}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            {/* Card Header / Trigger */}
            <button
              onClick={() => toggleExpanded(item.id)}
              className={cn(
                // Layout
                "w-full flex items-center gap-3 p-4 sm:p-5",
                // Touch-friendly sizing
                "min-h-[60px]",
                // Focus states
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                accent.ring,
                // Cursor
                "cursor-pointer",
                // Rounded corners
                "rounded-xl"
              )}
              aria-expanded={isExpanded}
              aria-controls={`term-content-${item.id}`}
            >
              {/* Category indicator dot */}
              <div
                className={cn(
                  "w-2 h-2 rounded-full shrink-0 transition-transform duration-300",
                  accent.accent.replace("text-", "bg-"),
                  isExpanded && "scale-125"
                )}
                aria-hidden="true"
              />

              {/* Term info */}
              <div className="flex-1 text-left min-w-0">
                <h3
                  className={cn(
                    "font-semibold text-[15px] sm:text-base leading-snug",
                    "text-foreground transition-colors duration-200",
                    isExpanded && accent.accent
                  )}
                >
                  {item.term}
                </h3>
                {item.termEn && (
                  <p className="text-xs text-muted-foreground/70 mt-0.5 font-normal">
                    {item.termEn}
                  </p>
                )}
              </div>

              {/* Expand indicator */}
              <ChevronDown
                className={cn(
                  "w-5 h-5 shrink-0 text-muted-foreground/60",
                  "transition-transform duration-300 ease-out",
                  isExpanded && "rotate-180",
                  "group-hover:text-muted-foreground"
                )}
                aria-hidden="true"
              />
            </button>

            {/* Expandable Content */}
            <div
              id={`term-content-${item.id}`}
              className={cn(
                "grid transition-all duration-300 ease-out",
                isExpanded
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              )}
              aria-hidden={!isExpanded}
            >
              <div className="overflow-hidden">
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 space-y-4">
                  {/* Divider */}
                  <div
                    className={cn("h-px -mx-4 sm:-mx-5", accent.border)}
                    aria-hidden="true"
                  />

                  {/* Actions row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Определение</span>
                    </div>
                    <TermActions
                      termId={item.id}
                      termName={item.term}
                      termDefinition={item.definition}
                    />
                  </div>

                  {/* Definition */}
                  <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed">
                    {item.definition}
                  </p>

                  {/* Example box */}
                  {item.example && (
                    <div
                      className={cn(
                        "relative flex gap-3 p-3.5 rounded-lg",
                        "border",
                        accent.border,
                        accent.accentBg,
                        // Subtle inner shadow
                        "shadow-inner shadow-black/[0.02] dark:shadow-white/[0.02]"
                      )}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                          "bg-white/60 dark:bg-black/20",
                          accent.icon
                        )}
                      >
                        <Lightbulb className="w-4 h-4" aria-hidden="true" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <span
                          className={cn(
                            "block text-[11px] font-semibold uppercase tracking-wider mb-1",
                            accent.accent
                          )}
                        >
                          Пример
                        </span>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.example}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Related terms */}
                  {item.relatedTerms && item.relatedTerms.length > 0 && (
                    <div className="pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" aria-hidden="true" />
                          Связано с:
                        </span>
                        {item.relatedTerms.map((related) => (
                          <button
                            key={related}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Find the term id from its name
                              const termId = related
                                .toLowerCase()
                                .replace(/\s+/g, "-")
                                .replace(/[^a-z0-9-]/g, "");
                              scrollToTerm(termId);
                            }}
                            className={cn(
                              // Base styling
                              "inline-flex items-center gap-1",
                              "text-xs font-medium px-2.5 py-1.5 rounded-full",
                              // Colors
                              accent.accentBg,
                              accent.accent,
                              // Border
                              "border",
                              accent.border,
                              // Hover state
                              "hover:shadow-sm transition-all duration-200",
                              "hover:scale-[1.02] active:scale-[0.98]",
                              // Touch-friendly
                              "min-h-[32px]",
                              "touch-manipulation"
                            )}
                          >
                            <span>{related}</span>
                            <ArrowRight
                              className="w-3 h-3 opacity-60"
                              aria-hidden="true"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
