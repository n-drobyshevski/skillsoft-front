/**
 * useChartDefer - Performance hook for deferred chart rendering
 *
 * Provides utilities for lazy loading heavy chart components:
 * - Delays initial render by one animation frame
 * - Uses useDeferredValue for smooth updates
 * - Provides loading state management
 */

import { useState, useEffect, useCallback, useDeferredValue, useTransition } from 'react';

interface UseChartDeferOptions {
  /** Delay before showing charts (ms) */
  delay?: number;
  /** Enable deferred value for data */
  deferData?: boolean;
}

interface UseChartDeferResult<T> {
  /** Whether the chart should be rendered */
  isReady: boolean;
  /** Whether a transition is pending */
  isPending: boolean;
  /** Deferred data (if deferData is true) */
  deferredData: T;
  /** Trigger a deferred update */
  startTransition: (callback: () => void) => void;
}

/**
 * Hook for deferred chart rendering
 *
 * @example
 * ```tsx
 * const { isReady, deferredData } = useChartDefer(chartData);
 *
 * if (!isReady) {
 *   return <ChartSkeleton />;
 * }
 *
 * return <Chart data={deferredData} />;
 * ```
 */
export function useChartDefer<T>(
  data: T,
  options: UseChartDeferOptions = {}
): UseChartDeferResult<T> {
  const { delay = 0, deferData = true } = options;
  const [isReady, setIsReady] = useState(false);
  const [isPending, startTransition] = useTransition();
  const deferredData = useDeferredValue(data);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | number;

    if (delay > 0) {
      timer = setTimeout(() => {
        requestAnimationFrame(() => {
          setIsReady(true);
        });
      }, delay);
    } else {
      timer = requestAnimationFrame(() => {
        setIsReady(true);
      });
    }

    return () => {
      if (typeof timer === 'number') {
        cancelAnimationFrame(timer);
      } else {
        clearTimeout(timer);
      }
    };
  }, [delay]);

  return {
    isReady,
    isPending,
    deferredData: deferData ? deferredData : data,
    startTransition,
  };
}

/**
 * Hook for lazy loading components with intersection observer
 *
 * @example
 * ```tsx
 * const { ref, isVisible } = useLazyLoad();
 *
 * return (
 *   <div ref={ref}>
 *     {isVisible ? <HeavyComponent /> : <Placeholder />}
 *   </div>
 * );
 * ```
 */
export function useLazyLoad<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = {}
) {
  const [ref, setRef] = useState<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, options]);

  const setRefCallback = useCallback((node: T | null) => {
    setRef(node);
  }, []);

  return {
    ref: setRefCallback,
    isVisible,
  };
}

/**
 * Hook for preloading chart components
 */
export function useChartPreload() {
  const [preloaded, setPreloaded] = useState<Set<string>>(new Set());

  const preload = useCallback((chunkName: string, importFn: () => Promise<unknown>) => {
    if (preloaded.has(chunkName)) return;

    importFn().then(() => {
      setPreloaded((prev) => new Set(prev).add(chunkName));
    });
  }, [preloaded]);

  const isPreloaded = useCallback(
    (chunkName: string) => preloaded.has(chunkName),
    [preloaded]
  );

  return {
    preload,
    isPreloaded,
    preloadedCount: preloaded.size,
  };
}

export default useChartDefer;
