'use client';

import { preloadCharts } from '@/lib/lazy-charts';

// Trigger preload at module evaluation time (when chunk loads)
// This fires ~200-400ms earlier than useEffect
preloadCharts();

/**
 * Invisible client component that ensures the chart preload chunk is included
 * in the page's client bundle. The actual preload happens at module scope above.
 * Renders nothing — zero layout impact.
 */
export function ChartPreloader() {
  return null;
}
