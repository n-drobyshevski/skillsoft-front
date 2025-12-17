'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, BarChart3 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileChartsSectionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * MobileChartsSection - Wraps charts with collapsible behavior on mobile.
 * Charts are hidden by default on mobile with a "View Charts" button to expand.
 * On desktop, charts are always visible.
 */
export function MobileChartsSection({
  children,
  className,
}: MobileChartsSectionProps) {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);

  // On desktop, always show charts
  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  // On mobile, show collapsible section
  return (
    <div className={className}>
      {/* Collapsed state - show button */}
      {!isExpanded && (
        <Card
          className="cursor-pointer transition-all hover:bg-muted/50"
          onClick={() => setIsExpanded(true)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Analytics Charts</p>
                  <p className="text-sm text-muted-foreground">
                    Tap to view quality scatter and distribution charts
                  </p>
                </div>
              </div>
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expanded state - show charts with collapse button */}
      {isExpanded && (
        <div className="space-y-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="w-full"
          >
            <ChevronDown className="h-4 w-4 mr-2 rotate-180 transition-transform" />
            Hide Charts
          </Button>
          {children}
        </div>
      )}
    </div>
  );
}

export default MobileChartsSection;
