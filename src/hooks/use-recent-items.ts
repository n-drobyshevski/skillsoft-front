import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'skillsoft-palette-recent';
const MAX_ITEMS = 8;

export interface RecentItem {
  path: string;
  label: string;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// External store for localStorage sync
// ---------------------------------------------------------------------------

const listeners = new Set<() => void>();
const EMPTY: RecentItem[] = [];
let cachedSnapshot: RecentItem[] = EMPTY;
let cachedRaw: string | null = null;

function getSnapshot(): RecentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedSnapshot;
    cachedRaw = raw;
    cachedSnapshot = raw ? (JSON.parse(raw) as RecentItem[]) : EMPTY;
    return cachedSnapshot;
  } catch {
    return EMPTY;
  }
}

function getServerSnapshot(): RecentItem[] {
  return EMPTY;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify() {
  for (const cb of listeners) cb();
}

function persist(items: RecentItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota exceeded — silently ignore
  }
  notify();
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useRecentItems() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addRecent = useCallback((path: string, label: string) => {
    const current = getSnapshot();
    const filtered = current.filter((item) => item.path !== path);
    const updated = [{ path, label, timestamp: Date.now() }, ...filtered].slice(
      0,
      MAX_ITEMS,
    );
    persist(updated);
  }, []);

  const clearRecent = useCallback(() => {
    persist([]);
  }, []);

  return { recentItems: items, addRecent, clearRecent } as const;
}
