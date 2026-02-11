'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Check, X, Loader2, Search, Briefcase, ChevronDown, Star, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/use-debounce';
import { onetApi } from '@/services/api';
import type { ONetJobTitle, ONetProfile } from '@/types/domain';

// ============================================================================
// Types
// ============================================================================

interface ONetSearchComboboxProps {
  /** Currently selected O*NET SOC code */
  value?: string;
  /** Callback when selection changes */
  onChange: (socCode: string | undefined, profile?: ONetProfile) => void;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** CSS class name */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function ONetSearchCombobox({
  value,
  onChange,
  disabled = false,
  placeholder = 'Search job titles...',
  className,
}: ONetSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ONetJobTitle[]>([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState<ONetJobTitle | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [recentSelections, setRecentSelections] = useState<ONetJobTitle[]>([]);

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Load popular job titles on mount
  const [popularJobTitles, setPopularJobTitles] = useState<ONetJobTitle[]>([]);

  useEffect(() => {
    async function loadPopular() {
      try {
        const popular = await onetApi.getPopularJobTitles();
        if (popular && popular.length > 0) {
          setPopularJobTitles(popular);
        }
      } catch {
        // Use empty array as fallback
      }
    }
    loadPopular();
  }, []);

  // Search when query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      return;
    }

    async function search() {
      setIsSearching(true);
      try {
        const results = await onetApi.searchJobTitles(debouncedQuery);
        setSearchResults(results || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }

    search();
  }, [debouncedQuery]);

  // Resolve selected job title from value
  useEffect(() => {
    if (!value) {
      setSelectedJobTitle(null);
      return;
    }

    // Check if we already have this job title
    const found = [...searchResults, ...popularJobTitles, ...recentSelections].find(
      (o) => o.socCode === value
    );
    if (found) {
      setSelectedJobTitle(found);
    }
  }, [value, searchResults, popularJobTitles, recentSelections]);

  // Handle selection
  const handleSelect = useCallback(
    async (jobTitle: ONetJobTitle) => {
      setSelectedJobTitle(jobTitle);
      setOpen(false);
      setSearchQuery('');

      // Add to recent selections
      setRecentSelections((prev) => {
        const filtered = prev.filter((o) => o.socCode !== jobTitle.socCode);
        return [jobTitle, ...filtered].slice(0, 5);
      });

      // Load profile
      setIsLoadingProfile(true);
      try {
        const profile = await onetApi.getProfile(jobTitle.socCode);
        onChange(jobTitle.socCode, profile);
      } catch {
        onChange(jobTitle.socCode, undefined);
      } finally {
        setIsLoadingProfile(false);
      }
    },
    [onChange]
  );

  // Handle clear
  const handleClear = useCallback(() => {
    setSelectedJobTitle(null);
    onChange(undefined, undefined);
  }, [onChange]);

  // Determine what to show
  const hasSearchQuery = searchQuery.trim().length > 0;
  const showResults = hasSearchQuery && searchResults.length > 0;
  const showPopular = !hasSearchQuery;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between h-12 font-normal text-left',
            !selectedJobTitle && 'text-muted-foreground',
            selectedJobTitle && 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30',
            className
          )}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={cn(
                'p-2 rounded-lg shrink-0',
                selectedJobTitle
                  ? 'bg-blue-100 dark:bg-blue-900'
                  : 'bg-muted'
              )}
            >
              <Briefcase
                className={cn(
                  'h-4 w-4',
                  selectedJobTitle ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'
                )}
              />
            </div>
            <div className="min-w-0 flex-1">
              {selectedJobTitle ? (
                <>
                  <p className="text-sm font-medium truncate text-foreground">
                    {selectedJobTitle.title}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {selectedJobTitle.socCode}
                  </p>
                </>
              ) : (
                <span className="text-sm">{placeholder}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isLoadingProfile && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {selectedJobTitle && !isLoadingProfile && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleClear();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    e.preventDefault();
                    handleClear();
                  }
                }}
                className="rounded-full p-1 transition-colors hover:bg-muted cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        sideOffset={4}
      >
        <Command shouldFilter={false} className="rounded-lg">
          {/* Header */}
          <div className="flex items-center gap-2 border-b px-3 py-2.5 bg-blue-50/50 dark:bg-blue-950/30">
            <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold">O*NET Job Titles</span>
          </div>

          {/* Search input */}
          <div className="flex items-center gap-2 border-b px-3 py-1">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <CommandInput
              placeholder="Search by job title..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="h-10 border-0 bg-transparent px-0 text-sm focus-visible:ring-0"
            />
            {isSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>

          {/* Results */}
          <CommandList className="max-h-[300px] overflow-y-auto">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary/60" />
                <span className="text-sm">Searching...</span>
              </div>
            ) : hasSearchQuery && searchResults.length === 0 ? (
              <CommandEmpty className="py-6 text-center">
                <Search className="h-6 w-6 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No job titles found for &quot;{searchQuery}&quot;
                </p>
              </CommandEmpty>
            ) : showResults ? (
              <CommandGroup heading="Search Results" className="px-2 py-1">
                {searchResults.map((jobTitle) => (
                  <JobTitleItem
                    key={jobTitle.socCode}
                    jobTitle={jobTitle}
                    isSelected={value === jobTitle.socCode}
                    onSelect={handleSelect}
                  />
                ))}
              </CommandGroup>
            ) : showPopular ? (
              <>
                {recentSelections.length > 0 && (
                  <CommandGroup
                    heading={
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        Recent
                      </span>
                    }
                    className="px-2 py-1"
                  >
                    {recentSelections.map((jobTitle) => (
                      <JobTitleItem
                        key={jobTitle.socCode}
                        jobTitle={jobTitle}
                        isSelected={value === jobTitle.socCode}
                        onSelect={handleSelect}
                      />
                    ))}
                  </CommandGroup>
                )}
                <CommandGroup
                  heading={
                    <span className="flex items-center gap-1.5">
                      <Star className="h-3 w-3" />
                      Popular Job Titles
                    </span>
                  }
                  className="px-2 py-1"
                >
                  {popularJobTitles.map((jobTitle) => (
                    <JobTitleItem
                      key={jobTitle.socCode}
                      jobTitle={jobTitle}
                      isSelected={value === jobTitle.socCode}
                      onSelect={handleSelect}
                    />
                  ))}
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ============================================================================
// Job Title Item Subcomponent
// ============================================================================

interface JobTitleItemProps {
  jobTitle: ONetJobTitle;
  isSelected: boolean;
  onSelect: (jobTitle: ONetJobTitle) => void;
}

function JobTitleItem({ jobTitle, isSelected, onSelect }: JobTitleItemProps) {
  return (
    <CommandItem
      value={jobTitle.socCode}
      onSelect={() => onSelect(jobTitle)}
      className={cn(
        'flex items-start gap-3 py-2.5 px-2 rounded-md cursor-pointer mb-0.5 transition-all',
        isSelected
          ? 'bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800'
          : 'hover:bg-muted/50 border border-transparent'
      )}
    >
      {/* Checkbox */}
      <div
        className={cn(
          'flex h-4 w-4 items-center justify-center rounded border shrink-0 mt-0.5 transition-colors',
          isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-muted-foreground/30'
        )}
      >
        {isSelected && <Check className="h-3 w-3" />}
      </div>

      {/* Content */}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-medium truncate">{jobTitle.title}</span>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="secondary" className="h-4 px-1.5 text-[9px] font-mono">
            {jobTitle.socCode}
          </Badge>
        </div>
        {jobTitle.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {jobTitle.description}
          </p>
        )}
      </div>
    </CommandItem>
  );
}

export default ONetSearchCombobox;
