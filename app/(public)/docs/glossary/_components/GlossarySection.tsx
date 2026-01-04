"use client";

import { BookOpen, Brain, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";

import { GlossaryTermCard } from "./GlossaryTermCard";
import type { GlossaryTerm, GlossaryCategory } from "./glossary-data";

/**
 * Category visual configuration
 * Matches accent colors from GlossaryTermCard
 */
const categoryConfig: Record<
  GlossaryCategory,
  {
    iconBg: string;
    iconColor: string;
    countBg: string;
    countText: string;
    accentLine: string;
  }
> = {
  domain: {
    iconBg: "bg-emerald-100/80 dark:bg-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    countBg: "bg-emerald-100/60 dark:bg-emerald-900/30",
    countText: "text-emerald-700 dark:text-emerald-400",
    accentLine: "bg-gradient-to-r from-emerald-500/60 to-emerald-500/0",
  },
  psychometric: {
    iconBg: "bg-violet-100/80 dark:bg-violet-900/40",
    iconColor: "text-violet-600 dark:text-violet-400",
    countBg: "bg-violet-100/60 dark:bg-violet-900/30",
    countText: "text-violet-700 dark:text-violet-400",
    accentLine: "bg-gradient-to-r from-violet-500/60 to-violet-500/0",
  },
  technical: {
    iconBg: "bg-blue-100/80 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    countBg: "bg-blue-100/60 dark:bg-blue-900/30",
    countText: "text-blue-700 dark:text-blue-400",
    accentLine: "bg-gradient-to-r from-blue-500/60 to-blue-500/0",
  },
};

// Category icons with proper sizing
const categoryIcons: Record<GlossaryCategory, React.ReactNode> = {
  domain: <BookOpen className="size-4" />,
  psychometric: <Brain className="size-4" />,
  technical: <Wrench className="size-4" />,
};

interface GlossarySectionProps {
  id: string;
  title: string;
  terms: GlossaryTerm[];
  category: GlossaryCategory;
}

/**
 * GlossarySection - Clean section wrapper with minimal header
 *
 * Design features:
 * - Minimal, modern header design
 * - Category-specific accent colors
 * - Gradient accent line for visual hierarchy
 * - Responsive spacing and typography
 * - Smooth animations
 */
export function GlossarySection({
  id,
  title,
  terms,
  category,
}: GlossarySectionProps) {
  const config = categoryConfig[category as keyof typeof categoryConfig];
  const icon = categoryIcons[category as keyof typeof categoryIcons];

  return (
    <section
      id={id}
      className={cn(
        // Scroll margin for sticky header
        "scroll-mt-20",
        // Section styling
        "pb-8 last:pb-0",
        // Animation
        "animate-fade-in-up"
      )}
    >
      {/* Section Header - Clean minimal design */}
      <div className="mb-5">
        <div className="flex items-center gap-3">
          {/* Icon with subtle background */}
          <div
            className={cn(
              "w-9 h-9 rounded-lg shrink-0",
              "flex items-center justify-center",
              config.iconBg
            )}
          >
            <span className={cn("block", config.iconColor)}>{icon}</span>
          </div>

          {/* Title and count */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h2
                className={cn(
                  "text-lg sm:text-xl font-bold tracking-tight",
                  "text-foreground"
                )}
              >
                {title}
              </h2>

              {/* Term count pill */}
              <span
                className={cn(
                  "inline-flex items-center justify-center",
                  "text-xs font-semibold tabular-nums",
                  "px-2 py-0.5 rounded-full",
                  config.countBg,
                  config.countText
                )}
              >
                {terms.length}
              </span>
            </div>
          </div>
        </div>

        {/* Accent gradient line */}
        <div
          className={cn("h-0.5 mt-3 rounded-full", config.accentLine)}
          aria-hidden="true"
        />
      </div>

      {/* Terms list */}
      <GlossaryTermCard terms={terms} category={category} />
    </section>
  );
}
