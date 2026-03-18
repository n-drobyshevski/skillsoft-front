'use client';

import { useState, useEffect, useRef, useMemo, useDeferredValue } from 'react';
import Fuse, { type IFuseOptions } from 'fuse.js';
import { useDebounce } from '@/hooks/use-debounce';
import { getSignedAuthHeaders } from '@/services/roleApi';
import {
  NAVIGATION_ENTRIES,
  QUICK_ACTIONS,
  type PaletteAction,
} from '@/lib/command-palette/registry';
import type { LensType } from '@/store/lens-store';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchResult {
  id: string;
  name: string;
  description?: string;
}

export interface PaletteSearchReturn {
  navigationResults: PaletteAction[];
  quickActionResults: PaletteAction[];
  templateResults: SearchResult[];
  competencyResults: SearchResult[];
  isSearching: boolean;
  isEmpty: boolean;
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

function getApiBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return `http://localhost:8080/api/${API_VERSION}`;
  const protocol =
    apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')
      ? 'http'
      : 'https';
  return `${protocol}://${apiUrl}/api/${API_VERSION}`;
}

async function resolveAuthHeaders(
  userId: string | null | undefined,
  userRole: string | null,
): Promise<Record<string, string>> {
  return userId && userRole ? getSignedAuthHeaders(userId, userRole) : {};
}

// ---------------------------------------------------------------------------
// Fuse.js config for local entries
// ---------------------------------------------------------------------------

const FUSE_OPTIONS: IFuseOptions<PaletteAction> = {
  keys: [
    { name: 'labelKey', weight: 0.6 },
    { name: 'keywords', weight: 0.4 },
  ],
  threshold: 0.3,
  ignoreLocation: true,
  includeScore: true,
};

const COMPETENCY_FUSE_OPTIONS: IFuseOptions<SearchResult> = {
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'description', weight: 0.3 },
  ],
  threshold: 0.3,
  ignoreLocation: true,
};

// ---------------------------------------------------------------------------
// Hook: usePaletteSearch
// ---------------------------------------------------------------------------

export function usePaletteSearch(
  query: string,
  activeLens: LensType,
  userId: string | null | undefined,
  userRole: string | null,
  isOpen: boolean,
): PaletteSearchReturn {
  // ----- Local search (instant, Fuse.js) -----
  const lensFilteredNav = useMemo(
    () => NAVIGATION_ENTRIES.filter((e) => e.lenses.includes(activeLens)),
    [activeLens],
  );

  const lensFilteredActions = useMemo(
    () => QUICK_ACTIONS.filter((e) => e.lenses.includes(activeLens)),
    [activeLens],
  );

  const navFuse = useMemo(
    () => new Fuse(lensFilteredNav, FUSE_OPTIONS),
    [lensFilteredNav],
  );

  const actionFuse = useMemo(
    () => new Fuse(lensFilteredActions, FUSE_OPTIONS),
    [lensFilteredActions],
  );

  const navigationResults = useMemo(() => {
    if (!query) return lensFilteredNav;
    return navFuse.search(query).map((r) => r.item);
  }, [query, lensFilteredNav, navFuse]);

  const quickActionResults = useMemo(() => {
    if (!query) return lensFilteredActions;
    return actionFuse.search(query).map((r) => r.item);
  }, [query, lensFilteredActions, actionFuse]);

  // ----- Remote search (debounced) -----
  const debouncedQuery = useDebounce(query, 150);
  const deferredQuery = useDeferredValue(debouncedQuery);

  const [templateResults, setTemplateResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const mountedRef = useRef(true);

  // Competency cache — fetch once when palette opens
  const competencyCache = useRef<SearchResult[]>([]);
  const competenciesFetched = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Fetch competencies once on open
  useEffect(() => {
    if (!isOpen || competenciesFetched.current) return;
    competenciesFetched.current = true;

    async function fetchCompetencies() {
      try {
        const authHeaders = await resolveAuthHeaders(userId, userRole);
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/competencies`, {
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          mode: 'cors',
          credentials: 'include',
        });
        if (res.ok) {
          competencyCache.current = (await res.json()) as SearchResult[];
        }
      } catch {
        // silently ignore — competency search won't be available
      }
    }

    void fetchCompetencies();
  }, [isOpen, userId, userRole]);

  // Reset cache when palette closes
  useEffect(() => {
    if (!isOpen) {
      competenciesFetched.current = false;
      competencyCache.current = [];
    }
  }, [isOpen]);

  // Local competency fuzzy search
  const competencyResults = useMemo(() => {
    if (!query || query.length < 2 || competencyCache.current.length === 0) {
      return [];
    }
    const fuse = new Fuse(competencyCache.current, COMPETENCY_FUSE_OPTIONS);
    return fuse.search(query).slice(0, 5).map((r) => r.item);
  }, [query]);

  // Template API search
  useEffect(() => {
    if (!deferredQuery || deferredQuery.length < 2) {
      setTemplateResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);

    async function performSearch() {
      try {
        const authHeaders = await resolveAuthHeaders(userId, userRole);
        const baseUrl = getApiBaseUrl();
        const res = await fetch(
          `${baseUrl}/tests/templates/search?name=${encodeURIComponent(deferredQuery)}`,
          {
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            mode: 'cors',
            credentials: 'include',
          },
        );
        if (!mountedRef.current) return;
        if (res.ok) {
          const data = (await res.json()) as SearchResult[];
          setTemplateResults(Array.isArray(data) ? data.slice(0, 5) : []);
        } else {
          setTemplateResults([]);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      } finally {
        if (mountedRef.current) setIsSearching(false);
      }
    }

    void performSearch();
    return () => controller.abort();
  }, [deferredQuery, userId, userRole]);

  const isEmpty =
    query.length >= 2 &&
    !isSearching &&
    navigationResults.length === 0 &&
    quickActionResults.length === 0 &&
    templateResults.length === 0 &&
    competencyResults.length === 0;

  return {
    navigationResults,
    quickActionResults,
    templateResults,
    competencyResults,
    isSearching,
    isEmpty,
  };
}
