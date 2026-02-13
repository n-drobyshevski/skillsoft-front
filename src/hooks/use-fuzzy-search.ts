/**
 * Fuzzy Search Hook
 * 
 * Client-side fuzzy search engine using fuse.js for skill mapping.
 * Provides zero-latency search with no network calls.
 * 
 * Features:
 * - Weighted search across name, altNames, description
 * - Debounced query processing
 * - Match highlighting support
 * - Source and category filtering
 * - Configurable threshold and limits
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Fuse, { type IFuseOptions, type FuseResult } from 'fuse.js';
import type {
  UnifiedSkill,
  SkillSearchResult,
  SkillSearchFilters,
} from '@/types/skills';

// =============================================================================
// Types
// =============================================================================

export interface UseFuzzySearchOptions {
  /** Search threshold (0.0 = exact match, 1.0 = match anything). Default: 0.4 */
  threshold?: number;
  /** Maximum results to return. Default: 50 */
  limit?: number;
  /** Debounce delay in ms. Default: 150 */
  debounceMs?: number;
  /** Initial filters */
  filters?: SkillSearchFilters;
}

export interface FuzzySearchState {
  query: string;
  results: SkillSearchResult[];
  isSearching: boolean;
  totalIndexed: number;
  searchTime: number;
}

export interface FuzzySearchActions {
  setQuery: (query: string) => void;
  clearQuery: () => void;
  setFilters: (filters: SkillSearchFilters) => void;
  clearFilters: () => void;
}

// =============================================================================
// Fuse.js Configuration
// =============================================================================

/**
 * Default Fuse.js options optimized for skill search
 */
const DEFAULT_FUSE_OPTIONS: IFuseOptions<UnifiedSkill> = {
  // Search configuration
  threshold: 0.4,           // Lower = stricter matching
  distance: 100,            // How far to search for matches
  ignoreLocation: true,     // Search entire string, not just beginning
  minMatchCharLength: 2,    // Minimum characters to consider a match
  
  // Weighted search keys
  keys: [
    { name: 'name', weight: 2.0 },           // Primary: skill name
    { name: 'altNames', weight: 1.5 },       // High: alternative names
    { name: 'description', weight: 0.8 },    // Medium: description
    { name: 'category', weight: 0.6 },       // Lower: category
    { name: 'code', weight: 1.0 },           // Medium: O*NET codes
  ],
  
  // Include detailed match info for highlighting
  includeScore: true,
  includeMatches: true,
  
  // Extended search patterns (optional)
  // useExtendedSearch: true,  // Enable with =exact, 'include, !exclude, ^prefix, $suffix
};

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Debounce function for search queries
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Transform Fuse.js results to our SkillSearchResult format
 */
function transformResults(fuseResults: FuseResult<UnifiedSkill>[]): SkillSearchResult[] {
  return fuseResults.map(result => ({
    item: result.item,
    score: result.score ?? 0,
    matches: result.matches?.map(match => ({
      key: match.key ?? '',
      value: match.value ?? '',
      indices: match.indices as [number, number][],
    })),
    refIndex: result.refIndex,
  }));
}

/**
 * Apply filters to skills before search
 */
function applyFilters(
  skills: UnifiedSkill[],
  filters?: SkillSearchFilters
): UnifiedSkill[] {
  if (!filters) return skills;
  
  let filtered = skills;
  
  // Filter by source
  if (filters.sources && filters.sources.length > 0) {
    filtered = filtered.filter(skill => filters.sources!.includes(skill.source));
  }
  
  // Filter by category
  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter(skill => filters.categories!.includes(skill.category));
  }
  
  return filtered;
}

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Client-side fuzzy search hook for skill mapping
 * 
 * @param skills - Array of unified skills to search
 * @param options - Search configuration options
 * @returns Search state and action handlers
 * 
 * @example
 * ```tsx
 * const { state, actions } = useFuzzySearch(skills, { threshold: 0.4, limit: 20 });
 * 
 * <input
 *   value={state.query}
 *   onChange={e => actions.setQuery(e.target.value)}
 *   placeholder="Search skills..."
 * />
 * 
 * {state.results.map(result => (
 *   <SkillCard key={result.item.id} skill={result.item} score={result.score} />
 * ))}
 * ```
 */
export function useFuzzySearch(
  skills: UnifiedSkill[],
  options: UseFuzzySearchOptions = {}
): { state: FuzzySearchState; actions: FuzzySearchActions } {
  const {
    threshold = 0.4,
    limit = 50,
    debounceMs = 150,
    filters: initialFilters,
  } = options;
  
  // State
  const [query, setQueryState] = useState('');
  const [filters, setFiltersState] = useState<SkillSearchFilters>(initialFilters ?? {});
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SkillSearchResult[]>([]);
  const [searchTime, setSearchTime] = useState(0);
  
  // Debounced query
  const debouncedQuery = useDebounce(query, debounceMs);
  
  // Fuse index ref (memoized)
  const fuseRef = useRef<Fuse<UnifiedSkill> | null>(null);
  
  // Filter skills based on current filters
  const filteredSkills = applyFilters(skills, filters);

  // Build/rebuild Fuse index when skills or filters change
  useEffect(() => {
    const fuseOptions: IFuseOptions<UnifiedSkill> = {
      ...DEFAULT_FUSE_OPTIONS,
      threshold,
    };
    
    fuseRef.current = new Fuse(filteredSkills, fuseOptions);
  }, [filteredSkills, threshold]);
  
  // Execute search when debounced query changes
  useEffect(() => {
    if (!fuseRef.current) return;
    
    const trimmedQuery = debouncedQuery.trim();
    
    // Schedule state updates asynchronously to avoid synchronous setState in effect
    const rafId = requestAnimationFrame(() => {
      if (trimmedQuery.length === 0) {
        setResults([]);
        setSearchTime(0);
        setIsSearching(false);
        return;
      }
      
      setIsSearching(true);
      
      const startTime = performance.now();
      
      const fuseResults = fuseRef.current!.search(trimmedQuery, { limit });
      const transformedResults = transformResults(fuseResults);
      
      const endTime = performance.now();
      
      setResults(transformedResults);
      setSearchTime(endTime - startTime);
      setIsSearching(false);
    });
    
    return () => cancelAnimationFrame(rafId);
  }, [debouncedQuery, limit]);
  
  // Actions
  const setQuery = (newQuery: string) => {
    setQueryState(newQuery);
    if (newQuery.length > 0) {
      setIsSearching(true);
    }
  };

  const clearQuery = () => {
    setQueryState('');
    setResults([]);
    setSearchTime(0);
  };

  const setFilters = (newFilters: SkillSearchFilters) => {
    setFiltersState(newFilters);
  };

  const clearFilters = () => {
    setFiltersState({});
  };

  // Return state and actions
  return {
    state: {
      query,
      results,
      isSearching,
      totalIndexed: filteredSkills.length,
      searchTime,
    },
    actions: {
      setQuery,
      clearQuery,
      setFilters,
      clearFilters,
    },
  };
}

// =============================================================================
// Extended Search Hook (with pattern matching)
// =============================================================================

/**
 * Extended search hook with unix-like pattern matching
 * 
 * Patterns:
 * - `=exact` - exact match
 * - `'include` - items that include `include`
 * - `!exclude` - items that don't include `exclude`
 * - `^prefix` - items that start with `prefix`
 * - `$suffix` - items that end with `suffix`
 * 
 * @example
 * ```tsx
 * const { state, actions } = useExtendedFuzzySearch(skills);
 * 
 * // Search for skills starting with "manage" but not containing "data"
 * actions.setQuery("^manage !data");
 * ```
 */
export function useExtendedFuzzySearch(
  skills: UnifiedSkill[],
  options: UseFuzzySearchOptions = {}
): { state: FuzzySearchState; actions: FuzzySearchActions } {
  const [query, setQueryState] = useState('');
  const [filters, setFiltersState] = useState<SkillSearchFilters>(options.filters ?? {});
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SkillSearchResult[]>([]);
  const [searchTime, setSearchTime] = useState(0);
  
  const {
    threshold = 0.4,
    limit = 50,
    debounceMs = 150,
  } = options;
  
  const debouncedQuery = useDebounce(query, debounceMs);
  const fuseRef = useRef<Fuse<UnifiedSkill> | null>(null);
  
  const filteredSkills = applyFilters(skills, filters);

  // Build Fuse index with extended search enabled
  useEffect(() => {
    const fuseOptions: IFuseOptions<UnifiedSkill> = {
      ...DEFAULT_FUSE_OPTIONS,
      threshold,
      useExtendedSearch: true,
    };
    
    fuseRef.current = new Fuse(filteredSkills, fuseOptions);
  }, [filteredSkills, threshold]);
  
  // Execute search
  useEffect(() => {
    if (!fuseRef.current) return;
    
    const trimmedQuery = debouncedQuery.trim();
    
    // Schedule state updates asynchronously to avoid synchronous setState in effect
    const rafId = requestAnimationFrame(() => {
      if (trimmedQuery.length === 0) {
        setResults([]);
        setSearchTime(0);
        setIsSearching(false);
        return;
      }
      
      setIsSearching(true);
      
      const startTime = performance.now();
      
      const fuseResults = fuseRef.current!.search(trimmedQuery, { limit });
      const transformedResults = transformResults(fuseResults);
      
      const endTime = performance.now();
      
      setResults(transformedResults);
      setSearchTime(endTime - startTime);
      setIsSearching(false);
    });
    
    return () => cancelAnimationFrame(rafId);
  }, [debouncedQuery, limit]);
  
  const setQuery = (newQuery: string) => {
    setQueryState(newQuery);
    if (newQuery.length > 0) {
      setIsSearching(true);
    }
  };

  const clearQuery = () => {
    setQueryState('');
    setResults([]);
    setSearchTime(0);
  };

  const setFilters = (newFilters: SkillSearchFilters) => {
    setFiltersState(newFilters);
  };

  const clearFilters = () => {
    setFiltersState({});
  };

  return {
    state: {
      query,
      results,
      isSearching,
      totalIndexed: filteredSkills.length,
      searchTime,
    },
    actions: {
      setQuery,
      clearQuery,
      setFilters,
      clearFilters,
    },
  };
}

// =============================================================================
// Highlight Utility
// =============================================================================

/**
 * Highlight matched text segments
 * 
 * @param text - Original text
 * @param indices - Match indices from Fuse.js
 * @returns Array of text segments with highlight flags
 * 
 * @example
 * ```tsx
 * const segments = highlightMatches("manage data systems", [[0, 5]]);
 * // Returns: [
 * //   { text: "manage", highlight: true },
 * //   { text: " data systems", highlight: false }
 * // ]
 * ```
 */
export function highlightMatches(
  text: string,
  indices: [number, number][]
): { text: string; highlight: boolean }[] {
  if (!indices || indices.length === 0) {
    return [{ text, highlight: false }];
  }
  
  const segments: { text: string; highlight: boolean }[] = [];
  let lastIndex = 0;
  
  // Sort indices by start position
  const sortedIndices = [...indices].sort((a, b) => a[0] - b[0]);
  
  for (const [start, end] of sortedIndices) {
    // Add non-highlighted text before this match
    if (start > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, start),
        highlight: false,
      });
    }
    
    // Add highlighted match
    segments.push({
      text: text.slice(start, end + 1),
      highlight: true,
    });
    
    lastIndex = end + 1;
  }
  
  // Add remaining text after last match
  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      highlight: false,
    });
  }
  
  return segments;
}

export default useFuzzySearch;
