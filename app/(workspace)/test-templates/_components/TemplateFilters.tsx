'use client';
/* eslint-disable security/detect-object-injection -- Safe: accessing typed Record with enum keys */

import React, { useState, useRef, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
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
 * Goal filter configuration with translation keys
 */
type GoalFilterConfig = Record<GoalFilter, {
  labelKey: string;
  shortLabelKey: string;
}>;

const goalFilterConfig: GoalFilterConfig = {
  ALL: {
    labelKey: 'filters.all',
    shortLabelKey: 'filters.all',
  },
  [AssessmentGoal.OVERVIEW]: {
    labelKey: 'filters.overview',
    shortLabelKey: 'filters.overview',
  },
  [AssessmentGoal.JOB_FIT]: {
    labelKey: 'filters.jobFit',
    shortLabelKey: 'filters.forJob',
  },
  [AssessmentGoal.TEAM_FIT]: {
    labelKey: 'filters.teamFit',
    shortLabelKey: 'filters.forTeam',
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

  const t = useTranslations('template');

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
  const goalCounts: Record<GoalFilter, number> = {
    ALL: templates.length,
    [AssessmentGoal.OVERVIEW]: 0,
    [AssessmentGoal.JOB_FIT]: 0,
    [AssessmentGoal.TEAM_FIT]: 0,
  };

  templates.forEach(template => {
    if (template.goal) {
      goalCounts[template.goal]++;
    }
  });

  // Filter templates based on search and goal
  let filteredTemplates = templates;

  // Filter by goal
  if (activeTab !== 'ALL') {
    filteredTemplates = filteredTemplates.filter(t => t.goal === activeTab);
  }

  // Filter by search query (name and description)
  if (debouncedSearch.trim()) {
    const query = debouncedSearch.toLowerCase();
    filteredTemplates = filteredTemplates.filter(t =>
      t.name.toLowerCase().includes(query) ||
      (t.description?.toLowerCase().includes(query))
    );
  }

  // Notify parent of filtered results - use ref to avoid dependency on callback
  useEffect(() => {
    onFilteredTemplatesChangeRef.current(filteredTemplates);
  }, [filteredTemplates]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Handle tab change - instant UI update, background URL sync
  const handleTabChange = (value: string) => {
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
  };

  // Prefetch tab routes on hover/focus for faster navigation
  const handleTabHover = (tabValue: GoalFilter) => {
    if (tabValue === activeTab) return; // Skip current tab

    const params = new URLSearchParams(searchParams.toString());
    if (tabValue === 'ALL') {
      params.delete('goal');
    } else {
      params.set('goal', tabValue);
    }
    const queryString = params.toString();
    router.prefetch(`${pathname}${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none shrink-0" aria-hidden="true" />
          <Input
            type="text"
            placeholder={t('filters.searchPlaceholder')}
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9 pr-8 min-h-[44px] sm:min-h-0 sm:h-9 text-sm"
            aria-label={t('filters.searchPlaceholder')}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={handleClearSearch}
              aria-label={t('filters.clearSearch')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Results Count - Desktop */}
        <span className="hidden sm:block text-xs text-muted-foreground whitespace-nowrap">
          {t('filters.xOfY', { shown: filteredTemplates.length, total: templates.length })}
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
                    'min-h-[44px] sm:min-h-[36px]',
                    'data-[state=active]:bg-background data-[state=active]:shadow-sm',
                    'text-xs sm:text-sm font-medium transition-all whitespace-nowrap rounded-md touch-manipulation',
                    isPending && 'opacity-70'
                  )}
                >
                  <span className="hidden sm:inline">{t(config.labelKey)}</span>
                  <span className="sm:hidden">{t(config.shortLabelKey)}</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'min-w-5 sm:min-w-6 h-5 justify-center text-xs-safe sm:text-xs px-1 sm:px-1.5 rounded-sm tabular-nums',
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
        {t('filters.showingOf', { shown: filteredTemplates.length, total: templates.length })}
      </div>
    </div>
  );
}
