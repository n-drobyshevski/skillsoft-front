'use client';

/**
 * Standards Search Combobox
 * 
 * A structured search interface for O*NET and ESCO standards.
 * 
 * Features:
 * - Separate search fields for O*NET and ESCO (clear visual hierarchy)
 * - O*NET as primary standard with Big Five auto-detection
 * - ESCO as secondary/optional European standard
 * - Web Worker-based fuzzy search
 * - Clean chip-based display
 */

import * as React from 'react';
import { Check, X, Loader2, Search, Globe, Briefcase, Shield, Zap, Sparkles, ChevronDown, Filter } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkerSearch } from '@/hooks/use-worker-search';
import type { StandardCodesDto, OnetRefDto, EscoRefDto, BigFiveDimension } from '@/types/domain';
import { BigFiveInfo } from '@/types/domain';
import type { UnifiedSkill } from '@/types/skills';
import { useBigFiveMapper, getBigFiveMapping } from '@/hooks/useBigFiveMapper';
import { BigFiveSelect } from '@/components/standards/BigFiveSelect';
import { toast } from 'sonner';

// Types

interface StandardsSearchComboboxProps {
  /** Current StandardCodesDto value */
  value?: StandardCodesDto;
  /** Callback when selection changes */
  onChange: (value: StandardCodesDto) => void;
  /** Pre-loaded unified skills array (O*NET + ESCO combined) */
  skills: UnifiedSkill[];
  /** Whether skills are currently loading */
  isLoading?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** CSS class name */
  className?: string;
}

// Helper Functions

function mapToOnetRef(skill: UnifiedSkill): OnetRefDto {
  const categoryMap: Record<string, OnetRefDto['elementType']> = {
    'ability': 'ability',
    'work-style': 'work_style',
    'knowledge': 'knowledge',
    'skill': 'skill',
    'work-activity': 'work_activity',
  };
  
  return {
    code: skill.code || skill.id,
    title: skill.name,
    elementType: categoryMap[skill.category?.toLowerCase() || ''] || 'ability',
  };
}

function mapToEscoRef(skill: UnifiedSkill): EscoRefDto {
  const reuseLevel = skill.metadata?.reuseLevel as string | undefined;
  const type = skill.metadata?.type as string | undefined;
  
  let skillType: EscoRefDto['skillType'] = 'skill';
  if (reuseLevel === 'transversal' || type === 'transversal') {
    skillType = 'transversal';
  } else if (type === 'knowledge' || skill.category?.toLowerCase().includes('knowledge')) {
    skillType = 'knowledge';
  } else if (type === 'competence') {
    skillType = 'competence';
  }
  
  return {
    uri: skill.uri || skill.id,
    title: skill.name,
    skillType: skillType,
  };
}

// Loading Skeleton Component

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

// Filter Types

// O*NET element types for filtering
const ONET_CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'ability', label: 'Abilities' },
  { value: 'skill', label: 'Skills' },
  { value: 'knowledge', label: 'Knowledge' },
  { value: 'work-style', label: 'Work Styles' },
  { value: 'work-activity', label: 'Work Activities' },
] as const;

// ESCO skill types for filtering
const ESCO_CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'skill', label: 'Skills' },
  { value: 'knowledge', label: 'Knowledge' },
  { value: 'competence', label: 'Competences' },
  { value: 'transversal', label: 'Transversal' },
] as const;

type OnetCategory = typeof ONET_CATEGORIES[number]['value'];
type EscoCategory = typeof ESCO_CATEGORIES[number]['value'];
type CategoryFilter = OnetCategory | EscoCategory;

// Single Standard Search Popover

interface StandardSearchPopoverProps {
  type: 'onet' | 'esco';
  skills: UnifiedSkill[];
  selectedValue?: OnetRefDto | EscoRefDto;
  onSelect: (skill: UnifiedSkill) => void;
  onClear: () => void;
  disabled?: boolean;
  /** Context seed for smart recommendations (e.g., O*NET skill name for ESCO suggestions) */
  contextSeed?: string;
}

function StandardSearchPopover({
  type,
  skills,
  selectedValue,
  onSelect,
  onClear,
  disabled,
  contextSeed,
}: StandardSearchPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [categoryFilter, setCategoryFilter] = React.useState<CategoryFilter>('all');
  const isOnet = type === 'onet';
  
  // Get categories based on type
  const categories = isOnet ? ONET_CATEGORIES : ESCO_CATEGORIES;
  
  // Filter skills by source and category
  const filteredSkills = (() => {
    let filtered = skills.filter(s => s.source === type);

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(s => {
        const category = s.category?.toLowerCase() || '';
        // Handle different naming conventions
        if (isOnet) {
          return category === categoryFilter ||
                 category.includes(categoryFilter) ||
                 (categoryFilter === 'work-style' && category.includes('style')) ||
                 (categoryFilter === 'work-activity' && category.includes('activity'));
        } else {
          // ESCO categories
          const metadata = s.metadata as { type?: string; reuseLevel?: string } | undefined;
          const skillType = metadata?.type?.toLowerCase() || '';
          const reuseLevel = metadata?.reuseLevel?.toLowerCase() || '';

          if (categoryFilter === 'transversal') {
            return reuseLevel === 'transversal' || skillType === 'transversal';
          }
          return category === categoryFilter || skillType === categoryFilter;
        }
      });
    }

    return filtered;
  })();
  
  // Use worker search
  const { state, actions } = useWorkerSearch(filteredSkills, {
    threshold: 0.4,
    limit: 15,
    useWorker: true,
  });
  
  // Destructure actions to get stable references
  const { recommend, clearRecommendations, setQuery } = actions;
  
  // Trigger recommendations when contextSeed changes (for ESCO based on O*NET)
  React.useEffect(() => {
    if (contextSeed && state.isIndexReady) {
      recommend(contextSeed, type);
    } else {
      clearRecommendations();
    }
  }, [contextSeed, state.isIndexReady, type, recommend, clearRecommendations]);
  
  // Check if a skill is selected
  const isSelected = (skill: UnifiedSkill): boolean => {
    if (!selectedValue) return false;
    if (isOnet) {
      const onetRef = selectedValue as OnetRefDto;
      return skill.code === onetRef.code || skill.id === onetRef.code;
    } else {
      const escoRef = selectedValue as EscoRefDto;
      return skill.uri === escoRef.uri || skill.id === escoRef.uri;
    }
  };
  
  // Handle selection
  const handleSelect = (skill: UnifiedSkill) => {
    onSelect(skill);
    setOpen(false);
    setQuery('');
  };
  
  // Deduplicate results by name
  const dedupedResults = (() => {
    const seen = new Set<string>();
    return state.results.filter(r => {
      const name = r.item.name.toLowerCase();
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  })();
  
  // Deduplicate recommendations by name
  const dedupedRecommendations = (() => {
    const seen = new Set<string>();
    return state.recommendations.filter(r => {
      const name = r.item.name.toLowerCase();
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  })();
  
  // Determine what to show: search results or recommendations
  const hasSearchQuery = state.query.trim().length > 0;
  const showRecommendations = !hasSearchQuery && dedupedRecommendations.length > 0;
  
  // Get display label
  const displayLabel = selectedValue 
    ? (isOnet ? (selectedValue as OnetRefDto).title : (selectedValue as EscoRefDto).title)
    : null;
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between h-10 font-normal",
            !selectedValue && "text-muted-foreground",
            selectedValue && isOnet && "border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/30",
            selectedValue && !isOnet && "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30"
          )}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isOnet ? (
              <Briefcase className={cn("h-4 w-4 shrink-0", selectedValue ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground")} />
            ) : (
              <Globe className={cn("h-4 w-4 shrink-0", selectedValue ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground")} />
            )}
            {displayLabel ? (
              <span className="truncate text-foreground">{displayLabel}</span>
            ) : (
              <span className="text-muted-foreground">
                {isOnet ? 'Search O*NET standards...' : 'Search ESCO standards...'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {selectedValue && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onClear();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    e.preventDefault();
                    onClear();
                  }
                }}
                className={cn(
                  "rounded-full p-1 transition-colors hover:bg-muted cursor-pointer",
                  isOnet ? "hover:text-orange-600" : "hover:text-blue-600"
                )}
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[400px] p-0" align="start" sideOffset={4}>
        <Command shouldFilter={false} className="rounded-lg">
          {/* Header */}
          <div className={cn(
            "flex items-center gap-2 border-b px-3 py-2.5",
            isOnet ? "bg-orange-50/50 dark:bg-orange-950/30" : "bg-blue-50/50 dark:bg-blue-950/30"
          )}>
            {isOnet ? (
              <Briefcase className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            ) : (
              <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            )}
            <span className="text-sm font-semibold">
              {isOnet ? 'O*NET Occupational Standards' : 'ESCO European Skills'}
            </span>
            <Badge variant="secondary" className="ml-auto text-[10px]">
              {filteredSkills.length.toLocaleString()}
            </Badge>
          </div>
          
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 px-2 py-1.5 border-b bg-muted/20 overflow-x-auto">
            <Filter className="h-3 w-3 text-muted-foreground shrink-0 mr-1" />
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={categoryFilter === cat.value ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setCategoryFilter(cat.value)}
                className={cn(
                  "h-6 px-2 text-[10px] font-medium shrink-0",
                  categoryFilter === cat.value && "shadow-sm"
                )}
              >
                {cat.label}
              </Button>
            ))}
          </div>
          
          {/* Search input */}
          <div className="flex items-center gap-2 border-b px-3 py-1">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <CommandInput
              placeholder={state.isIndexing ? 'Building index...' : `Search ${isOnet ? 'O*NET' : 'ESCO'}...`}
              value={state.query}
              onValueChange={setQuery}
              className="h-9 border-0 bg-transparent px-0 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-0"
            />
            {state.isSearching && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
            )}
          </div>
          
          {/* Results */}
          <CommandList className="max-h-[280px] overflow-y-auto">
            {state.isIndexing ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary/60" />
                <span className="text-sm">Building search index...</span>
              </div>
            ) : hasSearchQuery && dedupedResults.length === 0 ? (
              <CommandEmpty className="py-6 text-center">
                <Search className="h-6 w-6 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No results for &quot;{state.query}&quot;</p>
              </CommandEmpty>
            ) : showRecommendations ? (
              /* Show context-aware recommendations when no search query */
              <CommandGroup 
                heading={
                  <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
                    <Sparkles className="h-3 w-3" />
                    Recommended based on O*NET context
                  </span>
                }
                className="px-2 py-1"
              >
                {dedupedRecommendations.map((result) => {
                  const selected = isSelected(result.item);
                  return (
                    <CommandItem
                      key={result.item.id}
                      value={result.item.id}
                      onSelect={() => handleSelect(result.item)}
                      className={cn(
                        "flex items-center gap-3 py-2.5 px-2 rounded-md cursor-pointer mb-0.5 transition-all",
                        selected 
                          ? "bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800"
                          : "hover:bg-muted/50 border border-transparent"
                      )}
                    >
                      {/* Checkbox */}
                      <div className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border shrink-0 transition-colors",
                        selected 
                          ? "border-blue-500 bg-blue-500 text-white"
                          : "border-muted-foreground/30"
                      )}>
                        {selected && <Check className="h-3 w-3" />}
                      </div>
                      
                      {/* Content */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium truncate">
                          {result.item.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {result.item.category && (
                            <Badge 
                              variant="secondary" 
                              className="h-4 px-1.5 text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            >
                              {result.item.category}
                            </Badge>
                          )}
                          <Badge 
                            variant="outline" 
                            className="h-4 px-1.5 text-[9px] gap-0.5 text-primary border-primary/30"
                          >
                            <Sparkles className="h-2.5 w-2.5" />
                            Match
                          </Badge>
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ) : hasSearchQuery && dedupedResults.length > 0 ? (
              /* Show search results */
              <CommandGroup heading="Search Results" className="px-2 py-1">
                {dedupedResults.slice(0, 15).map((result) => {
                  const selected = isSelected(result.item);
                  return (
                    <CommandItem
                      key={result.item.id}
                      value={result.item.id}
                      onSelect={() => handleSelect(result.item)}
                      className={cn(
                        "flex items-center gap-3 py-2.5 px-2 rounded-md cursor-pointer mb-0.5 transition-all",
                        selected 
                          ? isOnet
                            ? "bg-orange-100 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800" 
                            : "bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800"
                          : "hover:bg-muted/50"
                      )}
                    >
                      {/* Checkbox */}
                      <div className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border shrink-0 transition-colors",
                        selected 
                          ? isOnet
                            ? "border-orange-500 bg-orange-500 text-white" 
                            : "border-blue-500 bg-blue-500 text-white"
                          : "border-muted-foreground/30"
                      )}>
                        {selected && <Check className="h-3 w-3" />}
                      </div>
                      
                      {/* Content */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium truncate">
                          {result.item.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {isOnet && result.item.code && (
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {result.item.code}
                            </span>
                          )}
                          {result.item.category && (
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "h-4 px-1.5 text-[9px]",
                                isOnet 
                                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                              )}
                            >
                              {result.item.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ) : (
              /* Empty state - prompt to search */
              <div className="py-8 text-center">
                <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">Start typing to search</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {filteredSkills.length.toLocaleString()} {isOnet ? 'O*NET' : 'ESCO'} standards available
                </p>
              </div>
            )}
          </CommandList>
          
          {/* Footer */}
          {(state.results.length > 0 || showRecommendations) && (
            <div className="flex items-center justify-between border-t bg-muted/20 px-3 py-1.5 text-[10px] text-muted-foreground">
              <span>
                {showRecommendations 
                  ? `${dedupedRecommendations.length} recommendations` 
                  : `${dedupedResults.length} results`}
              </span>
              <div className="flex items-center gap-2">
                {state.searchTime > 0 && (
                  <span>{state.searchTime.toFixed(0)}ms</span>
                )}
                {state.workerSupported && (
                  <span className="text-green-600 dark:text-green-400 font-medium">⚡</span>
                )}
              </div>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Main Component

export function StandardsSearchCombobox({
  value,
  onChange,
  skills,
  isLoading = false,
  disabled = false,
  className,
}: StandardsSearchComboboxProps) {
  // Get O*NET code for Big Five mapping suggestion
  const onetCode = value?.onetRef?.code || null;
  const bigFiveMapping = useBigFiveMapper(onetCode);

  // Track previous O*NET selection for ripple effect
  const prevOnetRef = React.useRef<string | null>(null);
  
  // Stable reference to onChange to avoid effect re-runs
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;
  
  // Auto-apply Big Five for edit mode (when value is pre-populated without bigFiveRef)
  React.useEffect(() => {
    const currentOnetCode = value?.onetRef?.code || null;
    const hasBigFiveRef = !!value?.bigFiveRef?.trait;
    
    // Only apply if: O*NET exists, no bigFiveRef yet, and mapping exists
    // This handles edit mode where onetRef was saved but bigFiveRef wasn't
    if (currentOnetCode && !hasBigFiveRef && bigFiveMapping.hasMapping && bigFiveMapping.bigFive) {
      const newValue: StandardCodesDto = { ...value };
      newValue.bigFiveRef = {
        trait: bigFiveMapping.bigFive,
        title: BigFiveInfo[bigFiveMapping.bigFive]?.displayName,
        facet: bigFiveMapping.dimension || undefined,
      };
      onChangeRef.current(newValue);
    }
    
    prevOnetRef.current = currentOnetCode;
  }, [value, bigFiveMapping.bigFive, bigFiveMapping.dimension, bigFiveMapping.hasMapping]);

  // Handle Big Five change (manual override)
  const handleBigFiveChange = (bigFive: BigFiveDimension | null) => {
    const newValue: StandardCodesDto = { ...(value || {}) };
    if (bigFive) {
      newValue.bigFiveRef = {
        trait: bigFive,
        title: BigFiveInfo[bigFive]?.displayName,
        facet: bigFiveMapping.dimension || undefined,
      };
    } else {
      delete newValue.bigFiveRef;
    }
    onChange(newValue);
  };

  // Handle O*NET selection - also auto-applies Big Five mapping
  const handleOnetSelect = (skill: UnifiedSkill) => {
    const newValue: StandardCodesDto = { ...value };
    const onetRef = mapToOnetRef(skill);
    newValue.onetRef = onetRef;

    // Auto-apply Big Five mapping if available
    const mapping = getBigFiveMapping(onetRef.code);
    if (mapping.hasMapping && mapping.bigFive) {
      newValue.bigFiveRef = {
        trait: mapping.bigFive,
        title: BigFiveInfo[mapping.bigFive]?.displayName,
        facet: mapping.dimension || undefined,
      };
      // Show toast notification
      toast.success(
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>
            Psychometric profile mapped: <strong>{BigFiveInfo[mapping.bigFive]?.displayName}</strong>
          </span>
        </div>,
        {
          description: mapping.onetName
            ? `Derived from "${mapping.onetName}"`
            : 'Auto-detected from O*NET selection',
          duration: 3000,
        }
      );
    }

    onChange(newValue);
  };

  // Handle ESCO selection
  const handleEscoSelect = (skill: UnifiedSkill) => {
    const newValue: StandardCodesDto = { ...value };
    newValue.escoRef = mapToEscoRef(skill);
    onChange(newValue);
  };

  // Clear handlers
  const handleClearOnet = () => {
    const newValue = { ...value };
    delete newValue.onetRef;
    // Also clear auto-detected bigFiveRef since it was derived from O*NET
    delete newValue.bigFiveRef;
    onChange(newValue);
  };

  const handleClearEsco = () => {
    const newValue = { ...value };
    delete newValue.escoRef;
    onChange(newValue);
  };

  const hasOnet = !!value?.onetRef;

  // Show loading skeleton
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* ═══════════════════════════════════════════════════════════════════════
          PRIMARY: O*NET Classification
          Main occupational standard - triggers Big Five auto-detection
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-orange-100 dark:bg-orange-900/50">
            <Briefcase className="h-3 w-3 text-orange-600 dark:text-orange-400" />
          </div>
          <label className="text-sm font-medium text-foreground">
            O*NET Standard
          </label>
          <Badge variant="secondary" className="text-[9px] px-1.5 h-4">
            Primary
          </Badge>
        </div>
        
        <StandardSearchPopover
          type="onet"
          skills={skills}
          selectedValue={value?.onetRef}
          onSelect={handleOnetSelect}
          onClear={handleClearOnet}
          disabled={disabled}
        />
        
        {/* Big Five Auto-Detection - Nested under O*NET */}
        {hasOnet && (
          <div className="ml-7 pl-3 border-l-2 border-orange-200 dark:border-orange-800 space-y-1.5 pt-1">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-teal-500" />
              <span className="text-[11px] font-medium text-muted-foreground">
                Psychometric Profile
              </span>
              {value?.bigFiveRef?.trait && (
                <Badge 
                  variant="secondary" 
                  className="h-3.5 px-1 text-[8px] bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 gap-0.5"
                >
                  <Zap className="h-2 w-2" />
                  Auto
                </Badge>
              )}
            </div>
            <BigFiveSelect
              value={value?.bigFiveRef?.trait}
              onChange={handleBigFiveChange}
              suggestion={bigFiveMapping.bigFive}
              suggestionConfidence={bigFiveMapping.confidence}
              suggestionSource={bigFiveMapping.onetName}
              disabled={disabled}
            />
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECONDARY: ESCO Classification
          European skills framework - optional supplementary standard
          Smart boosting: Uses O*NET name as seed for recommendations
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-2 pt-3 border-t border-dashed">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/50">
            <Globe className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          </div>
          <label className="text-sm font-medium text-foreground">
            ESCO Standard
          </label>
          <span className="text-[10px] text-muted-foreground">(optional)</span>
          {value?.onetRef?.title && (
            <Badge 
              variant="outline" 
              className="text-[9px] px-1.5 h-4 gap-0.5 text-primary border-primary/30"
            >
              <Sparkles className="h-2.5 w-2.5" />
              Smart suggestions
            </Badge>
          )}
        </div>
        
        <StandardSearchPopover
          type="esco"
          skills={skills}
          selectedValue={value?.escoRef}
          onSelect={handleEscoSelect}
          onClear={handleClearEsco}
          disabled={disabled}
          contextSeed={value?.onetRef?.title}
        />
      </div>
      
      {/* Big Five Selection when no O*NET is selected */}
      {!hasOnet && (
        <div className="space-y-2 pt-3 border-t border-dashed">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-teal-100 dark:bg-teal-900/50">
              <Shield className="h-3 w-3 text-teal-600 dark:text-teal-400" />
            </div>
            <label className="text-sm font-medium text-foreground">
              Big Five Profile
            </label>
            <span className="text-[10px] text-muted-foreground italic">
              (auto-detected with O*NET)
            </span>
          </div>
          <BigFiveSelect
            value={value?.bigFiveRef?.trait}
            onChange={handleBigFiveChange}
            suggestion={bigFiveMapping.bigFive}
            suggestionConfidence={bigFiveMapping.confidence}
            suggestionSource={bigFiveMapping.onetName}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}

export default StandardsSearchCombobox;
