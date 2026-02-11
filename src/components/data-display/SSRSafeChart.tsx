'use client';

import { useEffect, useState } from 'react';
import { ChartContainer, ChartConfig } from '@/components/ui/chart';
import { ReactElement, JSXElementConstructor } from 'react';

interface SSRSafeChartProps {
  config: ChartConfig;
  children: ReactElement<unknown, string | JSXElementConstructor<unknown>>;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * SSR-Safe Chart Wrapper that prevents hydration mismatches
 * by handling the chart rendering only on the client-side
 */
export function SSRSafeChart({ children, fallback, config, className, ...props }: SSRSafeChartProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Use timeout to avoid cascading render warning
    const timer = setTimeout(() => setIsClient(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isClient) {
    return (
      <div className={className}>
        {fallback || (
          <div className="flex h-[250px] w-full items-center justify-center text-sm text-muted-foreground">
            Loading chart...
          </div>
        )}
      </div>
    );
  }

  return (
    <ChartContainer config={config} className={className} {...props}>
      {children}
    </ChartContainer>
  );
}