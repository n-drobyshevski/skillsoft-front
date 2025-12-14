'use client';
/* eslint-disable security/detect-object-injection -- Safe: accessing typed Record with enum keys */

import React, { useState, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TestTemplateSummary, AssessmentGoal } from "@/types/domain";
import {
  Search,
  Filter,
  X,
  Crosshair,
  Briefcase,
  Users,
  LayoutGrid,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export type GoalFilter = 'ALL' | AssessmentGoal;

interface TemplateFiltersProps {
  templates: TestTemplateSummary[];
  onFilteredTemplatesChange: (filtered: TestTemplateSummary[]) => void;
  className?: string;
}

/**
 * Goal filter configuration with icons and colors
 */
const goalFilterConfig: Record<GoalFilter, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = {
  ALL: {
    label: 'All',
    icon: LayoutGrid,
    color: 'text-foreground',
  },
  [AssessmentGoal.OVERVIEW]: {
    label: 'Overview',
    icon: Crosshair,
    color: 'text-emerald-600',
  },
  [AssessmentGoal.JOB_FIT]: {
    label: 'Job Fit',
    icon: Briefcase,
    color: 'text-blue-600',
  },
  [AssessmentGoal.TEAM_FIT]: {
    label: 'Team Fit',
    icon: Users,
    color: 'text-violet-600',
  },
};

/**
 * TemplateFilters - Search and filter interface for test templates
 *
 * Features:
 * - Debounced search input (300ms)
 * - Goal-based tab filtering
 * - Results count display
 * - Mobile-responsive collapsible filters
 */
export default function TemplateFilters({
  templates,
  onFilteredTemplatesChange,
  className = '',
}: TemplateFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<GoalFilter>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
    if (selectedGoal !== 'ALL') {
      result = result.filter(t => t.goal === selectedGoal);
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
  }, [templates, selectedGoal, debouncedSearch]);

  // Notify parent of filtered results
  React.useEffect(() => {
    onFilteredTemplatesChange(filteredTemplates);
  }, [filteredTemplates, onFilteredTemplatesChange]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleGoalChange = useCallback((value: string) => {
    setSelectedGoal(value as GoalFilter);
  }, []);

  const hasActiveFilters = searchQuery.trim() || selectedGoal !== 'ALL';

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Desktop Filters - Always visible on larger screens */}
      <div className="hidden sm:flex sm:flex-col sm:gap-3">
        {/* Search and Results Row */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9 pr-9"
              aria-label="Search templates"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-muted"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground whitespace-nowrap" role="status" aria-live="polite">
            <span className="font-medium text-foreground">{filteredTemplates.length}</span>
            {' '}of{' '}
            <span>{templates.length}</span>
            {' '}templates
          </div>
        </div>

        {/* Goal Filter Tabs */}
        <Tabs value={selectedGoal} onValueChange={handleGoalChange} className="w-full">
          <TabsList className="w-full justify-start h-10 p-1" aria-label="Filter by assessment goal">
            {(Object.keys(goalFilterConfig) as GoalFilter[]).map((goal) => {
               
              const config = goalFilterConfig[goal];
              const Icon = config.icon;
              const count = goalCounts[goal];

              return (
                <TabsTrigger
                  key={goal}
                  value={goal}
                  className="gap-2 data-[state=active]:shadow-sm px-3"
                  aria-label={`${config.label} (${count} templates)`}
                >
                  <Icon className={`h-4 w-4 ${selectedGoal === goal ? config.color : ''}`} />
                  <span className="hidden md:inline">{config.label}</span>
                  <Badge
                    variant="secondary"
                    className="h-5 min-w-5 px-1.5 text-xs font-medium bg-muted-foreground/10"
                  >
                    {count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Mobile Filters - Collapsible on small screens */}
      <div className="sm:hidden">
        <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <div className="flex items-center gap-2">
            {/* Mobile Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-9 pr-9 h-10"
                aria-label="Search templates"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <CollapsibleTrigger asChild>
              <Button
                variant={hasActiveFilters ? "default" : "outline"}
                size="icon"
                className="h-10 w-10 shrink-0"
                aria-expanded={isFilterOpen}
                aria-label="Toggle filters"
              >
                <Filter className="h-4 w-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="mt-3 space-y-3">
            {/* Results Count - Mobile */}
            <div className="text-sm text-muted-foreground px-1" role="status" aria-live="polite">
              Showing <span className="font-medium text-foreground">{filteredTemplates.length}</span>
              {' '}of {templates.length} templates
            </div>

            {/* Goal Filter Buttons - Mobile Grid */}
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Filter by assessment goal">
              {(Object.keys(goalFilterConfig) as GoalFilter[]).map((goal) => {
                 
              const config = goalFilterConfig[goal];
                const Icon = config.icon;
                const count = goalCounts[goal];
                const isActive = selectedGoal === goal;

                return (
                  <Button
                    key={goal}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="h-11 justify-start gap-2 text-sm"
                    onClick={() => handleGoalChange(goal)}
                    aria-pressed={isActive}
                    aria-label={`${config.label} (${count} templates)`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? '' : config.color}`} />
                    <span className="flex-1 text-left">{config.label}</span>
                    <Badge
                      variant={isActive ? "secondary" : "outline"}
                      className="h-5 min-w-5 px-1.5 text-xs"
                    >
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGoal('ALL');
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Clear all filters
              </Button>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
