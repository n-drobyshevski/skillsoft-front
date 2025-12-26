"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Clock, TrendingUp, Keyboard } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  glossarySections,
  type GlossaryTerm,
  type GlossaryCategory,
} from "./glossary-data";

// Popular terms (could be driven by analytics)
const POPULAR_TERMS = [
  "Компетенция",
  "Индекс дискриминации",
  "Job Fit",
  "Альфа Кронбаха",
];

// Category colors for badges
const categoryBadgeColors: Record<GlossaryCategory, string> = {
  domain:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  psychometric:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  technical:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
};

const categoryLabels: Record<GlossaryCategory, string> = {
  domain: "Предметная",
  psychometric: "Психометрия",
  technical: "Техническая",
};

interface IndexedTerm extends GlossaryTerm {
  category: GlossaryCategory;
  sectionId: string;
}

interface GlossarySearchProps {
  onSelectTerm: (termId: string, sectionId: string) => void;
}

export function GlossarySearch({ onSelectTerm }: GlossarySearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Index all terms with their category
  const indexedTerms = useMemo(() => {
    return glossarySections.flatMap((section) =>
      section.terms.map((term) => ({
        ...term,
        category: section.category,
        sectionId: section.id,
      }))
    );
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("glossary-recent-searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Filter terms based on query
  const filteredTerms = useMemo(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase().trim();
    return indexedTerms.filter(
      (term) =>
        term.term.toLowerCase().includes(lowerQuery) ||
        term.termEn?.toLowerCase().includes(lowerQuery) ||
        term.definition.toLowerCase().includes(lowerQuery)
    );
  }, [query, indexedTerms]);

  // Save to recent searches
  const saveRecentSearch = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setRecentSearches((prev) => {
      const updated = [searchTerm, ...prev.filter((s) => s !== searchTerm)].slice(
        0,
        5
      );
      try {
        localStorage.setItem("glossary-recent-searches", JSON.stringify(updated));
      } catch {
        // Ignore localStorage errors
      }
      return updated;
    });
  }, []);

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      // Also support "/" for quick search
      if (
        e.key === "/" &&
        !open &&
        document.activeElement?.tagName !== "INPUT"
      ) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

  const handleSelect = useCallback(
    (termId: string, sectionId: string, termName: string) => {
      saveRecentSearch(termName);
      onSelectTerm(termId, sectionId);
      setOpen(false);
      setQuery("");
    },
    [saveRecentSearch, onSelectTerm]
  );

  const hasResults = filteredTerms.length > 0;
  const isEmpty = query.length > 0 && filteredTerms.length === 0;

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 w-full",
          "px-3 py-2.5 rounded-lg",
          "bg-muted/50 border border-border/50",
          "text-sm text-muted-foreground",
          "hover:bg-muted hover:border-border",
          "transition-colors duration-200",
          "touch-manipulation"
        )}
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Поиск терминов...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono rounded bg-background border border-border">
          <span className="text-xs">Ctrl</span>
          <span>K</span>
        </kbd>
      </button>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Введите термин для поиска..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[400px]">
          {/* Empty state */}
          {isEmpty && (
            <CommandEmpty className="py-6 text-center">
              <p className="text-muted-foreground mb-2">Термин не найден</p>
              <p className="text-xs text-muted-foreground/70">
                Попробуйте изменить запрос
              </p>
            </CommandEmpty>
          )}

          {/* Search Results */}
          {hasResults && (
            <CommandGroup heading={`Найдено: ${filteredTerms.length}`}>
              {filteredTerms.slice(0, 10).map((term) => (
                <CommandItem
                  key={term.id}
                  value={term.id}
                  onSelect={() =>
                    handleSelect(term.id, term.sectionId, term.term)
                  }
                  className="flex items-start gap-3 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{term.term}</span>
                      {term.termEn && (
                        <span className="text-xs text-muted-foreground truncate">
                          ({term.termEn})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {term.definition}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] shrink-0",
                      categoryBadgeColors[term.category]
                    )}
                  >
                    {categoryLabels[term.category]}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Recent Searches (when no query) */}
          {!query && recentSearches.length > 0 && (
            <>
              <CommandGroup heading="Недавние">
                {recentSearches.map((search) => (
                  <CommandItem
                    key={search}
                    value={`recent-${search}`}
                    onSelect={() => setQuery(search)}
                    className="flex items-center gap-2"
                  >
                    <Clock className="size-4 text-muted-foreground" />
                    <span>{search}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Popular Terms (when no query) */}
          {!query && (
            <CommandGroup heading="Популярные термины">
              {POPULAR_TERMS.map((termName) => {
                const term = indexedTerms.find((t) => t.term === termName);
                if (!term) return null;
                return (
                  <CommandItem
                    key={term.id}
                    value={`popular-${term.id}`}
                    onSelect={() =>
                      handleSelect(term.id, term.sectionId, term.term)
                    }
                    className="flex items-center gap-2"
                  >
                    <TrendingUp className="size-4 text-muted-foreground" />
                    <span>{term.term}</span>
                    {term.termEn && (
                      <span className="text-xs text-muted-foreground">
                        ({term.termEn})
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>

        {/* Keyboard Navigation Hints */}
        <div className="hidden sm:flex items-center justify-between px-3 py-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">
                Enter
              </kbd>
              <span>выбрать</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">
                Esc
              </kbd>
              <span>закрыть</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Keyboard className="size-3" />
            <span>навигация стрелками</span>
          </div>
        </div>
      </CommandDialog>
    </>
  );
}
