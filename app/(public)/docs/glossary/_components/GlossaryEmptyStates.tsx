"use client";

import { useTranslations } from "next-intl";
import { Search, RefreshCw, BookOpen, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type { GlossaryCategory } from "./glossary-data";

// ============================================
// Loading Skeleton
// ============================================

interface GlossaryTermSkeletonProps {
  count?: number;
  category?: GlossaryCategory;
}

const categorySkeletonColors: Record<GlossaryCategory, string> = {
  domain: "bg-emerald-200/50 dark:bg-emerald-800/30",
  psychometric: "bg-violet-200/50 dark:bg-violet-800/30",
  technical: "bg-blue-200/50 dark:bg-blue-800/30",
};

export function GlossaryTermSkeleton({
  count = 3,
  category = "domain",
}: GlossaryTermSkeletonProps) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-3 py-4 px-2",
            "border-b border-border/40 last:border-b-0",
            "animate-pulse"
          )}
          style={{ animationDelay: `${i * 75}ms` }}
        >
          {/* Category indicator */}
          <div
            className={cn(
              "w-1 h-10 rounded-full shrink-0",
              categorySkeletonColors[category as keyof typeof categorySkeletonColors]
            )}
          />

          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-[180px]" />
            <Skeleton className="h-3 w-[120px]" />
          </div>

          <Skeleton className="h-4 w-4 rounded-sm shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function GlossarySectionSkeleton({
  category = "domain",
}: {
  category?: GlossaryCategory;
}) {
  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-3 pb-3 border-b border-border/30">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-5 w-8 rounded-full ml-auto" />
      </div>

      {/* Terms */}
      <GlossaryTermSkeleton count={4} category={category} />
    </div>
  );
}

export function GlossaryPageSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <GlossarySectionSkeleton category="domain" />
      <GlossarySectionSkeleton category="psychometric" />
      <GlossarySectionSkeleton category="technical" />
    </div>
  );
}

// ============================================
// No Search Results
// ============================================

interface NoSearchResultsProps {
  query: string;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  onClearSearch?: () => void;
}

export function NoSearchResults({
  query,
  suggestions = [],
  onSuggestionClick,
  onClearSearch,
}: NoSearchResultsProps) {
  const t = useTranslations("feedback");
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        "py-12 px-4 text-center",
        "animate-in fade-in-50 duration-300"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-16 h-16 rounded-full mb-4",
          "bg-muted/50 flex items-center justify-center"
        )}
      >
        <Search className="size-8 text-muted-foreground/50" />
      </div>

      {/* Message */}
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {t("nothingFound")}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">
        {t("noTermsFound", { query })}
      </p>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground/70 mb-2">
            {t("maybeMeant")}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onSuggestionClick?.(suggestion)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full",
                  "bg-primary/10 text-primary",
                  "hover:bg-primary/20 transition-colors",
                  "touch-manipulation active:scale-95"
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear button */}
      {onClearSearch && (
        <Button variant="outline" size="sm" onClick={onClearSearch}>
          <RefreshCw className="size-4 mr-2" />
          {t("resetSearch")}
        </Button>
      )}
    </div>
  );
}

// ============================================
// Empty Category
// ============================================

interface EmptyCategoryProps {
  categoryName: string;
}

export function EmptyCategory({ categoryName }: EmptyCategoryProps) {
  const t = useTranslations("feedback");
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        "py-8 px-4 text-center",
        "border border-dashed border-border/50 rounded-lg",
        "bg-muted/20"
      )}
    >
      <BookOpen className="size-8 text-muted-foreground/40 mb-3" />
      <p className="text-sm text-muted-foreground">
        {t("noCategoryTerms", { category: categoryName })}
      </p>
    </div>
  );
}

// ============================================
// Error State
// ============================================

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function GlossaryErrorState({
  title,
  message,
  onRetry,
}: ErrorStateProps) {
  const t = useTranslations("feedback");
  const tCommon = useTranslations("common");

  const displayTitle = title ?? t("loadingError");
  const displayMessage = message ?? t("couldNotLoad");

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        "py-12 px-4 text-center",
        "animate-in fade-in-50 duration-300"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-16 h-16 rounded-full mb-4",
          "bg-destructive/10 flex items-center justify-center"
        )}
      >
        <AlertCircle className="size-8 text-destructive/70" />
      </div>

      {/* Message */}
      <h3 className="text-lg font-semibold text-foreground mb-1">{displayTitle}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{displayMessage}</p>

      {/* Retry button */}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="size-4 mr-2" />
          {tCommon("retry")}
        </Button>
      )}
    </div>
  );
}
