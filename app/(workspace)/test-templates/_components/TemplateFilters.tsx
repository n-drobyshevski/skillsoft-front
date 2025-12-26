'use client';
/* eslint-disable security/detect-object-injection -- Safe: accessing typed Record with enum keys */

import React, { useState, useCallback, useMemo, useRef, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TestTemplateSummary, AssessmentGoal } from "@/types/domain";
import {
  Search,
  X,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

export type GoalFilter = 'ALL' | AssessmentGoal;

// Valid tab values for URL state
const VALID_TABS: GoalFilter[] = ['ALL', AssessmentGoal.OVERVIEW, AssessmentGoal.JOB_FIT, AssessmentGoal.TEAM_FIT];

interface TemplateFiltersProps {
  templates: TestTemplateSummary[];
  onFilteredTemplatesChange: (filtered: TestTemplateSummary[]) => void;
  className?: string;
  initialTab?: GoalFilter;
}

/**
 * Goal filter configuration with labels
 */
const goalFilterConfig: Record<GoalFilter, {
  label: string;
  shortLabel: string;
}> = {
  ALL: {
    label: 'Все',
    shortLabel: 'Все',
  },
  [AssessmentGoal.OVERVIEW]: {
    label: 'Обзор',
    shortLabel: 'Обзор',
  },
  [AssessmentGoal.JOB_FIT]: {
    label: 'Для работы',
    shortLabel: 'Работа',
  },
  [AssessmentGoal.TEAM_FIT]: {
    label: 'Для команды',
    shortLabel: 'Команда',
  },
};

/**
 * TemplateFilters - Search and filter interface for test templates
 *
 * Mobile-first design with:
 * - Clean search input
 * - Horizontal scrolling tabs (matching my-tests pattern)
 * - URL-based tab state for bookmarkable/shareable links
 * - Optimistic tab switching with prefetch on hover
 */
export default function TemplateFilters({
  templates,
  onFilteredTemplatesChange,
  className = '',
  initialTab = 'ALL',
}: TemplateFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState('');

  // URL-based tab state with optimistic updates
  const urlTab = searchParams.get('goal') as GoalFilter | null;
  const [optimisticTab, setOptimisticTab] = useState<GoalFilter>(
    urlTab && VALID_TABS.includes(urlTab) ? urlTab : initialTab
  );
  const activeTab = optimisticTab;

  // Use ref to store callback to avoid infinite loop
  const onFilteredTemplatesChangeRef = useRef(onFilteredTemplatesChange);
  useEffect(() => {
    onFilteredTemplatesChangeRef.current = onFilteredTemplatesChange;
  }, [onFilteredTemplatesChange]);

  // Debounce search query for performance
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Calculate goal counts for badge display
  const goalCounts = useMemo(() => {
    const counts: Record<GoalFilter, number> = {
      ALL: templates.length,
      [AssessmentGoal.OVERVIEW]: 0,
      [AssessmentGoal.JOB_FIT]: 0,
      [AssessmentGoal.TEAM_FIT]: 0,
    };

    templates.forEach(template => {
      if (template.goal) {
        counts[template.goal]++;
      }
    });

    return counts;
  }, [templates]);

  // Filter templates based on search and goal
  const filteredTemplates = useMemo(() => {
    let result = templates;

    // Filter by goal
    if (activeTab !== 'ALL') {
      result = result.filter(t => t.goal === activeTab);
    }

    // Filter by search query (name and description)
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(query) ||
        (t.description?.toLowerCase().includes(query))
      );
    }

    return result;
  }, [templates, activeTab, debouncedSearch]);

  // Notify parent of filtered results - use ref to avoid dependency on callback
  useEffect(() => {
    onFilteredTemplatesChangeRef.current(filteredTemplates);
  }, [filteredTemplates]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Handle tab change - instant UI update, background URL sync
  const handleTabChange = useCallback(
    (value: string) => {
      const newTab = value as GoalFilter;

      // Immediate UI update (optimistic)
      setOptimisticTab(newTab);

      // Background URL sync using transition (non-blocking)
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (newTab === 'ALL') {
          params.delete('goal'); // Clean URL for default tab
        } else {
          params.set('goal', newTab);
        }
        const queryString = params.toString();
        router.push(`${pathname}${queryString ? `?${queryString}` : ''}`, {
          scroll: false,
        });
      });
    },
    [router, pathname, searchParams]
  );

  // Prefetch tab routes on hover/focus for faster navigation
  const handleTabHover = useCallback(
    (tabValue: GoalFilter) => {
      if (tabValue === activeTab) return; // Skip current tab

      const params = new URLSearchParams(searchParams.toString());
      if (tabValue === 'ALL') {
        params.delete('goal');
      } else {
        params.set('goal', tabValue);
      }
      const queryString = params.toString();
      router.prefetch(`${pathname}${queryString ? `?${queryString}` : ''}`);
    },
    [router, pathname, searchParams, activeTab]
  );

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Поиск шаблонов..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9 pr-8 h-9 text-sm"
            aria-label="Поиск шаблонов"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={handleClearSearch}
              aria-label="Очистить поиск"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Results Count - Desktop */}
        <span className="hidden sm:block text-xs text-muted-foreground whitespace-nowrap">
          {filteredTemplates.length} из {templates.length}
        </span>
      </div>

      {/* Tabs with URL-synced state - matching my-tests pattern */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <ScrollArea className="w-full">
          <TabsList className="inline-flex w-max h-11 sm:h-10 p-1 bg-muted/50 rounded-lg gap-1">
            {VALID_TABS.map((tab) => {
              const config = goalFilterConfig[tab];
              const count = goalCounts[tab];

              return (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  disabled={isPending}
                  onMouseEnter={() => handleTabHover(tab)}
                  onFocus={() => handleTabHover(tab)}
                  className={cn(
                    'inline-flex flex-none items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-1.5',
                    'min-h-[40px] sm:min-h-[36px]',
                    'data-[state=active]:bg-background data-[state=active]:shadow-sm',
                    'text-xs sm:text-sm font-medium transition-all whitespace-nowrap rounded-md',
                    isPending && 'opacity-70'
                  )}
                >
                  <span className="hidden sm:inline">{config.label}</span>
                  <span className="sm:hidden">{config.shortLabel}</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'min-w-5 sm:min-w-6 h-5 justify-center text-[11px] sm:text-xs px-1 sm:px-1.5 rounded-sm',
                      activeTab === tab && 'bg-primary text-primary-foreground'
                    )}
                  >
                    {count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </Tabs>

      {/* Results Count - Mobile */}
      <div className="sm:hidden text-xs text-muted-foreground">
        Показано {filteredTemplates.length} из {templates.length}
      </div>
    </div>
  );
}
