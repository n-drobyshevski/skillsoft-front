'use client';

import { useState, useEffect } from 'react';

/**
 * Phase 3.5: Network-aware hook for performance optimization
 *
 * Detects network conditions to adjust prefetching and loading strategies:
 * - saveData: User has requested reduced data usage
 * - effectiveType: Connection quality (4g, 3g, 2g, slow-2g)
 * - downlink: Estimated bandwidth in Mbps
 *
 * @example
 * const { isSlowConnection, shouldPrefetch, effectiveType } = useNetworkStatus();
 *
 * // Disable heavy prefetching on slow connections
 * if (shouldPrefetch) {
 *   prefetchData();
 * }
 */

interface NetworkStatus {
  /** True if on 2G or save-data mode */
  isSlowConnection: boolean;
  /** True if prefetching is recommended */
  shouldPrefetch: boolean;
  /** Connection type: '4g' | '3g' | '2g' | 'slow-2g' | null */
  effectiveType: string | null;
  /** Whether data saver is enabled */
  saveData: boolean;
  /** Whether we're online */
  isOnline: boolean;
  /** Estimated downlink speed in Mbps */
  downlink: number | null;
}

// Network Information API types (not in standard TypeScript DOM types)
interface NetworkInformation {
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
  saveData?: boolean;
  downlink?: number;
  rtt?: number;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

function getConnection(): NetworkInformation | null {
  if (typeof navigator === 'undefined') return null;
  const nav = navigator as NavigatorWithConnection;
  return nav.connection || nav.mozConnection || nav.webkitConnection || null;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(() => {
    // Initial state - assume good connection on server
    const connection = getConnection();
    const effectiveType = connection?.effectiveType || null;
    const saveData = connection?.saveData || false;
    const isSlowConnection = saveData || effectiveType === '2g' || effectiveType === 'slow-2g';

    return {
      isSlowConnection,
      shouldPrefetch: !isSlowConnection,
      effectiveType,
      saveData,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      downlink: connection?.downlink || null,
    };
  });

  useEffect(() => {
    const connection = getConnection();

    const updateStatus = () => {
      const conn = getConnection();
      const effectiveType = conn?.effectiveType || null;
      const saveData = conn?.saveData || false;
      const isSlowConnection = saveData || effectiveType === '2g' || effectiveType === 'slow-2g';

      setStatus({
        isSlowConnection,
        shouldPrefetch: !isSlowConnection,
        effectiveType,
        saveData,
        isOnline: navigator.onLine,
        downlink: conn?.downlink || null,
      });
    };

    // Listen for connection changes
    connection?.addEventListener?.('change', updateStatus);

    // Listen for online/offline events
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Update on mount
    updateStatus();

    return () => {
      connection?.removeEventListener?.('change', updateStatus);
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return status;
}

/**
 * Simple utility to check if prefetching should be disabled
 * Can be used outside React components
 */
export function shouldDisablePrefetch(): boolean {
  const connection = getConnection();
  if (!connection) return false; // Can't detect, assume good

  const { effectiveType, saveData } = connection;
  return saveData === true || effectiveType === '2g' || effectiveType === 'slow-2g';
}
