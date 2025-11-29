/**
 * Web Worker Search Hook
 * 
 * React hook that offloads Fuse.js search to a Web Worker.
 * Keeps the main thread responsive during index building and searches.
 * 
 * Features:
 * - Worker-based index building (off main thread)
 * - Worker-based search execution
 * - useDeferredValue for smooth input
 * - Fallback to main thread if workers unavailable
 * - Automatic cleanup on unmount
 */

'use client';

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useDeferredValue,
  useMemo,
} from 'react';
import type { IFuseOptions } from 'fuse.js';
import type {
  UnifiedSkill,
  SkillSearchResult,
  SkillSearchFilters,
} from '@/types/skills';

// =============================================================================
// Types
// =============================================================================

export interface UseWorkerSearchOptions {
  /** Search threshold (0.0 = exact, 1.0 = match anything). Default: 0.4 */
  threshold?: number;
  /** Maximum results. Default: 50 */
  limit?: number;
  /** Debounce delay in ms (0 = use useDeferredValue only). Default: 0 */
  debounceMs?: number;
  /** Initial filters */
  filters?: SkillSearchFilters;
  /** Use Web Worker (falls back to main thread if unavailable). Default: true */
  useWorker?: boolean;
}

export interface WorkerSearchState {
  query: string;
  deferredQuery: string;
  results: SkillSearchResult[];
  isSearching: boolean;
  isIndexing: boolean;
  isIndexReady: boolean;
  totalIndexed: number;
  searchTime: number;
  indexBuildTime: number;
  workerSupported: boolean;
}

export interface WorkerSearchActions {
  setQuery: (query: string) => void;
  clearQuery: () => void;
  setFilters: (filters: SkillSearchFilters) => void;
  clearFilters: () => void;
  rebuildIndex: () => void;
}

// Worker message types (must match search.worker.ts)
interface WorkerMessage {
  type: 'build-index' | 'search' | 'update-options';
  payload: unknown;
  id: string;
}

interface WorkerResponse {
  type: 'index-ready' | 'search-results' | 'error';
  payload: {
    indexedCount?: number;
    buildTime?: number;
    results?: SkillSearchResult[];
    searchTime?: number;
    query?: string;
    message?: string;
    code?: string;
  };
  id: string;
}

// =============================================================================
// Utilities
// =============================================================================

/**
 * Generate unique message ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if Web Workers are supported
 */
function isWorkerSupported(): boolean {
  return typeof Worker !== 'undefined';
}

/**
 * Apply filters to skills
 */
function applyFilters(
  skills: UnifiedSkill[],
  filters?: SkillSearchFilters
): UnifiedSkill[] {
  if (!filters) return skills;

  let filtered = skills;

  if (filters.sources && filters.sources.length > 0) {
    filtered = filtered.filter(skill => filters.sources!.includes(skill.source));
  }

  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter(skill =>
      filters.categories!.includes(skill.category)
    );
  }

  return filtered;
}

// =============================================================================
// Default Fuse Options
// =============================================================================

const DEFAULT_FUSE_OPTIONS: IFuseOptions<UnifiedSkill> = {
  threshold: 0.4,
  distance: 100,
  ignoreLocation: true,
  minMatchCharLength: 2,
  keys: [
    { name: 'name', weight: 2.0 },
    { name: 'altNames', weight: 1.5 },
    { name: 'description', weight: 0.8 },
    { name: 'category', weight: 0.6 },
    { name: 'code', weight: 1.0 },
  ],
  includeScore: true,
  includeMatches: true,
};

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Web Worker-based fuzzy search hook with useDeferredValue
 * 
 * @param skills - Array of unified skills to search
 * @param options - Search configuration options
 * @returns Search state and action handlers
 * 
 * @example
 * ```tsx
 * const { state, actions } = useWorkerSearch(skills, { threshold: 0.4 });
 * 
 * // Input stays responsive even during heavy searches
 * <input
 *   value={state.query}
 *   onChange={e => actions.setQuery(e.target.value)}
 * />
 * 
 * // Show searching indicator when deferred query differs
 * {state.query !== state.deferredQuery && <Spinner />}
 * 
 * {state.results.map(result => (
 *   <SkillCard key={result.item.id} skill={result.item} />
 * ))}
 * ```
 */
export function useWorkerSearch(
  skills: UnifiedSkill[],
  options: UseWorkerSearchOptions = {}
): { state: WorkerSearchState; actions: WorkerSearchActions } {
  const {
    threshold = 0.4,
    limit = 50,
    filters: initialFilters,
    useWorker = true,
  } = options;

  // State
  const [query, setQueryState] = useState('');
  const [filters, setFiltersState] = useState<SkillSearchFilters>(
    initialFilters ?? {}
  );
  const [results, setResults] = useState<SkillSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [isIndexReady, setIsIndexReady] = useState(false);
  const [totalIndexed, setTotalIndexed] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [indexBuildTime, setIndexBuildTime] = useState(0);

  // useDeferredValue for smooth input (React 19)
  const deferredQuery = useDeferredValue(query);

  // Worker ref
  const workerRef = useRef<Worker | null>(null);
  const pendingSearchRef = useRef<string | null>(null);

  // Worker support check
  const workerSupported = useMemo(
    () => useWorker && isWorkerSupported(),
    [useWorker]
  );

  // Filter skills
  const filteredSkills = useMemo(
    () => applyFilters(skills, filters),
    [skills, filters]
  );

  // Initialize worker
  useEffect(() => {
    if (!workerSupported) {
      // Fallback: mark index as ready immediately (will use main thread)
      setIsIndexReady(true);
      setTotalIndexed(filteredSkills.length);
      return;
    }

    // Create worker
    const worker = new Worker(
      new URL('../workers/search.worker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current = worker;

    // Handle worker messages
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { type, payload, id } = event.data;

      switch (type) {
        case 'index-ready':
          setIsIndexing(false);
          setIsIndexReady(true);
          if (payload.indexedCount !== undefined) {
            setTotalIndexed(payload.indexedCount);
          }
          if (payload.buildTime !== undefined) {
            setIndexBuildTime(payload.buildTime);
          }
          break;

        case 'search-results':
          // Only apply results if this is the latest search
          if (id === pendingSearchRef.current) {
            setResults(payload.results ?? []);
            setSearchTime(payload.searchTime ?? 0);
            setIsSearching(false);
          }
          break;

        case 'error':
          console.error('[SearchWorker]', payload.code, payload.message);
          setIsSearching(false);
          setIsIndexing(false);
          break;
      }
    };

    worker.onerror = (error) => {
      console.error('[SearchWorker] Error:', error);
      setIsSearching(false);
      setIsIndexing(false);
    };

    // Cleanup
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [workerSupported]);

  // Build index when skills or filters change
  useEffect(() => {
    if (!workerSupported || !workerRef.current) return;

    setIsIndexing(true);
    setIsIndexReady(false);

    const message: WorkerMessage = {
      type: 'build-index',
      payload: {
        skills: filteredSkills,
        options: { ...DEFAULT_FUSE_OPTIONS, threshold },
      },
      id: generateId(),
    };

    workerRef.current.postMessage(message);
  }, [filteredSkills, threshold, workerSupported]);

  // Execute search when deferred query changes
  useEffect(() => {
    const trimmedQuery = deferredQuery.trim();

    if (trimmedQuery.length === 0) {
      setResults([]);
      setSearchTime(0);
      setIsSearching(false);
      return;
    }

    if (!isIndexReady) return;

    if (workerSupported && workerRef.current) {
      // Worker-based search
      const searchId = generateId();
      pendingSearchRef.current = searchId;
      setIsSearching(true);

      const message: WorkerMessage = {
        type: 'search',
        payload: { query: trimmedQuery, limit },
        id: searchId,
      };

      workerRef.current.postMessage(message);
    } else {
      // Fallback: main thread search (import Fuse dynamically)
      setIsSearching(true);

      import('fuse.js').then(({ default: Fuse }) => {
        const fuse = new Fuse(filteredSkills, {
          ...DEFAULT_FUSE_OPTIONS,
          threshold,
        });

        const startTime = performance.now();
        const fuseResults = fuse.search(trimmedQuery, { limit });
        const endTime = performance.now();

        const transformedResults: SkillSearchResult[] = fuseResults.map(
          result => ({
            item: result.item,
            score: result.score ?? 0,
            matches: result.matches?.map(match => ({
              key: match.key ?? '',
              value: match.value ?? '',
              indices: match.indices as [number, number][],
            })),
            refIndex: result.refIndex,
          })
        );

        setResults(transformedResults);
        setSearchTime(endTime - startTime);
        setIsSearching(false);
      });
    }
  }, [deferredQuery, limit, isIndexReady, workerSupported, filteredSkills, threshold]);

  // Actions
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
  }, []);

  const clearQuery = useCallback(() => {
    setQueryState('');
    setResults([]);
    setSearchTime(0);
  }, []);

  const setFilters = useCallback((newFilters: SkillSearchFilters) => {
    setFiltersState(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  const rebuildIndex = useCallback(() => {
    if (!workerSupported || !workerRef.current) return;

    setIsIndexing(true);
    setIsIndexReady(false);

    const message: WorkerMessage = {
      type: 'build-index',
      payload: {
        skills: filteredSkills,
        options: { ...DEFAULT_FUSE_OPTIONS, threshold },
      },
      id: generateId(),
    };

    workerRef.current.postMessage(message);
  }, [filteredSkills, threshold, workerSupported]);

  return {
    state: {
      query,
      deferredQuery,
      results,
      isSearching,
      isIndexing,
      isIndexReady,
      totalIndexed,
      searchTime,
      indexBuildTime,
      workerSupported,
    },
    actions: {
      setQuery,
      clearQuery,
      setFilters,
      clearFilters,
      rebuildIndex,
    },
  };
}

export default useWorkerSearch;
