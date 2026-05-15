'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Multi-Tab Sync Hook - Phase 4.3 Conflict Resolution
 *
 * Provides conflict detection and resolution for multi-tab editing with:
 * - BroadcastChannel for cross-tab communication
 * - Version-based optimistic locking
 * - Conflict detection and resolution UI triggers
 */

// TYPES

export interface SyncMessage<T> {
  type: 'STATE_UPDATE' | 'LOCK_ACQUIRED' | 'LOCK_RELEASED' | 'CONFLICT_DETECTED' | 'PING' | 'PONG';
  tabId: string;
  version: number;
  timestamp: number;
  state?: T;
  lockHolder?: string;
}

export interface ConflictInfo<T> {
  localVersion: number;
  remoteVersion: number;
  localState: T;
  remoteState: T;
  remoteTabId: string;
  timestamp: number;
}

interface UseMultiTabSyncOptions<T> {
  /** Unique channel name (e.g., template ID) */
  channelName: string;
  /** Callback when a conflict is detected */
  onConflict?: (conflict: ConflictInfo<T>) => void;
  /** Callback when remote tab updates state */
  onRemoteUpdate?: (state: T, version: number) => void;
  /** Enable/disable sync */
  enabled?: boolean;
}

interface UseMultiTabSyncReturn<T> {
  // State
  tabId: string;
  currentVersion: number;
  isLeader: boolean;
  connectedTabs: number;
  hasConflict: boolean;
  conflictInfo: ConflictInfo<T> | null;

  // Actions
  broadcastState: (state: T) => void;
  incrementVersion: () => number;
  acquireLock: () => boolean;
  releaseLock: () => void;
  resolveConflict: (resolution: 'keep_local' | 'use_remote' | 'merge') => T | null;
  clearConflict: () => void;
}

// HOOK

export function useMultiTabSync<T>({
  channelName,
  onConflict,
  onRemoteUpdate,
  enabled = true,
}: UseMultiTabSyncOptions<T>): UseMultiTabSyncReturn<T> {
  // Generate unique tab ID using lazy initializer to avoid impure render
  const [tabId] = useState(() =>
    typeof window !== 'undefined'
      ? `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      : 'ssr'
  );
  const tabIdRef = useRef(tabId);

  // State
  const [currentVersion, setCurrentVersion] = useState(1);
  const [isLeader, setIsLeader] = useState(false);
  const [connectedTabs, setConnectedTabs] = useState(1);
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo<T> | null>(null);
  const [localState, setLocalState] = useState<T | null>(null);

  // Refs
  const channelRef = useRef<BroadcastChannel | null>(null);
  const lockHolderRef = useRef<string | null>(null);
  const versionRef = useRef(1);
  const tabsRef = useRef<Set<string>>(new Set([tabIdRef.current]));

  // Initialize BroadcastChannel
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !('BroadcastChannel' in window)) {
      return;
    }

    const channel = new BroadcastChannel(`blueprint-sync-${channelName}`);
    channelRef.current = channel;

    // Handle incoming messages
    channel.onmessage = (event: MessageEvent<SyncMessage<T>>) => {
      const message = event.data;

      // Ignore own messages
      if (message.tabId === tabIdRef.current) {
        return;
      }

      switch (message.type) {
        case 'STATE_UPDATE':
          // Check for version conflict
          if (message.version !== versionRef.current && localState !== null) {
            const conflict: ConflictInfo<T> = {
              localVersion: versionRef.current,
              remoteVersion: message.version,
              localState: localState as T,
              remoteState: message.state as T,
              remoteTabId: message.tabId,
              timestamp: message.timestamp,
            };
            setConflictInfo(conflict);
            onConflict?.(conflict);
          } else if (message.state) {
            versionRef.current = message.version;
            setCurrentVersion(message.version);
            onRemoteUpdate?.(message.state, message.version);
          }
          break;

        case 'LOCK_ACQUIRED':
          lockHolderRef.current = message.lockHolder ?? null;
          break;

        case 'LOCK_RELEASED':
          if (lockHolderRef.current === message.lockHolder) {
            lockHolderRef.current = null;
          }
          break;

        case 'PING':
          // Respond to ping to indicate we're alive
          tabsRef.current.add(message.tabId);
          setConnectedTabs(tabsRef.current.size);
          channel.postMessage({
            type: 'PONG',
            tabId: tabIdRef.current,
            version: versionRef.current,
            timestamp: Date.now(),
          } satisfies SyncMessage<T>);
          break;

        case 'PONG':
          tabsRef.current.add(message.tabId);
          setConnectedTabs(tabsRef.current.size);
          break;

        case 'CONFLICT_DETECTED':
          // Another tab detected conflict - update our state
          break;
      }
    };

    // Announce our presence
    channel.postMessage({
      type: 'PING',
      tabId: tabIdRef.current,
      version: versionRef.current,
      timestamp: Date.now(),
    } satisfies SyncMessage<T>);

    // Elect leader (first tab to respond)
    const leaderTimeout = setTimeout(() => {
      if (tabsRef.current.size === 1) {
        setIsLeader(true);
      }
    }, 500);

    // Cleanup
    return () => {
      clearTimeout(leaderTimeout);
      channel.close();
      channelRef.current = null;
    };
  }, [channelName, enabled, localState, onConflict, onRemoteUpdate]);

  // Broadcast state update
  const broadcastState = (state: T) => {
    setLocalState(state);
    versionRef.current += 1;
    setCurrentVersion(versionRef.current);

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'STATE_UPDATE',
        tabId: tabIdRef.current,
        version: versionRef.current,
        timestamp: Date.now(),
        state,
      } satisfies SyncMessage<T>);
    }
  };

  // Increment version without broadcasting
  const incrementVersion = () => {
    versionRef.current += 1;
    setCurrentVersion(versionRef.current);
    return versionRef.current;
  };

  // Acquire editing lock
  const acquireLock = () => {
    if (lockHolderRef.current && lockHolderRef.current !== tabIdRef.current) {
      return false; // Lock held by another tab
    }

    lockHolderRef.current = tabIdRef.current;

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'LOCK_ACQUIRED',
        tabId: tabIdRef.current,
        version: versionRef.current,
        timestamp: Date.now(),
        lockHolder: tabIdRef.current,
      } satisfies SyncMessage<T>);
    }

    return true;
  };

  // Release editing lock
  const releaseLock = () => {
    if (lockHolderRef.current !== tabIdRef.current) {
      return; // We don't hold the lock
    }

    lockHolderRef.current = null;

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'LOCK_RELEASED',
        tabId: tabIdRef.current,
        version: versionRef.current,
        timestamp: Date.now(),
        lockHolder: tabIdRef.current,
      } satisfies SyncMessage<T>);
    }
  };

  // Resolve conflict
  const resolveConflict = (resolution: 'keep_local' | 'use_remote' | 'merge'): T | null => {
    if (!conflictInfo) {
      return null;
    }

    let resolvedState: T;

    switch (resolution) {
      case 'keep_local':
        resolvedState = conflictInfo.localState;
        break;
      case 'use_remote':
        resolvedState = conflictInfo.remoteState;
        break;
      case 'merge':
        // Basic merge strategy - combine arrays, prefer newer for conflicts
        resolvedState = mergeStates(
          conflictInfo.localState,
          conflictInfo.remoteState
        );
        break;
    }

    // Increment version to supersede both
    const newVersion = Math.max(
      conflictInfo.localVersion,
      conflictInfo.remoteVersion
    ) + 1;
    versionRef.current = newVersion;
    setCurrentVersion(newVersion);
    setConflictInfo(null);

    // Broadcast resolution
    broadcastState(resolvedState);

    return resolvedState;
  };

  // Clear conflict without resolving
  const clearConflict = () => {
    setConflictInfo(null);
  };

  return {
    tabId: tabIdRef.current,
    currentVersion,
    isLeader,
    connectedTabs,
    hasConflict: conflictInfo !== null,
    conflictInfo,
    broadcastState,
    incrementVersion,
    acquireLock,
    releaseLock,
    resolveConflict,
    clearConflict,
  };
}

// HELPERS

function mergeStates<T>(local: T, remote: T): T {
  // If both are arrays, merge unique items
  if (Array.isArray(local) && Array.isArray(remote)) {
    const merged = [...local];
    const localIds = new Set(local.map((item: { id?: string }) => item.id));

    for (const item of remote) {
      if (!localIds.has((item as { id?: string }).id)) {
        merged.push(item);
      }
    }

    return merged as T;
  }

  // If both are objects, shallow merge with remote taking precedence
  if (typeof local === 'object' && typeof remote === 'object' && local !== null && remote !== null) {
    return { ...local, ...remote };
  }

  // Default: use remote
  return remote;
}
