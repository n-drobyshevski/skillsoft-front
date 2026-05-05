'use client';

import { useState, useEffect, memo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTranslations } from 'next-intl';
import { Search, X, Filter, Info, ExternalLink, Tag, Layers, Clock, Loader2 } from 'lucide-react';
import { useWorkerSearch } from '@/hooks/use-worker-search';
import { highlightMatches } from '@/hooks/use-fuzzy-search';
import { useIsMobile } from '@/hooks/use-mobile';
import type { UnifiedSkill, SkillSearchResult, SkillSearchFilters } from '@/types/skills';
import { cn } from '@/lib/utils';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';

// =============================================================================
// Types
// =============================================================================

interface SkillMapperProps {
  skills: UnifiedSkill[];
  onSkillSelect?: (skill: UnifiedSkill) => void;
  className?: string;
  placeholder?: string;
  initialQuery?: string;
  useWorker?: boolean;
}

// =============================================================================
// Sub-Components
// =============================================================================

const HighlightedText = memo(function HighlightedText({
  text,
  indices,
}: {
  text: string;
  indices?: [number, number][];
}) {
  if (!indices || indices.length === 0) {
    return <span>{text}</span>;
  }

  const segments = highlightMatches(text, indices);

  return (
    <span>
      {segments.map((segment, i) =>
        segment.highlight ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
            {segment.text}
          </mark>
        ) : (
          <span key={i}>{segment.text}</span>
        )
      )}
    </span>
  );
});

const SearchResultItem = memo(function SearchResultItem({
  result,
  isSelected,
  onClick,
}: {
  result: SkillSearchResult;
  isSelected: boolean;
  onClick: () => void;
}) {
  const t = useTranslations('skillMapper');
  const { item, score, matches } = result;

  const nameMatch = matches?.find(m => m.key === 'name');
  const nameIndices = nameMatch?.indices;

  const matchPercentage = Math.round((1 - score) * 100);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 sm:p-3 rounded-lg border transition-all',
        'hover:bg-accent hover:border-accent-foreground/20',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'touch-manipulation active:scale-[0.98]',
        'min-h-[72px] sm:min-h-0',
        isSelected
          ? 'bg-accent border-primary shadow-sm'
          : 'bg-card border-border'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm sm:text-sm truncate">
            <HighlightedText text={item.name} indices={nameIndices} />
          </h4>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {item.description || t('search.noDescription')}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge
            variant={item.source === 'esco' ? 'default' : 'secondary'}
            className="text-[10px] uppercase"
          >
            {item.source}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {matchPercentage}%
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2">
        <Badge variant="outline" className="text-[10px]">
          {item.category}
        </Badge>
        {item.code && (
          <Badge variant="outline" className="text-[10px] font-mono">
            {item.code}
          </Badge>
        )}
      </div>
    </button>
  );
});

const SkillDetailsPanel = memo(function SkillDetailsPanel({
  skill,
  onClose,
  isDrawer = false,
}: {
  skill: UnifiedSkill | null;
  onClose: () => void;
  isDrawer?: boolean;
}) {
  const t = useTranslations('skillMapper');

  if (!skill) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
        <Info className="h-12 w-12 mb-4 opacity-50" />
        <h3 className="font-medium">{t('details.noSelection')}</h3>
        <p className="text-sm mt-2">
          {t('details.noSelectionHint')}
        </p>
      </div>
    );
  }

  const metadata = skill.metadata as Record<string, unknown>;
  const topOccupations = metadata?.topOccupations as Array<{
    code: string;
    title: string;
    importance?: number;
    level?: number;
  }> | undefined;

  return (
    <div className={cn("flex flex-col overflow-hidden", isDrawer ? "h-full" : "h-full")}>
      {/* Header */}
      <div className={cn(
        "flex items-start justify-between border-b shrink-0",
        isDrawer ? "p-3" : "p-4"
      )}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge
              variant={skill.source === 'esco' ? 'default' : 'secondary'}
              className="uppercase text-[10px]"
            >
              {skill.source}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {skill.category}
            </Badge>
          </div>
          <h2 className={cn("font-semibold", isDrawer ? "text-base" : "text-lg")}>{skill.name}</h2>
        </div>
        {!isDrawer && (
          <Button variant="ghost" size="icon" onClick={onClose} className="min-w-11 min-h-11 touch-manipulation" aria-label={t('details.closeDetails')}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className={cn("space-y-4", isDrawer ? "p-3" : "p-4")}>
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              {t('details.description')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {skill.description || t('details.noDescription')}
            </p>
          </div>

          <Separator />

          {/* Alternative Names (ESCO) */}
          {skill.altNames && skill.altNames.length > 0 && (
            <>
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  {t('details.altNames')}
                </h3>
                <div className="flex flex-wrap gap-1">
                  {skill.altNames.slice(0, 10).map((altName, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {altName}
                    </Badge>
                  ))}
                  {skill.altNames.length > 10 && (
                    <Badge variant="outline" className="text-xs">
                      {t('details.moreAltNames', { count: skill.altNames.length - 10 })}
                    </Badge>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Identifiers */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              {t('details.identifiers')}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('details.id')}</span>
                <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[180px]">
                  {skill.id}
                </code>
              </div>
              {skill.code && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('details.code')}</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {skill.code}
                  </code>
                </div>
              )}
              {skill.uri && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('details.uri')}</span>
                  <a
                    href={skill.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 min-h-11 px-2 touch-manipulation"
                  >
                    {t('details.view')} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Top Occupations (O*NET) */}
          {topOccupations && topOccupations.length > 0 && (
            <>
              <Separator />
              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium w-full min-h-11 touch-manipulation">
                  <Clock className="h-4 w-4" />
                  {t('details.relatedOccupations', { count: topOccupations.length })}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="space-y-2">
                    {topOccupations.map((occ, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-sm p-2 rounded bg-muted/50"
                      >
                        <div>
                          <span className="font-medium">{occ.title}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({occ.code})
                          </span>
                        </div>
                        {occ.importance && (
                          <Badge variant="outline" className="text-[10px]">
                            {t('details.importance', { value: occ.importance.toFixed(1) })}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </>
          )}

          {/* Metadata */}
          <Separator />
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium w-full min-h-11 touch-manipulation">
              <Info className="h-4 w-4" />
              {t('details.rawMetadata')}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-48">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );
});

const FilterPanel = memo(function FilterPanel({
  categories,
  filters,
  onFiltersChange,
}: {
  categories: string[];
  filters: SkillSearchFilters;
  onFiltersChange: (filters: SkillSearchFilters) => void;
}) {
  const t = useTranslations('skillMapper');
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount =
    (filters.sources?.length || 0) + (filters.categories?.length || 0);

  const toggleSource = (source: 'esco' | 'onet') => {
    const currentSources = filters.sources || [];
    const newSources = currentSources.includes(source)
      ? currentSources.filter(s => s !== source)
      : [...currentSources, source];
    onFiltersChange({ ...filters, sources: newSources.length > 0 ? newSources : undefined });
  };

  const toggleCategory = (category: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    onFiltersChange({ ...filters, categories: newCategories.length > 0 ? newCategories : undefined });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 min-h-11 px-4 touch-manipulation active:scale-[0.98] transition-transform"
          >
            <Filter className="h-4 w-4" />
            {t('search.filters')}
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </CollapsibleTrigger>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="min-h-11 px-4 touch-manipulation active:scale-[0.98] transition-transform"
          >
            {t('search.clear')}
          </Button>
        )}
      </div>

      <CollapsibleContent className="mt-3 space-y-4">
        {/* Source filters */}
        <div>
          <h4 className="text-xs font-medium mb-2 text-muted-foreground">
            {t('search.dataSource')}
          </h4>
          <div className="flex gap-2">
            {(['esco', 'onet'] as const).map(source => (
              <button
                key={source}
                onClick={() => toggleSource(source)}
                className={cn(
                  'min-h-11 px-4 py-2 rounded-md text-sm font-medium transition-all',
                  'touch-manipulation active:scale-[0.98]',
                  filters.sources?.includes(source)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                {source.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Category filters */}
        <div>
          <h4 className="text-xs font-medium mb-2 text-muted-foreground">
            {t('search.categories')}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {categories.slice(0, 12).map(category => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={cn(
                  'min-h-11 px-3 py-2 rounded-md text-xs font-medium transition-all',
                  'touch-manipulation active:scale-[0.98]',
                  filters.categories?.includes(category)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
});

// =============================================================================
// Main Component
// =============================================================================

export function SkillMapper({
  skills,
  onSkillSelect,
  className,
  placeholder,
  initialQuery = '',
  useWorker = true,
}: SkillMapperProps) {
  const t = useTranslations('skillMapper');
  const resolvedPlaceholder = placeholder ?? t('searchPlaceholderShort');
  const [selectedSkill, setSelectedSkill] = useState<UnifiedSkill | null>(null);
  const [filters, setFilters] = useState<SkillSearchFilters>({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const categories = (() => {
    const cats = new Set<string>();
    skills.forEach(skill => cats.add(skill.category));
    return Array.from(cats).sort();
  })();

  const { state, actions } = useWorkerSearch(skills, {
    threshold: 0.4,
    limit: 50,
    filters,
    useWorker,
  });

  useEffect(() => {
    if (initialQuery) {
      actions.setQuery(initialQuery);
    }
  }, [initialQuery, actions]);

  useEffect(() => {
    actions.setFilters(filters);
  }, [filters, actions]);

  const isInputAhead = state.query !== state.deferredQuery;

  const handleSkillSelect = (skill: UnifiedSkill) => {
    setSelectedSkill(skill);
    if (isMobile) {
      setIsDrawerOpen(true);
    }
    onSkillSelect?.(skill);
  };

  const handleCloseDetails = () => {
    setSelectedSkill(null);
    setIsDrawerOpen(false);
  };

  const handleFiltersChange = (newFilters: SkillSearchFilters) => {
    setFilters(newFilters);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    actions.setQuery(e.target.value);
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: state.results.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 100,
    overscan: 5,
    getItemKey: (index) => state.results[index]?.item.id ?? index,
  });

  return (
    <div className={cn('flex h-full', className)}>
      {/* Left Panel: Search */}
      <div className="w-full md:w-1/2 lg:w-2/5 md:border-r flex flex-col">
        {/* Search Header */}
        <div className="p-3 sm:p-4 border-b space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={state.query}
              onChange={handleSearchChange}
              placeholder={resolvedPlaceholder}
              className="pl-9 pr-11 h-11 text-base sm:text-sm"
              inputMode="search"
              enterKeyHint="search"
            />
            {state.query && (
              <div className="absolute right-1 top-1/2 -translate-y-1/2">
                {isInputAhead || state.isSearching ? (
                  <div className="p-2">
                    <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                  </div>
                ) : (
                  <button
                    onClick={actions.clearQuery}
                    className="p-2 min-w-9 min-h-9 flex items-center justify-center text-muted-foreground hover:text-foreground touch-manipulation active:scale-[0.95] transition-transform rounded-md hover:bg-muted"
                    aria-label={t('search.clearSearch')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          <FilterPanel
            categories={categories}
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {state.isIndexing ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {t('search.buildingIndex')}
                </span>
              ) : state.results.length > 0 ? (
                t('search.resultsCount', { count: state.results.length })
              ) : (
                t('search.skillsIndexed', { count: state.totalIndexed.toLocaleString() })
              )}
            </span>
            <span className="flex items-center gap-2">
              {state.searchTime > 0 && (
                <span>{state.searchTime.toFixed(1)}ms</span>
              )}
              {state.workerSupported && (
                <span className="text-[10px] text-green-600 dark:text-green-400" title={`⚡ ${t('search.worker')}`}>
                  ⚡ {t('search.worker')}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Results List */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-auto"
          style={{ contain: 'strict' }}
        >
          <div className="p-3 sm:p-4">
            {state.isIndexing ? (
              <div className="text-center text-muted-foreground py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p>{t('search.preparingIndex')}</p>
                <p className="text-xs mt-1">{t('search.backgroundThread')}</p>
              </div>
            ) : state.isSearching ? (
              <div className="text-center text-muted-foreground py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                {t('search.searching')}
              </div>
            ) : state.results.length > 0 ? (
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {virtualizer.getVirtualItems().map((virtualRow) => {
                  const result = state.results[virtualRow.index];
                  return (
                    <div
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={virtualizer.measureElement}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      className="pb-2"
                    >
                      <SearchResultItem
                        result={result}
                        isSelected={selectedSkill?.id === result.item.id}
                        onClick={() => handleSkillSelect(result.item)}
                      />
                    </div>
                  );
                })}
              </div>
            ) : state.query ? (
              <div className="text-center text-muted-foreground py-8">
                <p>{t('search.noResults', { query: state.query })}</p>
                <p className="text-xs mt-2">{t('search.noResultsHint')}</p>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p>{t('search.emptyState')}</p>
                <p className="text-xs mt-2">
                  {t('search.emptyStateHint', { count: state.totalIndexed.toLocaleString() })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel: Details - Desktop only */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 flex-col bg-muted/30 overflow-hidden">
        <SkillDetailsPanel
          skill={selectedSkill}
          onClose={handleCloseDetails}
        />
      </div>

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="border-b">
              <div className="flex items-center justify-between">
                <DrawerTitle className="text-base">{t('details.skillDetails')}</DrawerTitle>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="min-w-11 min-h-11 touch-manipulation active:scale-[0.95]"
                    aria-label={t('details.closeDetails')}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="flex-1 overflow-hidden">
              <SkillDetailsPanel
                skill={selectedSkill}
                onClose={handleCloseDetails}
                isDrawer
              />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}

export default SkillMapper;
